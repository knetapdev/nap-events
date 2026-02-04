'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IEvent } from '@/types';
import { useAuth } from './AuthContext';

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

  // Load events when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshEvents();
    } else {
      setAvailableEvents([]);
      setSelectedEvent(null);
    }
  }, [isAuthenticated, user]);

  // Restore selected event from localStorage when events are loaded
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

      // If no saved event or saved event not found, select the first one
      setSelectedEvent(availableEvents[0]);
      localStorage.setItem(SELECTED_EVENT_KEY, availableEvents[0]._id);
    }
  }, [availableEvents]);

  const refreshEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch('/api/events/my-events', {
        credentials: 'include',
      });

      console.log(await response)
      if (response.ok) {
        console.log('paso')
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableEvents(data.data);
        } else {
          setAvailableEvents([]);
        }
      } else {
        setAvailableEvents([]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setAvailableEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const selectEvent = (eventId: string) => {
    const event = availableEvents.find((e) => e._id === eventId);
    if (event) {
      setSelectedEvent(event);
      localStorage.setItem(SELECTED_EVENT_KEY, eventId);
    }
  };

  const canAccessEvent = (eventId: string): boolean => {
    return availableEvents.some((e) => e._id === eventId);
  };

  const addEventOptimistic = (newEvent: IEvent) => {
    setAvailableEvents(prev => [newEvent, ...prev]);
    selectEvent(newEvent._id);
  };

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
