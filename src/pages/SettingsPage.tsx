import { useState } from 'react';
import { useTheme } from '../stores/ThemeContext';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  return (
    <div className="max-w-lg">
      <div className="animate-rise mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-[var(--color-muted)]">Preferences are saved on this device.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <div>
            <p className="text-sm font-medium">Appearance</p>
            <p className="text-sm text-[var(--color-muted)]">
              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <div>
            <p className="text-sm font-medium">Browser notifications</p>
            <p className="text-sm text-[var(--color-muted)]">
              {notifPermission === 'granted'
                ? 'Enabled — reminders will show as browser notifications.'
                : notifPermission === 'denied'
                  ? 'Blocked in your browser settings.'
                  : notifPermission === 'unsupported'
                    ? 'Not supported in this browser.'
                    : 'Turn on to get reminders before events start.'}
            </p>
          </div>
          {notifPermission === 'default' && (
            <button
              onClick={requestNotifications}
              className="rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
            >
              Enable
            </button>
          )}
        </div>

        <p className="px-1 text-xs text-[var(--color-muted)]">
          Per-event reminder timing (15 min – 1 day before) is set from each event's detail page.
        </p>
      </div>
    </div>
  );
}
