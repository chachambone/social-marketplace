import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readUsers, writeUsers } from '../utils/fileHelpers.js';
import { sendWelcomeEmail } from '../utils/email.service.js';
import { authConfig } from '../config/auth.config.js';
import { AppError } from '../middleware/error.middleware.js';


interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  userType: 'buyer' | 'seller' | 'admin';
  createdAt: string;
  lastLogin: string;
}

// Function to generate a secure random password
const generateSecurePassword = (length: number = 12): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numberChars[Math.floor(Math.random() * numberChars.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, userType = 'buyer' } = req.body;

    // ==================== INPUT VALIDATION ====================
    
    // 1. Email validation
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    const isValidEmail = email && typeof email === 'string' && emailRegex.test(email);
    
    if (!isValidEmail) {
      throw new AppError('Invalid email format. Please provide a valid email address.', 400);
    }
    
    // Sanitize email (lowercase, trim)
    const sanitizedEmail = email.toLowerCase().trim();
    
    // 2. Username validation
    if (!username || typeof username !== 'string') {
      throw new AppError('Username is required and must be a string', 400);
    }
    
    const trimmedUsername = username.trim();
    
    // Username length validation
    if (trimmedUsername.length < 3) {
      throw new AppError('Username must be at least 3 characters long', 400);
    }
    
    if (trimmedUsername.length > 30) {
      throw new AppError('Username must not exceed 30 characters', 400);
    }
    
    // Username format validation (alphanumeric, underscore, hyphen only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      throw new AppError('Username can only contain letters, numbers, underscores, and hyphens', 400);
    }
    
    // Username reserved words check
    const reservedUsernames = ['admin', 'root', 'system', 'support', 'info', 'webmaster'];
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
      throw new AppError('This username is reserved and cannot be used', 400);
    }
    
    // 3. UserType validation
    const validUserTypes = ['buyer', 'seller', 'admin'];
    let sanitizedUserType = userType;
    
    if (userType && typeof userType === 'string') {
      const lowerUserType = userType.toLowerCase();
      if (!validUserTypes.includes(lowerUserType)) {
        throw new AppError(`Invalid userType. Must be one of: ${validUserTypes.join(', ')}`, 400);
      }
      sanitizedUserType = lowerUserType;
    } else {
      sanitizedUserType = 'buyer'; // default
    }
    
    // 4. Additional security checks
    // Prevent SQL injection patterns (even for non-SQL DBs)
    const dangerousPatterns = /[;'"`\\]|--|\b(OR|AND|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER)\b/i;
    if (dangerousPatterns.test(sanitizedEmail) || dangerousPatterns.test(trimmedUsername)) {
      throw new AppError('Invalid characters detected in input', 400);
    }
    
    // 5. Email domain validation (optional but recommended)
    const blockedDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com'];
    const emailDomain = sanitizedEmail.split('@')[1];
    if (blockedDomains.includes(emailDomain?.toLowerCase())) {
      throw new AppError('Temporary email addresses are not allowed', 400);
    }
    
    // 6. Rate limiting check (should be implemented at middleware level)
    // This is a placeholder for rate limiting validation
    const ipAddress = req.ip || req.socket.remoteAddress;
    // await checkRateLimit(ipAddress, 'register');

    // ==================== EXISTING CODE BELOW ====================

    const users: User[] = readUsers();
    
    // Check if email already exists (case-insensitive)
    const existingEmail = users.find(u => u.email.toLowerCase() === sanitizedEmail);
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }
    
    // Check if username already exists (case-insensitive)
    const existingUsername = users.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    // Generate secure system password
    const systemGeneratedPassword = generateSecurePassword(12);
    console.log(`System generated password for ${trimmedUsername}: ${systemGeneratedPassword}`);

    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(systemGeneratedPassword, authConfig.bcryptSaltRounds);
    
    const newUser: User = {
      id: uuidv4(),
      email: sanitizedEmail,
      username: trimmedUsername,
      password: hashedPassword,
      userType: sanitizedUserType as 'buyer' | 'seller' | 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Send welcome email with the generated password
    const emailResult = await sendWelcomeEmail({ 
      email: sanitizedEmail, 
      username: trimmedUsername, 
      password: systemGeneratedPassword 
    });

    if (!emailResult.success) {
      console.error('Failed to send welcome email, but user was created');
      // Log for monitoring
      console.error(`Welcome email failed for user: ${newUser.id}, email: ${sanitizedEmail}`);
    }

    // CRITICAL FIX: Set session on successful registration
    if (req.session) {
      req.session.userId = newUser.id;
      req.session.user = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        userType: newUser.userType
      };
      
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: newUser.id, email: sanitizedEmail, username: trimmedUsername, userType: newUser.userType },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    // Return success response with sanitized data
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Credentials have been sent to your email.',
      user: userWithoutPassword,
      accessToken,
      userType: newUser.userType,
      ...(process.env.NODE_ENV === 'development' && { 
        temporaryPassword: systemGeneratedPassword 
      }),
    });
    
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Registration error:', error);
    throw new AppError('Failed to register user', 500);
  }
};

// Optional: Add password reset functionality
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    
    const users: User[] = readUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      throw new AppError('User not found', 404);
    }
    
    // Generate new password
    const newPassword = generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);
    
    // Update user password
    users[userIndex].password = hashedPassword;
    writeUsers(users);
    
    // Send new password via email
    const emailResult = await sendWelcomeEmail({
      email,
      username: users[userIndex].username,
      password: newPassword,
    });
    
    if (!emailResult.success) {
      throw new AppError('Failed to send password reset email', 500);
    }
    
    res.json({
      success: true,
      message: 'New password has been sent to your email',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Password reset error:', error);
    throw new AppError('Failed to reset password', 500);
  }
};

// usersController.ts - Fixed login function
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const users: User[] = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    writeUsers(users);

    // Generate access token
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        userType: user.userType 
      },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    // Set session and wait for it to save
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      userType: user.userType
    };
    
    // IMPORTANT: Wait for session to save before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to create session' 
        });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      console.log(`✅ Login successful for: ${user.username}, Session ID: ${req.session.id}`);
      
        res.json({
      success: true,
      user: userWithoutPassword, // Make sure this has id, email, username, userType
      accessToken,
      userType: user.userType,
    });

    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Login error:', error);
    throw new AppError('Failed to login', 500);
  }
};

// Get profile (already exists, but ensure it's working)
export const getProfile = async (req: any, res: Response) => {
  try {
    const users: User[] = readUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get profile', 500);
  }
};


export const updateProfile = async (req: any, res: Response) => {
  try {
    const { email, username, currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From authenticateToken middleware

    const users: User[] = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new AppError('User not found', 404);
    }

    const user = users[userIndex];

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const emailExists = users.some(u => u.email === email && u.id !== userId);
      if (emailExists) {
        throw new AppError('Email already in use', 409);
      }
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const usernameExists = users.some(u => u.username === username && u.id !== userId);
      if (usernameExists) {
        throw new AppError('Username already taken', 409);
      }
    }

    // Update email if provided
    if (email && email !== user.email) {
      user.email = email;
    }

    // Update username if provided
    if (username && username !== user.username) {
      user.username = username;
    }

    // Update password if provided
    if (newPassword) {
      // Verify current password
      if (!currentPassword) {
        throw new AppError('Current password is required to change password', 400);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);
    }

    // Save updated user
    users[userIndex] = user;
    writeUsers(users);

    // Generate new token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, userType: user.userType },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword,
      accessToken
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Update profile error:', error);
    throw new AppError('Failed to update profile', 500);
  }
};

// Delete account
export const deleteAccount = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    let users: User[] = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new AppError('User not found', 404);
    }

    // Remove user
    users = users.filter(u => u.id !== userId);
    writeUsers(users);

    // Also delete user's items (optional - implement if needed)
    // You might want to delete or reassign items from this user

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Delete account error:', error);
    throw new AppError('Failed to delete account', 500);
  }
};

