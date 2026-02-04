'use client';

import { useEvent } from '@/contexts/EventContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function EventSelector({ withLabel = true, withDetails = true }: { withLabel?: boolean, withDetails?: boolean }) {
  const { availableEvents, selectedEvent, selectEvent, isLoadingEvents } = useEvent();

  if (isLoadingEvents) {
    return (
      <div className="px-4 py-4 border-b border-slate-200 dark:border-white/10">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (availableEvents.length === 0) {
    return (
      <div className="px-4 py-4 border-b border-slate-200 dark:border-white/10">
        <p className="text-xs text-slate-500 italic">No tienes eventos asignados</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 min-w-[200px]">
      {
        withLabel && (
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block px-1">
            Evento Seleccionado
          </label>
        )
      }

      <Select
        value={selectedEvent?._id}
        onValueChange={(value) => selectEvent(value)}
      >
        <SelectTrigger className={cn(
          withDetails
            ? 'min-w-[280px] w-full'
            : 'w-auto',
          'min-h-12 h-20 rounded-lg bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all'
        )}>
          <SelectValue placeholder="Seleccionar evento" />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="bg-white text-center dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl shadow-xl w-[--radix-select-trigger-width]"
        >
          {availableEvents.map((event) => (
            <SelectItem
              key={event._id}
              value={event._id}
              className="focus:bg-primary focus:text-white cursor-pointer py-3 w-full"
            >
              <div className="flex flex-row justify-center items-center w-full text-center gap-2">
                <span className="text-base font-medium w-full text-center">{event.name}</span>
                {
                  withDetails && (
                    -  <span className="text-[14px] text-slate-500 dark:text-slate-400 w-full text-center mt-0.5">{event.location}</span>
                  )
                }
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
