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

    // Validate required fields
    if (!email || !username) {
      throw new AppError('Email and username are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      throw new AppError('Username must be between 3 and 30 characters', 400);
    }

    const users: User[] = readUsers();
    
    // Check if email already exists
    const existingEmail = users.find(u => u.email === email);
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }
    
    // Check if username already exists
    const existingUsername = users.find(u => u.username === username);
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    // Generate secure system password
    const systemGeneratedPassword = generateSecurePassword(12);
    console.log(`🔐 System generated password for ${username}: ${systemGeneratedPassword}`);

    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(systemGeneratedPassword, authConfig.bcryptSaltRounds);
    
    const newUser: User = {
      id: uuidv4(),
      email,
      username,
      password: hashedPassword,
      userType: userType as 'buyer' | 'seller' | 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Send welcome email with the generated password
    const emailResult = await sendWelcomeEmail({ 
      email, 
      username, 
      password: systemGeneratedPassword 
    });

    if (!emailResult.success) {
      console.error('⚠️ Failed to send welcome email, but user was created');
      // Optionally: You might want to rollback user creation if email is critical
      // For now, we'll continue but log the error
    }

    // Generate access token
    const accessToken = jwt.sign(
      { id: newUser.id, email, username, userType: newUser.userType },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Credentials have been sent to your email.',
      user: userWithoutPassword,
      accessToken,
      userType: newUser.userType,
      // For development only - remove in production
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // READ users from file instead of importing
    const users: User[] = readUsers();
    console.log("users are ",users)
    
    console.log(`📖 Found ${users.length} users in database`);
    
    const user = users.find(u => u.email === email);

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
      throw new AppError('Invalid credentials', 401);
    }

    console.log(`✅ User found: ${user.username} (${user.userType})`);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ Invalid password for user: ${user.username}`);
      throw new AppError('Invalid credentials', 401);
    }

    console.log(`✅ Password verified for user: ${user.username}`);

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

    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`✅ Login successful for: ${user.username}`);
    
    res.json({
      user: userWithoutPassword,
      accessToken,
      userType: user.userType,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Login error:', error);
    throw new AppError('Failed to login', 500);
  }
};

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