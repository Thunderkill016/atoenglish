/**
 * Learning flow — single source of truth for lesson pedagogy.
 *
 * Evidence base (SDL redesign, unit1.ts):
 * - Nation & Webb 2011: pre-teach vocab before dialogue → lower cognitive load
 * - IPOR: Input → Processing → Output → Review (landing ScienceSection)
 * - Active recall + FSRS warmup (section 1)
 * - Csikszentmihalyi: ~80% success target in practice/quiz sections
 */

export type IporPhase = "input" | "processing" | "output" | "review";

export interface LessonSectionDef {
  id: number;
  label: string;
  phase: IporPhase;
  /** ~minutes */
  estimatedMin: number;
  /** Short goal shown in phase bar tooltip area */
  goalVi: string;
}

export const IPOR_META: Record<
  IporPhase,
  { label: string; labelVi: string; color: string; activeColor: string }
> = {
  input: {
    label: "Input",
    labelVi: "Tiếp nhận",
    color: "text-primary/50",
    activeColor: "text-primary bg-primary/15 border-primary/30",
  },
  processing: {
    label: "Processing",
    labelVi: "Xử lý",
    color: "text-primary/50",
    activeColor: "text-primary bg-primary/15 border-primary/30",
  },
  output: {
    label: "Output",
    labelVi: "Sản xuất",
    color: "text-warning/50",
    activeColor: "text-warning bg-warning/15 border-warning/30",
  },
  review: {
    label: "Review",
    labelVi: "Ôn tập",
    color: "text-primary/50",
    activeColor: "text-primary bg-primary/15 border-primary/30",
  },
};

/** 10-step hybrid flow — vocab BEFORE dialogue (Nation & Webb 2011) */
export const LESSON_SECTIONS: readonly LessonSectionDef[] = [
  {
    id: 1,
    label: "Khởi động",
    phase: "input",
    estimatedMin: 3,
    goalVi: "SRS + tình huống thực tế",
  },
  {
    id: 2,
    label: "Từ vựng",
    phase: "input",
    estimatedMin: 5,
    goalVi: "Pre-teach từ trước hội thoại",
  },
  {
    id: 3,
    label: "Ngữ pháp",
    phase: "processing",
    estimatedMin: 5,
    goalVi: "Nhận diện mẫu → quy tắc",
  },
  {
    id: 4,
    label: "Luyện tập",
    phase: "processing",
    estimatedMin: 8,
    goalVi: "Active recall + phản hồi tức thì",
  },
  {
    id: 5,
    label: "Hội thoại",
    phase: "input",
    estimatedMin: 5,
    goalVi: "Nghe hiểu với vocab đã học",
  },
  {
    id: 10,
    label: "Phản xạ",
    phase: "processing",
    estimatedMin: 4,
    goalVi: "Tự động hóa phản xạ (fluency)",
  },
  {
    id: 9,
    label: "Dịch câu",
    phase: "output",
    estimatedMin: 5,
    goalVi: "Sản xuất câu VN→EN",
  },
  {
    id: 6,
    label: "Shadowing",
    phase: "output",
    estimatedMin: 5,
    goalVi: "Nói theo ngữ điệu bản ngữ",
  },
  {
    id: 7,
    label: "Luyện nói",
    phase: "output",
    estimatedMin: 5,
    goalVi: "Nói tự do trong ngữ cảnh",
  },
  {
    id: 8,
    label: "Hoàn thành",
    phase: "review",
    estimatedMin: 5,
    goalVi: "Quiz + cumulative review + FSRS",
  },
] as const;

export const SECTION_ORDER = LESSON_SECTIONS.map(
  (s) => s.id,
) as readonly number[];
export type SectionNumber = (typeof SECTION_ORDER)[number];
export const TOTAL_SECTIONS = SECTION_ORDER.length;

export const SECTION_LABELS: Record<number, string> = Object.fromEntries(
  LESSON_SECTIONS.map((s) => [s.id, s.label]),
);

const sectionById = new Map(LESSON_SECTIONS.map((s) => [s.id, s]));

export function getSectionDef(sectionId: number): LessonSectionDef | undefined {
  return sectionById.get(sectionId);
}

export function getSectionPhase(sectionId: number): IporPhase {
  return sectionById.get(sectionId)?.phase ?? "input";
}

export function getSectionGoalVi(sectionId: number): string {
  return sectionById.get(sectionId)?.goalVi ?? "";
}

export function getOrderIndex(sectionId: number): number {
  return SECTION_ORDER.indexOf(sectionId);
}

/** Mini-session skips to practice (4) then quiz (8) — review path only */
export const MINI_SESSION_START = 4;
export const MINI_SESSION_QUIZ = 8;

/** Active recall instruction (Roediger & Karpicke retrieval practice) */
export const VOCAB_ACTIVE_RECALL_HINT =
  "Nhìn từ tiếng Anh → thử nhớ nghĩa tiếng Việt → lật thẻ kiểm tra. Bấm «Biết rồi?» nếu nhớ đúng không cần lật.";
