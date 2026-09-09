/**
 * AuthManager.js - Client-side Authentication Manager
 * Handles login, registration, token storage, and auth state
 */

export class AuthManager {
  constructor() {
    this.apiUrl = 'http://localhost:3000/api';
    this.token = localStorage.getItem('quantum_auth_token');
    this.user = null;
    this.onAuthChangeCallbacks = [];

    // Verify existing token on initialization
    if (this.token) {
      this.verifyToken();
    }
  }

  /**
   * Register a new user
   */
  async register(username, email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Return data for verification flow
      return {
        success: true,
        requiresVerification: data.requiresVerification,
        userId: data.userId,
        email: data.email
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Login existing user
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if verification is required
        if (data.requiresVerification) {
          // Get user's email from response
          const emailMatch = data.error.match(/[\w\.-]+@[\w\.-]+\.\w+/);
          return {
            success: false,
            requiresVerification: true,
            userId: data.userId,
            email: emailMatch ? emailMatch[0] : null,
            error: data.error
          };
        }
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('quantum_auth_token', this.token);
      localStorage.setItem('quantum_user', JSON.stringify(this.user));

      this.notifyAuthChange(true);
      return { success: true, user: this.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('quantum_auth_token');
    localStorage.removeItem('quantum_user');
    this.notifyAuthChange(false);
  }

  /**
   * Verify current token is valid
   */
  async verifyToken() {
    if (!this.token) return false;

    try {
      const response = await fetch(`${this.apiUrl}/verify`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        localStorage.setItem('quantum_user', JSON.stringify(this.user));
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      this.logout();
      return false;
    }
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    if (!this.user && this.token) {
      const stored = localStorage.getItem('quantum_user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  /**
   * Save user progress to server
   */
  async saveProgress(progressData) {
    if (!this.isAuthenticated()) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${this.apiUrl}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify(progressData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save progress');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Load user progress from server
   */
  async loadProgress() {
    if (!this.isAuthenticated()) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${this.apiUrl}/progress`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load progress');
      }

      return { success: true, progress: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback) {
    this.onAuthChangeCallbacks.push(callback);
  }

  /**
   * Notify all subscribers of auth state change
   */
  notifyAuthChange(isAuthenticated) {
    this.onAuthChangeCallbacks.forEach(callback => {
      callback(isAuthenticated, this.user);
    });
  }
}
