export default function WritingHistoryLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* History items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 space-y-2">
          <div className="h-3 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-3/4 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <div className="h-5 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
