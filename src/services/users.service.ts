import { apiService } from './api';
import { 
  User, 
  ApiResponse, 
  PaginatedResponse 
} from '../types/api';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
  restaurant_id?: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ChangePasswordRequest {
  password: string;
  password_confirmation: string;
}

export interface UserFilters {
  restaurant_id?: number;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
}

export interface RolesPermissionsResponse {
  roles: Role[];
  permissions: Permission[];
}

class UsersService {
  // Get users with pagination and filters
  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<User>>>('/users', filters);
    return response.data;
  }

  // Get single user by ID
  async getUserById(id: number): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  }

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>('/users', userData);
    return response.data;
  }

  // Update user
  async updateUser(id: number, userData: UpdateUserRequest): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data;
  }

  // Change user password (admin action)
  async changePassword(id: number, passwordData: ChangePasswordRequest): Promise<void> {
    const response = await apiService.put<ApiResponse<void>>(`/users/${id}/password`, passwordData);
    if (!response.success) {
      throw new Error(response.message || 'Password change failed');
    }
  }

  // Update user roles (super-admin only)
  async updateRoles(id: number, roles: string[]): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>(`/users/${id}/roles`, { roles });
    return response.data;
  }

  // Update user status
  async updateStatus(id: number, status: string): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>(`/users/${id}/status`, { status });
    return response.data;
  }

  // Delete user
  async deleteUser(id: number): Promise<void> {
    const response = await apiService.delete<ApiResponse<void>>(`/users/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'User deletion failed');
    }
  }

  // Get roles and permissions
  async getRolesAndPermissions(): Promise<RolesPermissionsResponse> {
    const response = await apiService.get<ApiResponse<RolesPermissionsResponse>>('/users/roles-permissions');
    return response.data;
  }

  // Get users by restaurant
  async getUsersByRestaurant(restaurantId: number): Promise<User[]> {
    const response = await apiService.get<ApiResponse<User[]>>(`/restaurants/${restaurantId}/users`);
    return response.data;
  }

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiService.get<ApiResponse<User[]>>('/users', { search: query });
    return response.data;
  }
}

export const usersService = new UsersService(); 