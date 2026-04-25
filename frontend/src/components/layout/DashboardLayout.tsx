'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, Gift, User, LogOut, Menu, X, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Liste Regalo', href: '/dashboard/gift-lists', icon: Gift },
    { name: 'Eventi', href: '/dashboard/events', icon: CalendarDays },
    { name: 'Profilo', href: '/dashboard/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
        <Sparkles className="h-7 w-7 text-amber-500" />
        <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-6 gap-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150
                ${active
                  ? 'bg-amber-50 text-amber-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  active ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              {item.name}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-gray-100 p-4">
        {user && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-gray-50">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 group"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ─── Mobile overlay backdrop ─── */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden
          transition-opacity duration-300 ease-in-out
          ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ─── Mobile slide-in drawer ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu principale"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600
            hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          aria-label="Chiudi menu"
        >
          <X className="h-5 w-5" />
        </button>

        <SidebarContent />
      </aside>

      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200 shadow-sm">
        <SidebarContent />
      </aside>

      {/* ─── Main content ─── */}
      <div className="lg:pl-64">

        {/* Top bar (mobile only) */}
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3 lg:hidden shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100
              transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Apri menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="text-base font-bold text-gray-900">ListDreams</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {user && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Benvenuto, {user.first_name}!
                </h1>
                {user.role === 'jeweler' && user.business_name && (
                  <p className="text-gray-500 text-sm mt-0.5">{user.business_name}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
