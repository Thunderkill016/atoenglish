"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Check,
  ChevronRight,
  GraduationCap,
  Shield,
  Smartphone,
  Trash2,
} from "lucide-react";
import { SecondaryPageShell } from "@/components/design-system";

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {children}
      </div>
    </div>
  );
}

function SettingToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className="block cursor-pointer text-sm font-semibold text-foreground"
        >
          {label}
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SettingSelect({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getStoredSettings() {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("ato_settings");
    return stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const [saved, setSaved] = useState(false);
  const { setTheme: applyTheme } = useTheme();

  const [soundEffects, setSoundEffects] = useState(() => {
    const settings = getStoredSettings();
    return settings.soundEffects !== undefined
      ? Boolean(settings.soundEffects)
      : true;
  });
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => {
    const settings = getStoredSettings();
    return settings.autoPlayAudio !== undefined
      ? Boolean(settings.autoPlayAudio)
      : false;
  });
  const [fsrsRetention, setFsrsRetention] = useState(() => {
    const settings = getStoredSettings();
    return settings.fsrsRetention !== undefined
      ? String(settings.fsrsRetention)
      : "0.9";
  });
  const [fsrsMaxNewCards, setFsrsMaxNewCards] = useState(() => {
    const settings = getStoredSettings();
    return settings.fsrsMaxNewCards !== undefined
      ? String(settings.fsrsMaxNewCards)
      : "15";
  });
  const [theme, setTheme] = useState(() => {
    const settings = getStoredSettings();
    const stored =
      typeof settings.theme === "string" ? settings.theme : "light";
    // "system" is unsupported (enableSystem=false) — coerce legacy values.
    return stored === "system" ? "light" : stored;
  });

  const saveSettings = () => {
    const settings = {
      soundEffects,
      autoPlayAudio,
      fsrsRetention: Number(fsrsRetention),
      fsrsMaxNewCards: Number(fsrsMaxNewCards),
      theme,
    };
    localStorage.setItem("ato_settings", JSON.stringify(settings));
    applyTheme(theme);
    window.dispatchEvent(
      new CustomEvent("ato:settings-changed", { detail: settings }),
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const clearLocalProgress = () => {
    if (
      !window.confirm(
        "Xóa dữ liệu học tạm trên thiết bị? Dữ liệu tiến độ trên server sẽ không bị xóa.",
      )
    )
      return;
    const keep = ["ato_settings"];
    for (const key of Object.keys(localStorage)) {
      if (!keep.some((prefix) => key.includes(prefix)))
        localStorage.removeItem(key);
    }
    window.location.reload();
  };

  const installPwa = () => {
    const promptEvent = (
      window as Window & { _pwaInstallPrompt?: BeforeInstallPromptEvent }
    )._pwaInstallPrompt;
    if (promptEvent) {
      void promptEvent.prompt();
      return;
    }
    window.alert(
      "Mở menu trình duyệt (⋮) → Thêm vào màn hình chính để cài AtoEnglish.",
    );
  };

  return (
    <SecondaryPageShell title="Cài đặt" subtitle={userEmail || undefined}>
      <div className="pb-16">
        <SettingSection title="Học tập">
          <SettingSelect
            label="Tỷ lệ nhớ mục tiêu (FSRS)"
            description="Tỷ lệ ghi nhớ mong muốn; tỷ lệ cao hơn sẽ tăng số lần ôn tập."
            value={fsrsRetention}
            options={[
              { value: "0.8", label: "80%" },
              { value: "0.85", label: "85%" },
              { value: "0.9", label: "90% (Khuyên dùng)" },
              { value: "0.95", label: "95%" },
            ]}
            onChange={setFsrsRetention}
          />
          <SettingSelect
            label="Số từ mới tối đa mỗi ngày"
            description="Giới hạn số thẻ từ mới đưa vào lịch ôn tập."
            value={fsrsMaxNewCards}
            options={[
              { value: "5", label: "5 từ" },
              { value: "10", label: "10 từ" },
              { value: "15", label: "15 từ (Mặc định)" },
              { value: "20", label: "20 từ" },
              { value: "25", label: "25 từ" },
              { value: "30", label: "30 từ" },
            ]}
            onChange={setFsrsMaxNewCards}
          />
          <SettingToggle
            id="sound-effects"
            label="Âm thanh phản hồi"
            description="Phát âm thanh khi trả lời đúng hoặc sai."
            checked={soundEffects}
            onChange={setSoundEffects}
          />
          <SettingToggle
            id="auto-play-audio"
            label="Tự động phát âm"
            description="Tự động phát audio khi nội dung học hỗ trợ."
            checked={autoPlayAudio}
            onChange={setAutoPlayAudio}
          />
          <Link
            href="/placement"
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-muted text-muted-foreground p-2">
                <GraduationCap className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Làm lại Placement Test
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cập nhật điểm bắt đầu trong curriculum.
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground" />
          </Link>
          <Link
            href="/me/grammar"
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-muted text-muted-foreground p-2">
                <BookOpenCheck className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ngữ pháp tham khảo
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Mở tài liệu ngữ pháp hỗ trợ bài học.
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground" />
          </Link>
        </SettingSection>

        <SettingSection title="Giao diện">
          <SettingSelect
            label="Chủ đề"
            description="Màu sắc giao diện ứng dụng."
            value={theme}
            options={[
              { value: "light", label: "Sáng" },
              { value: "dark", label: "Tối" },
            ]}
            onChange={setTheme}
          />
        </SettingSection>

        <SettingSection title="Ứng dụng">
          <button
            onClick={installPwa}
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-muted-foreground">
                <Smartphone className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Cài đặt ứng dụng
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Thêm AtoEnglish vào màn hình chính.
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground" />
          </button>
          <button
            onClick={clearLocalProgress}
            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-destructive/10"
          >
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-destructive/10 text-destructive p-2">
                <Trash2 className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Xóa cache cục bộ
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Xóa dữ liệu tạm trên thiết bị, không xóa tiến độ server.
                </p>
              </div>
            </div>
            <ChevronRight className="size-4 flex-shrink-0 text-muted-foreground" />
          </button>
        </SettingSection>

        <div className="mb-6 rounded-2xl border border-border bg-muted p-4 ">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 flex-shrink-0 text-success" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                Quyền riêng tư
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Tiến độ học tập được lưu trên Supabase với RLS; cài đặt giao
                diện được lưu cục bộ trên thiết bị.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none sm:bottom-6">
          <motion.button
            onClick={saveSettings}
            whileTap={{ scale: 0.96 }}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-4" /> Đã lưu!
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  Lưu cài đặt
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </SecondaryPageShell>
  );
}
