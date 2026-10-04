/**
 * Honest presentation of `learner_skill_states` rows for `/me/progress`.
 *
 * The table stores per-channel EWMA routing estimates plus a total evidence
 * count. A channel value only becomes positive after real evidence lands —
 * a zero is "unobserved", never "weak". Labels deliberately describe
 * evidence, not ability: the values are routing signals, not calibrated
 * mastery, and the UI must not present them as a level or a grade.
 */

export const EVIDENCE_CHANNELS = [
  "recognition",
  "retrieval",
  "listening",
  "production",
  "repair",
  "transfer",
  "retention",
] as const;

export type EvidenceChannel = (typeof EVIDENCE_CHANNELS)[number];

export const CHANNEL_LABELS: Record<EvidenceChannel, string> = {
  recognition: "Nhận diện",
  retrieval: "Nhớ lại",
  listening: "Nghe hiểu",
  production: "Sản xuất",
  repair: "Sửa lỗi",
  transfer: "Chuyển tiếp",
  retention: "Độ bền",
};

/** EWMA bands — routing-estimate ranges, not calibrated mastery. */
const FORMING_MIN = 0.35;
const STEADY_MIN = 0.7;

export type EvidenceBand = "unobserved" | "new" | "forming" | "steady";

export const BAND_LABELS: Record<EvidenceBand, string> = {
  unobserved: "Chưa quan sát",
  new: "Tín hiệu mới — cần thêm luyện tập",
  forming: "Đang hình thành",
  steady: "Tín hiệu ổn định",
};

export function bandEvidenceEstimate(value: number): EvidenceBand {
  if (!(value > 0)) return "unobserved";
  if (value < FORMING_MIN) return "new";
  if (value < STEADY_MIN) return "forming";
  return "steady";
}

export type SkillStateRow = {
  readonly target_id: string;
  readonly evidence_count: number;
  readonly last_evidence_at: string | null;
} & { readonly [channel in EvidenceChannel]: number };

export type ChannelRead = {
  readonly channel: EvidenceChannel;
  readonly label: string;
  readonly band: EvidenceBand;
  readonly bandLabel: string;
};

export type SkillEvidenceRead = {
  readonly targetId: string;
  readonly observedChannels: readonly ChannelRead[];
  readonly evidenceCount: number;
  readonly lastEvidenceAt: string | null;
};

/** Channels with at least one observation, strongest signal first. */
export function readSkillStateRow(row: SkillStateRow): SkillEvidenceRead {
  const observed = EVIDENCE_CHANNELS.map((channel) => {
    const band = bandEvidenceEstimate(row[channel] ?? 0);
    return {
      channel,
      label: CHANNEL_LABELS[channel],
      band,
      bandLabel: BAND_LABELS[band],
    };
  }).filter((read) => read.band !== "unobserved");

  observed.sort((a, b) => (row[b.channel] ?? 0) - (row[a.channel] ?? 0));

  return {
    targetId: row.target_id,
    observedChannels: observed,
    evidenceCount: row.evidence_count,
    lastEvidenceAt: row.last_evidence_at,
  };
}
