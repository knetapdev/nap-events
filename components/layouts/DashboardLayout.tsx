'use client';

import React, { ReactNode, useState } from 'react';
import Sidebar from '../Sidebar';
import TopNavbar from '../navigation/TopNavbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      {/* Subtle background accent - only in dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 dark:opacity-100 hidden dark:block">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      </div>

      {/* Top Navbar - Siempre visible */}
      <TopNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Solo navegación */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto relative z-10 dashboard-bg transition-colors duration-300">
          <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
