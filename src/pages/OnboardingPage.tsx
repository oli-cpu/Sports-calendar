import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SPORTS } from '../models/sports';
import type { Interest, SportId } from '../models/types';
import { sportsDataProvider } from '../services/sports';
import { useInterests } from '../stores/InterestsContext';

type Step = 'sports' | 'interests';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { interests, addInterest, removeInterest, setOnboarded } = useInterests();
  const [step, setStep] = useState<Step>('sports');
  const [selectedSports, setSelectedSports] = useState<SportId[]>(
    Array.from(new Set(interests.map((i) => i.sportId))),
  );

  const toggleSport = (id: SportId) => {
    setSelectedSports((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const finish = () => {
    setOnboarded(true);
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-5 py-14">
      <div className="mb-10 flex items-center gap-2 text-sm text-[var(--color-muted)]">
        <span className={step === 'sports' ? 'text-[var(--color-text)]' : ''}>1. Sports</span>
        <span>—</span>
        <span className={step === 'interests' ? 'text-[var(--color-text)]' : ''}>2. Interests</span>
      </div>

      {step === 'sports' ? (
        <SportsStep
          selected={selectedSports}
          onToggle={toggleSport}
          onNext={() => setStep('interests')}
        />
      ) : (
        <InterestsStep
          sportIds={selectedSports}
          interests={interests}
          onAdd={addInterest}
          onRemove={removeInterest}
          onBack={() => setStep('sports')}
          onFinish={finish}
        />
      )}
    </div>
  );
}

function SportsStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: SportId[];
  onToggle: (id: SportId) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-rise">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        What sports do you follow?
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">Pick as many as you like — you can change this later.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPORTS.map((sport) => {
          const active = selected.includes(sport.id);
          return (
            <button
              key={sport.id}
              onClick={() => onToggle(sport.id)}
              className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--color-signal)] bg-[var(--color-signal-dim)] text-[var(--color-text)]'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <span className="text-2xl">{sport.icon}</span>
              {sport.label}
            </button>
          );
        })}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={onNext}
        className="mt-10 w-full rounded-full bg-[var(--color-signal)] py-3 text-base font-medium text-[#160c08] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}

function InterestsStep({
  sportIds,
  interests,
  onAdd,
  onRemove,
  onBack,
  onFinish,
}: {
  sportIds: SportId[];
  interests: Interest[];
  onAdd: (interest: Interest) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  const [activeSport, setActiveSport] = useState<SportId>(sportIds[0]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ teams: Interest[]; leagues: Interest[]; athletes: Interest[] }>({
    teams: [],
    leagues: [],
    athletes: [],
  });
  const [loading, setLoading] = useState(false);

  const selectedIds = useMemo(() => new Set(interests.map((i) => i.id)), [interests]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ teams: [], leagues: [], athletes: [] });
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      const [teams, leagues, athletes] = await Promise.all([
        sportsDataProvider.searchTeams(query, activeSport),
        sportsDataProvider.searchLeagues(query, activeSport),
        sportsDataProvider.searchAthletes(query, activeSport),
      ]);
      setResults({
        teams: teams.map((t) => ({ id: t.id, name: t.name, sportId: t.sportId, type: 'team' })),
        leagues: leagues.map((l) => ({ id: l.id, name: l.name, sportId: l.sportId, type: 'league' })),
        athletes: athletes.map((a) => ({ id: a.id, name: a.name, sportId: a.sportId, type: 'athlete' })),
      });
      setLoading(false);
    }, 350); // debounce per project spec §29
    return () => clearTimeout(handle);
  }, [query, activeSport]);

  const allResults = [...results.teams, ...results.leagues, ...results.athletes];
  const currentSportInterests = interests.filter((i) => sportIds.includes(i.sportId));

  return (
    <div className="animate-rise">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Add your interests
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">Search teams, leagues or athletes for each sport.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {sportIds.map((id) => {
          const sport = SPORTS.find((s) => s.id === id)!;
          return (
            <button
              key={id}
              onClick={() => setActiveSport(id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                activeSport === id
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {sport.icon} {sport.label}
            </button>
          );
        })}
      </div>

      <div className="relative mt-5">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search teams, leagues or competitions..."
          className="w-full rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] py-3 pl-11 pr-4 text-sm outline-none placeholder:text-[var(--color-faint)] focus:border-[var(--color-signal)]"
        />
      </div>

      <div className="mt-4 min-h-[4rem]">
        {loading && <p className="text-sm text-[var(--color-muted)]">Searching…</p>}
        {!loading && query.trim() && allResults.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No results for "{query}".</p>
        )}
        {!loading && allResults.length > 0 && (
          <ul className="flex flex-col gap-1">
            {allResults.map((item) => {
              const added = selectedIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => (added ? onRemove(item.id) : onAdd(item))}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                      added ? 'bg-[var(--color-signal-dim)]' : 'hover:bg-[var(--color-surface-2)]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                      {added ? 'Added ✓' : `+ Add · ${item.type}`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {currentSportInterests.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {currentSportInterests.map((i) => (
            <span
              key={i.id}
              className="flex items-center gap-2 rounded-full bg-[var(--color-surface-2)] px-3 py-1.5 text-sm"
            >
              {i.name}
              <button onClick={() => onRemove(i.id)} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 flex gap-3">
        <button
          onClick={onBack}
          className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Back
        </button>
        <button
          disabled={interests.length === 0}
          onClick={onFinish}
          className="flex-1 rounded-full bg-[var(--color-signal)] py-3 text-base font-medium text-[#160c08] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Go to my calendar
        </button>
      </div>
    </div>
  );
}
