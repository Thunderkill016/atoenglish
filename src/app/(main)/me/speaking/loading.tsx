export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-zinc-800 rounded-xl w-52 mb-2" />
      <div className="h-4 bg-zinc-800/60 rounded-lg w-80 mb-8" />
      <div className="flex gap-2 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-9 bg-zinc-800/50 rounded-xl w-32" />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-zinc-800/50 rounded-2xl mb-3" />
      ))}
    </div>
  );
}
