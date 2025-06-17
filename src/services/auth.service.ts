import { apiService } from './api';
import { 
  AuthResponse, 
  LoginRequest, 
  User, 
  ApiResponse 
} from '../types/api';

class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    
    if (response.success && response.data) {
      // Store token and user in localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.message || 'Login failed');
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/auth/profile', data);
    
    if (response.success && response.data) {
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error(response.message || 'Profile update failed');
  }

  // Change password
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/auth/password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    return null;
  }

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiService.post<ApiResponse<AuthResponse>>('/auth/refresh');
    
    if (response.success && response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.message || 'Token refresh failed');
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/auth/password/forgot', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed');
    }
  }

  // Reset password with token
  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    const response = await apiService.post<ApiResponse<void>>('/auth/password/reset', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }
}

export const authService = new AuthService(); 