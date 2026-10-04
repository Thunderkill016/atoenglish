/**
 * P1-5 Fix: Layout-preserving skeleton for the learn unit page.
 * Matches the session runner structure: header + progress bar + content area.
 * Prevents CLS (Cumulative Layout Shift) on slow connections.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-foreground/95 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-lg" />
          <div className="flex-1">
            <div className="h-4 bg-foreground rounded w-40 mb-1.5" />
            <div className="h-2.5 bg-foreground/60 rounded-full w-full" />
          </div>
          <div className="w-14 h-5 bg-foreground rounded-full" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 space-y-5">
        {/* Unit title block */}
        <div className="space-y-2">
          <div className="h-3 bg-primary/40 rounded-full w-20" />
          <div className="h-7 bg-foreground rounded-xl w-64" />
          <div className="h-4 bg-foreground/60 rounded-lg w-80" />
        </div>

        {/* Section tab bar skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["Từ vựng", "Ngữ pháp", "Hội thoại", "Luyện tập", "Quiz"].map(
            (label) => (
              <div
                key={label}
                className="flex-shrink-0 h-8 w-20 bg-foreground/70 rounded-full"
              />
            ),
          )}
        </div>

        {/* Main content card skeleton */}
        <div className="bg-foreground/60 border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="h-5 bg-foreground rounded-lg w-40" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-foreground rounded w-24" />
                  <div className="h-3 bg-foreground/60 rounded w-36" />
                </div>
                <div className="w-16 h-8 bg-foreground rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary card skeleton */}
        <div className="bg-foreground/40 border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="h-4 bg-foreground rounded w-32" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-foreground/60 rounded-xl" />
            ))}
          </div>
        </div>

        {/* CTA button skeleton */}
        <div className="h-12 bg-primary/40 rounded-2xl w-full" />
      </div>
    </div>
  );
}
