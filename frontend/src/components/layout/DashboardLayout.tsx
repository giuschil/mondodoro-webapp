'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Sparkles, 
  Gift, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  CreditCard,
  Users
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navigation = [
    {
      name: 'Panoramica',
      href: '/dashboard',
      icon: BarChart3,
      current: pathname === '/dashboard',
    },
    {
      name: 'Liste Regalo',
      href: '/dashboard/gift-lists',
      icon: Gift,
      current: pathname.startsWith('/dashboard/gift-lists'),
    },
    {
      name: 'Contributi',
      href: '/dashboard/contributions',
      icon: CreditCard,
      current: pathname.startsWith('/dashboard/contributions'),
    },
    {
      name: 'Clienti',
      href: '/dashboard/customers',
      icon: Users,
      current: pathname.startsWith('/dashboard/customers'),
    },
    {
      name: 'Impostazioni',
      href: '/dashboard/settings',
      icon: Settings,
      current: pathname.startsWith('/dashboard/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-secondary-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      item.current ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-secondary-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-secondary-700 group-hover:text-secondary-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm font-medium text-secondary-500 group-hover:text-secondary-700">
                  {user?.business_name || 'Gioielliere'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-secondary-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-secondary-900">Mondodoro</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-secondary-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-secondary-700">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs font-medium text-secondary-500">
                  {user?.business_name || 'Gioielliere'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-secondary-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
