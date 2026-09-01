import type { ReactNode } from 'react';

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">Something went wrong.</h3>
      <p className="max-w-sm text-sm text-[var(--color-muted)]">
        We couldn't load your sports events. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-medium text-[#160c08] hover:brightness-110"
      >
        Try again
      </button>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--color-line)] px-6 py-16 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--color-muted)]">{description}</p>
      {action}
    </div>
  );
}
