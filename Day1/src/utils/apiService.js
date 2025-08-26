/**
 * Universal API Service
 * Backend integration utilities for various frameworks
 * Day 1 of 365 Days Challenge
 */

// Configuration for different backend endpoints
const API_CONFIG = {
    // Default configuration
    default: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    // Node.js/Express configuration
    express: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
        endpoints: {
            login: '/auth/login',
            signup: '/auth/signup',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            profile: '/auth/profile'
        }
    },
    
    // Django/Django REST Framework configuration
    django: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
        endpoints: {
            login: '/auth/login/',
            signup: '/auth/register/',
            logout: '/auth/logout/',
            refresh: '/auth/token/refresh/',
            profile: '/auth/user/'
        }
    },
    
    // Laravel configuration
    laravel: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
        endpoints: {
            login: '/login',
            signup: '/register',
            logout: '/logout',
            refresh: '/refresh',
            profile: '/user'
        }
    },
    
    // Spring Boot configuration
    springboot: {
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
        endpoints: {
            login: '/auth/login',
            signup: '/auth/register',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            profile: '/auth/profile'
        }
    }
};

/**
 * Universal API Service Class
 */
class APIService {
    constructor(framework = 'default') {
        this.config = API_CONFIG[framework] || API_CONFIG.default;
        this.token = this.getStoredToken();
        
        // Set up request interceptor
        this.setupRequestInterceptor();
    }

    /**
     * Get stored authentication token
     */
    getStoredToken() {
        return localStorage.getItem('universalAuth_token') || 
               sessionStorage.getItem('universalAuth_token');
    }

    /**
     * Set authentication token
     */
    setToken(token, remember = false) {
        this.token = token;
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('universalAuth_token', token);
    }

    /**
     * Clear authentication token
     */
    clearToken() {
        this.token = null;
        localStorage.removeItem('universalAuth_token');
        sessionStorage.removeItem('universalAuth_token');
    }

    /**
     * Setup request interceptor for automatic token inclusion
     */
    setupRequestInterceptor() {
        // This would be used with axios or similar HTTP client
        // For now, we'll handle it in individual requests
    }

    /**
     * Make HTTP request
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.config.baseURL}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                ...this.config.headers,
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...options
        };

        // Add body if present
        if (options.data) {
            defaultOptions.body = JSON.stringify(options.data);
        }

        try {
            const response = await fetch(url, defaultOptions);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                data,
                status: response.status,
                headers: response.headers
            };
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(credentials) {
        const endpoint = this.config.endpoints?.login || '/auth/login';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                data: {
                    email: credentials.email,
                    password: credentials.password,
                    remember_me: credentials.rememberMe || false
                }
            });

            // Store token if provided
            if (response.data.token || response.data.access_token) {
                this.setToken(
                    response.data.token || response.data.access_token,
                    credentials.rememberMe
                );
            }

            return response.data;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    /**
     * Signup user
     */
    async signup(userData) {
        const endpoint = this.config.endpoints?.signup || '/auth/signup';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                data: {
                    email: userData.email,
                    password: userData.password,
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    agree_to_terms: userData.agreeToTerms
                }
            });

            // Store token if provided (auto-login after signup)
            if (response.data.token || response.data.access_token) {
                this.setToken(response.data.token || response.data.access_token);
            }

            return response.data;
        } catch (error) {
            throw new Error(`Signup failed: ${error.message}`);
        }
    }

    /**
     * Logout user
     */
    async logout() {
        const endpoint = this.config.endpoints?.logout || '/auth/logout';
        
        try {
            await this.makeRequest(endpoint, {
                method: 'POST'
            });
        } catch (error) {
            console.warn('Logout API call failed:', error.message);
        } finally {
            // Always clear token locally
            this.clearToken();
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const endpoint = this.config.endpoints?.refresh || '/auth/refresh';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST'
            });

            if (response.data.token || response.data.access_token) {
                this.setToken(response.data.token || response.data.access_token);
                return response.data;
            }
        } catch (error) {
            this.clearToken();
            throw new Error(`Token refresh failed: ${error.message}`);
        }
    }

    /**
     * Get user profile
     */
    async getProfile() {
        const endpoint = this.config.endpoints?.profile || '/auth/profile';
        
        try {
            const response = await this.makeRequest(endpoint);
            return response.data;
        } catch (error) {
            throw new Error(`Profile fetch failed: ${error.message}`);
        }
    }

    /**
     * Password reset request
     */
    async requestPasswordReset(email) {
        const endpoint = '/auth/password/reset';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                data: { email }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Password reset request failed: ${error.message}`);
        }
    }

    /**
     * Password reset confirmation
     */
    async resetPassword(token, newPassword) {
        const endpoint = '/auth/password/reset/confirm';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                data: { 
                    token, 
                    password: newPassword 
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Password reset failed: ${error.message}`);
        }
    }

    /**
     * Email verification
     */
    async verifyEmail(token) {
        const endpoint = '/auth/email/verify';
        
        try {
            const response = await this.makeRequest(endpoint, {
                method: 'POST',
                data: { token }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Email verification failed: ${error.message}`);
        }
    }
}

/**
 * Factory function to create API service for different backends
 */
export const createAPIService = (framework = 'default') => {
    return new APIService(framework);
};

/**
 * Default API service instance
 */
export const apiService = new APIService();

/**
 * Framework-specific API services
 */
export const expressAPI = new APIService('express');
export const djangoAPI = new APIService('django');
export const laravelAPI = new APIService('laravel');
export const springBootAPI = new APIService('springboot');

/**
 * Utility functions for common authentication patterns
 */
export const authUtils = {
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!apiService.getStoredToken();
    },

    /**
     * Get current user from stored data
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem('universalAuth_user') ||
                           sessionStorage.getItem('universalAuth_user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

    /**
     * Auto-refresh token before expiration
     */
    async autoRefreshToken() {
        // This would implement automatic token refresh logic
        // based on token expiration time
        try {
            await apiService.refreshToken();
        } catch (error) {
            // Redirect to login if refresh fails
            window.location.href = '/login';
        }
    },

    /**
     * Setup automatic logout on token expiration
     */
    setupAutoLogout() {
        // This would set up listeners for token expiration
        // and automatically log out the user
    },

    /**
     * Handle authentication errors globally
     */
    handleAuthError(error) {
        if (error.status === 401) {
            // Unauthorized - clear token and redirect
            apiService.clearToken();
            window.location.href = '/login';
        } else if (error.status === 403) {
            // Forbidden - show access denied message
            console.error('Access denied');
        }
    }
};

export default APIService;
