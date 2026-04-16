import { User } from '../types/index.js';

const API_URL = 'http://localhost:3000/api';

export class AuthService {
  private static currentUser: User | null = null;

  static async login(name: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const user = await response.json();
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  static async register(name: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const user = await response.json();
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }

  static logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}