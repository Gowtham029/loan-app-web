import { User } from '@/types';

export const hasPermission = (user: User | null, action: 'read' | 'write' | 'delete'): boolean => {
  if (!user) return false;
  
  switch (user.role) {
    case 'admin':
    case 'manager':
      return true; // Admin and Manager have all permissions
    case 'viewer':
      return action === 'read'; // Viewer can only read
    default:
      return false;
  }
};

export const canAccessUsers = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'manager';
};