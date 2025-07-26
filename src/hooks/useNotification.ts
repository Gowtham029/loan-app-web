import { useState } from 'react';

interface NotificationState {
  type: 'success' | 'error' | 'warning';
  message: string;
  isVisible: boolean;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    type: 'success',
    message: '',
    isVisible: false,
  });

  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
};