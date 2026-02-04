'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function NoEventsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">📅</div>
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-3">
          No tienes eventos asignados
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Actualmente no tienes acceso a ningún evento en el sistema.
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Por favor, contacta a tu administrador para que te asigne a un evento.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Usuario:</strong> {user?.email}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Rol:</strong> {user?.role.replace('_', ' ')}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
