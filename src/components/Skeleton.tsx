export function EventCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--color-surface-3)]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[var(--color-surface-3)]" />
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-[var(--color-surface-3)]" />
          <div className="h-3 w-12 animate-pulse rounded bg-[var(--color-surface-3)]" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-full bg-[var(--color-surface-3)]" />
      </div>
    </div>
  );
}
