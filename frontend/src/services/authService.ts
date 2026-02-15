import { api } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

/**
 * Authentication service for handling all auth-related operations
 * This service provides a clean abstraction over the API for authentication
 */
export const authService = {
  /**
   * Login a user with email and password
   * @param credentials - Login credentials (email, password)
   * @returns Promise with user data and token
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const result = await api.login(credentials);
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  },

  /**
   * Register a new user
   * @param data - Registration data (email, password, name, role, phone)
   * @returns Promise with user data and token
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const result = await api.register(data);
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  },

  /**
   * Logout the current user
   * @returns Promise with logout confirmation
   */
  logout: async (): Promise<void> => {
    await api.logout();
  },

  /**
   * Get the current authenticated user
   * @returns Promise with user data
   */
  getMe: async (): Promise<User> => {
    const result = await api.getMe();
    
    if (!result.success) {
      throw new Error(result.error.message);
    }
    
    return result.data;
  },

  /**
   * Store authentication token in localStorage
   * @param token - JWT or session token
   */
  storeToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  /**
   * Remove authentication token from localStorage
   */
  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * Get authentication token from localStorage
   * @returns Token string or null
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is authenticated (has valid token)
   * @returns Boolean indicating authentication status
   */
  isAuthenticated: (): boolean => {
    const token = authService.getToken();
    return token !== null && token !== '';
  },
};
