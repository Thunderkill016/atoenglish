export default function QuizLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 space-y-8 animate-pulse">
      <div className="text-center space-y-3">
        <div className="mx-auto size-14 rounded-2xl bg-muted" />
        <div className="mx-auto h-8 w-48 rounded-xl bg-muted" />
        <div className="mx-auto h-4 w-72 rounded-lg bg-muted" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 p-4 sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-4 w-3/4 rounded-lg bg-muted" />
                <div className="h-3 w-1/3 rounded-lg bg-muted" />
              </div>
              <div className="size-8 rounded-lg bg-muted shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
