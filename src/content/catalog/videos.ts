/**
 * Curated video catalog for `/discover` (SPEC §10).
 *
 * INTERIM: this hand-picked list stands in until the slice-6 owner curation
 * lands `videos.json` + `schema.ts` with ≥30 videos across ≥5 topics.
 * Every id below was verified against YouTube oEmbed and every video ships
 * with English captions (manual where noted). `level` is curator judgement —
 * never a CEFR/band label.
 */

export type CatalogTopic = "ted" | "music" | "vlog" | "news" | "science";

export type CatalogLevel = "easy" | "medium" | "hard";

export interface CatalogVideo {
  /** YouTube video id, 11 chars. */
  id: string;
  title: string;
  /** Vietnamese discovery gloss, authored in the catalog; not official YouTube metadata. */
  titleVi: string;
  channel: string;
  topic: CatalogTopic;
  /** Curator judgement only — never a CEFR label. */
  level: CatalogLevel;
  durationSec: number;
  /** manual+vi = also has a Vietnamese caption track. */
  captions: "manual" | "asr" | "manual+vi";
}

export const CATALOG_VIDEOS: CatalogVideo[] = [
  // — TED / talks —
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address",
    titleVi: "Bài phát biểu của Steve Jobs tại lễ tốt nghiệp Stanford năm 2005",
    channel: "Stanford",
    topic: "ted",
    level: "medium",
    durationSec: 904,
    captions: "manual",
  },
  {
    id: "8jPQjjsBbIc",
    title: "How to Stay Calm When You Know You'll Be Stressed",
    titleVi: "Cách giữ bình tĩnh khi biết mình sắp căng thẳng",
    channel: "TED",
    topic: "ted",
    level: "medium",
    durationSec: 740,
    captions: "manual+vi",
  },
  {
    id: "iG9CE55wbtY",
    title: "Do Schools Kill Creativity?",
    titleVi: "Trường học có giết chết sự sáng tạo?",
    channel: "TED",
    topic: "ted",
    level: "medium",
    durationSec: 1203,
    captions: "manual+vi",
  },
  {
    id: "qp0HIF3SfI4",
    title: "How Great Leaders Inspire Action",
    titleVi: "Cách những nhà lãnh đạo tài ba truyền cảm hứng hành động",
    channel: "TED",
    topic: "ted",
    level: "medium",
    durationSec: 1115,
    captions: "manual+vi",
  },
  {
    id: "arj7oStGLkU",
    title: "Inside the Mind of a Master Procrastinator",
    titleVi: "Bên trong tâm trí của một bậc thầy trì hoãn",
    channel: "TED",
    topic: "ted",
    level: "medium",
    durationSec: 844,
    captions: "manual+vi",
  },
  {
    id: "iCvmsMzlF7o",
    title: "The Power of Vulnerability",
    titleVi: "Sức mạnh của sự dễ bị tổn thương",
    channel: "TED",
    topic: "ted",
    level: "hard",
    durationSec: 1250,
    captions: "manual+vi",
  },
  // — Music —
  {
    id: "dQw4w9WgXcQ",
    title: "Never Gonna Give You Up",
    titleVi: "Sẽ không bao giờ từ bỏ em",
    channel: "Rick Astley",
    topic: "music",
    level: "easy",
    durationSec: 213,
    captions: "manual",
  },
  {
    id: "JGwWNGJdvx8",
    title: "Shape of You",
    titleVi: "Dáng hình của em",
    channel: "Ed Sheeran",
    topic: "music",
    level: "easy",
    durationSec: 263,
    captions: "manual",
  },
  {
    id: "RgKAFK5djSk",
    title: "See You Again (ft. Charlie Puth)",
    titleVi: "Hẹn ngày gặp lại (cùng Charlie Puth)",
    channel: "Wiz Khalifa",
    topic: "music",
    level: "medium",
    durationSec: 237,
    captions: "manual",
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    titleVi: "Khúc ngẫu hứng Bohemian",
    channel: "Queen",
    topic: "music",
    level: "medium",
    durationSec: 359,
    captions: "manual",
  },
  {
    id: "hTWKbfoikeg",
    title: "Smells Like Teen Spirit",
    titleVi: "Phảng phất tinh thần tuổi trẻ",
    channel: "Nirvana",
    topic: "music",
    level: "hard",
    durationSec: 278,
    captions: "manual",
  },
  // — Science —
  {
    id: "h6fcK_fRYaI",
    title: "The Egg — A Short Story",
    titleVi: "Quả trứng — Một truyện ngắn",
    channel: "Kurzgesagt – In a Nutshell",
    topic: "science",
    level: "medium",
    durationSec: 486,
    captions: "manual+vi",
  },
  {
    id: "MBRqu0YOH14",
    title: "Optimistic Nihilism",
    titleVi: "Chủ nghĩa hư vô lạc quan",
    channel: "Kurzgesagt – In a Nutshell",
    topic: "science",
    level: "medium",
    durationSec: 446,
    captions: "manual+vi",
  },
  {
    id: "sNhhvQGsMEc",
    title: "The Fermi Paradox — Where Are All the Aliens?",
    titleVi: "Nghịch lý Fermi — Người ngoài hành tinh ở đâu?",
    channel: "Kurzgesagt – In a Nutshell",
    topic: "science",
    level: "hard",
    durationSec: 380,
    captions: "manual+vi",
  },
  // — Vlog —
  {
    id: "WxfZkMm3wcg",
    title: "Make It Count",
    titleVi: "Hãy sống sao cho đáng",
    channel: "Casey Neistat",
    topic: "vlog",
    level: "medium",
    durationSec: 278,
    captions: "asr",
  },
  {
    id: "0e3GPea1Tyg",
    title: "$456,000 Squid Game in Real Life!",
    titleVi: "Trò chơi con mực ngoài đời thực với giải thưởng 456.000 USD!",
    channel: "MrBeast",
    topic: "vlog",
    level: "easy",
    durationSec: 1541,
    captions: "manual+vi",
  },
  // — News / explainers —
  {
    id: "Mh4f9AYRCZY",
    title: "Children Interrupt BBC News Interview",
    titleVi: "Các con làm gián đoạn cuộc phỏng vấn trên BBC News",
    channel: "BBC News",
    topic: "news",
    level: "medium",
    durationSec: 44,
    captions: "manual",
  },
  {
    id: "NKb9GVU8bHE",
    title: "Syria's War: Who Is Fighting and Why",
    titleVi: "Chiến tranh Syria: Ai đang chiến đấu và vì sao",
    channel: "Vox",
    topic: "news",
    level: "medium",
    durationSec: 324,
    captions: "manual",
  },
];

/** The whole catalog. Order is curated display order, not alphabetical. */
export function getCatalog(): CatalogVideo[] {
  return CATALOG_VIDEOS;
}

/** Topics actually present in the catalog, in first-appearance order. */
export function catalogTopics(): CatalogTopic[] {
  return [...new Set(CATALOG_VIDEOS.map((v) => v.topic))];
}

/** Levels actually present in the catalog, easy → hard order. */
export function catalogLevels(): CatalogLevel[] {
  const order: CatalogLevel[] = ["easy", "medium", "hard"];
  return order.filter((l) => CATALOG_VIDEOS.some((v) => v.level === l));
}

/** Vietnamese UI labels — hand-written, keyed by catalog enum values. */
export const TOPIC_LABELS: Record<CatalogTopic, string> = {
  ted: "TED Talks",
  music: "Âm nhạc",
  vlog: "Vlog đời sống",
  news: "Tin tức",
  science: "Khoa học",
};

export const LEVEL_LABELS: Record<CatalogLevel, string> = {
  easy: "Dễ",
  medium: "Vừa",
  hard: "Khó",
};

/** Caption-source labels for card badges / filter notes. */
export const CAPTION_LABELS: Record<CatalogVideo["captions"], string> = {
  manual: "Phụ đề tay",
  asr: "Phụ đề tự động",
  "manual+vi": "Phụ đề tay + tiếng Việt",
};
