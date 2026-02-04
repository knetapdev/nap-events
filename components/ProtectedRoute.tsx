'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/auth';
import { Permission, UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  requireAll?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermissions,
  requiredRoles,
  requireAll = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return null;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(user.role)) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md px-6 py-8 bg-white rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    let hasAccess = false;

    if (requireAll) {
      hasAccess = hasAllPermissions(user.role, requiredPermissions);
    } else {
      hasAccess = hasAnyPermission(user.role, requiredPermissions);
    }

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md px-6 py-8 bg-white rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}
