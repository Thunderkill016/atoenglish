import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-6 — Gia Đình & Những Người Thân  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-6 — Gia Đình & Những Người Thân (Family Members)
// Grammar: HE / SHE / THEY + BE — Third person pronouns with gender
// L1 Alert: Vietnamese "anh ấy/cô ấy/họ" ≈ English HE/SHE/THEY
//           BUT Vietnamese often uses family terms instead of pronouns
// CELTA: Dialogue first — showing family photos context
// Lewis: "This is my...", "He/She is...", "They are..." as fixed chunks

export const unitA06: UnitData = {
  unitId: "unit-a0-6",
  title: "Unit A0-6: Gia Đình & Những Người Thân",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học từ vựng về gia đình và cách kể về những người thân yêu bằng tiếng Anh — kỹ năng thiết yếu trong mọi cuộc trò chuyện.",
  badgeName: "Người Kể Chuyện",
  badgeEmoji: "👨‍👩‍👧‍👦",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Đồng nghiệp nước ngoài Sara nhìn thấy ảnh gia đình trên điện thoại của bạn và hỏi về từng người. Bạn cần kể về gia đình bằng tiếng Anh.",

  learningOutcomes: [
    "Nói được các từ chỉ thành viên gia đình cơ bản",
    "Dùng HE/SHE/THEY đúng theo giới tính",
    "Kể về gia đình: This is my mother. She is a teacher.",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Người bản ngữ thường hỏi <span class="text-primary font-semibold">"Do you have any brothers or sisters?"</span> thay vì hỏi về từng người một. Câu trả lời ngắn gọn như <span class="text-primary font-semibold">"I have one older brother"</span> là đủ — không cần kể chi tiết nếu không được hỏi tiếp.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📸",
      en: "This is my family photo.",
      vn: "Đây là ảnh gia đình tôi.",
      context: "Mở đầu kể về gia đình",
    },
    {
      emoji: "👨",
      en: "This is my father. He is a doctor.",
      vn: "Đây là bố tôi. Ông ấy là bác sĩ.",
      context: "Giới thiệu người thân nam",
    },
    {
      emoji: "👩",
      en: "This is my mother. She is a teacher.",
      vn: "Đây là mẹ tôi. Bà ấy là giáo viên.",
      context: "Giới thiệu người thân nữ",
    },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "mother",
      emoji: "👩",
      phonetic: "/ˈmʌðər/",
      meaning: "mẹ",
      example: "My mother is a teacher.",
      example2: "She is my mother.",
      collocation: "my mother / mother's day / working mother",
      audio: "/audio/unit-a0-6/mother.mp3",
      l1_interference_vn:
        "⚠️ 'My mother' (không viết hoa trừ đầu câu). 'Mom/Mum' (informal). KHÔNG dùng 'the mother' để chỉ mẹ của bạn.",
    },
    {
      id: 2,
      word: "father",
      emoji: "👨",
      phonetic: "/ˈfɑːðər/",
      meaning: "bố, cha",
      example: "My father is a doctor.",
      example2: "He is my father.",
      collocation: "my father / father's day / single father",
      audio: "/audio/unit-a0-6/father.mp3",
      l1_interference_vn:
        "⚠️ 'My father' = formal. 'Dad/Papa' = informal. Trong câu: 'My father is a doctor' — KHÔNG 'The father of me'.",
    },
    {
      id: 3,
      word: "brother",
      emoji: "👦",
      phonetic: "/ˈbrʌðər/",
      meaning: "anh/em trai",
      example: "I have one brother.",
      example2: "My brother is twenty years old.",
      collocation: "older brother / younger brother / big brother",
      audio: "/audio/unit-a0-6/brother.mp3",
      l1_interference_vn:
        "⚠️ 'Brother' không phân biệt anh/em trai. Phải nói rõ: 'older brother' (anh) vs 'younger brother' (em trai).",
    },
    {
      id: 4,
      word: "sister",
      emoji: "👧",
      phonetic: "/ˈsɪstər/",
      meaning: "chị/em gái",
      example: "My sister lives in Hanoi.",
      example2: "She is my younger sister.",
      collocation: "older sister / younger sister / big sister",
      audio: "/audio/unit-a0-6/sister.mp3",
      l1_interference_vn:
        "⚠️ 'Sister' không phân biệt chị/em gái. 'Older sister' (chị) vs 'younger sister' (em gái). Tiếng Việt có nhưng tiếng Anh không.",
    },
    {
      id: 5,
      word: "husband",
      emoji: "🤵",
      phonetic: "/ˈhʌzbənd/",
      meaning: "chồng",
      example: "My husband works in a bank.",
      example2: "Her husband is very kind.",
      collocation: "my husband / her husband / future husband",
      audio: "/audio/unit-a0-6/husband.mp3",
      l1_interference_vn:
        "⚠️ 'Husband' (đã kết hôn) vs 'boyfriend' (đang hẹn hò). KHÔNG nhầm. 'My husband' — KHÔNG 'my man' trong tiếng Anh chuẩn.",
    },
    {
      id: 6,
      word: "wife",
      emoji: "👰",
      phonetic: "/waɪf/",
      meaning: "vợ",
      example: "His wife is a nurse.",
      example2: "My wife is from Hue.",
      collocation: "my wife / his wife / wife and kids",
      audio: "/audio/unit-a0-6/wife.mp3",
      l1_interference_vn:
        "⚠️ Số nhiều bất quy tắc: wife → wives (không phải wifes). Tương tự: life/lives, knife/knives.",
    },
    {
      id: 7,
      word: "child",
      emoji: "🧒",
      phonetic: "/tʃaɪld/",
      meaning: "con (trẻ em)",
      example: "They have two children.",
      example2: "My child is five years old.",
      collocation: "my child / have children / only child",
      audio: "/audio/unit-a0-6/child.mp3",
      l1_interference_vn:
        "⚠️ Số nhiều bất quy tắc: child → children (không phải childs). 'Two children', not 'two childs'. Cực kỳ phổ biến.",
    },
    {
      id: 8,
      word: "only",
      emoji: "☝️",
      phonetic: "/ˈoʊnli/",
      meaning: "duy nhất, chỉ",
      example: "I am an only child.",
      example2: "She has only one sister.",
      collocation: "only child / only one / the only / only a little",
      audio: "/audio/unit-a0-6/only.mp3",
      l1_interference_vn:
        "⚠️ Vị trí 'only' ảnh hưởng nghĩa: 'Only I love her' vs 'I only love her' vs 'I love only her' — ba nghĩa khác nhau.",
    },
    {
      id: 9,
      word: "close",
      emoji: "🤝",
      phonetic: "/kloʊs/",
      meaning: "thân thiết, gần gũi",
      example: "My family is very close.",
      example2: "I am close to my sister.",
      collocation: "close family / very close / close friend",
      audio: "/audio/unit-a0-6/close.mp3",
      l1_interference_vn:
        "⚠️ 'Close' /kloʊs/ (adj=gần/thân) vs /kloʊz/ (v=đóng). Cùng viết, đọc khác. 'A close friend' vs 'Close the door'.",
    },
    {
      id: 10,
      word: "family",
      emoji: "👨‍👩‍👧‍👦",
      phonetic: "/ˈfæməli/",
      meaning: "gia đình",
      example: "My family is very close.",
      example2: "How many people are in your family?",
      collocation: "my family / family photo / close family / big family",
      audio: "/audio/unit-a0-6/family.mp3",
      l1_interference_vn:
        "⚠️ 'My family is/are well' — cả hai đúng. Family = tập thể, có thể dùng singular hoặc plural verb tùy vùng.",
    },
  ],

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "HE / SHE / THEY + BE — Đại từ ngôi 3",
    rule: "HE = nam giới (anh, chú, ông, bố...) / SHE = nữ giới / THEY = nhiều người",

    conjugation: [
      {
        subject: "HE",
        form: "IS",
        example: "He is my father. He is a doctor.",
      },
      {
        subject: "SHE",
        form: "IS",
        example: "She is my mother. She is a teacher.",
      },
      {
        subject: "THEY",
        form: "ARE",
        example: "They are my parents. They are kind.",
      },
    ],

    examples: [
      { en: "He is my older brother.", vn: "Anh ấy là anh trai tôi." },
      { en: "She is my younger sister.", vn: "Cô ấy là em gái tôi." },
      { en: "They are my parents.", vn: "Họ là bố mẹ tôi." },
      { en: "My family is very close.", vn: "Gia đình tôi rất thân thiết." },
    ],

    tip: "Khi nói về người thân: 'This is my mother. SHE is a teacher.' — dùng SHE thay vì lặp lại 'my mother'. Người bản ngữ luôn dùng HE/SHE sau lần giới thiệu đầu tiên.",

    vnNote:
      "⚠️ LỖI PHỔ BIẾN — Nhầm HE/SHE:\n\n" +
      "Tiếng Việt: 'anh ấy' (nam) vs 'cô ấy' (nữ) — có phân biệt\n" +
      "NHƯNG người Việt hay dùng 'nó' cho cả nam lẫn nữ\n\n" +
      "❌ SAI:  'My mother... he is a teacher.'\n" +
      "✅ ĐÚNG: 'My mother... SHE is a teacher.'\n\n" +
      "Mẹo: Trước khi nói, xác định giới tính → HE hay SHE?\n" +
      "Mother/Sister/Wife/Daughter → SHE\n" +
      "Father/Brother/Husband/Son → HE",

    dialogueExample: {
      speaker: "Minh",
      text: "This is my mother. She is a teacher. She is very kind.",
      translation: "Đây là mẹ tôi. Bà ấy là giáo viên. Bà ấy rất tốt bụng.",
      highlight: "She",
    },

    ccq: {
      question: "Câu nào ĐÚNG khi nói về mẹ bạn?",
      options: [
        "My mother... he is a teacher.",
        "My mother... it is a teacher.",
        "My mother... she is a teacher.",
        "My mother... they is a teacher.",
      ],
      answer: "My mother... she is a teacher.",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối thành viên gia đình với đại từ đúng",
    pairs: [
      { left: "mother", right: "she" },
      { left: "father", right: "he" },
      { left: "brother", right: "he" },
      { left: "sister", right: "she" },
      { left: "parents", right: "they" },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq6-1",
      question: "Điền đúng đại từ: 'This is my mother. ___ is a doctor.'",
      options: ["He", "She", "They", "It"],
      answer: "She",
      type: "multiple-choice",
    },
    {
      id: "pq6-2",
      question: "Điền từ: 'My ___ has two children.' (ý: chồng)",
      options: [],
      answer: "husband",
      type: "cloze",
    },
    {
      id: "pq6-3",
      question: "Câu nào ĐÚNG về bố bạn?",
      options: [
        "My father... she is a teacher.",
        "My father... he is a teacher.",
        "My father... they is a teacher.",
        "My father... it is a teacher.",
      ],
      answer: "My father... he is a teacher.",
      type: "multiple-choice",
    },
    {
      id: "pq6-4",
      question: "Điền từ: 'I am an ___ child — no brothers, no sisters.'",
      options: [],
      answer: "only",
      type: "cloze",
    },
  ],

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt6-1",
      prompt_vn: "Đây là bố tôi. Ông ấy là bác sĩ.",
      answer: "This is my father. He is a doctor.",
    },
    {
      id: "pt6-2",
      prompt_vn: "Gia đình tôi rất thân thiết. Chúng tôi có bốn người.",
      answer: "My family is very close. We have four people.",
    },
    {
      id: "pt6-3",
      prompt_vn: "Chị gái tôi đã kết hôn. Chồng cô ấy làm kỹ sư.",
      answer: "My sister is married. Her husband is an engineer.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A06-1",
      sentence: "He has three child.",
      errorWord: "child",
      correction: "children",
      explanation_vn:
        "'Child' số nhiều bất quy tắc: 'CHILDREN'. Không dùng 'childs'. Tương tự: man→men, woman→women.",
    },
    {
      id: "sc-A06-2",
      sentence: "She is my sister's.",
      errorWord: "sister's",
      correction: "sister",
      explanation_vn:
        "'She is my sister' — không thêm '\\'s\" vào đây. '\\'s\" chỉ dùng cho sở hữu cách: 'my sister\\'s bag'.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA06-1",
      audio_text: "She is my mother and he is my father.",
      prompt_vn: "Đây là mẹ tôi và đây là bố tôi.",
      words: [
        "She",
        "is",
        "my",
        "mother",
        "and",
        "he",
        "is",
        "my",
        "father",
        ".",
        "He is my mother",
        "They are",
      ],
      answer: "She is my mother and he is my father .",
    },
    {
      id: "laA06-2",
      audio_text: "My family has four people.",
      prompt_vn: "Gia đình tôi có bốn người.",
      words: ["My", "family", "has", "four", "people", ".", "have", "person"],
      answer: "My family has four people .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Đây là mẹ tôi. Bà ấy là giáo viên.",
      words: [
        "This",
        "is",
        "my",
        "mother.",
        "She",
        "is",
        "a",
        "teacher",
        ".",
        "are",
      ],
      answer: "This is my mother. She is a teacher .",
    },
    {
      id: "wb2",
      prompt_vn: "Họ là bố mẹ tôi. Họ rất thân thiết.",
      words: [
        "They",
        "are",
        "my",
        "parents.",
        "They",
        "are",
        "very",
        "close",
        ".",
        "is",
      ],
      answer: "They are my parents. They are very close .",
    },
    {
      id: "wb3",
      prompt_vn: "Tôi có một anh trai và một em gái.",
      words: [
        "I",
        "have",
        "one",
        "brother",
        "and",
        "one",
        "sister",
        ".",
        "is",
        "are",
      ],
      answer: "I have one brother and one sister .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s6-1",
      prompt_vn: "Đây là mẹ tôi. Bà ấy là giáo viên.",
      words: ["This", "is", "my", "mother.", "She", "is", "a", "teacher", "."],
      answer: "This is my mother. She is a teacher .",
    },
    {
      id: "s6-2",
      prompt_vn: "Họ là bố mẹ tôi. Họ rất thân thiết.",
      words: [
        "They",
        "are",
        "my",
        "parents.",
        "They",
        "are",
        "very",
        "close",
        ".",
      ],
      answer: "They are my parents. They are very close .",
    },
    {
      id: "s6-3",
      prompt_vn: "Tôi có một anh trai và một em gái.",
      words: ["I", "have", "one", "brother", "and", "one", "sister", "."],
      answer: "I have one brother and one sister .",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Kể về gia đình qua ảnh",
      audio: "/audio/unit-a0-6/dialogue_1.mp3",
      desc: "Sara thấy ảnh gia đình và hỏi Minh về từng người.",
      lines: [
        {
          id: "d6-1-1",
          speaker: "Sara",
          text: "Oh! Is this your family photo?",
          translation: "Ồ! Đây là ảnh gia đình bạn à?",
        },
        {
          id: "d6-1-2",
          speaker: "Minh",
          text: "Yes! This is my family. We are very close.",
          translation: "Đúng! Đây là gia đình tôi. Chúng tôi rất thân thiết.",
        },
        {
          id: "d6-1-3",
          speaker: "Sara",
          text: "Who is this?",
          translation: "Người này là ai?",
        },
        {
          id: "d6-1-4",
          speaker: "Minh",
          text: "This is my mother. She is a teacher. She is fifty years old.",
          translation:
            "Đây là mẹ tôi. Bà ấy là giáo viên. Bà ấy năm mươi tuổi.",
        },
        {
          id: "d6-1-5",
          speaker: "Sara",
          text: "And this man — is he your father?",
          translation: "Còn người đàn ông này — ông ấy có phải bố bạn không?",
        },
        {
          id: "d6-1-6",
          speaker: "Minh",
          text: "Yes! He is my father. He is a doctor. He and my mother are very close.",
          translation:
            "Đúng! Ông ấy là bố tôi. Ông ấy là bác sĩ. Ông ấy và mẹ tôi rất thân thiết.",
        },
        {
          id: "d6-1-7",
          speaker: "Sara",
          text: "Do you have brothers or sisters?",
          translation: "Bạn có anh chị em không?",
        },
        {
          id: "d6-1-8",
          speaker: "Minh",
          text: "Yes! I have one older brother and one younger sister. My brother is married — his wife is from Hue. And my sister is an only child... I mean, she is single!",
          translation:
            "Có! Tôi có một anh trai và một em gái. Anh tôi đã kết hôn — vợ anh ấy đến từ Huế. Và em gái tôi là... ý tôi là, em ấy còn độc thân!",
        },
      ],
    },
    {
      id: 2,
      title: "Ảnh gia đình của Sara",
      audio: "/audio/unit-a0-6/dialogue_2.mp3",
      desc: "Minh hỏi lại Sara về gia đình của cô ấy.",
      lines: [
        {
          id: "d6-2-1",
          speaker: "Minh",
          text: "How about you, Sara? Do you have a big family?",
          translation: "Còn bạn, Sara? Gia đình bạn có đông không?",
        },
        {
          id: "d6-2-2",
          speaker: "Sara",
          text: "Not very big. I have my father, my mother, and one sister.",
          translation: "Không đông lắm. Tôi có bố, mẹ, và một chị gái.",
        },
        {
          id: "d6-2-3",
          speaker: "Minh",
          text: "Is your sister married?",
          translation: "Chị bạn đã kết hôn chưa?",
        },
        {
          id: "d6-2-4",
          speaker: "Sara",
          text: "Yes! She is married. She and her husband have two children.",
          translation: "Rồi! Chị ấy đã kết hôn. Chị ấy và chồng có hai con.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac6-1",
      audio_text: "She is my mother she is a teacher",
      options: [
        "She is my mother she is a teacher",
        "He is my mother he is a teacher",
        "She is my sister she is a teacher",
        "She is my mother she is a doctor",
      ],
      answer: "She is my mother she is a teacher",
    },
    {
      id: "lac6-2",
      audio_text: "They are my parents they are very close",
      options: [
        "They are my parents they are very close",
        "They are my family they are very close",
        "They is my parents they are very close",
        "They are my parents they are very kind",
      ],
      answer: "They are my parents they are very close",
    },
    {
      id: "lac6-3",
      audio_text: "I have one older brother",
      options: [
        "I have one older brother",
        "I have one younger brother",
        "I have one older sister",
        "I had one older brother",
      ],
      answer: "I have one older brother",
    },
    {
      id: "lac6-4",
      audio_text: "My sister is married her husband is a doctor",
      options: [
        "Chị tôi đã kết hôn, chồng cô ấy là bác sĩ",
        "Chị tôi đã kết hôn, chồng cô ấy là giáo viên",
        "Em tôi đã kết hôn, chồng cô ấy là bác sĩ",
        "Chị tôi độc thân, bạn trai cô ấy là bác sĩ",
      ],
      answer: "Chị tôi đã kết hôn, chồng cô ấy là bác sĩ",
    },
    {
      id: "lac6-5",
      audio_text: "My family is very close we have four people",
      options: [
        "Gia đình tôi rất thân thiết, chúng tôi có bốn người",
        "Gia đình tôi rất thân thiết, chúng tôi có ba người",
        "Gia đình tôi rất hạnh phúc, chúng tôi có bốn người",
        "Gia đình bạn rất thân thiết, chúng tôi có bốn người",
      ],
      answer: "Gia đình tôi rất thân thiết, chúng tôi có bốn người",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "crA06-1",
      question: "Nghề 'bác sĩ' trong tiếng Anh là gì? (unitA05 - Nghề nghiệp)",
      options: ["Teacher", "Doctor", "Student", "Engineer"],
      answer: "Doctor",
      type: "multiple-choice",
    },
    {
      id: "crA06-2",
      question:
        "Nghề 'giáo viên' trong tiếng Anh là gì? (unitA05 - Nghề nghiệp)",
      options: ["Doctor", "Nurse", "Teacher", "Student"],
      answer: "Teacher",
      type: "multiple-choice",
    },
    {
      id: "crA06-3",
      question: "Dịch sang tiếng Anh: 'Tôi làm việc tại đây' (unitA05)",
      options: [],
      answer: "I work here",
      type: "translate",
    },
    {
      id: "crA06-4",
      question: "Dịch sang tiếng Anh: 'Ông ấy là bác sĩ' (unitA05)",
      options: [],
      answer: "He is a doctor",
      type: "translate",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/ʌ/ vs /ɑː/",
    description: "Phân biệt CUP /ʌ/ và CAR /ɑː/",
    examples: [
      { word: "sun", ipa: "/sʌn/", tip: "Ngắn, miệng nửa mở, không tròn môi" },
      {
        word: "father",
        ipa: "/ˈfɑːðə/",
        tip: "Dài, miệng mở rộng nhất, hàm xuống thấp",
      },
    ],
    minimalPairs: [["cup /ʌ/", "carp /ɑː/"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nhanh: Kể về gia đình",
    items: [
      { en: "This is my mother.", vn: "Đây là mẹ tôi." },
      { en: "She is a teacher.", vn: "Bà ấy là giáo viên." },
      { en: "This is my father.", vn: "Đây là bố tôi." },
      { en: "He is a doctor.", vn: "Ông ấy là bác sĩ." },
      { en: "They are my parents.", vn: "Họ là bố mẹ tôi." },
      { en: "My family is very close.", vn: "Gia đình tôi rất thân thiết." },
      { en: "I have one brother.", vn: "Tôi có một anh/em trai." },
      { en: "She is married.", vn: "Cô ấy đã kết hôn." },
    ],
  },

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "This is my {input}. He/She is a...",
    level1Placeholder: "Nhập quan hệ (mother, father, brother, sister)...",
    level2Situation:
      "Giới thiệu gia đình bạn. Nói về ít nhất 3 người: tên quan hệ + đại từ HE/SHE + nghề nghiệp hoặc thông tin thêm.",
    level2Hint:
      "This is my [relation]. He/She is [job/description]. My family is [adjective].",
  },

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q6-1",
      question: "Điền đúng: 'My mother is a nurse. ___ is very kind.'",
      options: ["He", "She", "They", "It"],
      answer: "She",
      type: "multiple-choice",
    },
    {
      id: "q6-2",
      question:
        "Điền từ: 'My ___ is married. Her husband is a teacher.' (chị gái)",
      options: [],
      answer: "sister",
      type: "cloze",
    },
    {
      id: "q6-3",
      question: "Câu nào ĐÚNG?",
      options: [
        "My father... she is a doctor.",
        "My father... he is a doctor.",
        "My father... they is a doctor.",
        "My father... it is a doctor.",
      ],
      answer: "My father... he is a doctor.",
      type: "multiple-choice",
    },
    {
      id: "q6-4",
      question: "Điền từ: 'They ___ my parents.'",
      options: [],
      answer: "are",
      type: "cloze",
    },
    {
      id: "q6-5",
      question: "Đây là mẹ tôi. Bà ấy là giáo viên. (Dịch)",
      options: [],
      answer: "This is my mother. She is a teacher.",
      type: "translate",
    },
    {
      id: "q6-6",
      question:
        "Gia đình tôi rất thân thiết. Tôi có một anh trai và một em gái. (Dịch)",
      options: [],
      answer: "My family is very close. I have one brother and one sister.",
      type: "translate",
    },
    {
      id: "q6-7",
      question: "Chị ấy đã kết hôn. Chồng cô ấy là bác sĩ. (Dịch)",
      options: [],
      answer: "She is married. Her husband is a doctor.",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA06-reading-1",
    title: "My Family",
    title_vn: "Đọc đoạn giới thiệu gia đình",
    level: "A0" as const,
    text:
      "This is my family. " +
      "My father is 50 years old. He is a doctor. " +
      "My mother is 48 years old. She is a teacher. " +
      "I have one brother. His name is Long. " +
      "I have one sister. Her name is Mai. " +
      "I love my family!",
    questions: [
      {
        id: "uA06r-q1",
        question_vn: "Bố làm nghề gì?",
        options: ["Teacher", "Engineer", "Doctor", "Police"],
        answer: "Doctor",
        explanation_vn: "'He is a doctor.'",
      },
      {
        id: "uA06r-q2",
        question_vn: "Mẹ bao nhiêu tuổi?",
        options: ["45", "46", "48", "50"],
        answer: "48",
        explanation_vn: "'My mother is 48 years old.'",
      },
      {
        id: "uA06r-q3",
        question_vn: "Tên của người anh/em trai là gì?",
        options: ["Nam", "Minh", "Long", "Hùng"],
        answer: "Long",
        explanation_vn: "'His name is Long.'",
      },
      {
        id: "uA06r-q4",
        question_vn: "Tên của người chị/em gái là gì?",
        options: ["Lan", "Mai", "Hoa", "Thu"],
        answer: "Mai",
        explanation_vn: "'Her name is Mai.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "XeZbFQUoHq8", // BBC Learning English — Family vocabulary
  jobScenarios: [
    {
      id: 1,
      title: "Viết email đơn giản apply việc entry level",
      focus: "Email structure: subject, greeting, introduce, attach CV, close",
      context: "Gửi CV cho vị trí receptionist hoặc assistant",
      l1Note:
        "⚠️ Subject clear. 'Dear Hiring Manager,' 'Please find my CV attached.' 'Thank you for your time.'",
      example:
        "Subject: Application for Receptionist Position. Dear Sir/Madam, I am writing to apply... Please see attached CV.",
    },
  ],
};
