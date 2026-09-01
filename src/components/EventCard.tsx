import { Link } from 'react-router-dom';
import type { SportEvent } from '../models/types';
import { sportById } from '../models/sports';
import { formatEventDay, formatEventTime } from '../utils/date';
import { useCalendar } from '../stores/CalendarContext';

export function EventCard({ event, index = 0 }: { event: SportEvent; index?: number }) {
  const sport = sportById(event.sportId);
  const { isAdded, addEvent, removeEvent } = useCalendar();
  const added = isAdded(event.id);

  return (
    <div
      className="animate-rise group relative flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-signal)]/40"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <Link to={`/events/${event.id}`} className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {sport?.icon} {event.competition}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold leading-snug">
            {event.title}
          </h3>
        </Link>
        {event.status === 'live' && (
          <span className="flex items-center gap-1.5 rounded-full bg-[var(--color-signal-dim)] px-2.5 py-1 text-xs font-medium text-[var(--color-signal)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-signal)]" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="tabular text-sm text-[var(--color-muted)]">
          <div className="text-base text-[var(--color-text)]">{formatEventDay(event.startTime)}</div>
          <div>{formatEventTime(event.startTime)}</div>
          {event.venue && <div className="mt-1 text-xs">{event.venue}</div>}
        </div>

        <button
          onClick={() => (added ? removeEvent(event.id) : addEvent(event.id))}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            added
              ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]'
              : 'bg-[var(--color-signal)] text-[#160c08] hover:brightness-110'
          }`}
        >
          {added ? 'Added ✓' : '+ Add to calendar'}
        </button>
      </div>
    </div>
  );
}
