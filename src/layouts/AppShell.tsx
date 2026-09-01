import { NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, Home, ListFilter, Settings, Trophy } from 'lucide-react';
import { useTheme } from '../stores/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Trophy },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/interests', label: 'Interests', icon: ListFilter },
];

export function AppShell() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-ink)] pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-ink)]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <NavLink to="/dashboard" className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
            Personal Sports Calendar
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-[var(--color-line)] px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <NavLink
              to="/settings"
              className="hidden rounded-full border border-[var(--color-line)] p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] md:block"
              aria-label="Settings"
            >
              <Settings size={18} />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--color-line)] bg-[var(--color-ink)]/95 py-2 backdrop-blur-md md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs ${
                isActive ? 'text-[var(--color-signal)]' : 'text-[var(--color-muted)]'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
