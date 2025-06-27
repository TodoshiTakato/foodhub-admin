import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, MoreVertical, Shield, Key } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useUsers, useDeleteUser, useUpdateUserStatus } from '../../hooks/useUsers';
import { UserFilters } from '../../services/users.service';
import { User } from '../../types/api';
import { useAuth } from '../../stores/auth-context';
import { 
  getUserPrimaryRole, 
  canEditUser, 
  canDeleteUser, 
  getRoleDisplayName, 
  getRoleColor,
  getStatusLabel,
  getStatusColor,
  UserRole 
} from '../../utils/userRoles';
import UserFormModal from '../../components/users/UserFormModal';
import ChangePasswordModal from '../../components/users/ChangePasswordModal';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    per_page: 10,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: usersData, isLoading, error } = useUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();

  const currentUserRole = currentUser ? getUserPrimaryRole(currentUser) : 'customer';

  // Не рендерим ничего пока currentUser не загружен
  if (!currentUser) {
    return <LoadingSpinner />;
  }

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    if (!currentUser || !canEditUser(currentUser, user)) {
      toast.error('У вас нет прав для редактирования этого пользователя');
      return;
    }
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!currentUser || !canDeleteUser(currentUser, user)) {
      toast.error('У вас нет прав для удаления этого пользователя');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите удалить пользователя ${user.name}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleChangePassword = (user: User) => {
    if (!currentUser || !canEditUser(currentUser, user)) {
      toast.error('У вас нет прав для изменения пароля этого пользователя');
      return;
    }
    setSelectedUserId(user.id);
    setShowPasswordModal(true);
  };

  const handleStatusChange = (user: User, newStatus: string) => {
    if (!currentUser || !canEditUser(currentUser, user)) {
      toast.error('У вас нет прав для изменения статуса этого пользователя');
      return;
    }
    updateStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-red-600">Failed to load users. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button
          onClick={handleCreateUser}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create User</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="input"
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                className="input"
                value={filters.role || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              >
                <option value="">All Roles</option>
                <option value="super-admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="restaurant-owner">Restaurant Owner</option>
                <option value="restaurant-manager">Manager</option>
                <option value="kitchen-staff">Kitchen Staff</option>
                <option value="cashier">Cashier</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersData?.data.map((user) => {
                const userRole = getUserPrimaryRole(user);
                const canEdit = currentUser ? canEditUser(currentUser, user) : false;
                const canDelete = currentUser ? canDeleteUser(currentUser, user) : false;

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                        {getRoleDisplayName(userRole)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.restaurant?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canEdit && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleChangePassword(user)}
                              className="text-green-600 hover:text-green-900"
                              title="Change Password"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {(canEdit || canDelete) && (
                          <div className="relative group">
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {/* Dropdown menu can be added here */}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData?.meta && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((usersData.meta.current_page - 1) * usersData.meta.per_page) + 1} to{' '}
              {Math.min(usersData.meta.current_page * usersData.meta.per_page, usersData.meta.total)} of{' '}
              {usersData.meta.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                disabled={usersData.meta.current_page <= 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {usersData.meta.current_page} of {usersData.meta.last_page}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                disabled={usersData.meta.current_page >= usersData.meta.last_page}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showUserModal && (
        <UserFormModal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          user={editingUser}
          currentUserRole={currentUserRole}
        />
      )}

      {showPasswordModal && selectedUserId && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default UsersPage; 