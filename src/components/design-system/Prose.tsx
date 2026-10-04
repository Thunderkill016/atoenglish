import { cn } from "@/lib/utils";

interface ProseProps {
  children: React.ReactNode;
  className?: string;
}

/** Readable long-form content — terms, privacy, grammar (V2) */
export function Prose({ children, className }: ProseProps) {
  return (
    <article
      className={cn(
        "max-w-none text-foreground",
        "[&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:mb-4",
        "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold",
        "[&_p]:text-[var(--minimal-body-size)] [&_p]:leading-relaxed [&_p]:mb-3",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
        "[&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5",
        "[&_li]:text-[var(--minimal-body-size)] [&_li]:leading-relaxed",
        "[&_strong]:font-bold [&_strong]:text-foreground",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        className,
      )}
    >
      {children}
    </article>
  );
}
