"use client";

import { useState, useEffect } from "react";
import { Mic, Volume2, MessageSquare, Calendar, Sparkles } from "lucide-react";
import {
  ListSection,
  PrimaryRow,
  SecondaryPageShell,
} from "@/components/design-system";
import { getRecentSpeakingSessions } from "@/app/actions/speaking";
import { SpeakingSession } from "@/types/database";

export default function SpeakingPage() {
  const [historySessions, setHistorySessions] = useState<SpeakingSession[]>([]);
  const [speakingCount, setSpeakingCount] = useState<number>(0);

  useEffect(() => {
    async function loadHistory() {
      const res = await getRecentSpeakingSessions(6);
      let sessions = res.success && res.sessions ? res.sessions : [];
      // Guest: show local history viz (TASK-152)
      if (sessions.length === 0 && typeof window !== "undefined") {
        try {
          const local = JSON.parse(
            localStorage.getItem("guest_speaking_sessions") || "[]",
          );
          if (Array.isArray(local) && local.length) sessions = local;
        } catch {}
      }
      setHistorySessions(sessions);
      setSpeakingCount(sessions.length);
    }
    loadHistory();
  }, []);

  return (
    <SecondaryPageShell
      title="Luyện nói"
      subtitle={`${speakingCount} buổi luyện gần đây`}
    >
      <div className="space-y-5 pb-16">
        <PrimaryRow
          href="/me/pronunciation"
          label="Luyện 44 âm IPA"
          description="Nghe · ghi âm · so sánh native"
          icon={Mic}
        />

        <ListSection title="Chế độ luyện nói">
          <PrimaryRow
            href="/me/speaking/shadowing"
            label="Shadowing Practice"
            description="Nói đuổi theo audio"
            icon={Volume2}
          />
          <PrimaryRow
            href="/me/speaking/roleplay"
            label="AI Roleplay"
            description="Hội thoại nhập vai"
            icon={MessageSquare}
          />
          <PrimaryRow
            href="/me/speaking/journal"
            label="Daily Journal"
            description="Nhật ký nói tự do"
            icon={Calendar}
          />
          <PrimaryRow
            href="/me/speaking/phoneme"
            label="Phoneme Coach"
            description="Luyện câu mẫu — so sánh transcript"
            icon={Sparkles}
          />
        </ListSection>

        <p className="px-1 text-[var(--minimal-caption-size)] text-muted-foreground/80">
          Chấm phát âm tự động chưa đủ tin cậy để bật. Các chỉ số bên dưới là độ
          khớp transcript, không phải điểm phát âm.
        </p>

        {/* Compact recent — guest local history viz enhanced (TASK-152) */}
        {historySessions.length > 0 && (
          <ListSection title="Gần đây">
            {historySessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-xl bg-card border border-border/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                      session.practice_type === "shadowing"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-violet-500/10 text-violet-600 border border-violet-500/20"
                    }`}
                  >
                    {session.practice_type}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {new Date(session.created_at).toLocaleDateString("vi-VN", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {session.accuracy_score !== null && (
                  <span
                    className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono shrink-0"
                    title="Độ khớp transcript với bản mẫu — không phải điểm phát âm"
                  >
                    {session.accuracy_score}%
                  </span>
                )}
              </div>
            ))}
          </ListSection>
        )}
      </div>
    </SecondaryPageShell>
  );
}
