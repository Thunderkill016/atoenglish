export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-zinc-800 rounded-xl w-48 mb-2" />
      <div className="h-4 bg-zinc-800/60 rounded-lg w-64 mb-8" />
      <div className="h-64 bg-zinc-800/50 rounded-2xl mb-4" />
      <div className="flex gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-12 bg-zinc-800/50 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-zinc-800 rounded-xl" />
    </div>
  );
}
