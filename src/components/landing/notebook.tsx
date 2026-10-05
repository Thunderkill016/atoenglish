/**
 * Notebook primitives for the landing page — visual language per DESIGN.md
 * ("Trang sổ hội thoại": paper canvas + conversation content).
 */
import type { ReactNode } from "react";

/** Audio waveform bar row. Only rendered inside voice contexts (DESIGN.md). */
export function Waveform({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`nb-wave ${className}`}>
      {Array.from({ length: 15 }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}

/** Handwritten annotation (Caveat) — annotations/kickers/margin-notes only. */
export function Hand({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-hand text-nb-annotation text-[22px] sm:text-[24px] font-bold leading-none inline-block -rotate-1 ${className}`}
    >
      {children}
    </span>
  );
}

/** Section heading: handwriting kicker + bold title + optional lead. */
export function SectionHead({
  hand,
  title,
  lead,
}: {
  hand: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="space-y-2">
      <Hand>{hand}</Hand>
      <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold tracking-tight leading-[1.1] text-nb-ink">
        {title}
      </h2>
      {lead ? (
        <p className="text-base sm:text-[17px] text-nb-muted leading-relaxed max-w-xl">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
