import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Interest, SportId } from '../models/types';
import { SPORTS, sportById } from '../models/sports';
import { sportsDataProvider } from '../services/sports';
import { useInterests } from '../stores/InterestsContext';
import { EmptyState } from '../components/States';

export function InterestsPage() {
  const { interests, addInterest, removeInterest } = useInterests();
  const [addingFor, setAddingFor] = useState<SportId | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<SportId, Interest[]>();
    for (const i of interests) {
      map.set(i.sportId, [...(map.get(i.sportId) ?? []), i]);
    }
    return map;
  }, [interests]);

  return (
    <div>
      <div className="animate-rise mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          My interests
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">The teams, leagues and athletes you follow.</p>
      </div>

      {interests.length === 0 ? (
        <EmptyState
          title="No interests yet."
          description="Add a sport below to start following teams, leagues or athletes."
          action={
            <button
              onClick={() => setAddingFor(SPORTS[0].id)}
              className="rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
            >
              + Add interest
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([sportId, items]) => {
            const sport = sportById(sportId);
            return (
              <div key={sportId}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span>{sport?.icon}</span> {sport?.label}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {items.map((i) => (
                    <span
                      key={i.id}
                      className="flex items-center gap-2 rounded-full bg-[var(--color-surface-2)] px-3.5 py-1.5 text-sm"
                    >
                      {i.name}
                      <button
                        onClick={() => removeInterest(i.id)}
                        aria-label={`Remove ${i.name}`}
                        className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setAddingFor(sportId)}
                    className="rounded-full border border-dashed border-[var(--color-line)] px-3.5 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-muted)]">Follow a new sport</h2>
            <div className="flex flex-wrap gap-2">
              {SPORTS.filter((s) => !grouped.has(s.id)).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setAddingFor(s.id)}
                  className="rounded-full border border-[var(--color-line)] px-3.5 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {addingFor && (
        <AddInterestModal
          sportId={addingFor}
          existingIds={new Set(interests.map((i) => i.id))}
          onAdd={addInterest}
          onRemove={removeInterest}
          onClose={() => setAddingFor(null)}
        />
      )}
    </div>
  );
}

function AddInterestModal({
  sportId,
  existingIds,
  onAdd,
  onRemove,
  onClose,
}: {
  sportId: SportId;
  existingIds: Set<string>;
  onAdd: (i: Interest) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [activeSport, setActiveSport] = useState<SportId>(sportId);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const [teams, leagues, athletes] = await Promise.all([
        sportsDataProvider.searchTeams(query, activeSport),
        sportsDataProvider.searchLeagues(query, activeSport),
        sportsDataProvider.searchAthletes(query, activeSport),
      ]);
      setResults([
        ...teams.map((t) => ({ id: t.id, name: t.name, sportId: t.sportId, type: 'team' as const })),
        ...leagues.map((l) => ({ id: l.id, name: l.name, sportId: l.sportId, type: 'league' as const })),
        ...athletes.map((a) => ({ id: a.id, name: a.name, sportId: a.sportId, type: 'athlete' as const })),
      ]);
      setLoading(false);
    }, 350);
    return () => clearTimeout(handle);
  }, [query, activeSport]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="animate-rise w-full max-w-md rounded-t-3xl border border-[var(--color-line)] bg-[var(--color-ink)] p-6 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">Add interest</h2>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {SPORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSport(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activeSport === s.id
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {s.icon}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search teams, leagues or athletes…"
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-signal)]"
          />
        </div>

        <div className="mt-3 max-h-64 overflow-y-auto">
          {loading && <p className="px-1 py-3 text-sm text-[var(--color-muted)]">Searching…</p>}
          {!loading && query.trim() && results.length === 0 && (
            <p className="px-1 py-3 text-sm text-[var(--color-muted)]">No results for "{query}".</p>
          )}
          {!loading &&
            results.map((r) => {
              const added = existingIds.has(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => (added ? onRemove(r.id) : onAdd(r))}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${
                    added ? 'bg-[var(--color-signal-dim)]' : 'hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-xs uppercase text-[var(--color-muted)]">{added ? 'Added ✓' : '+ Add'}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
