// ─── Study Plan: 4-Phase A0→B2 Self-Study Curriculum ────────────────────────
// Based on: Krashen CI, Nation 4-strand, FSRS SRS, shadowing research
// Designed for Vietnamese learners targeting business/tech English

export interface DailyActivity {
  duration: number; // minutes
  skill:
    | "pronunciation"
    | "vocabulary"
    | "grammar"
    | "listening"
    | "speaking"
    | "reading"
    | "writing";
  icon: string;
  title: string;
  description: string;
  resource?: string;
}

export interface Milestone {
  month: number;
  title: string;
  canDo: string[]; // CEFR "can-do" statements
}

export interface PhaseResource {
  name: string;
  url?: string;
  type: "app" | "website" | "book" | "youtube" | "podcast";
  description: string;
  free: boolean;
}

export interface VietnameseTip {
  problem: string;
  solution: string;
}

export interface StudyPhase {
  id: number;
  title: string;
  subtitle: string;
  months: string;
  monthRange: [number, number]; // [start, end]
  cefrFrom: string;
  cefrTo: string;
  color: string;
  gradient: string;
  emoji: string;
  goal: string;
  vocabTarget: number;
  unitLevels: string[]; // which CEFR levels map to this phase
  dailyMinutes: number;
  milestones: Milestone[];
  dailyRoutine: DailyActivity[];
  resources: PhaseResource[];
  vietnameseTips: VietnameseTip[];
  weeklyReview: string[];
}

export const STUDY_PHASES: StudyPhase[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Nền Tảng Vững",
    subtitle: "Xây móng từ con số 0",
    months: "Tháng 1–3",
    monthRange: [1, 3],
    cefrFrom: "A0",
    cefrTo: "A2",
    color: "#3b82f6",
    gradient: "from-primary to-primary",
    emoji: "🧱",
    goal: "Phát âm chuẩn, 500–800 từ thiết yếu, giao tiếp hàng ngày đơn giản",
    vocabTarget: 800,
    unitLevels: ["A0", "A1"],
    dailyMinutes: 60,
    milestones: [
      {
        month: 1,
        title: "Chào hỏi & Giới thiệu",
        canDo: [
          "Giới thiệu bản thân (tên, tuổi, quê quán)",
          "Hỏi và trả lời câu hỏi đơn giản nếu người kia nói chậm",
          "Nói được 26 chữ cái + số 1–100",
          "Phát âm được 10 âm cơ bản tiếng Anh",
        ],
      },
      {
        month: 2,
        title: "Cuộc Sống Hàng Ngày",
        canDo: [
          "Mô tả thói quen hàng ngày (thức dậy, ăn sáng, đi làm)",
          "Hỏi giá và mua sắm đơn giản",
          "Dùng được Present Simple và Present Continuous",
          "Hiểu câu chào hỏi thông thường mà không cần dịch",
        ],
      },
      {
        month: 3,
        title: "A1 Test Ready",
        canDo: [
          "Hội thoại đơn giản về gia đình, sở thích, công việc",
          "Viết email ngắn giới thiệu bản thân (5–7 câu)",
          "Nghe hiểu 70% clip BBC Learning English speed beginner",
          "Vượt qua bài test A1 CEFR",
        ],
      },
    ],
    dailyRoutine: [
      {
        duration: 10,
        skill: "pronunciation",
        icon: "🎯",
        title: "Phát Âm & Shadowing",
        description:
          "Nghe 1 clip ngắn native speaker → nhắc lại 2–3 lần, khớp rhythm & intonation",
        resource: "ELSA Speak / Rachel's English / YouGlish",
      },
      {
        duration: 15,
        skill: "vocabulary",
        icon: "🃏",
        title: "SRS Flashcards",
        description:
          "Ôn từ theo FSRS — chỉ ôn đúng lúc sắp quên. Chủ đề: chào hỏi, gia đình, số, màu sắc, đồ ăn",
        resource: "AtoEnglish Flashcards",
      },
      {
        duration: 10,
        skill: "grammar",
        icon: "📐",
        title: "Ngữ Pháp Trong Ngữ Cảnh",
        description:
          "Học 1 cấu trúc nhỏ qua ví dụ thực tế, không học lý thuyết trừu tượng",
        resource: "AtoEnglish Grammar / Murphy Elementary",
      },
      {
        duration: 15,
        skill: "listening",
        icon: "👂",
        title: "Comprehensible Input",
        description:
          "Nghe/xem clip dễ hiểu 70–80% — không cần hiểu hết. Não tiếp thu tự nhiên",
        resource: "BBC Learning English / VOA Learning English / Peppa Pig",
      },
      {
        duration: 10,
        skill: "speaking",
        icon: "🎙️",
        title: "Output: Tự Nói & Ghi Âm",
        description:
          "Tự giới thiệu bản thân, mô tả ngày hôm nay, viết 3 câu journal. Record + nghe lại",
        resource: "Voice Memo / AtoEnglish Speaking",
      },
    ],
    resources: [
      {
        name: "ELSA Speak",
        url: "https://elsaspeak.com",
        type: "app",
        description: "Luyện phát âm với AI — rất tốt cho người Việt",
        free: true,
      },
      {
        name: "BBC Learning English",
        url: "https://www.bbc.co.uk/learningenglish",
        type: "website",
        description: "Clip + bài học miễn phí, chuẩn British English",
        free: true,
      },
      {
        name: "YouGlish",
        url: "https://youglish.com",
        type: "website",
        description: "Xem native speaker nói từ bất kỳ trong video thật",
        free: true,
      },
      {
        name: "VOA Learning English",
        url: "https://learningenglish.voanews.com",
        type: "website",
        description: "Tin tức tiếng Anh tốc độ chậm, chuẩn American English",
        free: true,
      },
      {
        name: "Essential Grammar in Use",
        type: "book",
        description: "Raymond Murphy — sách ngữ pháp số 1 cho beginner",
        free: false,
      },
      {
        name: "Rachel's English",
        url: "https://www.youtube.com/@rachelsenglish",
        type: "youtube",
        description: "Phát âm American English siêu chi tiết",
        free: true,
      },
    ],
    vietnameseTips: [
      {
        problem: "Nói 'Việtlish' — đọc từng chữ cái",
        solution:
          "Tập stress patterns: từ 2 âm → stress âm 1 (HEL-lo, TA-ble). Record và so sánh native.",
      },
      {
        problem: "Quên thêm -s/-es cho ngôi thứ 3",
        solution:
          "Drill: 'She WORKS, he DRINKS, it RUNS' — tập như phản xạ, không cần nghĩ.",
      },
      {
        problem: "Không biết dùng 'a' hay 'the'",
        solution:
          "Quy tắc đơn giản: lần đầu nhắc → 'a dog'; lần sau → 'the dog'. Luyện qua reading.",
      },
    ],
    weeklyReview: [
      "Record 1 phút tự giới thiệu — so sánh với tuần trước",
      "Làm 10 câu quiz vocab tuần này",
      "Viết 5 câu mô tả ngày hôm qua bằng Past Simple",
      "Nghe lại 1 clip tuần này — bao nhiêu % hiểu được?",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: "Xây Dựng Chắc",
    subtitle: "Giao tiếp độc lập cơ bản",
    months: "Tháng 3–6",
    monthRange: [3, 6],
    cefrFrom: "A2",
    cefrTo: "B1",
    color: "#8b5cf6",
    gradient: "from-primary to-primary",
    emoji: "🏗️",
    goal: "1500–2000 từ, xử lý tình huống thực tế, kể chuyện quá khứ, đọc bài ngắn",
    vocabTarget: 2000,
    unitLevels: ["A2", "B1"],
    dailyMinutes: 75,
    milestones: [
      {
        month: 4,
        title: "Du Lịch & Giao Dịch",
        canDo: [
          "Xử lý tình huống du lịch (sân bay, khách sạn, hỏi đường)",
          "Kể chuyện đơn giản về quá khứ bằng Past Simple",
          "Mô tả kinh nghiệm, sở thích chi tiết hơn",
          "Đọc hiểu bài viết A2 không cần từ điển nhiều",
        ],
      },
      {
        month: 5,
        title: "Dự Án & Tech Cơ Bản",
        canDo: [
          "Mô tả dự án web dev đơn giản bằng tiếng Anh",
          "Dùng Conditionals (If I have time, I will...)",
          "Viết đoạn văn 80–100 từ mạch lạc",
          "Tham gia language exchange online 1x/tuần",
        ],
      },
      {
        month: 6,
        title: "B1 Test Ready",
        canDo: [
          "Giao tiếp độc lập trong tình huống quen thuộc",
          "Giải thích ý kiến, đưa lý do đơn giản",
          "Hiểu ý chính podcast dễ (không cần sub)",
          "Vượt qua bài test B1 CEFR practice",
        ],
      },
    ],
    dailyRoutine: [
      {
        duration: 10,
        skill: "pronunciation",
        icon: "🎯",
        title: "Shadowing Nâng Cao",
        description:
          "Clip dài hơn (1–2 phút), tập connected speech, contractions (gonna, wanna, I'd)",
        resource: "YouGlish / English with Lucy",
      },
      {
        duration: 15,
        skill: "vocabulary",
        icon: "🃏",
        title: "SRS + Themed Vocab",
        description:
          "Chủ đề: work, travel, technology, health, relationships. Học cụm từ (collocations), không chỉ từ đơn",
        resource: "AtoEnglish Flashcards",
      },
      {
        duration: 15,
        skill: "listening",
        icon: "👂",
        title: "CI Input Nặng Hơn",
        description:
          "VOA Learning English, News in Levels, TED Talks easy (script available). 80% hiểu mới nghe tiếp",
        resource: "News in Levels / TED-Ed",
      },
      {
        duration: 15,
        skill: "reading",
        icon: "📖",
        title: "Graded Reading",
        description:
          "Oxford Bookworms A2–B1. Đọc 1–2 trang/ngày. Chú ý collocations và cách câu được kết nối",
        resource: "Oxford Bookworms / Graded Readers",
      },
      {
        duration: 20,
        skill: "speaking",
        icon: "🎙️",
        title: "Output: Kể Chuyện & Mô Tả",
        description:
          "Mô tả ảnh, kể chuyện hôm qua, role-play tình huống. Language exchange HelloTalk 2x/tuần",
        resource: "HelloTalk / Tandem / AtoEnglish Speaking",
      },
    ],
    resources: [
      {
        name: "News in Levels",
        url: "https://www.newsinlevels.com",
        type: "website",
        description: "Tin tức 3 level — chọn Level 1–2 cho giai đoạn này",
        free: true,
      },
      {
        name: "HelloTalk",
        url: "https://www.hellotalk.com",
        type: "app",
        description: "Language exchange với native speaker — miễn phí",
        free: true,
      },
      {
        name: "TED-Ed",
        url: "https://ed.ted.com",
        type: "youtube",
        description: "Video giáo dục ngắn 3–6 phút — có script, phụ đề",
        free: true,
      },
      {
        name: "English with Lucy",
        url: "https://www.youtube.com/@EnglishwithLucy",
        type: "youtube",
        description: "British English — grammar + pronunciation rõ ràng",
        free: true,
      },
      {
        name: "Oxford Bookworms A2–B1",
        type: "book",
        description:
          "Graded readers — đọc truyện adapted từ tác phẩm nổi tiếng",
        free: false,
      },
      {
        name: "Grammarly",
        url: "https://www.grammarly.com",
        type: "app",
        description: "Kiểm tra writing — học từ lỗi sai",
        free: true,
      },
    ],
    vietnameseTips: [
      {
        problem: "Không phân biệt Present Perfect vs Past Simple",
        solution:
          "'I have eaten' (còn liên quan tới hiện tại) vs 'I ate' (xong hẳn, biết khi nào). Luyện qua storytelling.",
      },
      {
        problem: "Hay dịch từ tiếng Việt sang Anh từng từ",
        solution:
          "Học theo chunks: 'take a shower' chứ không phải 'shower take'. SRS theo cụm từ, không từ đơn.",
      },
      {
        problem: "Ngại nói vì sợ sai",
        solution:
          "Người bản xứ không quan tâm lỗi ngữ pháp nhỏ — họ quan tâm mày có communicate được không. Lỗi = feedback.",
      },
    ],
    weeklyReview: [
      "Record 2 phút mô tả 1 chủ đề (gia đình, công việc, dự án web)",
      "Viết 1 đoạn 80 từ về chủ đề tuần này",
      "Làm 1 bài test B1 practice question",
      "Review 20 từ mới nhất từ SRS — dùng trong câu thật",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: "Thực Chiến & Nâng Cao",
    subtitle: "English cho SaaS & business",
    months: "Tháng 6–12",
    monthRange: [6, 12],
    cefrFrom: "B1",
    cefrTo: "B2",
    color: "#f59e0b",
    gradient: "from-warning to-warning",
    emoji: "🚀",
    goal: "Business/tech English, pitch SaaS, email US clients, xem YouTube tech không sub",
    vocabTarget: 4000,
    unitLevels: ["B1", "B2"],
    dailyMinutes: 90,
    milestones: [
      {
        month: 8,
        title: "Tech & Business Basics",
        canDo: [
          "Đọc tech blog, Stack Overflow, GitHub README không cần dịch",
          "Viết email giới thiệu AtoEnglish đến potential user Mỹ",
          "Mô tả features của app bằng English tự nhiên",
          "Nghe podcast tech 50% hiểu (không sub)",
        ],
      },
      {
        month: 10,
        title: "Giao Tiếp Tự Nhiên",
        canDo: [
          "Tham gia Discord/Slack tiếng Anh về web dev",
          "Thảo luận ý kiến, debate chủ đề quen thuộc",
          "Xem YouTube tech talk không sub 70% hiểu",
          "Viết product description, landing page copy bằng English",
        ],
      },
      {
        month: 12,
        title: "Business Ready",
        canDo: [
          "Pitch ý tưởng SaaS trong 2 phút (elevator pitch)",
          "Cold email US indie hackers/investors tự nhiên",
          "Tham gia Product Hunt launch bằng English",
          "B2 CEFR self-assessment: pass",
        ],
      },
    ],
    dailyRoutine: [
      {
        duration: 15,
        skill: "listening",
        icon: "👂",
        title: "Immersion Input",
        description:
          "Podcast tốc độ thường (Indie Hackers, How I Built This, Darknet Diaries), YouTube tech không sub",
        resource: "Indie Hackers Podcast / Darknet Diaries / Fireship",
      },
      {
        duration: 20,
        skill: "reading",
        icon: "📖",
        title: "Tech & Business Reading",
        description:
          "HackerNews, Product Hunt, The Guardian tech section, Y Combinator startup docs",
        resource: "HackerNews / Indie Hackers / TechCrunch",
      },
      {
        duration: 15,
        skill: "vocabulary",
        icon: "🃏",
        title: "Business & Tech Vocab",
        description:
          "Academic Word List (AWL), SaaS terminology, pitch deck vocabulary, email phrases",
        resource: "AtoEnglish — Business deck",
      },
      {
        duration: 20,
        skill: "speaking",
        icon: "🎙️",
        title: "Structured Output",
        description:
          "Record 2–3 phút pitch AtoEnglish, Italki tutor 1x/tuần feedback, Discord tech community",
        resource: "Italki / Cambly / Discord",
      },
      {
        duration: 20,
        skill: "writing",
        icon: "✍️",
        title: "Business Writing",
        description:
          "Viết cold email, product descriptions, GitHub README, indie hacker posts. Edit với Grammarly",
        resource: "Grammarly / ChatGPT review",
      },
    ],
    resources: [
      {
        name: "Indie Hackers Podcast",
        url: "https://www.indiehackers.com/podcast",
        type: "podcast",
        description:
          "Founders build SaaS từ 0 — nghe story + tech English thực",
        free: true,
      },
      {
        name: "Fireship",
        url: "https://www.youtube.com/@Fireship",
        type: "youtube",
        description:
          "Tech YouTube nhanh, funny, authentic — rất tốt cho immersion",
        free: true,
      },
      {
        name: "HackerNews",
        url: "https://news.ycombinator.com",
        type: "website",
        description:
          "Đọc + comment về startup, tech — authentic business English",
        free: true,
      },
      {
        name: "Italki",
        url: "https://www.italki.com",
        type: "app",
        description:
          "Tutor 1-on-1 — book 1–2 buổi/tháng để feedback pronunciation & business talk",
        free: false,
      },
      {
        name: "All Ears English Business",
        url: "https://www.allearsenglish.com",
        type: "podcast",
        description: "Business English podcast — email, meetings, small talk",
        free: true,
      },
      {
        name: "The Alchemist (English)",
        type: "book",
        description:
          "Tiểu thuyết ngắn dễ đọc — bắt đầu đọc sách thật không graded",
        free: false,
      },
    ],
    vietnameseTips: [
      {
        problem: "Business email nghe 'robotic' hoặc quá formal",
        solution:
          "Học chunks: 'I hope this finds you well', 'Just checking in', 'Happy to chat'. Copy style email của founder Mỹ mày follow.",
      },
      {
        problem: "Không biết idioms khi nghe podcast",
        solution:
          "Note lại 1 idiom/ngày từ input. Ví dụ: 'hit the ground running', 'low-hanging fruit'. Dùng lại trong writing.",
      },
      {
        problem: "Accent người Mỹ nói nhanh, nuốt từ",
        solution:
          "Shadowing podcast từng câu ngắn. 'gonna' = going to, 'wanna' = want to, 'hafta' = have to.",
      },
    ],
    weeklyReview: [
      "Record elevator pitch AtoEnglish 2 phút — nghe lại, note điểm cải thiện",
      "Viết 1 cold email (giả định pitch to US user) — tự review với Grammarly",
      "Nghe 1 full podcast episode (30+ phút) không sub — tóm tắt bằng tiếng Anh",
      "Post 1 comment trên HackerNews hoặc Indie Hackers",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: "Duy Trì & Mastery",
    subtitle: "Immersion không điểm dừng",
    months: "Tháng 12+",
    monthRange: [12, 24],
    cefrFrom: "B2",
    cefrTo: "C1+",
    color: "#10b981",
    gradient: "from-primary to-primary",
    emoji: "🏆",
    goal: "Tự do tài chính qua English — giao dịch business quốc tế, đưa AtoEnglish ra thị trường Mỹ",
    vocabTarget: 8000,
    unitLevels: ["B2"],
    dailyMinutes: 60,
    milestones: [
      {
        month: 15,
        title: "Full Immersion",
        canDo: [
          "Chuyển toàn bộ môi trường sang English (OS, apps, social media)",
          "Xem phim/series không sub 80%+ hiểu",
          "Viết thread Twitter/X về AtoEnglish bằng English",
          "Network với founders Mỹ trên X / LinkedIn",
        ],
      },
      {
        month: 18,
        title: "Business Freedom",
        canDo: [
          "Pitch AtoEnglish tới US accelerator/angel investor",
          "Conduct user interview với native speakers",
          "Write blog posts / case studies in English",
          "Present product demo tự tin không cần script",
        ],
      },
      {
        month: 24,
        title: "Financial Freedom via English",
        canDo: [
          "Đưa AtoEnglish ra thị trường Mỹ với marketing English hoàn toàn",
          "Earn first US dollar từ English-speaking customers",
          "Mentor người khác học English theo method này",
          "Optional: IELTS 6.5+ nếu cần chứng chỉ",
        ],
      },
    ],
    dailyRoutine: [
      {
        duration: 20,
        skill: "listening",
        icon: "👂",
        title: "Daily Immersion",
        description:
          "Podcast, YouTube, audiobook — chọn cái thích, không cần 'học'. Não vẫn tiếp thu.",
        resource: "Any English content mày yêu thích",
      },
      {
        duration: 20,
        skill: "speaking",
        icon: "🎙️",
        title: "Active Output",
        description:
          "Call với đối tác/user Mỹ, Italki conversation, community Discord, Twitter Spaces",
        resource: "Italki / Twitter Spaces / Discord",
      },
      {
        duration: 10,
        skill: "vocabulary",
        icon: "🃏",
        title: "SRS Maintenance",
        description:
          "Chỉ ôn cards due hôm nay — FSRS tự tính. Không cần học card mới nhiều.",
        resource: "AtoEnglish Flashcards",
      },
      {
        duration: 10,
        skill: "writing",
        icon: "✍️",
        title: "English-Only Writing",
        description:
          "Journal, social posts, emails — viết hết bằng English. Đừng nghĩ bằng tiếng Việt nữa.",
        resource: "Notion / Obsidian / Twitter",
      },
    ],
    resources: [
      {
        name: "Twitter/X English Community",
        url: "https://twitter.com",
        type: "website",
        description:
          "Follow indie hackers, founders, devs Mỹ. Tweet bằng English.",
        free: true,
      },
      {
        name: "Product Hunt",
        url: "https://www.producthunt.com",
        type: "website",
        description: "Launch sản phẩm, đọc comments, network với founders",
        free: true,
      },
      {
        name: "Y Combinator Resources",
        url: "https://www.ycombinator.com/resources",
        type: "website",
        description:
          "Startup English — pitch deck, investor emails, product thinking",
        free: true,
      },
      {
        name: "Cambly",
        url: "https://www.cambly.com",
        type: "app",
        description:
          "On-demand conversation với native speakers — no scheduling",
        free: false,
      },
    ],
    vietnameseTips: [
      {
        problem: "Vẫn nghĩ bằng tiếng Việt rồi dịch",
        solution:
          "Set phone/laptop language = English. Inner monologue thực hành bằng English. Mô tả xung quanh mày bằng English khi đi bộ.",
      },
      {
        problem: "Plateau — thấy không tiến nữa",
        solution:
          "Đây là dấu hiệu tốt — não đang consolidate. Tăng output (nói nhiều hơn), đọc nội dung khó hơn 1 level.",
      },
    ],
    weeklyReview: [
      "Gửi 1 cold outreach email cho US founder/user",
      "Đọc 1 chapter sách tiếng Anh không graded",
      "30 phút conversation với native speaker",
      "Review tiến độ business goal (bao nhiêu US customers?)",
    ],
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getPhaseForLevel(cefrLevel: string): StudyPhase {
  // Strip any trailing description text (e.g. "A1 · Nền Tảng" → "A1")
  const level = (cefrLevel.split(/[\s·\-]/)[0] ?? cefrLevel).toUpperCase();
  if (level === "A0" || level === "A1") return STUDY_PHASES[0]!;
  if (level === "A2" || level === "B1") return STUDY_PHASES[1]!;
  if (level === "B1+" || level === "B2") return STUDY_PHASES[2]!;
  return STUDY_PHASES[3]!;
}

export function getPhaseProgress(
  cefrLevel: string,
  completedUnitIds: string[],
  allUnits: { id: string; level: string }[],
): { completed: number; total: number; percent: number } {
  const phase = getPhaseForLevel(cefrLevel);
  const phaseUnits = allUnits.filter((u) => phase.unitLevels.includes(u.level));
  const completed = phaseUnits.filter((u) =>
    completedUnitIds.includes(u.id),
  ).length;
  const total = phaseUnits.length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export const DAILY_TIPS: string[] = [
  "Shadowing 10 phút mỗi ngày hiệu quả hơn học ngữ pháp 2 tiếng — não học qua pattern, không qua rule.",
  "Học 10 từ mới mỗi ngày với FSRS = 3,650 từ sau 1 năm. Tích lũy nhỏ, kết quả lớn!",
  "Khi nghe mà không hiểu, đừng dừng lại tra từ điển ngay — cố gắng đoán nghĩa từ context.",
  "Record giọng nói hôm nay, nghe lại sau 1 tháng — mày sẽ tự ngạc nhiên về sự tiến bộ.",
  "Đừng đợi 'sẵn sàng' mới nói — native speakers không cần grammar hoàn hảo để giao tiếp.",
  "Output sớm giúp não biết cần học gì tiếp theo. Nói → sai → sửa → nhớ mãi.",
  "Tiếng Anh là công cụ, không phải môn học. Hãy dùng nó để làm điều mày thật sự muốn làm.",
  "Mỗi từ mới nên học trong 3 câu khác nhau — ngữ cảnh tạo memory, không phải định nghĩa.",
  "Comprehensible Input: nếu hiểu 100% → quá dễ. Hiểu 60% → quá khó. Hiểu 70-80% → perfect.",
  "Pitch AtoEnglish cho chính mình bằng tiếng Anh — đây là speaking practice và business practice cùng lúc.",
];
