/* Developed by Akash Mani - Skeleton Loader Components
 * Native-app style pulsing skeleton shapes.
 * Use these to replace ALL loading spinners for instant perceived performance.
 * Each variant matches common PlacePrep UI shapes.
 */

/**
 * Base skeleton atom — a single pulsing shape.
 * Pass any Tailwind size/shape classes via `className`.
 *
 * @example
 * <Skeleton className="w-full h-10 rounded-2xl" />
 * <Skeleton className="w-10 h-10 rounded-full" />
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-muted/40 dark:bg-white/[0.05] ${className}`}
    />
  );
}

/**
 * Stat Bento Cell Skeleton — matches the 2×2 mobile bento grid cards.
 */
export function BentoCellSkeleton() {
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-4 flex flex-col justify-between"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid rgba(255,255,255,0.06)',
        minHeight: 132,
      }}
    >
      {/* Icon + label row */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="w-16 h-2.5 rounded-full" />
      </div>
      {/* Large number */}
      <Skeleton className="w-20 h-9 rounded-xl mt-4" />
    </div>
  );
}

/**
 * Flashcard Skeleton — matches the SRS card dimensions.
 */
export function FlashcardSkeleton() {
  return (
    <div
      className="relative rounded-[28px] p-6 flex flex-col gap-4"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        minHeight: 260,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>
      {/* Title lines */}
      <div className="flex-1 flex flex-col justify-center gap-3 mt-4">
        <Skeleton className="w-full h-6 rounded-lg" />
        <Skeleton className="w-3/4 h-6 rounded-lg" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="w-20 h-7 rounded-xl" />
          <Skeleton className="w-16 h-7 rounded-xl" />
        </div>
      </div>
      {/* Action hint row */}
      <div className="flex justify-between">
        <Skeleton className="w-16 h-4 rounded-full" />
        <Skeleton className="w-16 h-4 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Mobile Dashboard Skeleton — 2×2 bento grid + progress bar card.
 * Drop this in while MobileDashboard data is loading.
 */
export function MobileDashboardSkeleton() {
  return (
    <div className="md:hidden flex flex-col gap-4 px-1 pb-2">
      {/* Greeting row */}
      <div className="flex items-center gap-3 pt-1">
        <Skeleton className="w-10 h-10 rounded-2xl flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="w-36 h-6 rounded-lg" />
          <Skeleton className="w-48 h-3 rounded-full" />
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <BentoCellSkeleton />
        <BentoCellSkeleton />
        <BentoCellSkeleton />
        <BentoCellSkeleton />
      </div>

      {/* DSA progress bar card */}
      <div
        className="rounded-[22px] p-4"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex justify-between mb-4">
          <Skeleton className="w-32 h-3 rounded-full" />
          <Skeleton className="w-16 h-3 rounded-full" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-6 h-2 rounded-full" />
                <Skeleton className="flex-1 h-1.5 rounded-full" />
                <Skeleton className="w-10 h-2 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        </div>
      </div>

      {/* Quick action pills */}
      <div className="flex gap-2.5">
        <Skeleton className="flex-1 h-12 rounded-2xl" />
        <Skeleton className="flex-1 h-12 rounded-2xl" />
        <Skeleton className="flex-1 h-12 rounded-2xl" />
      </div>
    </div>
  );
}
