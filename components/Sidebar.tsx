'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS } from '@/types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isPersonasOpen, setIsPersonasOpen] = useState(
    pathname.startsWith('/dashboard/personas')
  );

  useEffect(() => {
    // Close sidebar on navigation in mobile
    if (onClose) onClose();
  }, [pathname]);

  if (!user) return null;

  const showPersonasMenu =
    hasPermission(user.role, PERMISSIONS.USER_CREATE) ||
    hasPermission(user.role, PERMISSIONS.USER_ASSIGN);

  const links = [
    // ... paths remain same
    {
      href: '/dashboard',
      label: 'Dashboard',
      show: true,
    },
    {
      href: '/dashboard/events',
      label: 'Eventos',
      show: hasPermission(user.role, PERMISSIONS.EVENT_CREATE) || hasPermission(user.role, PERMISSIONS.EVENT_UPDATE),
    },
    {
      href: '/dashboard/tickets',
      label: 'Entradas',
      show: true,
    },
    {
      href: '/dashboard/reports',
      label: 'Reportes',
      show: hasPermission(user.role, PERMISSIONS.REPORT_VIEW),
    },
    {
      href: '/dashboard/tickets/scan',
      label: 'Check-in',
      show: hasPermission(user.role, PERMISSIONS.TICKET_CHECKIN),
    },
  ];

  const personasSubLinks = [
    {
      href: '/dashboard/personas/usuarios',
      label: 'Usuarios',
      show: hasPermission(user.role, PERMISSIONS.USER_CREATE),
    },
    {
      href: '/dashboard/personas/asignacion',
      label: 'Asignación',
      show: hasPermission(user.role, PERMISSIONS.USER_ASSIGN),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-white/5
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Decorative background glow - only in dark mode */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 dark:bg-orange-600/10 blur-3xl -mr-16 -mt-16 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/5 dark:bg-amber-600/10 blur-3xl -ml-16 -mb-16 rounded-full pointer-events-none"></div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto relative z-10">
          <div className="px-3 mb-2">
            <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
              Menu Principal
            </h2>
          </div>

          {links.filter((link) => link.show).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${isActive
                  ? 'bg-orange-500/10 dark:bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-orange-600 dark:hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-full"></div>
                )}
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* Section: Administracion */}
          {showPersonasMenu && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5">
              <div className="px-3 mb-2">
                <h2 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
                  Administración
                </h2>
              </div>

              <button
                onClick={() => setIsPersonasOpen(!isPersonasOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/dashboard/personas')
                  ? 'bg-orange-500/10 dark:bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-orange-600 dark:hover:text-white'
                  }`}
              >
                <span className="font-medium">Personas</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isPersonasOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPersonasOpen && (
                <div className="ml-3 mt-1 space-y-1 pl-3">
                  {personasSubLinks.filter((link) => link.show).map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${isActive
                          ? 'text-orange-600 dark:text-orange-400 font-medium'
                          : 'text-slate-500 hover:text-orange-600 dark:hover:text-white transition-colors'
                          }`}
                      >
                        <span className="text-sm">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
