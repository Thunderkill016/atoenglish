export default function PlacementTestLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-6 animate-pulse">
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted">
        <div className="h-2 w-1/4 rounded-full bg-muted" />
      </div>

      {/* Question */}
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="h-6 w-full rounded-xl bg-muted" />
        <div className="h-6 w-3/4 rounded-xl bg-muted" />
      </div>

      {/* Answer options */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-muted" />
      ))}
    </div>
  );
}
