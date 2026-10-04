// ─── EF SET–style CEFR Placement Test — 40 Questions ────────────────────────
// Format: Reading comprehension + Vocabulary in context (như EF SET Quick Check)
// KHÔNG dùng isolated grammar drills — hiểu English in USE
// Levels: A1 → A2 → B1 → B2

export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2";
export type SkillType = "reading" | "vocabulary" | "language-use";

export interface PlacementQuestion {
  id: number;
  level: CEFRLevel;
  skill: SkillType;
  context?: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
}

// ─── PASSAGES ────────────────────────────────────────────────────────────────

const P0 = `Hi. I am Lisa. I am from England. I am twenty-five years old. I live in London. I have a cat. Her name is Mimi. I like coffee and music.`;

const P1 = `Tom is 8 years old. He lives with his mother, father, and sister. His sister's name is Amy. She is 5. Tom goes to school every day. He likes math and science. After school, he plays football with his friends.`;

const P2 = `Maria works at a café near her home. She starts work at 8 a.m. and finishes at 4 p.m. She serves coffee and food to customers. The café is always busy on weekends. Maria enjoys her job because she meets many interesting people.`;

const P3 = `Last summer, David and his family went on a camping trip. They drove to a national park and set up their tent near a river. Every morning, they went hiking in the forest. One evening, they saw a deer near their campsite. It was the best holiday David had ever had.`;

const P4 = `Many cities around the world are trying to reduce air pollution. One way they do this is by encouraging people to use public transport instead of private cars. Some cities have introduced free bus services on certain days. Others have built more bicycle lanes. These changes have helped to improve air quality in several urban areas.`;

const P5 = `The concept of remote work has changed significantly in recent years. While working from home was once seen as a privilege for a few, the COVID-19 pandemic forced millions of people worldwide to adopt this model. Studies show that many employees are more productive when working remotely, though others report feeling isolated. Companies are now exploring hybrid models that combine office days with remote working to balance these competing needs.`;

const P6 = `Online shopping has transformed the way people buy goods. Rather than visiting physical stores, consumers can now browse thousands of products from their homes and have them delivered within days — or even hours. This convenience has led to the rise of large e-commerce platforms. However, critics point out that this trend has negative consequences for local businesses, which often cannot compete with the lower prices offered online.`;

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // ══ A0 Reading — P0: Lisa (Pre-CEFR Foundation) ══════════════════════════
  {
    id: 41,
    level: "A0",
    skill: "reading",
    context: P0,
    question: "Where is Lisa from?",
    options: ["France", "England", "Vietnam", "Japan"],
    correctAnswer: 1,
    explanation: "'I am from England.'",
  },
  {
    id: 42,
    level: "A0",
    skill: "reading",
    context: P0,
    question: "How old is Lisa?",
    options: ["22 years old", "25 years old", "30 years old", "18 years old"],
    correctAnswer: 1,
    explanation: "'I am twenty-five years old.'",
  },
  {
    id: 43,
    level: "A0",
    skill: "vocabulary",
    question: "What does 'cat' mean in Vietnamese?",
    options: ["Con chó", "Con mèo", "Con cá", "Con chim"],
    correctAnswer: 1,
    explanation: "'Cat' = con mèo. Lisa có một con mèo tên là Mimi.",
  },
  {
    id: 44,
    level: "A0",
    skill: "vocabulary",
    question: "Complete: 'My ___ is Lan.' (tên của tôi là Lan)",
    options: ["age", "city", "name", "job"],
    correctAnswer: 2,
    explanation: "'My name is Lan.' — 'name' = tên.",
  },
  {
    id: 45,
    level: "A0",
    skill: "language-use",
    question: "Which sentence is correct?",
    options: [
      "I am from Vietnam.",
      "I from Vietnam.",
      "I are from Vietnam.",
      "I be from Vietnam.",
    ],
    correctAnswer: 0,
    explanation:
      "'I AM from Vietnam.' — động từ BE bắt buộc. Bỏ 'am' là lỗi #1 của người Việt.",
  },

  // ══ A1 Reading — P1: Tom ══════════════════════════════════════════════════
  {
    id: 1,
    level: "A1",
    skill: "reading",
    context: P1,
    question: "How old is Tom?",
    options: ["5 years old", "6 years old", "8 years old", "10 years old"],
    correctAnswer: 2,
    explanation: "Câu đầu tiên: 'Tom is 8 years old.'",
  },
  {
    id: 2,
    level: "A1",
    skill: "reading",
    context: P1,
    question: "What is Tom's sister's name?",
    options: ["Maria", "Amy", "Sara", "Lucy"],
    correctAnswer: 1,
    explanation: "'His sister's name is Amy.'",
  },
  {
    id: 3,
    level: "A1",
    skill: "reading",
    context: P1,
    question: "What does Tom do after school?",
    options: [
      "He reads books.",
      "He watches TV.",
      "He plays football.",
      "He does homework.",
    ],
    correctAnswer: 2,
    explanation: "'After school, he plays football with his friends.'",
  },
  {
    id: 4,
    level: "A1",
    skill: "reading",
    context: P1,
    question: "What subjects does Tom like?",
    options: [
      "English and art",
      "Math and science",
      "History and music",
      "PE and drama",
    ],
    correctAnswer: 1,
    explanation: "'He likes math and science.'",
  },

  // ══ A1 Vocabulary in context ══════════════════════════════════════════════
  {
    id: 5,
    level: "A1",
    skill: "vocabulary",
    question:
      "Choose the correct word: 'The weather is very ___. I need a coat.'",
    options: ["hot", "windy", "cold", "sunny"],
    correctAnswer: 2,
    explanation:
      "Cần áo khoác → trời lạnh (cold). Các lựa chọn khác không cần áo.",
  },
  {
    id: 6,
    level: "A1",
    skill: "vocabulary",
    question: "Choose the correct word: 'I am ___. I want to eat something.'",
    options: ["tired", "thirsty", "hungry", "bored"],
    correctAnswer: 2,
    explanation:
      "Muốn ăn → đói (hungry). Thirsty = khát, Tired = mệt, Bored = chán.",
  },
  {
    id: 7,
    level: "A1",
    skill: "vocabulary",
    question: "Choose the correct word: 'She goes to the ___ to buy medicine.'",
    options: ["bakery", "pharmacy", "library", "garage"],
    correctAnswer: 1,
    explanation:
      "Pharmacy = hiệu thuốc. Bakery = tiệm bánh, Library = thư viện.",
  },

  // ══ A1 Language use ═══════════════════════════════════════════════════════
  {
    id: 8,
    level: "A1",
    skill: "language-use",
    question: "'___ your name?' 'My name is Peter.'",
    options: ["What is", "Where is", "Who is", "How is"],
    correctAnswer: 0,
    explanation:
      "Hỏi tên dùng 'What is your name?' → đây là cụm từ chào hỏi cơ bản nhất.",
  },
  {
    id: 9,
    level: "A1",
    skill: "language-use",
    question: "'How many brothers ___ you have?' 'I have two.'",
    options: ["is", "are", "do", "does"],
    correctAnswer: 2,
    explanation:
      "'How many + noun + do + subject + have?' Với 'you' dùng 'do'.",
  },
  {
    id: 10,
    level: "A1",
    skill: "language-use",
    question: "'___ is the bank?' 'It's on Main Street.'",
    options: ["What", "Who", "Where", "When"],
    correctAnswer: 2,
    explanation:
      "Hỏi địa điểm (Main Street = địa chỉ) → 'Where'. What = cái gì, Who = ai, When = khi nào.",
  },

  // ══ A2 Reading — P2: Maria ════════════════════════════════════════════════
  {
    id: 11,
    level: "A2",
    skill: "reading",
    context: P2,
    question: "Where does Maria work?",
    options: ["At a hospital", "At a café", "At a school", "At a supermarket"],
    correctAnswer: 1,
    explanation: "'Maria works at a café near her home.'",
  },
  {
    id: 12,
    level: "A2",
    skill: "reading",
    context: P2,
    question: "What time does Maria finish work?",
    options: ["At 8 a.m.", "At 12 p.m.", "At 4 p.m.", "At 6 p.m."],
    correctAnswer: 2,
    explanation: "'She starts work at 8 a.m. and finishes at 4 p.m.'",
  },
  {
    id: 13,
    level: "A2",
    skill: "reading",
    context: P2,
    question: "When is the café busiest?",
    options: [
      "On Mondays",
      "Every morning",
      "On weekends",
      "On public holidays",
    ],
    correctAnswer: 2,
    explanation: "'The café is always busy on weekends.'",
  },
  {
    id: 14,
    level: "A2",
    skill: "reading",
    context: P3,
    question: "Where did David's family go last summer?",
    options: [
      "To the beach",
      "To a national park",
      "To another country",
      "To a hotel",
    ],
    correctAnswer: 1,
    explanation:
      "'They drove to a national park and set up their tent near a river.'",
  },
  {
    id: 15,
    level: "A2",
    skill: "reading",
    context: P3,
    question: "What animal did they see near the campsite?",
    options: ["A fox", "A rabbit", "A bear", "A deer"],
    correctAnswer: 3,
    explanation: "'One evening, they saw a deer near their campsite.'",
  },

  // ══ A2 Vocabulary in context ══════════════════════════════════════════════
  {
    id: 16,
    level: "A2",
    skill: "vocabulary",
    question:
      "The flight was ___. It arrived two hours after the scheduled time.",
    options: ["on time", "delayed", "cancelled", "early"],
    correctAnswer: 1,
    explanation: "Đến trễ 2 tiếng so với lịch → delayed (bị hoãn/trễ).",
  },
  {
    id: 17,
    level: "A2",
    skill: "vocabulary",
    question: "I need to ___ some money from the ATM before we go shopping.",
    options: ["spend", "borrow", "withdraw", "deposit"],
    correctAnswer: 2,
    explanation:
      "Rút tiền từ ATM = withdraw. Deposit = gửi tiền, Borrow = vay, Spend = tiêu.",
  },
  {
    id: 18,
    level: "A2",
    skill: "vocabulary",
    question: "She looked at the ___ to check when the next bus would arrive.",
    options: ["receipt", "timetable", "menu", "invoice"],
    correctAnswer: 1,
    explanation:
      "Lịch trình xe buýt = timetable (thời gian biểu). Receipt = hóa đơn, Menu = thực đơn.",
  },

  // ══ A2 Language use ═══════════════════════════════════════════════════════
  {
    id: 19,
    level: "A2",
    skill: "language-use",
    question: "I've lived in Hanoi ___ I was born.",
    options: ["for", "since", "during", "ago"],
    correctAnswer: 1,
    explanation:
      "'Since' + mốc thời gian cụ thể (when I was born). 'For' + khoảng thời gian (for 5 years).",
  },
  {
    id: 20,
    level: "A2",
    skill: "language-use",
    question: "This is ___ restaurant I've ever been to. The food is amazing!",
    options: ["good", "better", "the best", "more good"],
    correctAnswer: 2,
    explanation:
      "Superlative (tốt nhất trong tất cả) = 'the best'. 'Good → better → the best'.",
  },

  // ══ B1 Reading — P4: Air Pollution ═══════════════════════════════════════
  {
    id: 21,
    level: "B1",
    skill: "reading",
    context: P4,
    question: "What is the main topic of this text?",
    options: [
      "The benefits of using private cars",
      "Ways cities are trying to reduce air pollution",
      "How bicycles are made",
      "The history of public transport",
    ],
    correctAnswer: 1,
    explanation: "Toàn bài nói về các cách thành phố giảm ô nhiễm không khí.",
  },
  {
    id: 22,
    level: "B1",
    skill: "reading",
    context: P4,
    question: "According to the text, what have some cities introduced?",
    options: [
      "Free taxi services",
      "Free bus services on certain days",
      "Electric cars for all citizens",
      "New airports",
    ],
    correctAnswer: 1,
    explanation:
      "'Some cities have introduced free bus services on certain days.'",
  },
  {
    id: 23,
    level: "B1",
    skill: "reading",
    context: P4,
    question: "What is the result of these changes, according to the text?",
    options: [
      "Traffic has increased.",
      "Air quality has improved in some cities.",
      "More people are buying cars.",
      "Bicycle lanes have been removed.",
    ],
    correctAnswer: 1,
    explanation:
      "'These changes have helped to improve air quality in several urban areas.'",
  },
  {
    id: 24,
    level: "B1",
    skill: "reading",
    context: P4,
    question: "The word 'urban' in the last sentence means:",
    options: [
      "rural",
      "industrial",
      "relating to cities",
      "relating to nature",
    ],
    correctAnswer: 2,
    explanation:
      "'Urban' = thuộc về thành phố (city). Opposite of rural = nông thôn.",
  },

  // ══ B1 Vocabulary in context ══════════════════════════════════════════════
  {
    id: 25,
    level: "B1",
    skill: "vocabulary",
    question:
      "The company needs to ___ its marketing strategy to attract younger customers.",
    options: ["ignore", "revise", "avoid", "forget"],
    correctAnswer: 1,
    explanation:
      "Revise = xem xét lại, chỉnh sửa. Đây là từ quan trọng trong business English.",
  },
  {
    id: 26,
    level: "B1",
    skill: "vocabulary",
    question: "He was feeling very ___ after working 12 hours without a break.",
    options: ["energetic", "enthusiastic", "exhausted", "excited"],
    correctAnswer: 2,
    explanation:
      "Exhausted = kiệt sức hoàn toàn. Làm 12 tiếng không nghỉ → mệt kiệt.",
  },
  {
    id: 27,
    level: "B1",
    skill: "vocabulary",
    question: "The new law will ___ all citizens, not just businesses.",
    options: ["ignore", "replace", "affect", "create"],
    correctAnswer: 2,
    explanation:
      "Affect = ảnh hưởng đến. 'The law affects everyone' = luật này tác động đến mọi người.",
  },
  {
    id: 28,
    level: "B1",
    skill: "vocabulary",
    question: "We need to find a ___ to the problem before the deadline.",
    options: ["question", "solution", "problem", "confusion"],
    correctAnswer: 1,
    explanation:
      "Solution = giải pháp. 'Find a solution to a problem' là collocation chuẩn.",
  },

  // ══ B1 Language use ═══════════════════════════════════════════════════════
  {
    id: 29,
    level: "B1",
    skill: "language-use",
    question: "If I ___ more time, I would learn a new language.",
    options: ["have", "had", "will have", "would have"],
    correctAnswer: 1,
    explanation:
      "Second Conditional: If + past simple → điều không có thật hiện tại. 'If I had...'",
  },
  {
    id: 30,
    level: "B1",
    skill: "language-use",
    question: "She told me that she ___ finish the report by Friday.",
    options: ["will", "would", "can", "is going to"],
    correctAnswer: 1,
    explanation:
      "Reported speech: will → would. 'She said she WOULD finish...' (backshift).",
  },

  // ══ B2 Reading — P5: Remote Work ═════════════════════════════════════════
  {
    id: 31,
    level: "B2",
    skill: "reading",
    context: P5,
    question: "What does the text say about remote work before the pandemic?",
    options: [
      "It was the standard way of working.",
      "It was seen as a privilege for a few.",
      "It was illegal in most countries.",
      "It was only used by technology companies.",
    ],
    correctAnswer: 1,
    explanation:
      "'working from home was once seen as a privilege for a few' — trước dịch, làm việc từ nhà là đặc quyền.",
  },
  {
    id: 32,
    level: "B2",
    skill: "reading",
    context: P5,
    question:
      "Which of the following best describes the attitude of employees towards remote work, according to the text?",
    options: [
      "All employees prefer working from home.",
      "No employees want to work from home.",
      "Opinions are mixed — some are more productive, others feel isolated.",
      "Employees prefer office work because of better salaries.",
    ],
    correctAnswer: 2,
    explanation:
      "'many employees are more productive... though others report feeling isolated.' → ý kiến trái chiều.",
  },
  {
    id: 33,
    level: "B2",
    skill: "reading",
    context: P5,
    question: "What is the 'hybrid model' mentioned in the text?",
    options: [
      "A new type of electric car",
      "A combination of office days and remote working",
      "A training programme for new employees",
      "A type of company with both local and international offices",
    ],
    correctAnswer: 1,
    explanation:
      "'hybrid models that combine office days with remote working' — kết hợp làm ở văn phòng và ở nhà.",
  },
  {
    id: 34,
    level: "B2",
    skill: "reading",
    context: P5,
    question:
      "The word 'competing' in the last sentence ('competing needs') suggests that the needs are:",
    options: [
      "similar and easy to balance",
      "in conflict with each other",
      "unimportant",
      "temporary",
    ],
    correctAnswer: 1,
    explanation:
      "'Competing needs' = những nhu cầu mâu thuẫn nhau, khó thỏa mãn cùng lúc.",
  },

  // ══ B2 Reading — P6: Online Shopping ════════════════════════════════════
  {
    id: 35,
    level: "B2",
    skill: "reading",
    context: P6,
    question: "What is the main argument of critics mentioned in the text?",
    options: [
      "Online shopping is too slow.",
      "Online shopping harms local businesses.",
      "E-commerce platforms are unreliable.",
      "Delivery services are too expensive.",
    ],
    correctAnswer: 1,
    explanation:
      "'this trend has negative consequences for local businesses, which often cannot compete with lower prices.'",
  },
  {
    id: 36,
    level: "B2",
    skill: "reading",
    context: P6,
    question: "The phrase 'browse thousands of products' means:",
    options: [
      "to buy all available products",
      "to look through many products without necessarily buying",
      "to compare prices at different shops",
      "to return unwanted products",
    ],
    correctAnswer: 1,
    explanation:
      "Browse = lướt xem qua nhiều mục (không nhất thiết phải mua). Giống browse web.",
  },

  // ══ B2 Vocabulary in context ══════════════════════════════════════════════
  {
    id: 37,
    level: "B2",
    skill: "vocabulary",
    question:
      "The government's decision to raise taxes was met with widespread ___.",
    options: ["enthusiasm", "opposition", "support", "indifference"],
    correctAnswer: 1,
    explanation:
      "Opposition = sự phản đối. 'Met with opposition' = gặp phải sự phản đối — collocation quan trọng.",
  },
  {
    id: 38,
    level: "B2",
    skill: "vocabulary",
    question: "The new policy aims to ___ the gap between rich and poor.",
    options: ["widen", "narrow", "ignore", "celebrate"],
    correctAnswer: 1,
    explanation:
      "Narrow the gap = thu hẹp khoảng cách. Collocation rất phổ biến trong academic/business English.",
  },

  // ══ B2 Language use ═══════════════════════════════════════════════════════
  {
    id: 39,
    level: "B2",
    skill: "language-use",
    question: "Had she read the instructions carefully, she ___ the mistake.",
    options: [
      "would avoid",
      "will have avoided",
      "would have avoided",
      "avoided",
    ],
    correctAnswer: 2,
    explanation:
      "Third Conditional (inverted): Had + V3, would have + V3. Sai lầm trong quá khứ không thể thay đổi.",
  },
  {
    id: 40,
    level: "B2",
    skill: "language-use",
    question:
      "Not only ___ the project on time, but it also came in under budget.",
    options: [
      "they delivered",
      "delivered they",
      "did they deliver",
      "they did deliver",
    ],
    correctAnswer: 2,
    explanation:
      "Inversion sau 'Not only': Not only + auxiliary + subject + verb. Cấu trúc nhấn mạnh B2.",
  },
];

// ─── Scoring Logic ────────────────────────────────────────────────────────────

export interface TestResult {
  totalScore: number;
  readingScore: number;
  vocabularyScore: number;
  languageUseScore: number;
  cefrLevel: CEFRLevel;
  levelLabel: string;
  levelDescription: string;
  nextSteps: string[];
}

export function calculateResult(answers: Record<number, number>): TestResult {
  let totalScore = 0;
  let readingScore = 0;
  let vocabularyScore = 0;
  let languageUseScore = 0;

  for (const q of PLACEMENT_QUESTIONS) {
    if (answers[q.id] === q.correctAnswer) {
      totalScore++;
      if (q.skill === "reading") readingScore++;
      else if (q.skill === "vocabulary") vocabularyScore++;
      else languageUseScore++;
    }
  }

  let cefrLevel: CEFRLevel;
  let levelLabel: string;
  let levelDescription: string;
  let nextSteps: string[];

  if (totalScore <= 5) {
    cefrLevel = "A0";
    levelLabel = "A0 — Foundation (ước tính)";
    levelDescription =
      "Bạn đang ở điểm xuất phát — đây là cơ hội tuyệt vời! Mọi người giỏi tiếng Anh đều bắt đầu từ zero.";
    nextSteps = [
      "Bắt đầu với 26 chữ cái và âm cơ bản (Unit A0-1)",
      "Học 5 câu giao tiếp cơ bản: Hello, My name is, Thank you",
      "Nghe BBC Learning English — Everyday Grammar (A1)",
      "Mục tiêu 30 ngày: hoàn thành 8 unit A0",
    ];
  } else if (totalScore <= 15) {
    cefrLevel = "A1";
    levelLabel = "A1 — Beginner (ước tính)";
    levelDescription =
      "Bạn đang ở mức khởi đầu — điểm xuất phát tốt! Mọi người giỏi tiếng Anh đều bắt đầu từ đây.";
    nextSteps = [
      "Học 10 từ vựng/ngày: greetings, numbers, family, food",
      "Luyện 44 âm IPA cơ bản (vào trang Phát âm)",
      "Nghe BBC Learning English 15 phút/ngày (beginner)",
      "Mục tiêu ngắn hạn: hoàn thành các unit A1 đầu trong lộ trình",
    ];
  } else if (totalScore <= 25) {
    cefrLevel = "A2";
    levelLabel = "A2 — Elementary (ước tính)";
    levelDescription =
      "Bạn có nền tảng cơ bản tốt! Xây thêm từ vựng và luyện đọc là lên B1 nhanh thôi.";
    nextSteps = [
      "Mở rộng vocab lên 1500–2000 từ (travel, work, health)",
      "Đọc News in Levels — Level 1 & 2 mỗi ngày",
      "Viết journal 3–5 câu tiếng Anh/ngày",
      "Language exchange HelloTalk 1–2 lần/tuần",
    ];
  } else if (totalScore <= 35) {
    cefrLevel = "B1";
    levelLabel = "B1 — Intermediate (ước tính)";
    levelDescription =
      "Kết quả ước tính bạn ở mức trung cấp. Luyện thêm nói và viết để tiến xa hơn.";
    nextSteps = [
      "Nghe podcast thường: News in Levels 3, TED Easy",
      "Luyện speaking với AI Roleplay",
      "Đọc tech blog và GitHub README bằng tiếng Anh",
      "Học business email + product description writing",
    ];
  } else {
    cefrLevel = "B2";
    levelLabel = "B2 — Upper Intermediate (ước tính)";
    levelDescription =
      "Kết quả ước tính bạn ở mức khá cao. Bài test ngắn không đo được nói/viết — hãy kiểm chứng bằng luyện tập thật.";
    nextSteps = [
      "Luyện speaking với AI Roleplay và nhật ký nói",
      "Nghe podcast native speed (TED, How I Built This)",
      "Viết journal tiếng Anh và nhận phản hồi",
      "Ôn lại các unit B2 trong lộ trình",
    ];
  }

  return {
    totalScore,
    readingScore,
    vocabularyScore,
    languageUseScore,
    cefrLevel,
    levelLabel,
    levelDescription,
    nextSteps,
  };
}

/** Result payload when the learner self-selects a level (no scored test). */
export function buildSelfSelectResult(level: CEFRLevel): TestResult {
  const templates: Record<
    CEFRLevel,
    Omit<
      TestResult,
      "totalScore" | "readingScore" | "vocabularyScore" | "languageUseScore"
    >
  > = {
    A0: {
      cefrLevel: "A0",
      levelLabel: "A0 — Foundation",
      levelDescription:
        "Bạn chọn bắt đầu từ nền tảng — phù hợp nếu mới học hoặc cần củng cố căn bản.",
      nextSteps: [
        "Bắt đầu Unit A0-1 — bảng chữ cái & âm cơ bản",
        "Học 15 phút/ngày để xây thói quen",
        "Làm lại bài test sau 2 tuần để kiểm tra tiến bộ",
      ],
    },
    A1: {
      cefrLevel: "A1",
      levelLabel: "A1 — Beginner",
      levelDescription:
        "Bạn chọn mức cơ bản — lộ trình mở từ Unit 1, bỏ qua phần A0.",
      nextSteps: [
        "Bắt đầu Unit 1 — động từ To be",
        "Luyện phát âm IPA 15 phút/ngày",
        "Dùng chế độ học nhanh (~15 phút) khi bận",
      ],
    },
    A2: {
      cefrLevel: "A2",
      levelLabel: "A2 — Elementary",
      levelDescription:
        "Bạn chọn sơ trung cấp — bắt đầu từ Unit 13, bỏ qua A0–A1.",
      nextSteps: [
        "Bắt đầu Unit 13 — Past Simple",
        "Đọc News in Levels Level 1 mỗi ngày",
        "Luyện nói Shadowing 3 lần/tuần",
      ],
    },
    B1: {
      cefrLevel: "B1",
      levelLabel: "B1 — Intermediate",
      levelDescription:
        "Bạn chọn trung cấp — bắt đầu từ Unit 19, không cần học lại từ đầu.",
      nextSteps: [
        "Bắt đầu Unit 19 — Present Perfect",
        "Thử AI Roleplay trên trang Luyện nói",
        "Luyện business email trong mục Viết",
      ],
    },
    B2: {
      cefrLevel: "B2",
      levelLabel: "B2 — Upper Intermediate",
      levelDescription:
        "Bạn chọn mức khá — bắt đầu từ Unit 33, tập trung polish & chuyên ngành.",
      nextSteps: [
        "Bắt đầu Unit 33 — Advanced structures",
        "Luyện cold pitch bằng tiếng Anh",
        "Tham gia Business track khi sẵn sàng",
      ],
    },
  };

  const template = templates[level];
  return {
    totalScore: 0,
    readingScore: 0,
    vocabularyScore: 0,
    languageUseScore: 0,
    ...template,
  };
}

export const TOTAL_QUESTIONS = PLACEMENT_QUESTIONS.length;
export const READING_COUNT = PLACEMENT_QUESTIONS.filter(
  (q) => q.skill === "reading",
).length;
export const VOCAB_COUNT = PLACEMENT_QUESTIONS.filter(
  (q) => q.skill === "vocabulary",
).length;
export const LANG_USE_COUNT = PLACEMENT_QUESTIONS.filter(
  (q) => q.skill === "language-use",
).length;
// Keep GRAMMAR_COUNT as alias for backwards compat
export const GRAMMAR_COUNT = LANG_USE_COUNT;
