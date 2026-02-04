'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { availableEvents, isLoadingEvents } = useEvent();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Redirect to no-events page if user has no events assigned
  useEffect(() => {
    if (!isLoading && !isLoadingEvents && isAuthenticated && availableEvents.length === 0) {
      // Only redirect if not already on the no-events page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/no-events')) {
        router.push('/dashboard/no-events');
      }
    }
  }, [isLoading, isLoadingEvents, isAuthenticated, availableEvents, router]);

  // Show loading state
  if (isLoading || isLoadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 animate-pulse" />
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
