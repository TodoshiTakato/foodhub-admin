import React, { useState } from 'react';
import { useAuth } from '../../stores/auth-context';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to FoodHub Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your restaurant operations
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">—— Demo Credentials ——</p>
            <p className="text-xs text-gray-500">
              <strong>Super Admin:</strong> admin@foodhub.com / admin123<br />
              <strong>Restaurant Owner:</strong> owner@pizzapalace.com / owner123<br />
              <strong>Manager:</strong> manager@foodhub.com / manager123<br />
              <strong>Staff:</strong> staff@foodhub.com / staff123<br />
              <strong>Test User 1:</strong> testuser1@foodhub.com / test123<br />
              <strong>Test User 2:</strong> testuser2@foodhub.com / test123<br />
              <strong>API Test User:</strong> apitest@foodhub.com / api123
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 