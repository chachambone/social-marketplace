const API_URL = 'http://localhost:3000/api';
export class AuthService {
    static async register(email, username, password, userType = 'buyer') {
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password, userType })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        const data = await response.json();
        this.setSession(data.user, data.accessToken);
        return data;
    }
    static async login(email, password) {
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        const data = await response.json();
        this.setSession(data.user, data.accessToken);
        return data;
    }
    static setSession(user, token) {
        this.currentUser = user;
        this.accessToken = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
    }
    static logout() {
        this.currentUser = null;
        this.accessToken = null;
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }
    static getCurrentUser() {
        if (this.currentUser)
            return this.currentUser;
        const stored = localStorage.getItem('user');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return this.currentUser;
        }
        return null;
    }
    static getAccessToken() {
        if (this.accessToken)
            return this.accessToken;
        const stored = localStorage.getItem('accessToken');
        if (stored) {
            this.accessToken = stored;
            return this.accessToken;
        }
        return null;
    }
    static isAuthenticated() {
        return this.getCurrentUser() !== null && this.getAccessToken() !== null;
    }
    static async getProfile() {
        const token = this.getAccessToken();
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to get profile');
        }
        return response.json();
    }
}
AuthService.currentUser = null;
AuthService.accessToken = null;
