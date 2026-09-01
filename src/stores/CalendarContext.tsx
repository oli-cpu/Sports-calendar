import { createContext, useContext, type ReactNode } from 'react';
import type { CalendarEntry, ReminderOffset } from '../models/types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface CalendarContextValue {
  entries: CalendarEntry[];
  isAdded: (eventId: string) => boolean;
  addEvent: (eventId: string, reminder?: ReminderOffset) => void;
  addEvents: (eventIds: string[]) => void;
  removeEvent: (eventId: string) => void;
  setReminder: (eventId: string, reminder: ReminderOffset) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useLocalStorage<CalendarEntry[]>('psc.calendar', []);

  const isAdded = (eventId: string) => entries.some((e) => e.eventId === eventId);

  const addEvent = (eventId: string, reminder: ReminderOffset = 'none') => {
    setEntries((prev) =>
      prev.some((e) => e.eventId === eventId)
        ? prev
        : [...prev, { eventId, addedAt: new Date().toISOString(), reminder }],
    );
  };

  const addEvents = (eventIds: string[]) => {
    setEntries((prev) => {
      const existing = new Set(prev.map((e) => e.eventId));
      const additions = eventIds
        .filter((id) => !existing.has(id))
        .map((id) => ({ eventId: id, addedAt: new Date().toISOString(), reminder: 'none' as ReminderOffset }));
      return [...prev, ...additions];
    });
  };

  const removeEvent = (eventId: string) => {
    setEntries((prev) => prev.filter((e) => e.eventId !== eventId));
  };

  const setReminder = (eventId: string, reminder: ReminderOffset) => {
    setEntries((prev) => prev.map((e) => (e.eventId === eventId ? { ...e, reminder } : e)));
  };

  return (
    <CalendarContext.Provider value={{ entries, isAdded, addEvent, addEvents, removeEvent, setReminder }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
}
