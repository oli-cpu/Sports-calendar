import { useEffect, useMemo, useState } from 'react';
import type { SportEvent, SportId } from '../models/types';
import { SPORTS, sportById } from '../models/sports';
import { sportsDataProvider } from '../services/sports';
import { useInterests } from '../stores/InterestsContext';
import { useCalendar } from '../stores/CalendarContext';
import { EventCard } from '../components/EventCard';
import { EventCardSkeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';

type Timeframe = 'all' | 'today' | 'week' | 'month';

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'all', label: 'Upcoming' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
];

function withinTimeframe(iso: string, tf: Timeframe): boolean {
  if (tf === 'all') return true;
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((date.getTime() - startOfDay.getTime()) / (1000 * 60 * 60 * 24));
  if (tf === 'today') return diffDays === 0;
  if (tf === 'week') return diffDays >= 0 && diffDays < 7;
  if (tf === 'month') return diffDays >= 0 && diffDays < 31;
  return true;
}

export function EventsPage() {
  const { interests } = useInterests();
  const { addEvents } = useCalendar();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sport, setSport] = useState<SportId | 'all'>('all');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [reloadKey, setReloadKey] = useState(0);

  const followedSportIds = useMemo(
    () => Array.from(new Set(interests.map((i) => i.sportId))),
    [interests],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    // With no interests yet, fall back to the full catalog so the page is
    // never a dead end before onboarding-style filtering is set up.
    sportsDataProvider
      .getEvents({ interests })
      .then((result) => {
        if (!cancelled) setEvents(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [interests, reloadKey]);

  const filtered = events.filter(
    (e) => (sport === 'all' || e.sportId === sport) && withinTimeframe(e.startTime, timeframe),
  );

  const availableSports = SPORTS.filter((s) => followedSportIds.includes(s.id));

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addSelected = () => {
    addEvents(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div>
      <div className="animate-rise mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Events
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">Browse and filter everything coming up.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setSport('all')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
            sport === 'all'
              ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          All sports
        </button>
        {(availableSports.length > 0 ? availableSports : SPORTS).map((s) => (
          <button
            key={s.id}
            onClick={() => setSport(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              sport === s.id
                ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              timeframe === tf.id
                ? 'border-[var(--color-signal)] text-[var(--color-signal)]'
                : 'border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No events match." description="Try a different sport or timeframe." />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2">
            {filtered.map((event) => {
              const sportDef = sportById(event.sportId);
              const isChecked = selected.has(event.id);
              return (
                <label
                  key={event.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-signal)]/30"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelected(event.id)}
                    className="h-4 w-4 accent-[var(--color-signal)]"
                  />
                  <span className="text-sm">{sportDef?.icon}</span>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">{event.title}</span>
                  <span className="tabular hidden text-xs text-[var(--color-muted)] sm:inline">
                    {event.competition}
                  </span>
                  <span className="tabular text-xs text-[var(--color-muted)]">
                    {new Date(event.startTime).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </label>
              );
            })}
          </div>

          {selected.size > 0 && (
            <div className="sticky bottom-20 z-20 mb-8 flex items-center justify-between rounded-2xl border border-[var(--color-signal)]/40 bg-[var(--color-surface-2)] px-5 py-3 shadow-lg md:bottom-4">
              <span className="text-sm font-medium">
                {selected.size} event{selected.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={addSelected}
                className="rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
              >
                Add selected to calendar
              </button>
            </div>
          )}

          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
