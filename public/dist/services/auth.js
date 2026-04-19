// AuthService.ts
export class AuthService {
    static async login(email, password) {
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
        // Store token if needed for API calls
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data;
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
    static async register(email, fullName, userType) {
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
        // Store token if needed for API calls
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        return data;
    }
    static async logout() {
        const response = await fetch('/logout', {
            method: 'GET',
            credentials: 'include'
        });
        localStorage.removeItem('accessToken');
        return response;
    }
}
