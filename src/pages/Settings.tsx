import React, { useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { setAuthEnabled, getAuthEnabled } from '@/utils/api';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/UI/Notification';

export const Settings: React.FC = () => {
  const [authToggle, setAuthToggle] = useState(getAuthEnabled());
  const { notification, showNotification, hideNotification } = useNotification();

  const handleAuthToggle = () => {
    const newValue = !authToggle;
    setAuthToggle(newValue);
    setAuthEnabled(newValue);
    showNotification('success', `Authentication ${newValue ? 'enabled' : 'disabled'}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Authentication Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enable/Disable authentication for the system
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  When disabled, users can access the system without login
                </p>
              </div>
              <Button
                onClick={handleAuthToggle}
                variant={authToggle ? 'danger' : 'primary'}
              >
                {authToggle ? 'Disable Auth' : 'Enable Auth'}
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="API Base URL" defaultValue="http://localhost:3000" />
              <Input label="Items per page" type="number" defaultValue="10" />
              <Input label="Session timeout (minutes)" type="number" defaultValue="30" />
              <Input label="Max file upload size (MB)" type="number" defaultValue="10" />
            </div>
            <div className="mt-4">
              <Button>Save Configuration</Button>
            </div>
          </div>
        </div>
      </div>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </Layout>
  );
};