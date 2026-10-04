export default function PronunciationLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-80 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* IPA chart area */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>

      {/* Practice section */}
      <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
    </div>
  );
}
