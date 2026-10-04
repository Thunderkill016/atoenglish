import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-37 — Concise & Precise Language  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit37: UnitData = {
  unitId: "unit-37",
  title: "Unit 37: Concise & Precise Language",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Participle Clauses — Mệnh đề phân từ (V-ing, V-ed, Having + V3). Rút gọn câu để diễn đạt súc tích, chuyên nghiệp. Điểm mấu chốt để nâng băng điểm tiêu chí Coherence và Grammatical Range trong IELTS Writing Task 2.",
  badgeName: "Nhà Biên Tập",
  badgeEmoji: "✍️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Soạn thảo tóm tắt dự án (Project Executive Summary) gửi cho Giám đốc điều hành. Bạn cần rút gọn các câu dài, lặp chủ ngữ bằng mệnh đề phân từ để văn bản trở nên súc tích, chuyên nghiệp và có tính thuyết phục cao.",
  learningOutcomes: [
    "Sử dụng mệnh đề phân từ chủ động (V-ing) và bị động (V-ed) để rút gọn câu",
    "Sử dụng phân từ hoàn thành (Having + V3) để thể hiện trình tự thời gian súc tích",
    "Áp dụng từ vựng phân tích và biên soạn báo cáo ở trình độ B2",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong viết học thuật và báo cáo doanh nghiệp tiếng Anh, sự súc tích (<span class="text-emerald-400">conciseness</span>) là tiêu chuẩn vàng. Việc viết những câu quá dài kết nối bằng các từ như "and", "because", "after" làm văn bản bị rời rạc. Sử dụng mệnh đề phân từ giúp bạn truyền tải cùng một lượng thông tin nhưng với ít từ hơn và cấu trúc câu đa dạng hơn.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "📝", en: "Having finished the draft, she sent it to the manager.", vn: "Sau khi hoàn thành bản nháp, cô ấy đã gửi nó cho quản lý.", context: "Having + PP — hành động trước hành động chính" },
    { emoji: "⚙️", en: "Built in 2020, our system is highly integrated.", vn: "Được xây dựng vào năm 2020, hệ thống của chúng tôi tích hợp rất cao.", context: "Built (V-ed clause) — bị động rút gọn" },
    { emoji: "💡", en: "Knowing the risks, we decided to modify the plan.", vn: "Biết rõ các rủi ro, chúng tôi đã quyết định điều chỉnh kế hoạch.", context: "Knowing (V-ing clause) — chủ động chỉ nguyên nhân" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "summarize", emoji: "📝", phonetic: "/ˈsʌməraɪz/", meaning: "tóm tắt", example: "He summarized the main points of the report in three sentences.", example2: "To summarize, the campaign was a huge success.", collocation: "summarize a point / summarize findings / executive summary", audio: "/audio/unit-37/summarize.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "compile", emoji: "📚", phonetic: "/kəmˈpaɪl/", meaning: "thu thập / biên soạn (tài liệu)", example: "We compiled a list of customer feedback from last month.", example2: "It took two weeks to compile the annual financial report.", collocation: "compile a database / compile information / compile a report", audio: "/audio/unit-37/compile.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'compile' trong câu trang trọng." },
    { id: 3, word: "construct", emoji: "🏗️", phonetic: "/kənˈstrʌkt/", meaning: "xây dựng / dựng lên (lập luận, hệ thống)", example: "You must construct a strong argument in your essay.", example2: "The factory was constructed in a rural area.", collocation: "construct an argument / construct a building / construct a theory", audio: "/audio/unit-37/construct.mp3", l1_interference_vn: "⚠️ 'construct' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "formulate", emoji: "🧪", phonetic: "/ˈfɔːmjʊleɪt/", meaning: "thiết lập / phát biểu rõ ràng / xây dựng chính sách", example: "The committee is formulating a new environmental policy.", example2: "We need to formulate a clear strategy for the launch.", collocation: "formulate a policy / formulate a strategy / formulate an answer", audio: "/audio/unit-37/formulate.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'formulate' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "modify", emoji: "🔧", phonetic: "/ˈmɒdɪfaɪ/", meaning: "sửa đổi / điều chỉnh nhẹ", example: "We had to modify the software to fit the new system.", example2: "The terms of the contract were slightly modified.", collocation: "modify a plan / modify code / modify behavior", audio: "/audio/unit-37/modify.mp3", l1_interference_vn: "⚠️ 'modify' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "integrate", emoji: "🧩", phonetic: "/ˈɪntɪɡreɪt/", meaning: "tích hợp / hợp nhất", example: "The new system integrates database and billing functions.", example2: "We must integrate the feedback into our design.", collocation: "highly integrated / integrate into / integrated system", audio: "/audio/unit-37/integrate.mp3", l1_interference_vn: "⚠️ Trong email B2, 'integrate' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "outline", emoji: "📌", phonetic: "/ˈaʊtlaɪn/", meaning: "phác thảo / vạch ra ý chính", example: "She outlined the project plan on the whiteboard.", example2: "The report outlines the main causes of the crisis.", collocation: "project outline / outline a plan / briefly outline", audio: "/audio/unit-37/outline.mp3", l1_interference_vn: "⚠️ 'Outline the key points first' — người Việt hay viết lan man mà không 'outline' trước khi viết báo cáo." },
    { id: 8, word: "synthesize", emoji: "🧪", phonetic: "/ˈsɪnθəsaɪz/", meaning: "tổng hợp (thông tin, dữ liệu)", example: "The report synthesizes data from five different studies.", example2: "Students need to learn how to synthesize information.", collocation: "synthesize information / synthesize data / synthesize findings", audio: "/audio/unit-37/synthesize.mp3", l1_interference_vn: "⚠️ 'Synthesize' = tổng hợp từ nhiều nguồn (khác 'summarize' chỉ tóm tắt một nguồn). Hay bị nhầm nghĩa." },
    { id: 9, word: "simplify", emoji: "✂️", phonetic: "/ˈsɪmplɪfaɪ/", meaning: "đơn giản hóa", example: "We simplified the checkout process to improve sales.", example2: "Could you simplify this explanation for the client?", collocation: "simplify a process / simplify instructions / simplify code", audio: "/audio/unit-37/simplify.mp3" },
    { id: 10, word: "enhance", emoji: "✨", phonetic: "/ɪnˈhɑːns/", meaning: "nâng cao / cải thiện chất lượng", example: "The new features will enhance user experience.", example2: "We want to enhance our brand reputation.", collocation: "enhance performance / enhance quality / enhance customer satisfaction", audio: "/audio/unit-37/enhance.mp3", l1_interference_vn: "⚠️ 'Enhance' nghĩa là cải thiện chất lượng (không chỉ tăng số). Người VN hay dùng 'increase' cho mọi thứ." },
    { id: 11, word: "establish", emoji: "🏢", phonetic: "/ɪˈstæblɪʃ/", meaning: "thiết lập / thành lập / xác lập", example: "The company was established in Singapore in 2015.", example2: "We need to establish clear communication channels.", collocation: "establish a company / establish a relationship / establish a system", audio: "/audio/unit-37/establish.mp3" },
    { id: 12, word: "substitute", emoji: "🔄", phonetic: "/ˈsʌbstɪtjuːt/", meaning: "thay thế / vật thay thế", example: "You can substitute honey for sugar in this recipe.", example2: "There is no substitute for hard work.", collocation: "substitute A for B / close substitute / act as a substitute", audio: "/audio/unit-37/substitute.mp3", l1_interference_vn: "⚠️ 'Substitute A for B' = thay A vào vị trí B. Thứ tự giới từ hay bị đảo bởi người Việt." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Viết tóm tắt báo cáo dự án",
      audio: "/audio/unit-37/dialogue_1.mp3",
      desc: "Trang hỗ trợ sếp biên soạn và sửa đổi tóm tắt dự án để gửi CEO.",
      lines: [
        { id: "d1-1", speaker: "Manager", text: "Trang, have you compiled the feedback from our corporate clients?", translation: "Trang, em đã thu thập các phản hồi từ khách hàng doanh nghiệp chưa?" },
        { id: "d1-2", speaker: "Trang", text: "Yes. Having synthesized all the comments, I drafted this summary. It outlines the key issues.", translation: "Rồi ạ. Sau khi tổng hợp toàn bộ bình luận, em đã phác thảo bản tóm tắt này. Nó vạch ra các vấn đề chính." },
        { id: "d1-3", speaker: "Manager", text: "Good. But the sentences are a bit too long. We need to simplify the language to enhance readability.", translation: "Tốt. Nhưng các câu hơi dài quá. Chúng ta cần đơn giản hóa ngôn ngữ để nâng cao mức độ dễ đọc." },
        { id: "d1-4", speaker: "Trang", text: "I understand. Knowing that the CEO is very busy, I will modify the layout to make it more concise.", translation: "Em hiểu. Biết rằng CEO rất bận, em sẽ điều chỉnh bố cục để làm nó súc tích hơn." },
        { id: "d1-5", speaker: "Manager", text: "Perfect. Once established, this format will act as a standard template.", translation: "Hoàn hảo. Sau khi được thiết lập, định dạng này sẽ đóng vai trò như một mẫu tiêu chuẩn." },
      ],
    },
    {
      id: 2,
      title: "Điều chỉnh hệ thống phần mềm",
      audio: "/audio/unit-37/dialogue_2.mp3",
      desc: "Huy giải thích với đối tác về việc tích hợp hệ thống.",
      lines: [
        { id: "d2-1", speaker: "Partner", text: "Designed in Germany, this software should integrate easily with our database.", translation: "Được thiết kế ở Đức, phần mềm này đáng lẽ phải tích hợp dễ dàng với cơ sở dữ liệu của chúng ta." },
        { id: "d2-2", speaker: "Huy", text: "Actually, facing compatibility issues, we had to substitute several old database components.", translation: "Thực tế thì, đối mặt với các vấn đề tương thích, chúng tôi đã phải thay thế một vài thành phần cơ sở dữ liệu cũ." },
        { id: "d2-3", speaker: "Partner", text: "Having modified the code, is the system stable now?", translation: "Sau khi đã sửa đổi mã nguồn, hệ thống bây giờ ổn định chứ?" },
        { id: "d2-4", speaker: "Huy", text: "Yes, we successfully enhanced the performance.", translation: "Vâng, chúng tôi đã nâng cao hiệu suất thành công." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Having finished the draft, she sent it to the manager.", options: ["She sent the draft before she finished it.", "Having finished the draft, she sent it to the manager.", "She will finish the draft and send it to the manager.", "She is writing the draft for the manager now."], answer: "Having finished the draft, she sent it to the manager." },
    { id: "lac2", audio_text: "Built in twenty-twenty, our system is highly integrated.", options: ["Our system was built last year and integrated yesterday.", "Built in twenty-twenty, our system is highly integrated.", "We will build a highly integrated system in twenty-twenty.", "The system is not integrated because it was built in twenty-twenty."], answer: "Built in twenty-twenty, our system is highly integrated." },
    { id: "lac3", audio_text: "Knowing the risks, we decided to modify the plan.", options: ["We modified the plan because we did not know the risks.", "Knowing the risks, we decided to modify the plan.", "We took the risks without modifying the plan.", "The modified plan had no risks."], answer: "Knowing the risks, we decided to modify the plan." },
    { id: "lac4", audio_text: "The new features will enhance user experience.", options: ["The new features will enhance user experience.", "The user experience was damaged by new features.", "We will simplify the user experience tomorrow.", "We need to outline the new features."], answer: "The new features will enhance user experience." },
    { id: "lac5", audio_text: "There is no substitute for hard work.", options: ["Hard work can be substituted easily.", "There is no substitute for hard work.", "We need a substitute worker today.", "Working hard is not necessary."], answer: "There is no substitute for hard work." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Having {input} the data, I {input} the summary to {input} readability.",
    level1Placeholder: "Ví dụ: compiled — simplified — enhance...",
    level2Situation: "Bạn viết một email gửi quản lý hoặc thuyết trình báo cáo. Hãy: (1) Nói rằng sau khi tổng hợp thông tin, bạn đã đề xuất chiến lược mới, (2) Giải thích rằng do được thành lập từ năm 2015, công ty có vị thế vững chắc, (3) Nhấn mạnh việc đơn giản hóa quy trình.",
    level2Hint: "Having synthesized the feedback, we formulated a new marketing strategy. Established in 2015, our company enjoys a strong reputation. We will modify our methods to simplify the process and enhance performance.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Participle Clauses — Mệnh Đề Phân Từ Rút Gọn",
    rule: "Mệnh đề phân từ dùng để nối hai câu có cùng chủ ngữ, giúp câu văn ngắn gọn và học thuật hơn.\n\n1. Present Participle (V-ing clause) — Chủ động:\nDùng để chỉ hành động xảy ra cùng lúc hoặc chỉ nguyên nhân (tương đương because/as).\n  → 'Knowing the risks, we modified the plan.' (= Because we knew the risks...)\n\n2. Past Participle (V-ed clause) — Bị động:\nDùng để rút gọn câu bị động.\n  → 'Built in 2015, the company is successful.' (= The company, which was built in 2015, is...)\n\n3. Perfect Participle (Having + Past Participle) — Chủ động hoàn thành:\nNhấn mạnh hành động ở mệnh đề phân từ hoàn thành xong trước hành động chính.\n  → 'Having compiled the data, she wrote the report.' (= After she had compiled the data, she...)",
    examples: [
      { en: "Having finished the meeting, we went to lunch. (Perfect participle - time sequence)", vn: "Sau khi họp xong, chúng tôi đi ăn trưa." },
      { en: "Facing financial problems, they terminated the project. (Present participle - cause/reason)", vn: "Đối mặt với các vấn đề tài chính, họ đã chấm dứt dự án." },
      { en: "Published in a medical journal, the study became famous. (Past participle - passive description)", vn: "Được công bố trên tạp chí y khoa, nghiên cứu đã trở nên nổi tiếng." },
    ],
    tip: "Khi viết bài luận IELTS Writing Task 2, hãy dùng mệnh đề phân từ để rút gọn các câu dài lê thê. Ví dụ, thay vì viết 'After the company had established a new policy, they enhanced productivity', hãy viết: 'Having established a new policy, the company enhanced productivity'. Câu văn sẽ vô cùng cô đọng.",
    vnNote: "⚠️ Lỗi nghiêm trọng nhất khi dùng mệnh đề phân từ là lỗi 'Dangling Participle' (Phân từ lơ lửng). Hai vế bắt buộc phải cùng chủ ngữ. Nếu bạn viết 'Having finished the report, the manager called me' → đúng. Nhưng viết 'Having finished the report, the phone rang' → sai, vì cái điện thoại không thể tự viết báo cáo.",
    dialogueExample: {
      speaker: "Trang",
      text: "Having synthesized all the comments, I drafted this summary. It outlines the key issues.",
      translation: "Sau khi tổng hợp toàn bộ bình luận, em đã phác thảo bản tóm tắt này. Nó vạch ra các vấn đề chính.",
      highlight: "Having synthesized (Perfect Participle chỉ hành động hoàn thành trước hành động nháp)",
    },
    ccq: {
      question: "Câu nào dùng ĐÚNG ngữ pháp mệnh đề phân từ (cùng chủ ngữ)?",
      options: [
        "Walking down the street, a dog bit him.",
        "Walking down the street, he was bitten by a dog.",
        "Having walked down the street, a dog bit him.",
        "To walk down the street, a dog bit him.",
      ],
      answer: "Walking down the street, he was bitten by a dog.",
      explanation: "Trong câu này, chủ ngữ của vế 'Walking' phải là 'he' (anh ấy đang đi bộ thì bị cắn). Câu 1 sai vì làm cho 'a dog' (con chó) thành chủ ngữ đi bộ.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: '___ the database, we found the missing error.'", options: ["Examine", "Examined", "Examining", "Having been examined"], answer: "Examining" },
    { id: "pq2", type: "multiple-choice", question: "Chọn phân từ hoàn thành đúng: '___ the report, she shut down her computer.'", options: ["Finished", "Having finished", "Having finish", "Finishing"], answer: "Having finished" },
    { id: "pq3", type: "cloze", question: "Điền dạng phân từ bị động: '___ (establish) in 2015, the company has grown rapidly.'", answer: "Established" },
    { id: "pq4", type: "multiple-choice", question: "Điền từ thích hợp: 'We compiled a summary to ___ readability.'", options: ["summarize", "simplify", "enhance", "construct"], answer: "enhance" },
    { id: "pq5", type: "cloze", question: "Điền dạng đúng của động từ: '___ (know) that the client was angry, he called immediately.'", answer: "Knowing" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng viết học thuật với nghĩa đúng",
    pairs: [
      { left: "summarize", right: "tóm tắt" },
      { left: "compile", right: "thu thập / biên soạn" },
      { left: "synthesize", right: "tổng hợp" },
      { left: "simplify", right: "đơn giản hóa" },
      { left: "substitute", right: "thay thế" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Đối mặt với các vấn đề tài chính, họ đã hoãn kế hoạch mở rộng.",
      answer: "Facing financial problems, they postponed the expansion plan.",
    },
    {
      id: "pt-2",
      prompt_vn: "Tóm tắt báo cáo, nhóm đề xuất thay đổi chiến lược.",
      answer: "Summarizing the report, the team proposed a strategy change.",
    },
    {
      id: "pt-3",
      prompt_vn: "Được xây dựng cẩn thận, mô hình đã dự đoán chính xác.",
      answer: "Carefully constructed, the model predicted accurately.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc37-1",
      sentence: "The reason is because I was late for the meeting.",
      errorWord: "is because",
      correction: "is that",
      explanation_vn: "'The reason is THAT...' (chuẩn văn viết). 'The reason is because' là lỗi redundancy phổ biến.",
    },
    {
      id: "sc37-2",
      sentence: "Despite of the rain she walked to work.",
      errorWord: "Despite of",
      correction: "Despite",
      explanation_vn: "'Despite + noun/V-ing' (không có 'of'). 'In spite OF' mới có 'of'. Lỗi phổ biến trong IELTS.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la37-1",
      audio_text: "Despite the rain she walked to work this morning.",
      prompt_vn: "Dù trời mưa cô ấy vẫn đi bộ đến công ty.",
      words: ["Despite", "the", "rain", "she", "walked", "to", "work", "this", "morning", ".", "Despite of", "In spite"],
      answer: "Despite the rain she walked to work this morning .",
    },
    {
      id: "la37-2",
      audio_text: "Although he was tired he continued working.",
      prompt_vn: "Dù mệt anh ấy vẫn tiếp tục làm việc.",
      words: ["Although", "he", "was", "tired", "he", "continued", "working", ".", "Despite", "Even"],
      answer: "Although he was tired he continued working .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Sau khi hoàn thành bản báo cáo, cô ấy đã tắt máy tính.",
      words: ["Having", "completed", "the", "report", ",", "she", "turned", "off", "her", "computer", ".", "might", "should"],
      answer: "Having completed the report , she turned off her computer .",
    },
    {
      id: "wb2",
      prompt_vn: "Được thành lập vào năm 2015, công ty có uy tín lớn.",
      words: ["Established", "in", "2015", ",", "the", "company", "has", "a", "great", "reputation", ".", "might", "should"],
      answer: "Established in 2015 , the company has a great reputation .",
    },
    {
      id: "wb3",
      prompt_vn: "Biết rõ các quy định, chúng tôi luôn tuân thủ.",
      words: ["Knowing", "the", "regulations", ",", "we", "are", "always", "in", "compliance", ".", "might", "should"],
      answer: "Knowing the regulations , we are always in compliance .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s37-1", prompt_vn: "Sau khi hoàn thành bản báo cáo, cô ấy đã tắt máy tính.", words: ["Having", "completed", "the", "report", ",", "she", "turned", "off", "her", "computer", "."], answer: "Having completed the report , she turned off her computer ." },
    { id: "s37-2", prompt_vn: "Được thành lập vào năm 2015, công ty có uy tín lớn.", words: ["Established", "in", "2015", ",", "the", "company", "has", "a", "great", "reputation", "."], answer: "Established in 2015 , the company has a great reputation ." },
    { id: "s37-3", prompt_vn: "Biết rõ các quy định, chúng tôi luôn tuân thủ.", words: ["Knowing", "the", "regulations", ",", "we", "are", "always", "in", "compliance", "."], answer: "Knowing the regulations , we are always in compliance ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn dạng đúng: '___ the client's email, he prepared the attachment.'", options: ["Received", "Having received", "Receive", "To receive"], answer: "Having received" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'The software was ___ (điều chỉnh nhẹ) to resolve the error.'", answer: "modified" },
    { id: "fq3", type: "multiple-choice", question: "Chọn từ điền: 'Let me ___ the main findings of our project.'", options: ["compile", "construct", "summarize", "integrate"], answer: "summarize" },
    { id: "fq4", type: "translate", question: "Dịch: 'Đối mặt với các vấn đề tài chính, họ đã hoãn kế hoạch mở rộng.'", answer: "Facing financial problems, they postponed the expansion plan." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'unite/combine'?", options: ["simplify", "substitute", "integrate", "compile"], answer: "integrate" },
    { id: "q-ex1", type: "multiple-choice", question: "Participle clause rút gọn từ:", options: ["Relative clause", "Conditional clause", "Both relative and adverbial clauses", "Noun clause"], answer: "Both relative and adverbial clauses" },
    { id: "q-ex2", type: "multiple-choice", question: "'The man sitting in the corner is my boss.' Rút gọn từ:", options: ["The man who sits...", "The man who is sitting...", "The man that sat...", "The man who was sitting..."], answer: "The man who is sitting..." },
    { id: "q-ex3", type: "cloze", question: "Rút gọn: 'Having finished the report, she left.' = 'After she ___ the report, she left.'", answer: "finished" },
    { id: "q-ex4", type: "multiple-choice", question: "'Written in 1984, the book is still popular.' — participle clause chỉ:", options: ["Thời gian", "Điều kiện", "Nguyên nhân/mô tả", "Mục đích"], answer: "Nguyên nhân/mô tả" },
    { id: "q-ex5", type: "translate", question: "Dịch ngắn gọn: 'Khi nhìn ra cửa sổ, tôi thấy tuyết rơi.'", answer: "Looking out of the window, I saw snow falling." },
    { id: "q-ex6", type: "multiple-choice", question: "Nominalisation: 'decide' → danh từ:", options: ["decision", "deciding", "decided", "decisive"], answer: "decision" },
    { id: "q-ex7", type: "multiple-choice", question: "Trong cụm 'The increasing demand for energy,' từ 'increasing' là loại từ gì?", options: ["Động từ", "Danh từ", "Tính từ (participle)", "Trạng từ"], answer: "Tính từ (participle)" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr37-1", question: "Ôn tập Unit 36 — Chọn câu đúng: 'The company is reported ___ millions last year.'", options: ["to lose", "to have lost", "losing", "lost"], answer: "to have lost", type: "multiple-choice" },
    { id: "cr37-2", question: "Ôn tập Unit 35 — Điền: 'We will not sign the trade contract ___ they reduce the penalty.'", options: [], answer: "unless", type: "cloze" },
    { id: "cr37-3", question: "Ôn tập Unit 34 — Chọn đúng: 'If she ___ (investigate) the crash, she would have found the fault.'", options: ["investigated", "had investigated", "has investigated", "would investigate"], answer: "had investigated", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "having /ˈhævɪŋ/",
    description: "Having + V3 — participle clause âm nối phức tạp",
    examples: [
        { word: "Having finished", ipa: "/ˈhævɪŋ ˈfɪnɪʃt/", tip: "Having FINISHED the work... — having không nhấn, finished nhấn" },
        { word: "Written in...", ipa: "/ˈrɪtən ɪn/", tip: "WRITTEN in 1984... — V3 đứng đầu nhấn mạnh" },
    ],
    minimalPairs: [
        ["Having done (chủ động)", "Having been done (bị động)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Having finished the draft, she sent it", vn: "Sau khi làm xong bản nháp, cô ấy đã gửi" },
      { en: "Built in 2015, the startup is successful", vn: "Được thành lập năm 2015, công ty đã thành công" },
      { en: "Knowing the CEO was busy, she simplified", vn: "Biết CEO bận, cô ấy đã đơn giản hóa" },
      { en: "We need to compile customer feedback", vn: "Chúng ta cần thu thập phản hồi khách hàng" },
      { en: "The new features enhance performance", vn: "Các tính năng mới giúp nâng cao hiệu suất" },
      { en: "Could you summarize the main findings?", vn: "Bạn có thể tóm tắt các phát hiện chính không?" },
      { en: "There is no substitute for experience", vn: "Không có gì thay thế được kinh nghiệm" },
      { en: "Facing issues, they modified the code", vn: "Đối mặt với sự cố, họ đã sửa đổi code" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit37-reading-1",
    title: "The Art of Concise Writing",
    title_vn: "Đọc đoạn về viết súc tích và chính xác",
    level: "B2" as const,
    text:
      "In professional communication, clarity and conciseness are paramount. " +
      "Wordy writing obscures your message and wastes the reader's time. " +
      "Compare: 'Due to the fact that the project was behind schedule, " +
      "we were unable to meet the deadline.' " +
      "With: 'Because the project was delayed, we missed the deadline.' " +
      "The second version uses 10 fewer words and is far clearer. " +
      "Redundant phrases such as 'past history', 'future plans', and 'new innovation' " +
      "should be eliminated. History is always past; plans are future; innovations are new. " +
      "Passive constructions, while sometimes necessary, often add unnecessary length. " +
      "'The report was written by our team' becomes 'Our team wrote the report'. " +
      "Strong verbs replace weak noun phrases: 'make a decision' becomes 'decide'; " +
      "'give assistance to' becomes 'help'. " +
      "Precision in language signals intellectual rigour and respect for the reader.",
    questions: [
      {
        id: "u37r-q1",
        question_vn: "Theo đoạn văn, điều gì là quan trọng nhất trong giao tiếp chuyên nghiệp?",
        options: [
          "Using many technical terms",
          "Clarity and conciseness",
          "Writing long detailed sentences",
          "Using formal passive structures",
        ],
        answer: "Clarity and conciseness",
        explanation_vn: "'In professional communication, clarity and conciseness are paramount.'",
      },
      {
        id: "u37r-q2",
        question_vn: "Phiên bản ngắn hơn của câu ví dụ ngắn hơn bao nhiêu từ?",
        options: ["5 words", "8 words", "10 words", "15 words"],
        answer: "10 words",
        explanation_vn: "'The second version uses 10 fewer words and is far clearer.'",
      },
      {
        id: "u37r-q3",
        question_vn: "Ví dụ nào sau đây là cụm từ dư thừa theo đoạn văn?",
        options: [
          "'annual report'",
          "'past history'",
          "'team meeting'",
          "'quarterly review'",
        ],
        answer: "'past history'",
        explanation_vn: "'Redundant phrases such as past history, future plans, and new innovation should be eliminated.'",
      },
      {
        id: "u37r-q4",
        question_vn: "Cụm từ 'give assistance to' nên được thay bằng từ gì?",
        options: ["Support", "Aid", "Help", "Assist"],
        answer: "Help",
        explanation_vn: "'give assistance to' becomes 'help'.",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Writing concise business reports",
      focus: "precise language in emails/proposals",
      context: "professional writing",
      l1Note: "⚠️ 'Concise' formal. Người VN hay dùng từ thừa. 'To sum up' vs 'In summary'.",
      example: "To summarize the findings, the market is expanding rapidly."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "XeI1m0B59PY",
};

export default unit37;
