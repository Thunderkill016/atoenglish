export default function HardFlashcardsLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-1.5">
          <div className="h-5 w-36 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>

      {/* Card */}
      <div className="h-52 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />

      {/* Rating buttons */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>
    </div>
  );
}
