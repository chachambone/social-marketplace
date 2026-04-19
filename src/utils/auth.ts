import { readUsers } from './fileHelpers.js';

export const getCurrentUser = async (userId) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    
    // Don't return sensitive info
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return null;
    }
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};