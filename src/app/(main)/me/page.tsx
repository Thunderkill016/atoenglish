import { redirect } from "next/navigation";
import { Eye, LifeBuoy, ShieldCheck, Timer, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getEvidence, type EvidenceData } from "@/app/actions/evidence";
import { SignOutButton } from "@/app/(main)/me/sign-out-button";
import { createClient } from "@/lib/supabase/server";

/**
 * `/me` — account + the evidence view (SPEC §9): four measurable tiers, each
 * with its denominator. Deliberately absent: CEFR/band/XP/streak and any
 * "real-world fluency" claim the product cannot measure.
 */
export default async function MePage() {
  const evidence = await getEvidence();
  if (!evidence.ok) {
    if (evidence.error === "unauthorized") redirect("/login?next=/me");
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Tôi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chưa tải được dữ liệu. Thử tải lại trang.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-xl font-bold">Tôi</h1>
      <EvidenceView data={evidence.data} />
      <AccountFooter />
    </div>
  );
}

function Tier({
  icon: Icon,
  title,
  note,
  rows,
}: {
  icon: LucideIcon;
  title: string;
  note?: string;
  // n/d for ratio rows; a plain count row just omits d.
  rows: { label: string; n: number; d?: number }[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        {title}
      </h2>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between">
            <span>{row.label}</span>
            <span className="tabular-nums">
              <strong className="text-foreground">{row.n}</strong>
              {row.d != null && (
                <span className="text-muted-foreground">/{row.d}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvidenceView({ data }: { data: EvidenceData }) {
  return (
    <div className="mt-5 space-y-3">
      <Tier
        icon={Eye}
        title="Đã gặp"
        note="Chỉ là phơi nhiễm — chưa phải bằng chứng học được."
        rows={[
          { label: "Mục đã lưu", n: data.exposure.saved_items },
          { label: "Video đã xem", n: data.exposure.videos_watched },
        ]}
      />
      <Tier
        icon={LifeBuoy}
        title="Làm được có hỗ trợ"
        rows={[
          {
            label: "Nhớ/tự chấm Good+ khi thẻ đến hạn",
            n: data.supported.due_rated.numerator,
            d: data.supported.due_rated.denominator,
          },
          {
            label: "Chép chính tả đạt nhưng đã dùng gợi ý",
            n: data.supported.dictation_with_hints.numerator,
            d: data.supported.dictation_with_hints.denominator,
          },
        ]}
      />
      <Tier
        icon={ShieldCheck}
        title="Làm được độc lập"
        rows={[
          {
            label: "Nghe điền đúng",
            n: data.independent.listen_fill.numerator,
            d: data.independent.listen_fill.denominator,
          },
          {
            label: "Chép chính tả ≥90% không gợi ý",
            n: data.independent.dictation_clean.numerator,
            d: data.independent.dictation_clean.denominator,
          },
          {
            label: "Câu write_reuse đã nộp",
            n: data.independent.write_reuse.numerator,
            d: data.independent.write_reuse.denominator,
          },
        ]}
      />
      <Tier
        icon={Timer}
        title="Nhớ sau ≥7 ngày"
        rows={[
          {
            label: "Lượt Good/Easy sau khoảng cách ≥7 ngày",
            n: data.delayed.good_easy_after_7d.numerator,
            d: data.delayed.good_easy_after_7d.denominator,
          },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        Mức &quot;dùng được ngoài đời&quot; không đo được trong sản phẩm — cố
        tình không hiển thị.
      </p>
    </div>
  );
}

async function AccountFooter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div className="mt-8 flex flex-col items-center gap-4 border-t border-border pt-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
        <UserRound className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">{user?.email}</p>
      <SignOutButton />
    </div>
  );
}
