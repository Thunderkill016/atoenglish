import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-A0-1 — Bảng Chữ Cái & Âm Cơ Bản  (A0)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UNIT A0-1 — Bảng Chữ Cái & Âm Cơ Bản (The Alphabet & Basic Sounds)
// Level 0 / Foundation — Pre-CEFR A0  [FIRST UNIT — Entry Point]
//
// ✅ CELTA:          Dialogue introduces language FIRST, grammar explained after
// ✅ Ellis (2005):   Explicit L1 grammar explanation for adult learners
// ✅ Lewis (1993):   Chunks taught, not isolated words
// ✅ Nation (2007):  4 Strands — Input / Output / Language Focus / Fluency
// ✅ i+1:            All 10 vocab words used in dialogue, 0 unknown words
//
// Grammar:  Verb BE — "My name IS..." / "I AM..."
// L1 Alert: Be-deletion ("My name Minh" ❌) — #1 Vietnamese learner error
// Phonics:  /θ/ in "thank" — most common VN pronunciation error
// ─────────────────────────────────────────────────────────────────────────────

export const unitA01: UnitData = {
  unitId: "unit-a0-1",
  title: "Unit A0-1: Bảng Chữ Cái & Âm Cơ Bản",
  level: "A0",
  xp: 60,
  estimatedTime: 40,
  description:
    "Học cách giới thiệu bản thân và đánh vần tên — kỹ năng đầu tiên và thiết yếu nhất khi giao tiếp bằng tiếng Anh.",
  badgeName: "Người Khám Phá",
  badgeEmoji: "🔤",

  // ── CONTEXT: Real situation to create need-to-learn ───────────────────────

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Bạn đến một công ty nước ngoài để nộp hồ sơ. Nhân viên lễ tân nhìn lên và hỏi: \"Can you spell your name, please?\" Bạn cần biết cách phát âm từng chữ cái tiếng Anh để đánh vần tên mình.",

  learningOutcomes: [
    "Đọc đúng 26 chữ cái tiếng Anh (A → Z) theo cách phát âm gần với tiếng Việt",
    "Đánh vần tên Việt của mình cho người nước ngoài nghe",
    "Giới thiệu bản thân bằng câu chuẩn: My name IS... / I AM from...",
  ],


  // ── HOOK (cultural): pragmatic note
  culturalNote:
    '<strong class="text-emerald-400">Bảng 26 chữ cái tiếng Anh</strong> — cách đọc gần với tiếng Việt:<br/><br/>' +
    '<span class="font-mono text-sm leading-loose">' +
    'A <span class="text-zinc-400">(ây)</span> · B <span class="text-zinc-400">(bi)</span> · C <span class="text-zinc-400">(xi)</span> · D <span class="text-zinc-400">(đi)</span> · E <span class="text-zinc-400">(i)</span> · F <span class="text-zinc-400">(ép-phờ)</span> · G <span class="text-zinc-400">(gi)</span> · H <span class="text-zinc-400">(ây-chờ)</span>' +
    ' · I <span class="text-zinc-400">(ai)</span> · J <span class="text-zinc-400">(giây)</span> · K <span class="text-zinc-400">(kây)</span> · L <span class="text-zinc-400">(eo)</span> · M <span class="text-zinc-400">(em)</span> · N <span class="text-zinc-400">(en)</span>' +
    ' · O <span class="text-zinc-400">(âu)</span> · P <span class="text-zinc-400">(pi)</span> · Q <span class="text-zinc-400">(kiu)</span> · R <span class="text-zinc-400">(a-rờ)</span> · S <span class="text-zinc-400">(ét)</span> · T <span class="text-zinc-400">(ti)</span>' +
    ' · U <span class="text-zinc-400">(iu)</span> · V <span class="text-zinc-400">(vi)</span> · W <span class="text-zinc-400">(đáp-bờ-liu)</span> · X <span class="text-zinc-400">(ét-xờ)</span> · Y <span class="text-zinc-400">(oai)</span> · Z <span class="text-zinc-400">(zi/zét)</span>' +
    '</span><br/><br/>' +
    '💡 <span class="text-emerald-400 font-semibold">Mẹo đánh vần tên Việt:</span> Người nước ngoài hay hỏi <span class="text-emerald-400">"How do you spell that?"</span> khi nghe tên lạ. Tên như Nguyễn, Phạm, Trần thường cần đánh vần chậm, rõ từng chữ.',


  // ── WARMUP: 3 cards to activate prior knowledge ───────────────────────────

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "👋",
      en: "Hello! My name is Minh.",
      vn: "Xin chào! Tên tôi là Minh.",
      context: "Câu giới thiệu đầu tiên",
    },
    {
      emoji: "❓",
      en: "Can you spell your name, please?",
      vn: "Bạn có thể đánh vần tên không?",
      context: "Câu hỏi bạn sẽ nghe ở công ty nước ngoài",
    },
    {
      emoji: "🔤",
      en: "M-I-N-H. Nice to meet you!",
      vn: "M-I-N-H. Rất vui được gặp bạn!",
      context: "Trả lời và kết thúc lịch sự",
    },
  ],

  // ── VOCABULARY: 10 chunks — all appear in dialogue ────────────────────────
  // ✅ Lewis Lexical Approach: teach CHUNKS not isolated words
  // ✅ All 10 words used in dialogue (i+1 principle)

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "hello",
      l1_interference_vn: "⚠️ \'Hello\' phát âm /həˈloʊ/ — nhấn âm thứ 2 \'LO\'. Không phát đều: \'HEL-lo\' (sai nhấn).",
      emoji: "👋",
      phonetic: "/həˈloʊ/",
      meaning: "xin chào",
      example: "Hello! Nice to meet you.",
      example2: "Hello, my name is Linh.",
      collocation: "say hello / hello everyone / hello there",
      audio: "/audio/unit-a0-1/hello.mp3",
    },
    {
      id: 2,
      word: "name",
      l1_interference_vn: "⚠️ \'My name IS Lan\' — KHÔNG bỏ \'is\': \'My name Lan\' là lỗi #1 của người Việt học tiếng Anh.",
      emoji: "🏷️",
      phonetic: "/neɪm/",
      meaning: "tên",
      example: "My name is Minh.",
      example2: "What is your name?",
      collocation: "my name is / first name / last name / full name",
      audio: "/audio/unit-a0-1/name.mp3",
    },
    {
      id: 3,
      word: "spell",
      l1_interference_vn: "⚠️ \'Spell\' = đánh vần từng chữ cái. \'How do you spell that?\' — không nhầm với \'say\'.",
      emoji: "🔤",
      phonetic: "/spel/",
      meaning: "đánh vần",
      example: "Can you spell your name?",
      example2: "How do you spell 'Nguyen'?",
      collocation: "spell your name / spell it out / how do you spell",
      audio: "/audio/unit-a0-1/spell.mp3",
    },
    {
      id: 4,
      word: "letter",
      emoji: "📝",
      phonetic: "/ˈletər/",
      meaning: "chữ cái",
      example: "The letter A is the first letter.",
      example2: "Spell it letter by letter.",
      collocation: "capital letter / small letter / the letter A",
      audio: "/audio/unit-a0-1/letter.mp3",
      l1_interference_vn: "⚠️ 'Letter' = chữ cái (A,B,C) HOẶC thư. 'Write a letter' = viết thư. Phân biệt qua ngữ cảnh.",
    },
    {
      id: 5,
      word: "please",
      emoji: "🙏",
      phonetic: "/pliːz/",
      meaning: "làm ơn",
      example: "Can you spell that, please?",
      example2: "Please say it again.",
      collocation: "yes please / please help / can you ... please",
      audio: "/audio/unit-a0-1/please.mp3",
    },
    {
      id: 6,
      word: "thank",
      l1_interference_vn: "⚠️ \'Thank\' bắt đầu bằng /θ/ — lưỡi phải ra ngoài hàng răng. KHÔNG phát \'tank\' hay \'fank\'.",
      emoji: "🙌",
      phonetic: "/θæŋk/",
      meaning: "cảm ơn",
      // ⚠️ /θ/ — most common Vietnamese pronunciation error
      example: "Thank you very much!",
      example2: "Thanks for your help.",
      collocation: "thank you / many thanks / thanks a lot",
      audio: "/audio/unit-a0-1/thank.mp3",
    },
    {
      id: 7,
      word: "nice",
      emoji: "😊",
      phonetic: "/naɪs/",
      meaning: "tuyệt / dễ chịu",
      example: "Nice to meet you!",
      example2: "It's nice to see you.",
      collocation: "nice to meet you / how nice / nice day",
      audio: "/audio/unit-a0-1/nice.mp3",
      l1_interference_vn: "⚠️ 'Nice to meet you' (gặp lần đầu). 'Nice' = pleasant. KHÔNG nhầm với 'good' — 'nice' thường nói về trải nghiệm/cảm giác.",
    },
    {
      id: 8,
      word: "meet",
      emoji: "🤝",
      phonetic: "/miːt/",
      meaning: "gặp",
      example: "Nice to meet you!",
      example2: "I want to meet your family.",
      collocation: "nice to meet you / meet someone / meet again",
      audio: "/audio/unit-a0-1/meet.mp3",
      l1_interference_vn: "⚠️ 'Meet' (lần đầu gặp) vs 'see' (gặp người đã biết). 'Nice to meet you' (lần đầu) vs 'Great to see you again!'",
    },
    {
      id: 9,
      word: "again",
      emoji: "🔁",
      phonetic: "/əˈɡen/",
      meaning: "lại / một lần nữa",
      example: "Can you say that again, please?",
      example2: "Nice to see you again.",
      collocation: "say again / try again / once again / see you again",
      audio: "/audio/unit-a0-1/again.mp3",
      l1_interference_vn: "⚠️ 'Again' đứng cuối câu: 'Say that again, please.' KHÔNG 'Again say that.' Phó từ luôn đặt sau động từ.",
    },
    {
      id: 10,
      word: "understand",
      emoji: "💡",
      phonetic: "/ˌʌndəˈstænd/",
      meaning: "hiểu",
      example: "I don't understand. Can you say that again?",
      example2: "Do you understand?",
      collocation: "I understand / I don't understand / do you understand",
      audio: "/audio/unit-a0-1/understand.mp3",
      l1_interference_vn: "⚠️ 'I understand' (không tiến hành từ đang xảy ra). KHÔNG 'I'm understanding' — stative verb không dùng continuous.",
    },
  ],

  // ── GRAMMAR: Verb BE — Meaning → Form → Pronunciation (CELTA order) ───────
  // ✅ Ellis: explicit instruction with L1 contrast for adult learners

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Verb BE — \"My name IS...\" (Câu giới thiệu đầu tiên)",
    rule: "Tiếng Anh BẮT BUỘC phải có động từ. Câu đơn giản nhất: My name IS [tên].",

    conjugation: [
      { subject: "I",        form: "am",  example: "I am Minh." },
      { subject: "My name",  form: "is",  example: "My name is Minh." },
      { subject: "Nice to",  form: "meet you", example: "Nice to meet you!" },
    ],

    examples: [
      { en: "My name is Linh.",       vn: "Tên tôi là Linh." },
      { en: "I am from Vietnam.",     vn: "Tôi đến từ Việt Nam." },
      { en: "Nice to meet you!",      vn: "Rất vui được gặp bạn!" },
      { en: "I don't understand.",    vn: "Tôi không hiểu." },
    ],

    tip: "Mẹo nhớ nhanh: Mỗi câu tiếng Anh cần ít nhất 1 động từ. IS và AM là 2 động từ nhỏ nhất — nhưng BẮT BUỘC phải có.\n\n" +
      "📌 I AM = I'M (rút gọn): 'I am Minh.' và 'I'm Minh.' đều ĐÚNG — dạng rút gọn nghe tự nhiên hơn trong giao tiếp hàng ngày.\n" +
      "📌 Tương tự: 'I am from Vietnam.' = 'I'm from Vietnam.' — nghĩa y hệt, chỉ khác cách viết.",

    // ✅ Ellis: Adult learners need explicit L1 contrast
    vnNote:
      "⚠️ LỖI PHỔ BIẾN NHẤT của người Việt: Bỏ qua động từ IS!\n\n" +
      "Tiếng Việt: 'Tên tôi [không có gì] Minh.' — hoàn toàn đúng!\n" +
      "Tiếng Anh: 'My name [IS] Minh.' — BẮT BUỘC phải có IS!\n\n" +
      "❌ SAI:  'My name Minh.' → Người bản ngữ không hiểu!\n" +
      "❌ SAI:  'I Minh.' → Sai ngữ pháp hoàn toàn!\n" +
      "✅ ĐÚNG: 'My name IS Minh.' / 'I AM Minh.'\n\n" +
      "⚠️ PHÁT ÂM: 'thank' → /θæŋk/ — lưỡi kẹp GIỮA 2 hàng răng, thổi hơi ra.\n" +
      "KHÔNG phải /tæŋk/ (âm /t/) hay /sæŋk/ (âm /s/)!",

    dialogueExample: {
      speaker: "Minh",
      text: "My name IS Minh. M-I-N-H. Nice to meet you!",
      translation: "Tên tôi là Minh. M-I-N-H. Rất vui được gặp bạn!",
      highlight: "is",
    },

    ccq: {
      question: "Câu nào ĐÚNG ngữ pháp tiếng Anh?",
      options: [
        "My name Minh.",
        "Name is Minh my.",
        "My name is Minh.",
        "I name is Minh.",
      ],
      answer: "My name is Minh.",
    },
  },

  // ── MATCHING: Chunks-based, not letter-matching ───────────────────────────

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối cụm từ với nghĩa tiếng Việt",
    pairs: [
      { left: "Nice to meet you",       right: "Rất vui được gặp bạn" },
      { left: "Can you spell that?",    right: "Bạn có thể đánh vần không?" },
      { left: "I don't understand",     right: "Tôi không hiểu" },
      { left: "Say it again, please",   right: "Nói lại, làm ơn" },
      { left: "My name is...",          right: "Tên tôi là..." },
    ],
  },

  // ── PRACTICE QUIZ: Controlled accuracy practice ───────────────────────────

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1-1",
      question: "Câu nào ĐÚNG ngữ pháp?",
      options: [
        "My name Minh.",
        "My name is Minh.",
        "I name is Minh.",
        "Name Minh.",
      ],
      answer: "My name is Minh.",
      type: "multiple-choice",
    },
    {
      id: "pq1-2",
      question: "Điền từ còn thiếu: 'My name ___ Linh.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "pq1-3",
      question: "\"I don't understand\" có nghĩa là gì?",
      options: [
        "Tôi không thích",
        "Tôi không hiểu",
        "Tôi không biết tên bạn",
        "Tôi không nghe thấy",
      ],
      answer: "Tôi không hiểu",
      type: "multiple-choice",
    },
    {
      id: "pq1-4",
      question: "Điền từ còn thiếu: 'I ___ from Vietnam.'",
      options: [],
      answer: "am",
      type: "cloze",
    },
  ],

  // ── PRACTICE TRANSLATE: Recall tasks (harder than recognition) ────────────
  // ✅ Ellis: Output forces learners to process language more precisely

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt1-1",
      prompt_vn: "Tên tôi là Minh.",
      answer: "My name is Minh.",
    },
    {
      id: "pt1-2",
      prompt_vn: "Rất vui được gặp bạn.",
      answer: "Nice to meet you.",
    },
    {
      id: "pt1-3",
      prompt_vn: "Bạn có thể nói lại không, làm ơn?",
      answer: "Can you say that again, please?",
    },
  ],

  // ── SCRAMBLE: Sentence building with target chunks ─────────────────────────

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc-A01-1",
      sentence: "My name are Lan.",
      errorWord: "are",
      correction: "is",
      explanation_vn: "'Name' là danh từ số ít → 'My name IS Lan'. 'Are' dùng cho số nhiều hoặc you/we/they.",
    },
    {
      id: "sc-A01-2",
      sentence: "I have eight years old.",
      errorWord: "have",
      correction: "am",
      explanation_vn: "Nói tuổi bằng 'to be': 'I AM eight years old'. Không dùng 'have' cho tuổi trong tiếng Anh.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "laA01-1",
      audio_text: "My name is Lan and I am from Hanoi.",
      prompt_vn: "Tên tôi là Lan và tôi đến từ Hà Nội.",
      words: ["My", "name", "is", "Lan", "and", "I", "am", "from", "Hanoi", ".", "are", "be"],
      answer: "My name is Lan and I am from Hanoi .",
    },
    {
      id: "laA01-2",
      audio_text: "Nice to meet you my name is Nam.",
      prompt_vn: "Rất vui được gặp bạn tên tôi là Nam.",
      words: ["Nice", "to", "meet", "you", "my", "name", "is", "Nam", ".", "are", "Nice meeting"],
      answer: "Nice to meet you my name is Nam .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tên tôi là Alex.",
      words: ["My", "name", "is", "Alex", ".", "are"],
      answer: "My name is Alex .",
    },
    {
      id: "wb2",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", ".", "is", "are"],
      answer: "I am from Vietnam .",
    },
    {
      id: "wb3",
      prompt_vn: "Bạn có thể đánh vần tên không?",
      words: ["Can", "you", "spell", "your", "name", "?", "is", "are"],
      answer: "Can you spell your name ?",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s1-1",
      prompt_vn: "Tên tôi là Alex.",
      words: ["My", "name", "is", "Alex", "."],
      answer: "My name is Alex .",
    },
    {
      id: "s1-2",
      prompt_vn: "Tôi đến từ Việt Nam.",
      words: ["I", "am", "from", "Vietnam", "."],
      answer: "I am from Vietnam .",
    },
    {
      id: "s1-3",
      prompt_vn: "Bạn có thể đánh vần tên không?",
      words: ["Can", "you", "spell", "your", "name", "?"],
      answer: "Can you spell your name ?",
    },
  ],

  // ── DIALOGUE: Context-rich — ALL 10 vocab words appear ───────────────────
  // ✅ CELTA: Language presented IN CONTEXT (dialogue before grammar isolated)
  // ✅ i+1: 100% of words are from vocab list — zero unknown words

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Đăng ký tại công ty nước ngoài",
      audio: "/audio/unit-a0-1/dialogue_1.mp3",
      desc: "Minh đến nộp hồ sơ xin việc. Nhân viên lễ tân hỏi tên và yêu cầu đánh vần.",
      lines: [
        {
          id: "d1-1-1",
          speaker: "Staff",
          text: "Hello! Good morning.",
          translation: "Xin chào! Chào buổi sáng.",
          // vocab: hello
        },
        {
          id: "d1-1-2",
          speaker: "Minh",
          text: "Hello! Good morning.",
          translation: "Xin chào! Chào buổi sáng.",
          // vocab: hello (recycled)
        },
        {
          id: "d1-1-3",
          speaker: "Staff",
          text: "What is your name, please?",
          translation: "Tên bạn là gì, làm ơn?",
          // vocab: name, please
        },
        {
          id: "d1-1-4",
          speaker: "Minh",
          text: "My name is Minh.",
          translation: "Tên tôi là Minh.",
          // vocab: name (grammar: IS)
        },
        {
          id: "d1-1-5",
          speaker: "Staff",
          text: "Can you spell that, please?",
          translation: "Bạn có thể đánh vần không, làm ơn?",
          // vocab: spell, please
        },
        {
          id: "d1-1-6",
          speaker: "Minh",
          text: "Yes! M — I — N — H. Each letter: M, I, N, H.",
          translation: "Vâng! M — I — N — H. Từng chữ cái: M, I, N, H.",
          // vocab: letter
        },
        {
          id: "d1-1-7",
          speaker: "Staff",
          text: "Thank you, Minh! Nice to meet you.",
          translation: "Cảm ơn, Minh! Rất vui được gặp bạn.",
          // vocab: thank, nice, meet
        },
        {
          id: "d1-1-8",
          speaker: "Minh",
          text: "Nice to meet you too! Sorry — I don't understand fast speech. Can you say that again, please?",
          translation:
            "Tôi cũng rất vui được gặp bạn! Xin lỗi — tôi không hiểu tiếng nhanh. Bạn có thể nói lại không?",
          // vocab: understand, again, please
        },
        {
          id: "d1-1-9",
          speaker: "Staff",
          text: "Of course! No problem at all.",
          translation: "Dĩ nhiên rồi! Không sao cả.",
        },
      ],
    },
    {
      id: 2,
      title: "Gặp bạn mới tại lớp học",
      audio: "/audio/unit-a0-1/dialogue_2.mp3",
      desc: "Sara và Linh gặp nhau lần đầu tại lớp tiếng Anh.",
      lines: [
        {
          id: "d1-2-1",
          speaker: "Sara",
          text: "Hello! My name is Sara. Nice to meet you.",
          translation: "Xin chào! Tên tôi là Sara. Rất vui được gặp bạn.",
        },
        {
          id: "d1-2-2",
          speaker: "Linh",
          text: "Hello Sara! I am Linh. Nice to meet you too!",
          translation: "Xin chào Sara! Tôi là Linh. Tôi cũng rất vui được gặp bạn!",
        },
        {
          id: "d1-2-3",
          speaker: "Sara",
          text: "How do you spell 'Linh', please?",
          translation: "Bạn đánh vần 'Linh' như thế nào, làm ơn?",
        },
        {
          id: "d1-2-4",
          speaker: "Linh",
          text: "L-I-N-H. Each letter: L, I, N, H.",
          translation: "L-I-N-H. Từng chữ cái: L, I, N, H.",
        },
        {
          id: "d1-2-5",
          speaker: "Sara",
          text: "Thank you! Sorry — I don't understand Vietnamese names. Can you say it again?",
          translation: "Cảm ơn! Xin lỗi — tôi không hiểu tên tiếng Việt. Bạn có thể nói lại không?",
        },
        {
          id: "d1-2-6",
          speaker: "Linh",
          text: "No problem! L-I-N-H. Linh.",
          translation: "Không sao! L-I-N-H. Linh.",
        },
      ],
    },
  ],

  // ── LISTEN & CHOOSE: Discrimination practice ──────────────────────────────

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1-1",
      audio_text: "My name is Minh",
      options: ["My name Minh", "My name is Minh", "I name is Minh", "Name is Minh"],
      answer: "My name is Minh",
    },
    {
      id: "lac1-2",
      audio_text: "Nice to meet you",
      options: ["Nice to meet you", "Nice to see you", "Nice to know you", "Good to meet you"],
      answer: "Nice to meet you",
    },
    {
      id: "lac1-3",
      audio_text: "Can you say that again please",
      options: [
        "Can you say that again please",
        "Can you spell that again please",
        "Can you say it now please",
        "Can you write that again please",
      ],
      answer: "Can you say that again please",
    },
    {
      id: "lac1-4",
      audio_text: "I am from Vietnam",
      options: ["Tôi đến từ Việt Nam", "Tôi đến từ Nhật Bản", "Tôi đến từ Hàn Quốc", "Tôi đến từ Thái Lan"],
      answer: "Tôi đến từ Việt Nam",
    },
    {
      id: "lac1-5",
      audio_text: "I don't understand please say again",
      options: ["Tôi không hiểu, làm ơn nói lại", "Tôi không thích, làm ơn nói lại", "Tôi không nghe thấy, làm ơn nói lại", "Tôi không biết, làm ơn hỏi lại"],
      answer: "Tôi không hiểu, làm ơn nói lại",
    },
  ],

  // ── SHADOWING: Fluency drill — key chunks from dialogue ──────────────────
  // ✅ Nation: Fluency strand — speed and automaticity
  // ✅ Pronunciation focus: /θ/, final /t/, /iː/ vowels

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/θ/",
    description: "Âm TH vô thanh — lưỡi nhô ra",
    examples: [
      { word: "thank", ipa: "/θæŋk/", tip: "Lưỡi ra ngoài hàng răng, thổi hơi — KHÔNG phát 't' hay 'f'" },
    ],
    minimalPairs: [
      ["thank", "tank"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    title: "Luyện nói nhanh — 7 câu chủ chốt",
    items: [
      {
        en: "Hello!",
        vn: "Xin chào!",
        // Easy — build confidence first
      },
      {
        en: "My name is Minh.",
        vn: "Tên tôi là Minh.",
        // Grammar target: IS
      },
      {
        en: "Nice to meet you!",
        vn: "Rất vui được gặp bạn!",
        // Fixed chunk — learn as one unit
      },
      {
        en: "Can you spell that, please?",
        vn: "Bạn có thể đánh vần không?",
        // /θ/ in "that" — pronunciation focus
      },
      {
        en: "Thank you very much!",
        vn: "Cảm ơn rất nhiều!",
        // /θ/ in "thank" — most important pronunciation target
      },
      {
        en: "I don't understand.",
        vn: "Tôi không hiểu.",
        // Survival phrase
      },
      {
        en: "Can you say that again, please?",
        vn: "Bạn có thể nói lại không?",
        // Full survival sentence
      },
    ],
  },

  // ── SPEAKING: Free production tasks ───────────────────────────────────────

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "My name is {input}. Nice to meet you!",
    level1Placeholder: "Nhập tên của bạn...",
    level2Situation:
      "Bạn đang gặp đồng nghiệp nước ngoài lần đầu. Hãy giới thiệu tên, đánh vần tên cho họ, và nói 'Nice to meet you!'",
    level2Hint:
      "Hello! My name is [tên]. That's [chữ cái]-[chữ cái]-... Nice to meet you!",
  },

  // ── QUIZ: Mixed types — MCQ + Cloze + Translate (7 items) ────────────────
  // ✅ Spaced retrieval: immediate testing within lesson
  // ✅ Wrong words → FSRS schedules for later review

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "q1-1",
      question: "Câu nào ĐÚNG ngữ pháp tiếng Anh?",
      options: [
        "My name Linh.",
        "My name is Linh.",
        "I name is Linh.",
        "Name Linh is.",
      ],
      answer: "My name is Linh.",
      type: "multiple-choice",
    },
    {
      id: "q1-2",
      question: "Điền từ còn thiếu: 'My name ___ Minh.'",
      options: [],
      answer: "is",
      type: "cloze",
    },
    {
      id: "q1-3",
      question: "Âm /θ/ trong từ 'thank' được phát âm như thế nào?",
      options: [
        "Giống /t/ trong 'time' — đặt lưỡi sau răng",
        "Giống /s/ trong 'sun' — không di chuyển lưỡi",
        "Lưỡi GIỮA 2 hàng răng, thổi hơi ra ngoài",
        "Im lặng, không phát âm",
      ],
      answer: "Lưỡi GIỮA 2 hàng răng, thổi hơi ra ngoài",
      type: "multiple-choice",
    },
    {
      id: "q1-4",
      question: "Điền từ còn thiếu: 'I ___ from Vietnam.'",
      options: [],
      answer: "am",
      type: "cloze",
    },
    {
      id: "q1-5",
      question: "\"I don't understand\" — khi nào bạn nói câu này?",
      options: [
        "Khi bạn không thích điều gì đó",
        "Khi bạn không nghe thấy gì",
        "Khi bạn không hiểu điều vừa nghe",
        "Khi bạn muốn dừng lại",
      ],
      answer: "Khi bạn không hiểu điều vừa nghe",
      type: "multiple-choice",
    },
    {
      id: "q1-6",
      question: "Rất vui được gặp bạn! (Dịch sang tiếng Anh)",
      options: [],
      answer: "Nice to meet you!",
      type: "translate",
    },
    {
      id: "q1-7",
      question:
        "Tên tôi là Hùng. H-U-N-G. Rất vui được gặp bạn! (Dịch sang tiếng Anh)",
      options: [],
      answer: "My name is Hung. H-U-N-G. Nice to meet you!",
      type: "translate",
    },
  ],

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unitA01-reading-1",
    title: "My Name",
    title_vn: "Đọc đoạn giới thiệu bản thân",
    level: "A0" as const,
    text:
      "Hello! My name is Nam. " +
      "I am from Vietnam. " +
      "My name has 3 letters: N-A-M. " +
      "My teacher's name is Mary. " +
      "Mary is from England. " +
      "Her name has 4 letters: M-A-R-Y. " +
      "Nice to meet you!",
    questions: [
      {
        id: "uA01r-q1",
        question_vn: "Tên của người kể chuyện là gì?",
        options: ["Mary", "Nam", "Lan", "Tom"],
        answer: "Nam",
        explanation_vn: "'My name is Nam.'",
      },
      {
        id: "uA01r-q2",
        question_vn: "Người kể chuyện đến từ đâu?",
        options: ["England", "Japan", "Vietnam", "America"],
        answer: "Vietnam",
        explanation_vn: "'I am from Vietnam.'",
      },
      {
        id: "uA01r-q3",
        question_vn: "Tên của giáo viên là gì?",
        options: ["Nam", "Linda", "Mary", "Anna"],
        answer: "Mary",
        explanation_vn: "'My teacher's name is Mary.'",
      },
      {
        id: "uA01r-q4",
        question_vn: "Tên Mary có bao nhiêu chữ cái?",
        options: ["3", "4", "5", "6"],
        answer: "4",
        explanation_vn: "'Her name has 4 letters: M-A-R-Y.'",
      },
    ],
  },

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "uA01-cr-1",
      type: "multiple-choice" as const,
      question: "Câu chào buổi sáng đúng là gì? (What is the correct morning greeting?)",
      options: ["Good morning", "Good night", "Good evening", "Goodbye"],
      answer: "Good morning",
      explanation_vn: "'Good morning' dùng để chào vào buổi sáng. 'Good evening' là buổi tối, 'Good night' là khi đi ngủ.",
    },
    {
      id: "uA01-cr-2",
      type: "multiple-choice" as const,
      question: "Bạn giới thiệu tên mình (Linh) như thế nào?",
      options: ["My name is Linh.", "I am name Linh.", "Name I Linh.", "Linh is my."],
      answer: "My name is Linh.",
      explanation_vn: "Cấu trúc đúng: 'My name is [tên].' — Đây là câu giới thiệu tên cơ bản nhất.",
    },
    {
      id: "uA01-cr-3",
      type: "multiple-choice" as const,
      question: "Câu trả lời đúng cho 'How are you?' là gì?",
      options: ["I am fine, thank you.", "My name is Tom.", "Nice to meet you.", "Good morning."],
      answer: "I am fine, thank you.",
      explanation_vn: "'I am fine, thank you.' là câu trả lời chuẩn. Các câu khác đúng ngữ pháp nhưng không phù hợp văn cảnh.",
    },
    {
      id: "uA01-cr-4",
      type: "multiple-choice" as const,
      question: "Bạn nói gì khi tạm biệt?",
      options: ["Goodbye!", "Hello!", "How are you?", "What is your name?"],
      answer: "Goodbye!",
      explanation_vn: "'Goodbye!' là lời tạm biệt phổ biến. Bạn cũng có thể nói 'Bye!' hay 'See you later!'",
    },
  ],

  // ── OUTPUT: shadowing
  shadowingVideoId: "sNvmqN2MBBo", // BBC Learning English — How to Greet People in English
  jobScenarios: [
    {
      id: 1,
      title: "Ngày đầu đi làm: chào hỏi và làm quen đồng nghiệp",
      focus: "Basic greetings + self intro at office (entry level job)",
      context: "Orientation hoặc first day tại công ty nhỏ ở Việt Nam",
      l1Note: "⚠️ 'Hello, my name is... Nice to meet you.' 'I am the new assistant.'",
      example: "Hi everyone, my name is Lan. I just joined as marketing assistant. Nice to meet you all."
    }
  ], 
};

export default unitA01;
