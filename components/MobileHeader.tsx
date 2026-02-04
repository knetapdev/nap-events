'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface MobileHeaderProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function MobileHeader({ isOpen, setIsOpen }: MobileHeaderProps) {
    return (
        <header className="lg:hidden h-16 flex items-center justify-between px-4 bg-white dark:bg-[#020617] border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 transition-colors">
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">
                        NapEvents
                    </span>
                </Link>
            </div>

            <ThemeToggle />
        </header>
    );
}
