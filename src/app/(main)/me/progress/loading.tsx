export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-foreground rounded-xl w-40 mb-8" />
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-foreground/50 rounded-2xl" />
        ))}
      </div>
      <div className="h-6 bg-foreground rounded-lg w-48 mb-4" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-foreground/50 rounded-2xl mb-3" />
      ))}
    </div>
  );
}
