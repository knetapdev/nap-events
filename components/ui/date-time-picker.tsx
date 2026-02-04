'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DateTimePickerProps {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function DateTimePicker({
    value,
    onChange,
    placeholder,
    disabled
}: DateTimePickerProps) {
    const hours = value ? value.getHours() : 0;
    const minutes = value ? value.getMinutes() : 0;

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) return;
        const newDate = new Date(date);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        onChange(newDate);
    };

    const setHour = (h: number) => {
        const baseDate = value || new Date();
        const newDate = new Date(baseDate);
        newDate.setHours(h);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        onChange(newDate);
    };

    const setMinute = (m: number) => {
        const baseDate = value || new Date();
        const newDate = new Date(baseDate);
        newDate.setHours(hours);
        newDate.setMinutes(m);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        onChange(newDate);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* Date Picker Part */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all",
                            !value && "text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                        {value ? (
                            format(value, "d 'de' MMM, yyyy", { locale: es })
                        ) : (
                            <span>{placeholder || "Fecha"}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-100">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="rounded-xl border-none p-0"
                    />
                </PopoverContent>
            </Popover>

            {/* Time Picker Part */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        disabled={disabled}
                        className={cn(
                            "w-full justify-start text-left font-normal h-12 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 transition-all",
                            !value && "text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <Clock className="mr-2 h-4 w-4 text-indigo-500" />
                        {value ? (
                            format(value, "HH:mm")
                        ) : (
                            <span>Hora</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-32 p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-100 overflow-hidden">
                    <div className="flex flex-col bg-slate-50/50 dark:bg-black/20">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Seleccionar</span>
                        </div>
                        <div className="flex h-[200px] divide-x divide-slate-100 dark:divide-white/5">
                            {/* Hours Scroll */}
                            <ScrollArea className="flex-1">
                                <div className="p-1 px-2 space-y-0.5">
                                    {Array.from({ length: 24 }).map((_, i) => (
                                        <Button
                                            key={i}
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-8 px-0 justify-center text-xs font-semibold rounded-lg transition-all",
                                                hours === i
                                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                            )}
                                            onClick={() => setHour(i)}
                                        >
                                            {i.toString().padStart(2, '0')}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                            {/* Minutes Scroll */}
                            <ScrollArea className="flex-1">
                                <div className="p-1 px-2 space-y-0.5">
                                    {Array.from({ length: 12 }).map((_, i) => {
                                        const m = i * 5;
                                        return (
                                            <Button
                                                key={m}
                                                variant="ghost"
                                                className={cn(
                                                    "w-full h-8 px-0 justify-center text-xs font-semibold rounded-lg transition-all",
                                                    minutes === m
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/10"
                                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                                )}
                                                onClick={() => setMinute(m)}
                                            >
                                                {m.toString().padStart(2, '0')}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
