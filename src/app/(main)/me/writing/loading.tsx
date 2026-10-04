export default function WritingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-3 w-64 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      {/* Textarea area */}
      <div className="h-40 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />

      {/* Submit button */}
      <div className="h-11 w-36 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

      {/* Feedback card */}
      <div className="space-y-3 p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60">
        <div className="h-4 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
        ))}
      </div>
    </div>
  );
}
