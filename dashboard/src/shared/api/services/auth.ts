/**
 * Auth API Service
 * Handles authentication and token management
 */

import { apiClient, type ApiResponse } from '../client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authApi = {
  /**
   * Login and get JWT token
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/auth/me');
  },
};

