import { useNavigate } from 'react-router-dom';

const PREVIEW_EVENTS = [
  { icon: '⚽', competition: 'Real Madrid', title: 'vs Valencia', when: 'Today · 21:00', rotate: '-rotate-2' },
  { icon: '🏎️', competition: 'Formula 1', title: 'Italian Grand Prix', when: 'Sun · 15:00', rotate: 'rotate-1' },
  { icon: '🎾', competition: 'Tennis', title: 'US Open', when: 'Tomorrow · 18:00', rotate: '-rotate-1' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Personal Sports Calendar
        </span>
        <button
          onClick={() => navigate('/onboarding')}
          className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Get Started
        </button>
      </header>

      <section className="mx-auto grid max-w-6xl gap-14 px-5 pb-24 pt-10 md:grid-cols-[1.1fr_0.9fr] md:pt-20">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Your sports.
            <br />
            Your schedule.
            <br />
            <span className="text-[var(--color-signal)]">One calendar.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-[var(--color-muted)]">
            Find every match, race and tournament that matters to you — across every sport, one
            unified calendar.
          </p>
          <button
            onClick={() => navigate('/onboarding')}
            className="mt-8 rounded-full bg-[var(--color-signal)] px-6 py-3 text-base font-medium text-[#160c08] transition hover:brightness-110"
          >
            Start personalizing →
          </button>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[var(--color-muted)]">
            <span>⚽ Football</span>
            <span>🏀 Basketball</span>
            <span>🏎️ Motorsport</span>
            <span>🎾 Tennis</span>
            <span>🏒 Ice Hockey</span>
            <span>+ 10 more</span>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 pt-4">
          {PREVIEW_EVENTS.map((event, i) => (
            <div
              key={event.title}
              className={`animate-rise ${event.rotate} rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]`}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
                {event.icon} {event.competition}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold">
                {event.title}
              </h3>
              <p className="tabular mt-3 text-sm text-[var(--color-muted)]">{event.when}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
