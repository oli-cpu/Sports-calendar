import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, Download } from 'lucide-react';
import type { ReminderOffset, SportEvent } from '../models/types';
import { sportById } from '../models/sports';
import { sportsDataProvider } from '../services/sports';
import { formatEventTime, formatFullDate } from '../utils/date';
import { downloadIcs, googleCalendarLink } from '../calendar/export';
import { useCalendar } from '../stores/CalendarContext';

const REMINDER_OPTIONS: { id: ReminderOffset; label: string }[] = [
  { id: 'none', label: 'Never' },
  { id: '15m', label: '15 minutes before' },
  { id: '30m', label: '30 minutes before' },
  { id: '1h', label: '1 hour before' },
  { id: '3h', label: '3 hours before' },
  { id: '1d', label: '1 day before' },
];

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SportEvent | null | undefined>(undefined);
  const { isAdded, addEvent, removeEvent, entries, setReminder } = useCalendar();

  useEffect(() => {
    let cancelled = false;
    sportsDataProvider.getEvents({ interests: [] }).then((all) => {
      if (!cancelled) setEvent(all.find((e) => e.id === id) ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (event === undefined) {
    return <div className="animate-pulse text-[var(--color-muted)]">Loading…</div>;
  }

  if (event === null) {
    return (
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Event not found</h1>
        <Link to="/events" className="mt-4 inline-block text-sm text-[var(--color-signal)]">
          ← Back to events
        </Link>
      </div>
    );
  }

  const sport = sportById(event.sportId);
  const added = isAdded(event.id);
  const entry = entries.find((e) => e.eventId === event.id);

  return (
    <div className="animate-rise mx-auto max-w-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <p className="text-sm text-[var(--color-muted)]">
        {sport?.icon} {sport?.label}
      </p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-tight">
        {event.title}
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">{event.competition}</p>

      <div className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <div className="tabular flex items-baseline gap-3">
          <span className="text-2xl font-semibold">{formatEventTime(event.startTime)}</span>
          <span className="text-sm text-[var(--color-muted)]">{formatFullDate(event.startTime)}</span>
        </div>
        {event.venue && <p className="mt-2 text-sm text-[var(--color-muted)]">📍 {event.venue}</p>}

        {event.home && event.away && (
          <div className="mt-6 flex items-center justify-center gap-6 border-y border-[var(--color-line)] py-6 text-center">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">{event.home}</span>
            <span className="text-sm text-[var(--color-muted)]">vs</span>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold">{event.away}</span>
          </div>
        )}

        {event.previousStartTime && (
          <div className="mt-4 rounded-xl bg-[var(--color-signal-dim)] px-4 py-3 text-sm text-[var(--color-signal)]">
            ⚠️ This event was rescheduled from{' '}
            {formatFullDate(event.previousStartTime)} {formatEventTime(event.previousStartTime)}.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => (added ? removeEvent(event.id) : addEvent(event.id))}
            className={`flex-1 rounded-full py-3 text-sm font-medium transition-colors ${
              added
                ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]'
                : 'bg-[var(--color-signal)] text-[#160c08] hover:brightness-110'
            }`}
          >
            {added ? 'Added to calendar ✓' : '+ Add to calendar'}
          </button>
          <a
            href={googleCalendarLink(event)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full border border-[var(--color-line)] py-3 text-center text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Google Calendar
          </a>
          <button
            onClick={() => downloadIcs([event], `${event.id}.ics`)}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <Download size={16} /> .ics
          </button>
        </div>
      </div>

      {added && (
        <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Bell size={16} /> Notify me
          </p>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setReminder(event.id, opt.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  (entry?.reminder ?? 'none') === opt.id
                    ? 'border-[var(--color-signal)] text-[var(--color-signal)]'
                    : 'border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
