export default function WeeklyProgressLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-64 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* Chart area */}
      <div className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>

      {/* Day breakdown */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
            <div className="h-3 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
