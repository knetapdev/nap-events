'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/auth';
import { PERMISSIONS, UserRole } from '@/types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isPersonasOpen, setIsPersonasOpen] = useState(
    pathname.startsWith('/dashboard/personas')
  );

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  if (!user) return null;

  const showPersonasMenu =
    hasPermission(user.role, PERMISSIONS.USER_CREATE) ||
    hasPermission(user.role, PERMISSIONS.USER_ASSIGN);

  const showSystemMenu = user.role === UserRole.SUPER_ADMIN;

  const links = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
      show: true,
    },
    {
      href: '/dashboard/events',
      label: 'Eventos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      show: hasPermission(user.role, PERMISSIONS.EVENT_CREATE) || hasPermission(user.role, PERMISSIONS.EVENT_UPDATE),
    },
    {
      href: '/dashboard/tickets',
      label: 'Entradas',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
      show: true,
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
      label: 'Asignacion',
      show: hasPermission(user.role, PERMISSIONS.USER_ASSIGN),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-64
        bg-sidebar border-r border-sidebar-border
        flex flex-col transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-4">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Menu Principal
            </h2>
          </div>

          {links.filter((link) => link.show).map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                  ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }
                `}
              >
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Section: Administracion */}
          {showPersonasMenu && (
            <div className="pt-6 mt-4 border-t border-sidebar-border">
              <div className="px-3 mb-4">
                <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Administracion
                </h2>
              </div>

              <button
                onClick={() => setIsPersonasOpen(!isPersonasOpen)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150
                  ${pathname.startsWith('/dashboard/personas')
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={pathname.startsWith('/dashboard/personas') ? 'text-primary' : 'text-muted-foreground'}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </span>
                  <span>Personas</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isPersonasOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPersonasOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                  {personasSubLinks.filter((link) => link.show).map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`
                          flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150
                          ${isActive
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: Sistema (SUPER_ADMIN only) */}
          {showSystemMenu && (
            <div className="pt-6 mt-4 border-t border-sidebar-border">
              <div className="px-3 mb-4">
                <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Sistema
                </h2>
              </div>

              <Link
                href="/dashboard/companies"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                  ${pathname === '/dashboard/companies'
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                  }
                `}
              >
                <span className={pathname === '/dashboard/companies' ? 'text-primary' : 'text-muted-foreground'}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </span>
                <span>Compañias</span>
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
