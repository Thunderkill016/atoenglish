export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-foreground rounded-xl w-48 mb-2" />
      <div className="h-4 bg-foreground/60 rounded-lg w-64 mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-32 bg-foreground/50 rounded-2xl mb-4" />
      ))}
    </div>
  );
}
