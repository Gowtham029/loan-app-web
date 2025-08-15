import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck,
  CreditCard, 
  Banknote, 
  FileText, 
  Building, 
  Settings, 
  Info 
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessUsers } from '@/utils/permissions';

const getMenuItems = (user: any) => [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/loans', label: 'Loans', icon: Banknote },
  { path: '/payments', label: 'Payments', icon: CreditCard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/capital', label: 'Capital', icon: Building },
  ...(canAccessUsers(user) ? [{ path: '/users', label: 'Users', icon: UserCheck }] : []),
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/info', label: 'Info', icon: Info },
];

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const menuItems = getMenuItems(user);

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen w-64 transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 ease-in-out border-r border-slate-700',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0'
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-center border-b border-slate-700/50 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">HexaBee</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25 transform scale-105'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:scale-105 hover:shadow-lg'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200',
                  isActive 
                    ? 'bg-white/20 shadow-inner' 
                    : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.firstName?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};