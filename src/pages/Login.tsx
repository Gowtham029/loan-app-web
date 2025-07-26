import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/UI/Notification';
import { LoginRequest } from '@/types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginRequest>({
    mode: 'onChange'
  });

  const email = watch('email', '');
  const password = watch('password', '');
  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authService.login(data);
      
      console.log('Login response:', response);
      
      if (response.access_token && response.user) {
        login(response.access_token, response.user);
        showNotification('success', 'Login successful');
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        showNotification('error', response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            HexaBee Loan Management
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              required
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Developed and maintained by <span className="font-semibold">HexaBee Technologies</span>
        </div>
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};