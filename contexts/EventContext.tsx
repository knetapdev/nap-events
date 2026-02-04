'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { IEvent } from '@/types';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import { toast } from 'sonner';

interface EventContextType {
  availableEvents: IEvent[];
  selectedEvent: IEvent | null;
  isLoadingEvents: boolean;
  selectEvent: (eventId: string) => void;
  refreshEvents: () => Promise<void>;
  canAccessEvent: (eventId: string) => boolean;
  addEventOptimistic: (newEvent: IEvent) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

const SELECTED_EVENT_KEY = 'selected_event_id';

export function EventProvider({ children }: { children: ReactNode }) {
  const [availableEvents, setAvailableEvents] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { activeCompanyId, isLoadingCompanies, selectedCompany } = useCompany();

  useEffect(() => {
    if (isAuthenticated && user && !isLoadingCompanies) {
      refreshEvents();
    } else {
      setAvailableEvents([]);
      setSelectedEvent(null);
    }
  }, [isAuthenticated, user, isLoadingCompanies]);

  useEffect(() => {
    if (!isAuthenticated || !user || isLoadingCompanies) return;
    if (!activeCompanyId) return;

    setAvailableEvents([]);
    setSelectedEvent(null);
    localStorage.removeItem(SELECTED_EVENT_KEY);

    refreshEvents();
  }, [activeCompanyId, isAuthenticated, user, isLoadingCompanies]);

  useEffect(() => {
    if (availableEvents.length > 0) {
      const savedEventId = localStorage.getItem(SELECTED_EVENT_KEY);

      if (savedEventId) {
        const savedEvent = availableEvents.find((e) => e._id === savedEventId);
        if (savedEvent) {
          setSelectedEvent(savedEvent);
          return;
        }
      }

      setSelectedEvent(availableEvents[0]);
      localStorage.setItem(SELECTED_EVENT_KEY, availableEvents[0]._id);
    }
  }, [availableEvents]);


  // todo : revisar
  console.log(activeCompanyId)
  const refreshEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);

      const response = await fetch(
        `/api/events/my-events?companyId=${activeCompanyId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        setAvailableEvents([]);
        return;
      }

      const data = await response.json();
      setAvailableEvents(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      toast.error(`Invalid response from server, ${error}`);
      setAvailableEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [activeCompanyId]);

  const selectEvent = useCallback((eventId: string) => {
    const event = availableEvents.find((e) => e._id === eventId);
    if (event) {
      setSelectedEvent(event);
      localStorage.setItem(SELECTED_EVENT_KEY, eventId);
    }
  }, [availableEvents]);

  // todo : Aun no se usa pero podria servir
  const canAccessEvent = useCallback((eventId: string): boolean => {
    return availableEvents.some((e) => e._id === eventId);
  }, [availableEvents]);

  const addEventOptimistic = useCallback((newEvent: IEvent) => {
    setAvailableEvents(prev => [newEvent, ...prev]);
    selectEvent(newEvent._id);
  }, [selectEvent]);

  const value: EventContextType = {
    availableEvents,
    selectedEvent,
    isLoadingEvents,
    selectEvent,
    refreshEvents,
    canAccessEvent,
    addEventOptimistic,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
