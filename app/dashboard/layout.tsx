'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { availableEvents, isLoadingEvents } = useEvent();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  //todo:  corregir esto
  useEffect(() => {
    if (isLoading || isLoadingEvents || !isAuthenticated) return;

    if (availableEvents.length === 0 && pathname === '/dashboard') {
      router.push('/dashboard/no-events');
    } else {
      router.push(pathname)
    }
  }, [isLoading, isLoadingEvents, isAuthenticated, availableEvents, router]);

  // Show loading state
  if (isLoading || isLoadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <p className="text-slate-300 text-lg font-medium tracking-wide">Preparando tu experiencia...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
