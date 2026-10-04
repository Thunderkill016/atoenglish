export default function WritingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-xl bg-muted" />
        <div className="h-3 w-64 rounded-full bg-muted" />
      </div>

      {/* Textarea area */}
      <div className="h-40 rounded-2xl bg-muted" />

      {/* Submit button */}
      <div className="h-11 w-36 rounded-xl bg-muted" />

      {/* Feedback card */}
      <div className="space-y-3 p-5 rounded-2xl bg-muted">
        <div className="h-4 w-32 rounded-full bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-full rounded-full bg-muted" />
        ))}
      </div>
    </div>
  );
}
