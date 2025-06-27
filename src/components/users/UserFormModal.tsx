import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { User } from '../../types/api';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import { CreateUserRequest, UpdateUserRequest } from '../../services/users.service';
import { 
  getCreateUserRoleOptions, 
  roleRequiresRestaurant, 
  UserRole 
} from '../../utils/userRoles';
import toast from 'react-hot-toast';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  currentUserRole: UserRole;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUserRole
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer' as UserRole,
    restaurant_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const isEditing = !!user;
  const availableRoles = getCreateUserRoleOptions(currentUserRole);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Пароль не показываем при редактировании
        phone: user.phone || '',
        role: user.role,
        restaurant_id: user.restaurant_id?.toString() || '',
        status: user.status,
      });
    } else {
      // Сброс формы для создания нового пользователя
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: availableRoles.length > 0 ? availableRoles[0].value : 'customer',
        restaurant_id: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [user, availableRoles]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Обязательные поля
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Пароль обязателен только при создании
    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Проверка ресторана для ролей, которые его требуют
    if (roleRequiresRestaurant(formData.role) && !formData.restaurant_id) {
      newErrors.restaurant_id = 'Restaurant is required for this role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && user) {
        // Обновление пользователя
        const updateData: UpdateUserRequest = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          status: formData.status,
        };
        await updateUserMutation.mutateAsync({ id: user.id, userData: updateData });
      } else {
        // Создание пользователя
        const createData: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          role: formData.role,
          restaurant_id: formData.restaurant_id ? parseInt(formData.restaurant_id) : undefined,
          status: formData.status,
        };
        await createUserMutation.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Очистка ошибки при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Сброс restaurant_id если роль не требует ресторан
    if (field === 'role' && !roleRequiresRestaurant(value as UserRole)) {
      setFormData(prev => ({ ...prev, restaurant_id: '' }));
    }
  };

  if (!isOpen) return null;

  const selectedRoleOption = availableRoles.find(r => r.value === formData.role);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit User' : 'Create New User'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="Enter full name"
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter email address"
              required
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="Enter phone number (optional)"
            />

            {/* Password - только при создании */}
            {!isEditing && (
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                error={errors.password}
                placeholder="Enter password (min 8 characters)"
                helperText="Password must be at least 8 characters long"
                required
              />
            )}

            {/* Role */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="input"
                required
              >
                {availableRoles.map((roleOption) => (
                  <option key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </option>
                ))}
              </select>
              {selectedRoleOption && (
                <p className="text-xs text-gray-500">
                  {selectedRoleOption.description}
                </p>
              )}
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Restaurant - только для ролей, которые требуют ресторан */}
            {roleRequiresRestaurant(formData.role) && (
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Restaurant *
                </label>
                <select
                  value={formData.restaurant_id}
                  onChange={(e) => handleChange('restaurant_id', e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Select Restaurant</option>
                  <option value="1">Pizza Palace</option>
                  {/* Здесь можно загружать рестораны из API */}
                </select>
                {errors.restaurant_id && (
                  <p className="text-sm text-red-600">{errors.restaurant_id}</p>
                )}
              </div>
            )}

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createUserMutation.isLoading || updateUserMutation.isLoading}
              >
                {isEditing ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal; 