import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readUsers, writeUsers } from '../utils/fileHelpers.js';
import { sendWelcomeEmail } from '../utils/email.service.js';
import { authConfig } from '../config/auth.config.js';
import { AppError } from '../middleware/error.middleware.js';
import { users } from '../data/users.js';

interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  userType: 'buyer' | 'seller' | 'admin';
  createdAt: string;
  lastLogin: string;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password, userType = 'buyer' } = req.body;

    if (!email || !username || !password) {
      throw new AppError('Email, username, and password are required', 400);
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

    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds);
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

    // Send welcome email with credentials
    await sendWelcomeEmail({ email, username, password });

    // Generate access token - FIXED: use expiresIn as string
    const accessToken = jwt.sign(
      { id: newUser.id, email, username, userType: newUser.userType },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      accessToken,
      userType: newUser.userType,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Registration error:', error);
    throw new AppError('Failed to register user', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }


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

    // Generate access token - FIXED: use expiresIn as string
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, userType: user.userType },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn } as jwt.SignOptions
    );

    const { password: _, ...userWithoutPassword } = user;
    
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