'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EventSelector from '../EventSelector';

interface TopNavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function TopNavbar({ sidebarOpen, setSidebarOpen }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const { availableEvents, selectedEvent, selectEvent, isLoadingEvents } = useEvent();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full h-20  bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-white/5 transition-colors">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section: Logo & Mobile Toggle */}
        <div className="flex items-center gap-4 w-1/4 min-w-max">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl font-bold text-primary">
              NapEvent
            </span>
          </Link>
        </div>

        {/* Center Section: Event Selector */}
        <div className="flex-1 flex justify-center max-w-[400px]">
          {!isLoadingEvents && availableEvents.length > 0 && (
            // <div className="w-full">
            //   <Select
            //     value={selectedEvent?._id}
            //     onValueChange={(value) => selectEvent(value)}
            //   >
            //     <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all h-10 rounded-lg">
            //       <SelectValue placeholder="Seleccionar evento" />
            //     </SelectTrigger>
            //     <SelectContent
            //       position="popper"
            //       sideOffset={4}
            //       className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl w-[--radix-select-trigger-width]"
            //     >
            //       {availableEvents.map((event) => (
            //         <SelectItem
            //           key={event._id}
            //           value={event._id}
            //           className="focus:bg-blue-600 focus:text-white cursor-pointer py-3"
            //         >
            //           <div className="flex flex-col">
            //             <span className="font-medium text-sm">{event.name}</span>
            //             <span className="text-[10px] text-slate-500 dark:text-slate-400">{event.location}</span>
            //           </div>
            //         </SelectItem>
            //       ))}
            //     </SelectContent>
            //   </Select>
            // </div>
            // <></>
            <EventSelector withLabel={false} />
          )}

          {isLoadingEvents && (
            <div className="w-full h-10 bg-slate-100 dark:bg-white/5 rounded-lg animate-pulse" />
          )}
        </div>

        {/* Right Section: Theme Toggle + User Menu */}
        <div className="flex items-center gap-2 w-1/4 justify-end min-w-max">
          <ThemeToggle />

          {/* todo:  generar componente a parte */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white text-sm font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.email.split('@')[0]}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10">
              <DropdownMenuLabel className="text-slate-900 dark:text-white">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
              <DropdownMenuItem className="cursor-pointer text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/5">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/5">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
