import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { SportEvent } from '../models/types';
import { sportsDataProvider } from '../services/sports';
import { useInterests } from '../stores/InterestsContext';
import { EventCard } from '../components/EventCard';
import { EventCardSkeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const { interests } = useInterests();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
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

  return (
    <div>
      <div className="animate-rise mb-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          {greeting()} 👋
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">Your sports at a glance.</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
          Next events
        </h2>
        <Link to="/events" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]">
          See all →
        </Link>
      </div>

      {interests.length === 0 ? (
        <EmptyState
          title="Your calendar is empty."
          description="Follow your favorite teams, sports or competitions to get started."
          action={
            <Link
              to="/interests"
              className="rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
            >
              Add your first interest
            </Link>
          }
        />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : events.length === 0 ? (
        <EmptyState
          title="Nothing coming up."
          description="No events found for your current interests yet — check back soon."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.slice(0, 8).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
