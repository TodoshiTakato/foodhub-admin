import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersService, UserFilters, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '../services/users.service';
import toast from 'react-hot-toast';

// Get users with filters
export const useUsers = (filters?: UserFilters) => {
  return useQuery(
    ['users', filters],
    () => usersService.getUsers(filters),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  );
};

// Get single user
export const useUser = (id: number, enabled = true) => {
  return useQuery(
    ['user', id],
    () => usersService.getUserById(id),
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Get roles and permissions
export const useRolesAndPermissions = () => {
  return useQuery(
    ['roles-permissions'],
    () => usersService.getRolesAndPermissions(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes - роли меняются редко
      refetchOnWindowFocus: false,
    }
  );
};

// Get users by restaurant
export const useUsersByRestaurant = (restaurantId: number, enabled = true) => {
  return useQuery(
    ['users', 'restaurant', restaurantId],
    () => usersService.getUsersByRestaurant(restaurantId),
    {
      enabled: enabled && !!restaurantId,
      staleTime: 2 * 60 * 1000,
    }
  );
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (userData: CreateUserRequest) => usersService.createUser(userData),
    {
      onSuccess: (newUser) => {
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        toast.success(`User ${newUser.name} created successfully!`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to create user');
      },
    }
  );
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, userData }: { id: number; userData: UpdateUserRequest }) => 
      usersService.updateUser(id, userData),
    {
      onSuccess: (updatedUser) => {
        // Update specific user in cache
        queryClient.setQueryData(['user', updatedUser.id], updatedUser);
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        toast.success(`User ${updatedUser.name} updated successfully!`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to update user');
      },
    }
  );
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: number) => usersService.deleteUser(id),
    {
      onSuccess: () => {
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        toast.success('User deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to delete user');
      },
    }
  );
};

// Change password mutation
export const useChangePassword = () => {
  return useMutation(
    ({ id, passwordData }: { id: number; passwordData: ChangePasswordRequest }) => 
      usersService.changePassword(id, passwordData),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to change password');
      },
    }
  );
};

// Update user status mutation
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, status }: { id: number; status: string }) => 
      usersService.updateStatus(id, status),
    {
      onSuccess: (updatedUser) => {
        // Update specific user in cache
        queryClient.setQueryData(['user', updatedUser.id], updatedUser);
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        toast.success(`User status updated to ${status}!`);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to update user status');
      },
    }
  );
};

// Update user roles mutation
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, roles }: { id: number; roles: string[] }) => 
      usersService.updateRoles(id, roles),
    {
      onSuccess: (updatedUser) => {
        // Update specific user in cache
        queryClient.setQueryData(['user', updatedUser.id], updatedUser);
        // Invalidate users list
        queryClient.invalidateQueries(['users']);
        toast.success('User roles updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to update user roles');
      },
    }
  );
}; 