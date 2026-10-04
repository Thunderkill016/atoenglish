import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-2 — Personal Information  (A1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit2: UnitData = {
  unitId: "unit-2",
  title: "Unit 2: Personal Information",
  level: "A1",
  xp: 80,
  estimatedTime: 40,
  description: "Học cách hỏi và trả lời về thông tin cá nhân: tên, tuổi, nghề nghiệp và nơi sống.",
  badgeName: "Người Tự Giới Thiệu",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "HR manager yêu cầu bạn điền form thông tin cá nhân và hỏi thêm về nghề nghiệp, tuổi tác và nơi sống của bạn.",
  learningOutcomes: [
    "Cung cấp thông tin cá nhân chính xác bằng tiếng Anh",
    "Hỏi và trả lời câu hỏi Wh- về thông tin cơ bản",
    "Điền form đăng ký tài khoản hoặc hồ sơ bằng tiếng Anh"
  ],
  badgeEmoji: "🪪",

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "❓",
      en: "What's your name?",
      vn: "Tên bạn là gì?",
      context: "Câu hỏi cơ bản khi gặp người mới"
    },
    {
      emoji: "🎂",
      en: "How old are you?",
      vn: "Bạn bao nhiêu tuổi?",
      context: "Hỏi tuổi một cách lịch sự"
    },
    {
      emoji: "💼",
      en: "What do you do?",
      vn: "Bạn làm nghề gì?",
      context: "Hỏi nghề nghiệp tự nhiên"
    }
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: "Người Anh và Mỹ thường hỏi <span class=\"text-emerald-400 font-semibold\">What do you do?</span> thay vì <span class=\"text-emerald-400 font-semibold\">What is your job?</span> — nghe tự nhiên hơn rất nhiều trong hội thoại thường ngày.",

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "name", emoji: "🏷️", phonetic: "/neɪm/", meaning: "tên", example: "What's your name?", example2: "My name is Minh.", collocation: "first name / last name", audio: "/audio/unit-2/name.mp3" , l1_interference_vn: "⚠️ 'What's your name?' không phải 'What is your name are?' — lỗi to be rất phổ biến." },
    { id: 2, word: "age", emoji: "🎂", phonetic: "/eɪdʒ/", meaning: "tuổi", example: "What's your age?", example2: "She is 25 years old.", collocation: "at the age of", audio: "/audio/unit-2/age.mp3" , l1_interference_vn: "⚠️ Hỏi tuổi: 'How old are you?' không phải 'How age are you?' — dùng 'old', không phải 'age'." },
    { id: 3, word: "job", emoji: "💼", phonetic: "/dʒɒb/", meaning: "nghề nghiệp / công việc", example: "What is your job?", example2: "My job is very interesting.", collocation: "full-time job", audio: "/audio/unit-2/job.mp3" , l1_interference_vn: "⚠️ Cách hỏi tự nhiên nhất: 'What do you do?' — không phải 'What is your job?' (nghe formal)." },
    { id: 4, word: "student", emoji: "🎓", phonetic: "/ˈstjuːdənt/", meaning: "học sinh / sinh viên", example: "I am a student.", example2: "She is a university student.", collocation: "student ID", audio: "/audio/unit-2/student.mp3" , l1_interference_vn: "⚠️ Âm /st/ đầu — không thêm 'ư' trước: đừng nói 'ư-student'. Nối âm: 'student'." },
    { id: 5, word: "teacher", emoji: "👩‍🏫", phonetic: "/ˈtiːtʃər/", meaning: "giáo viên", example: "He is an English teacher.", example2: "My teacher is very kind.", collocation: "English teacher", audio: "/audio/unit-2/teacher.mp3", l1_interference_vn: "⚠️ 'Teacher' đứng trước tên KHÔNG dùng 'the': 'Teacher Lan' sai — nói 'Ms/Mr Lan'. Trong lớp gọi là 'the teacher' (có 'the')." },
    { id: 6, word: "doctor", emoji: "👨‍⚕️", phonetic: "/ˈdɒktər/", meaning: "bác sĩ", example: "She is a doctor.", example2: "The doctor helps sick people.", collocation: "see a doctor", audio: "/audio/unit-2/doctor.mp3" , l1_interference_vn: "⚠️ 'See a doctor' (đi khám) — không phải 'go to doctor'. Cần mạo từ 'a' và động từ 'see'." },
    { id: 7, word: "address", emoji: "🏠", phonetic: "/ˈædrɛs/", meaning: "địa chỉ", example: "What is your address?", example2: "My address is 12 Nguyen Hue Street.", collocation: "home address", audio: "/audio/unit-2/address.mp3" , l1_interference_vn: "⚠️ Stress âm đầu: AD-dress (danh từ). Người Việt hay đọc 'a-DRESS' — sai stress." },
    { id: 8, word: "phone number", emoji: "📱", phonetic: "/fəʊn ˈnʌmbər/", meaning: "số điện thoại", example: "What's your phone number?", example2: "I'll give you my phone number.", collocation: "mobile phone number", audio: "/audio/unit-2/phone_number.mp3" , l1_interference_vn: "⚠️ Trong văn nói: 'phone number', không phải 'telephone number'. 'Tel.' dùng trong văn viết." },
    { id: 9, word: "nationality", emoji: "🌏", phonetic: "/ˌnæʃəˈnælɪti/", meaning: "quốc tịch", example: "What is your nationality?", example2: "My nationality is Vietnamese.", collocation: "Vietnamese nationality", audio: "/audio/unit-2/nationality.mp3" , l1_interference_vn: "⚠️ Stress: na-tion-AL-i-ty (âm 3). Người Việt hay bỏ âm /æl/ giữa câu." },
    { id: 10, word: "email", emoji: "📧", phonetic: "/ˈiːmeɪl/", meaning: "địa chỉ email", example: "What's your email address?", example2: "Send me an email, please.", collocation: "email address", audio: "/audio/unit-2/email.mp3" , l1_interference_vn: "⚠️ Đọc /ˈiːmeɪl/ — âm 'E' dài ở đầu. Nhiều người Việt đọc ngắn thành /e-meil/." },
    { id: 11, word: "married", emoji: "💍", phonetic: "/ˈmærid/", meaning: "đã kết hôn", example: "Are you married?", example2: "He got married last year.", collocation: "get married", audio: "/audio/unit-2/married.mp3" , l1_interference_vn: "⚠️ 'Are you married?' không phải 'Are you marry?' — dùng tính từ 'married'." },
    { id: 12, word: "single", emoji: "🙋", phonetic: "/ˈsɪŋɡəl/", meaning: "độc thân", example: "I am single.", example2: "Are you single or married?", collocation: "single person", audio: "/audio/unit-2/single.mp3" , l1_interference_vn: "⚠️ 'I'm single' = chưa kết hôn (độc thân). 'Single' còn nghĩa khác tùy context." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Điền form đăng ký",
      audio: "/audio/unit-2/dialogue_1.mp3",
      desc: "Nam đang giúp Lily điền vào mẫu đăng ký học tiếng Anh.",
      lines: [
        { id: "d1-1", speaker: "Nam", text: "What's your full name?", translation: "Họ và tên đầy đủ của bạn là gì?" },
        { id: "d1-2", speaker: "Lily", text: "My name is Lily Chen.", translation: "Tên tôi là Lily Chen." },
        { id: "d1-3", speaker: "Nam", text: "How old are you?", translation: "Bạn bao nhiêu tuổi?" },
        { id: "d1-4", speaker: "Lily", text: "I'm twenty-two years old.", translation: "Tôi 22 tuổi." },
        { id: "d1-5", speaker: "Nam", text: "What do you do?", translation: "Bạn làm nghề gì?" },
        { id: "d1-6", speaker: "Lily", text: "I'm a student at Hanoi University.", translation: "Tôi là sinh viên Đại học Hà Nội." },
      ]
    },
    {
      id: 2,
      title: "Gặp đồng nghiệp mới",
      audio: "/audio/unit-2/dialogue_2.mp3",
      desc: "Hoa gặp đồng nghiệp mới tên Tom trong ngày đầu đi làm.",
      lines: [
        { id: "d2-1", speaker: "Tom", text: "Hi! I'm Tom. Nice to meet you.", translation: "Chào! Mình là Tom. Rất vui được gặp bạn." },
        { id: "d2-2", speaker: "Hoa", text: "Hi Tom! I'm Hoa. Where are you from?", translation: "Chào Tom! Mình là Hoa. Bạn đến từ đâu?" },
        { id: "d2-3", speaker: "Tom", text: "I'm from Australia. And you?", translation: "Mình đến từ Úc. Còn bạn?" },
        { id: "d2-4", speaker: "Hoa", text: "I'm Vietnamese. What do you do here?", translation: "Mình là người Việt Nam. Bạn làm gì ở đây?" },
        { id: "d2-5", speaker: "Tom", text: "I'm an English teacher at this school.", translation: "Mình là giáo viên tiếng Anh tại trường này." },
      ]
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "What is your name", options: ["How old are you", "What is your name", "Where are you from", "What do you do"], answer: "What is your name" },
    { id: "lac2", audio_text: "I am a teacher", options: ["I am a student", "I am a teacher", "I am a doctor", "I am an engineer"], answer: "I am a teacher" },
    { id: "lac3", audio_text: "I am twenty years old", options: ["I am twelve years old", "I am twenty years old", "I am thirty years old", "I am two years old"], answer: "I am twenty years old" },
    { id: "lac4", audio_text: "What do you do", options: ["What is your name", "Where do you live", "What do you do", "How are you"], answer: "What do you do" },
    { id: "lac5", audio_text: "I am from Vietnam", options: ["I am fine", "I am from Vietnam", "I am a student", "I am married"], answer: "I am from Vietnam" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "My name is {input}. I am a student.",
    level1Placeholder: "Ví dụ: Minh, Lan, Nam...",
    level2Situation: "Bạn đang điền vào form đăng ký tại một trung tâm tiếng Anh. Nhân viên hỏi bạn về thông tin cá nhân.",
    level2Hint: "My name is [tên]. I am [tuổi] years old. I am a [nghề nghiệp]. I am from [nơi].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Wh- Questions — Câu hỏi thông tin",
    rule: "What / Who / Where / How old + am/is/are + chủ ngữ?",
    examples: [
      { en: "What is your name?", vn: "Tên bạn là gì?" },
      { en: "Where are you from?", vn: "Bạn đến từ đâu?" },
      { en: "How old are you?", vn: "Bạn bao nhiêu tuổi?" },
      { en: "What do you do?", vn: "Bạn làm nghề gì?" },
    ],
    tip: "Wh- questions bắt đầu bằng từ hỏi (What/Where/Who/How), sau đó là trợ động từ (am/is/are/do/does), cuối cùng là chủ ngữ. Đừng quên dấu hỏi (?) ở cuối câu!",
    vnNote: "⚠️ Lưu ý: Tiếng Việt đặt từ hỏi ở cuối câu ('bạn tên là gì?'), nhưng tiếng Anh đặt Wh-word lên ĐẦU câu. Lỗi phổ biến: bỏ 'do/does' trong câu hỏi — 'Where you live?' (sai) → 'Where do you live?' (đúng).",
    dialogueExample: {
      speaker: "Nam",
      text: "What's your full name?",
      translation: "Họ và tên đầy đủ của bạn là gì?",
      highlight: "What's",
    },
    ccq: {
      question: "Câu hỏi Wh- nào đúng cấu trúc?",
      options: ["Name your what is?", "What is your name?", "Is what your name?", "Your name what?"],
      answer: "What is your name?",
    },
  },

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối câu hỏi với câu trả lời",
    pairs: [
      { left: "What's your name?", right: "My name is Linh." },
      { left: "How old are you?", right: "I'm 20 years old." },
      { left: "What do you do?", right: "I'm a student." },
      { left: "Where are you from?", right: "I'm from Vietnam." },
      { left: "Are you married?", right: "No, I'm single." },
    ],
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", question: "Chọn câu hỏi đúng: '___ your name?' ", options: ["What's", "Who's", "Where's", "How's"], answer: "What's", type: "multiple-choice" },
    { id: "pq2", question: "'What do you do?' hỏi về điều gì?", options: ["Tên", "Tuổi", "Nghề nghiệp", "Địa chỉ"], answer: "Nghề nghiệp", type: "multiple-choice" },
    { id: "pq3", question: "Điền vào chỗ trống: 'I ___ a doctor.'", options: [], answer: "am", type: "cloze" },
  ],


  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    { id: "pt2-1", prompt_vn: "Bạn tên là gì?", answer: "What is your name?" },
    { id: "pt2-2", prompt_vn: "Tôi 25 tuổi.", answer: "I am 25 years old." },
    { id: "pt2-3", prompt_vn: "Số điện thoại của bạn là gì?", answer: "What is your phone number?" },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "q1", question: "Câu hỏi nào hỏi về nghề nghiệp?", options: ["What is your name?", "How old are you?", "What do you do?", "Where are you from?"], answer: "What do you do?", type: "multiple-choice",
      explanation_vn: "'What do you do?' hỏi nghề nghiệp. 'What is your name?' hỏi tên, 'How old' hỏi tuổi." },
    { id: "q2", question: "'I am a student at Hanoi University.' — từ nào chỉ nghề nghiệp?", options: ["Hanoi", "University", "student", "am"], answer: "student", type: "multiple-choice",
      explanation_vn: "'Student' là danh từ nghề nghiệp. 'Hanoi/University' là địa danh, 'am' là động từ." },
    { id: "q3", question: "Câu hỏi hỏi tuổi là gì?", options: ["What do you do?", "How old are you?", "Where are you from?", "What is your job?"], answer: "How old are you?", type: "multiple-choice",
      explanation_vn: "'How old are you?' hỏi tuổi. Không dùng 'What age are you?' trong tiếng Anh tự nhiên." },
    { id: "q4", question: "Điền từ còn thiếu: 'What ___ your phone number?'", options: [], answer: "is", type: "cloze" },
    { id: "q5", question: "Điền từ còn thiếu: 'I am ___ student.'", options: [], answer: "a", type: "cloze" },
    { id: "q6", question: "Tên tôi là Hoa và tôi là sinh viên.", options: [], answer: "My name is Hoa and I am a student.", type: "translate" },
    { id: "q7", question: "Bạn đến từ đâu?", options: [], answer: "Where are you from?", type: "translate" },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s2-1",
      prompt_vn: "Tên bạn là gì?",
      words: ["What", "is", "your", "name", "?"],
      answer: "What is your name ?",
    },
    {
      id: "s2-2",
      prompt_vn: "Tôi là giáo viên tiếng Anh.",
      words: ["I", "am", "an", "English", "teacher", "."],
      answer: "I am an English teacher .",
    },
    {
      id: "s2-3",
      prompt_vn: "Bạn bao nhiêu tuổi?",
      words: ["How", "old", "are", "you", "?"],
      answer: "How old are you ?",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la2-1",
      audio_text: "This is my mother she is a teacher.",
      prompt_vn: "Đây là mẹ tôi cô ấy là giáo viên.",
      words: ["This", "is", "my", "mother", "she", "is", "a", "teacher", ".", "father", "he"],
      answer: "This is my mother she is a teacher .",
    },
    {
      id: "la2-2",
      audio_text: "I have one brother and one sister.",
      prompt_vn: "Tôi có một anh trai và một em gái.",
      words: ["I", "have", "one", "brother", "and", "one", "sister", ".", "two", "father"],
      answer: "I have one brother and one sister .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb2-1",
      prompt_vn: "Tên bạn là gì?",
      words: ["What", "is", "your", "name", "are", "old", "?"],
      answer: "What is your name ?",
      hint: "What is your...?",
    },
    {
      id: "wb2-2",
      prompt_vn: "Tôi là sinh viên.",
      words: ["I", "am", "a", "student", "is", "teacher", "."],
      answer: "I am a student .",
      hint: "I am a...",
    },
    {
      id: "wb2-3",
      prompt_vn: "Bạn làm nghề gì?",
      words: ["What", "do", "you", "do", "are", "how", "?"],
      answer: "What do you do ?",
      hint: "What do you do?",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc2-1",
      sentence: "I am a engineer.",
      errorWord: "a",
      correction: "an",
      explanation_vn: "'Engineer' bắt đầu bằng nguyên âm /e/ → dùng 'AN engineer', không dùng 'a engineer'.",
    },
    {
      id: "sc2-2",
      sentence: "How old are your?",
      errorWord: "your",
      correction: "you",
      explanation_vn: "'How old are YOU?' (chủ ngữ), không dùng 'your' (sở hữu). 'Your name' = của bạn, nhưng hỏi tuổi dùng 'you'.",
    },
  ],


  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr2-1",
      question: "Câu nào đúng ngữ pháp với chủ ngữ 'She'? (Unit 1: To be)",
      options: ["She am a teacher.", "She is a teacher.", "She are a teacher.", "She be a teacher."],
      answer: "She is a teacher.",
      type: "multiple-choice",
    },
    {
      id: "cr2-2",
      question: "Rất vui được gặp bạn. (Unit 1)",
      options: [],
      answer: "Nice to meet you.",
      type: "translate",
    },
    {
      id: "cr2-3",
      question: "Chào buổi sáng bằng tiếng Anh là gì? (Unit 1)",
      options: ["Good morning", "Good night", "Good evening", "See you"],
      answer: "Good morning",
      type: "multiple-choice",
      explanation_vn: "Good morning dùng cho sáng sớm. Từ unit1 vocab + warmup.",
    },
  ],


  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "/w/",
    description: "Âm /w/ — tiếng Việt không có, hay bị đọc thành /v/ hoặc /u/",
    examples: [
        { word: "what", ipa: "/wɒt/", tip: "Mở miệng tròn như nói \"ồ\", không chạm răng — khác /v/ hoàn toàn" },
        { word: "where", ipa: "/weər/", tip: "Môi tròn, không có rung dây thanh quản" },
    ],
    minimalPairs: [
        ["wine", "vine"],
        ["west", "vest"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "What is your name?", vn: "Tên bạn là gì?" },
      { en: "Where are you from?", vn: "Bạn đến từ đâu?" },
      { en: "How old are you?", vn: "Bạn bao nhiêu tuổi?" },
      { en: "What do you do?", vn: "Bạn làm gì?" },
      { en: "Where do you work?", vn: "Bạn làm việc ở đâu?" },
      { en: "Do you have children?", vn: "Bạn có con chưa?" },
      { en: "What is your email?", vn: "Email của bạn là gì?" },
      { en: "Are you married?", vn: "Bạn đã kết hôn chưa?" },
    ],
  },


  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit2-reading-1",
    title: "My Name is Lan",
    title_vn: "Đọc đoạn giới thiệu bản thân",
    level: "A1",
    text:
      "Hi! My name is Lan. I am twenty-five years old. I am from Hanoi, Vietnam. " +
      "I am a teacher. I work at a school in the city. " +
      "My friend is Nam. He is a doctor. He works at a hospital. " +
      "We are happy to meet you!",
    questions: [
      {
        id: "u2r-q1",
        question_vn: "Lan bao nhiêu tuổi?",
        options: ["Twenty years old", "Twenty-five years old", "Thirty years old", "Fifteen years old"],
        answer: "Twenty-five years old",
        explanation_vn: "Đoạn văn nói 'I am twenty-five years old.'",
      },
      {
        id: "u2r-q2",
        question_vn: "Lan làm nghề gì?",
        options: ["A doctor", "A nurse", "A teacher", "An engineer"],
        answer: "A teacher",
        explanation_vn: "Đoạn văn nói 'I am a teacher. I work at a school.'",
      },
      {
        id: "u2r-q3",
        question_vn: "Nam làm việc ở đâu?",
        options: ["At a school", "At a bank", "At a hospital", "At an office"],
        answer: "At a hospital",
        explanation_vn: "Đoạn văn nói 'He works at a hospital.'",
      },
      {
        id: "u2r-q4",
        question_vn: "Lan đến từ đâu?",
        options: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hue"],
        answer: "Hanoi",
        explanation_vn: "Đoạn văn nói 'I am from Hanoi, Vietnam.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Giới thiệu nghề nghiệp khi điền form HR",
      focus: "What do you do? + tuổi + nghề (student / teacher / doctor)",
      context: "Buổi đầu gặp HR hoặc đăng ký làm việc tại công ty Hà Nội",
      l1Note: "⚠️ Dùng 'What do you do?' tự nhiên hơn 'What is your job?'. VN hay nhầm 'I am student' thiếu 'a'.",
      example: "I'm a student at Hanoi University. I study English."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "XeZbFQUoHq8", // BBC Learning English — Family vocabulary A1
};


