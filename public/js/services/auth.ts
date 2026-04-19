import { User } from "../types";

// AuthService.ts
export class AuthService {
  static currentUser: User | null = null;
  static accessToken: string | null = null;

  static async login(email: string, password: string) {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Important: Include cookies/session
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Store user data in localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      this.currentUser = data.user;
    }
    
    // Store token for API calls
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      this.accessToken = data.accessToken;
    }
    
    return data;
  }

  static getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    
    const stored = localStorage.getItem('accessToken');
    if (stored) {
      this.accessToken = stored;
      return this.accessToken;
    }
    return null;
  }
  
  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        return null;
      }
    }
    return null;
  }

  static async register(email: string, fullName: string, userType: 'buyer' | 'seller') {
    // Generate username from full name
    const username = fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');

    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, userType }),
      credentials: 'include' // Important: Include cookies/session
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    
    // Store user data in localStorage
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      this.currentUser = data.user;
    }
    
    // Store token for API calls
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      this.accessToken = data.accessToken;
    }
    
    return data;
  }

  static async logout() {
    const response = await fetch('/logout', {
      method: 'GET',
      credentials: 'include'
    });
    
    // Clear all stored data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    
    this.accessToken = null;
    this.currentUser = null;
    
    return response;
  }

  // Helper method to update user data after profile changes
  static updateUser(userData: User) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUser = userData;
  }
}