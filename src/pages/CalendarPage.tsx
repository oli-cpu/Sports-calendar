import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import type { SportEvent } from '../models/types';
import { sportById } from '../models/sports';
import { sportsDataProvider } from '../services/sports';
import { useCalendar } from '../stores/CalendarContext';
import { formatEventTime } from '../utils/date';
import { downloadIcs } from '../calendar/export';
import { EmptyState } from '../components/States';
import { Link } from 'react-router-dom';

type View = 'month' | 'week' | 'agenda';

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarPage() {
  const { entries } = useCalendar();
  const [allEvents, setAllEvents] = useState<SportEvent[]>([]);
  const [view, setView] = useState<View>('agenda');
  const [monthCursor, setMonthCursor] = useState(() => new Date());

  useEffect(() => {
    sportsDataProvider.getEvents({ interests: [] }).then(setAllEvents);
  }, []);

  const myEvents = useMemo(() => {
    const ids = new Set(entries.map((e) => e.eventId));
    return allEvents
      .filter((e) => ids.has(e.id))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [allEvents, entries]);

  return (
    <div>
      <div className="animate-rise mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Calendar
          </h1>
          <p className="mt-1 text-[var(--color-muted)]">Everything you've added, in one place.</p>
        </div>
        {myEvents.length > 0 && (
          <button
            onClick={() => downloadIcs(myEvents)}
            className="flex items-center gap-2 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <Download size={16} /> Export all (.ics)
          </button>
        )}
      </div>

      <div className="mb-8 flex gap-1 rounded-full border border-[var(--color-line)] p-1 w-fit">
        {(['month', 'week', 'agenda'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              view === v
                ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {myEvents.length === 0 ? (
        <EmptyState
          title="Your calendar is empty."
          description="Add events from your dashboard or the events list to see them here."
          action={
            <Link
              to="/events"
              className="rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
            >
              Browse events
            </Link>
          }
        />
      ) : view === 'agenda' ? (
        <AgendaView events={myEvents} />
      ) : view === 'week' ? (
        <WeekView events={myEvents} />
      ) : (
        <MonthView events={myEvents} cursor={monthCursor} onCursorChange={setMonthCursor} />
      )}
    </div>
  );
}

function AgendaView({ events }: { events: SportEvent[] }) {
  const groups = new Map<string, SportEvent[]>();
  for (const e of events) {
    const key = new Date(e.startTime).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }

  return (
    <div className="flex flex-col gap-8">
      {Array.from(groups.entries()).map(([day, dayEvents]) => (
        <div key={day}>
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">{day}</h3>
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => {
              const sport = sportById(event.sportId);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-signal)]/40"
                >
                  <span className="tabular w-14 shrink-0 text-sm text-[var(--color-muted)]">
                    {formatEventTime(event.startTime)}
                  </span>
                  <span>{sport?.icon}</span>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">{event.title}</span>
                  <span className="hidden text-xs text-[var(--color-muted)] sm:inline">{event.competition}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeekView({ events }: { events: SportEvent[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="grid gap-3 sm:grid-cols-7">
      {days.map((day) => {
        const dayEvents = events.filter((e) => sameDay(new Date(e.startTime), day));
        return (
          <div key={day.toISOString()} className="rounded-xl border border-[var(--color-line)] p-3">
            <p className="tabular text-xs text-[var(--color-muted)]">
              {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {dayEvents.map((e) => (
                <Link
                  key={e.id}
                  to={`/events/${e.id}`}
                  className="block truncate rounded-lg bg-[var(--color-signal-dim)] px-2 py-1 text-xs text-[var(--color-signal)]"
                >
                  {sportById(e.sportId)?.icon} {e.title}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({
  events,
  cursor,
  onCursorChange,
}: {
  events: SportEvent[];
  cursor: Date;
  onCursorChange: (d: Date) => void;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onCursorChange(new Date(year, month - 1, 1))}
          className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          ←
        </button>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => onCursorChange(new Date(year, month + 1, 1))}
          className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-[var(--color-muted)]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const date = new Date(year, month, day);
          const dayEvents = events.filter((e) => sameDay(new Date(e.startTime), date));
          return (
            <div
              key={day}
              className="flex aspect-square flex-col items-center gap-1 rounded-lg border border-[var(--color-line)] p-1.5"
            >
              <span className="tabular text-xs text-[var(--color-text)]">{day}</span>
              <div className="flex flex-wrap justify-center gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <span key={e.id} className="text-[10px]">
                    {sportById(e.sportId)?.icon}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
