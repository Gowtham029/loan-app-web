import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="lg:ml-64 flex flex-col h-full">
        <div className="flex-shrink-0">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
        
        <div className="flex-shrink-0">
          <Footer />
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};