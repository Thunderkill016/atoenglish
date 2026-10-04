import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-42 — B2 Final Assessment  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit42: UnitData = {
  unitId: "unit-42",
  title: "Unit 42: B2 Final Assessment",
  level: "B2",
  xp: 200,
  estimatedTime: 90,
  description: "B2 Complete — Bài đánh giá năng lực cuối cùng tổng hợp toàn bộ chương trình học từ A0 đến B2. Cấu trúc bài thi bao quát các dạng bài IELTS Reading, Listening và TOEIC Part 5/6/7. Cột mốc chứng nhận trình độ tương đương IELTS 6.5 / TOEIC 785+.",
  badgeName: "Bậc Thầy Tiếng Anh",
  badgeEmoji: "🏆",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn tham gia buổi phỏng vấn đánh giá năng lực cuối kỳ và hoàn thành bài thi chứng chỉ B2 của AtoEnglish. Bạn cần sử dụng kết hợp tất cả các kiến thức từ vựng học thuật, kỹ năng đàm phán, viết email, thuyết trình và các cấu trúc ngữ pháp nâng cao để khẳng định trình độ tiếng Anh của mình.",
  learningOutcomes: [
    "Sử dụng thành thạo và linh hoạt toàn bộ hệ thống ngữ pháp A0-B2 trong mọi ngữ cảnh",
    "Hoàn thành tốt các câu hỏi thi thử mô phỏng đề thi thực tế IELTS và TOEIC",
    "Đạt trình độ độc lập hoàn toàn (CEFR B2), đủ điều kiện làm việc trong môi trường quốc tế",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Chúc mừng bạn đã đi đến chặng đường cuối cùng! Đạt trình độ <span class="text-emerald-400 font-semibold">CEFR B2 (IELTS 6.5 / TOEIC 785+)</span> nghĩa là bạn đã có khả năng tự tin làm việc trong môi trường quốc tế, hiểu các văn bản chuyên ngành và giao tiếp tự nhiên không gặp trở ngại lớn. Đây là bệ phóng vững chắc để bạn tiếp tục phát triển sự nghiệp toàn cầu.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🏆", en: "Having completed all forty-two units, I feel ready for the exam.", vn: "Sau khi hoàn thành tất cả bốn mươi hai bài học, tôi cảm thấy sẵn sàng cho kỳ thi.", context: "Having completed — Perfect Participle" },
    { emoji: "🎓", en: "By next week, I will have received my B2 certificate.", vn: "Trước tuần tới, tôi sẽ đã nhận được chứng chỉ B2 của mình.", context: "will have received — Future Perfect" },
    { emoji: "💪", en: "Rarely has anyone demonstrated such dedication to learning.", vn: "Hiếm khi có ai thể hiện sự cống hiến lớn lao như vậy đối với việc học.", context: "Rarely has anyone demonstrated — Inversion" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "expertise", emoji: "🎓", phonetic: "/ˌekspɜːˈtiːz/", meaning: "chuyên môn / kinh nghiệm chuyên sâu", example: "Her expertise in business administration is widely recognized.", example2: "We need to leverage our collective expertise.", collocation: "technical expertise / develop expertise / area of expertise", audio: "/audio/unit-42/expertise.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "sustainable", emoji: "♻️", phonetic: "/səˈsteɪnəbəl/", meaning: "bền vững", example: "A sustainable economy requires clean energy.", example2: "We must adopt sustainable business practices.", collocation: "sustainable energy / sustainable development / sustainable growth", audio: "/audio/unit-42/sustainable.mp3", l1_interference_vn: "⚠️ Thường trước danh từ: \'sustainable development/energy/growth\'." },
    { id: 3, word: "implementation", emoji: "⚙️", phonetic: "/ˌɪmplɪmenˈteɪʃən/", meaning: "sự triển khai / thực hiện", example: "The successful implementation of the system took months.", example2: "We monitored the project implementation closely.", collocation: "project implementation / successful implementation", audio: "/audio/unit-42/implementation.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'implementation' trong câu trang trọng." },
    { id: 4, word: "collaborate", emoji: "🤝", phonetic: "/kəˈlæbəreɪt/", meaning: "cộng tác", example: "We collaborated with partners in Singapore to launch the app.", example2: "Let's collaborate on the next research paper.", collocation: "collaborate with / collaborate on", audio: "/audio/unit-42/collaborate.mp3", l1_interference_vn: "⚠️ 'collaborate' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 5, word: "alternative", emoji: "🔄", phonetic: "/ɒlˈtɜːnətɪv/", meaning: "lựa chọn thay thế", example: "Is there a feasible alternative to this plan?", example2: "We had to find an alternative route.", collocation: "alternative solution / alternative energy / find an alternative", audio: "/audio/unit-42/alternative.mp3", l1_interference_vn: "⚠️ \'Alternative TO\': \'an alternative to driving\'. Giới từ \'to\', không phải \'of\' hay \'for\'." },
    { id: 6, word: "resolution", emoji: "✅", phonetic: "/ˌrezəˈluːʃən/", meaning: "sự giải quyết / nghị quyết", example: "Conflict resolution is a crucial management skill.", example2: "The dispute was brought to a successful resolution.", collocation: "conflict resolution / final resolution", audio: "/audio/unit-42/resolution.mp3", l1_interference_vn: "⚠️ 'Resolution' trong business = giải quyết xung đột (không chỉ 'nghị quyết')." },
    { id: 7, word: "compliance", emoji: "🛡️", phonetic: "/kənˈplaɪəns/", meaning: "sự tuân thủ quy định/pháp luật", example: "The factory is in compliance with all safety standards.", example2: "We must ensure compliance with corporate policies.", collocation: "in compliance with / ensure compliance / compliance officer", audio: "/audio/unit-42/compliance.mp3", l1_interference_vn: "⚠️ 'In compliance with' là cụm cố định. Người VN hay nói 'comply to' sai giới từ." },
    { id: 8, word: "environmental degradation", emoji: "🍂", phonetic: "/ɪnˌvaɪrənˈmentəl ˌdeɡrəˈdeɪʃən/", meaning: "sự suy thoái môi trường", example: "Deforestation is a major cause of environmental degradation.", example2: "We must act to slow down environmental degradation.", collocation: "prevent environmental degradation / cause environmental degradation", audio: "/audio/unit-42/environmental_degradation.mp3" },
    { id: 9, word: "artificial intelligence", emoji: "🤖", phonetic: "/ˌɑːtɪˈfɪʃəl ɪnˈtelɪdʒəns/", meaning: "trí tuệ nhân tạo (AI)", example: "Artificial intelligence is changing software development.", example2: "Many corporate tasks are now automated by artificial intelligence.", collocation: "development of artificial intelligence / artificial intelligence system", audio: "/audio/unit-42/artificial_intelligence.mp3" },
    { id: 10, word: "nevertheless", emoji: "⚖️", phonetic: "/ˌnevəðəˈles/", meaning: "tuy nhiên / mặc dù vậy", example: "The risk was high; nevertheless, we signed the contract.", example2: "He was tired; nevertheless, he completed the report.", collocation: "nevertheless, S + V / but nevertheless", audio: "/audio/unit-42/nevertheless.mp3", l1_interference_vn: "⚠️ 'Nevertheless' trang trọng hơn 'but'. Thường đứng đầu câu hoặc sau ; . Hay bị lạm dụng 'however'." },
    { id: 11, word: "consequence", emoji: "💥", phonetic: "/ˈkɒnsɪkwəns/", meaning: "hậu quả / hệ quả", example: "Climate change has severe consequences for agriculture.", example2: "You must accept the consequences of your actions.", collocation: "severe consequences / negative consequence", audio: "/audio/unit-42/consequence.mp3", l1_interference_vn: "⚠️ \'Consequence OF\': \'consequences of climate change\'. Giới từ \'of\', không phải \'from\'." },
    { id: 12, word: "validate", emoji: "✔️", phonetic: "/ˈvælɪdeɪt/", meaning: "xác thực / phê chuẩn", example: "We gathered data to validate our business model.", example2: "The manager validated the signature on the contract.", collocation: "validate data / validate a contract / validate findings", audio: "/audio/unit-42/validate.mp3", l1_interference_vn: "⚠️ 'Validate findings' trong academic = chứng minh bằng dữ liệu. Hay dịch sai thành 'xác nhận' thông thường." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Buổi phỏng vấn tốt nghiệp và định hướng",
      audio: "/audio/unit-42/dialogue_1.mp3",
      desc: "Trang thực hiện cuộc hội thoại tổng kết với giám khảo để nhận chứng chỉ B2.",
      lines: [
        { id: "d1-1", speaker: "Examiner", text: "Trang, congratulations on reaching the final unit! Reflecting on your journey, what has been your greatest achievement?", translation: "Trang, chúc mừng bạn đã đạt đến bài học cuối cùng! Nhìn lại hành trình của bạn, thành tựu lớn nhất là gì?" },
        { id: "d1-2", speaker: "Trang", text: "Having completed the curriculum, I feel confident speaking English. Not only did I expand my vocabulary, but I also mastered B2 grammar.", translation: "Sau khi hoàn thành chương trình học, tôi cảm thấy tự tin nói tiếng Anh. Tôi không những mở rộng vốn từ vựng mà còn thành thạo ngữ pháp B2." },
        { id: "d1-3", speaker: "Examiner", text: "Indeed. Your usage of inversion is impressive. What would you have done differently if you started again?", translation: "Thực sự vậy. Cách bạn sử dụng đảo ngữ rất ấn tượng. Bạn đã làm gì khác đi nếu bạn được bắt đầu lại?" },
        { id: "d1-4", speaker: "Trang", text: "If I had started sooner, I would be even more fluent now. Nevertheless, I am proud of my progress. I can now collaborate globally.", translation: "Nếu tôi bắt đầu sớm hơn, bây giờ tôi đã có thể trôi chảy hơn nữa rồi. Tuy nhiên, tôi tự hào về sự tiến bộ của mình. Bây giờ tôi có thể cộng tác trên toàn cầu." },
        { id: "d1-5", speaker: "Examiner", text: "You should be. Your B2 expertise is validated. You have officially completed the program!", translation: "Bạn nên tự hào. Chuyên môn B2 của bạn đã được xác thực. Bạn đã chính thức hoàn thành chương trình!" },
      ],
    },
    {
      id: 2,
      title: "Thảo luận về cơ hội nghề nghiệp tương lai",
      audio: "/audio/unit-42/dialogue_2.mp3",
      desc: "Huy và Sarah thảo luận về kế hoạch xin việc quốc tế sau khi đạt B2.",
      lines: [
        { id: "d2-1", speaker: "Sarah", text: "Huy, now that you've completed B2, are you going to apply for the multinational manager position?", translation: "Huy, bây giờ bạn đã hoàn thành B2, bạn có định nộp đơn vào vị trí quản lý tập đoàn đa quốc gia không?" },
        { id: "d2-2", speaker: "Huy", text: "Yes. Unless I apply, I won't know if my expertise matches their criteria. I want to lead digital transformation projects.", translation: "Có chứ. Trừ khi tôi nộp đơn, tôi sẽ không biết chuyên môn của mình có khớp với tiêu chí của họ không. Tôi muốn dẫn dắt các dự án chuyển đổi số." },
        { id: "d2-3", speaker: "Sarah", text: "I'm sure you will succeed, provided that you showcase your problem-solving skills in the interview.", translation: "Tôi chắc chắn bạn sẽ thành công, miễn là bạn thể hiện được kỹ năng giải quyết vấn đề của mình trong buổi phỏng vấn." },
        { id: "d2-4", speaker: "Huy", text: "Thank you. What we need now is a celebration! Let's go to a cafe.", translation: "Cảm ơn bạn. Điều chúng ta cần bây giờ là một buổi ăn mừng! Chúng ta hãy đi cà phê thôi." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Having completed the curriculum, I feel confident speaking.", options: ["I feel confident speaking before starting the curriculum.", "Having completed the curriculum, I feel confident speaking.", "I will start the curriculum to become confident.", "Speaking confidence is not related to the curriculum."], answer: "Having completed the curriculum, I feel confident speaking." },
    { id: "lac2", audio_text: "If I had started sooner, I would be even more fluent now.", options: ["I started early so I am very fluent now.", "If I had started sooner, I would be even more fluent now.", "I will start early to be fluent now.", "Starting early did not help my fluency."], answer: "If I had started sooner, I would be even more fluent now." },
    { id: "lac3", audio_text: "Rarely has anyone demonstrated such dedication to learning.", options: ["Everyone demonstrates dedication to learning in our class.", "Rarely has anyone demonstrated such dedication to learning.", "Dedicated learning is common in our school.", "Dedication to learning is not demonstrated here."], answer: "Rarely has anyone demonstrated such dedication to learning." },
    { id: "lac4", audio_text: "The factory is in compliance with all safety standards.", options: ["The factory is in compliance with all safety standards.", "The factory violated the safety standards yesterday.", "Compliance is not required in the factory.", "We will ensure safety standards next year."], answer: "The factory is in compliance with all safety standards." },
    { id: "lac5", audio_text: "We gathered data to validate our business model.", options: ["We validated the data before building the business model.", "We gathered data to validate our business model.", "Our business model failed despite the data.", "We will gather data next year to check our business model."], answer: "We gathered data to validate our business model." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Having {input} the B2 level, I feel ready to {input} in a {input} environment.",
    level1Placeholder: "Ví dụ: completed — collaborate — global...",
    level2Situation: "Bạn phát biểu trong buổi lễ tốt nghiệp hoặc phỏng vấn đánh giá. Hãy: (1) Khẳng định rằng bạn đã tích lũy chuyên môn B2 thành công, (2) Giải thích rằng nếu không có phương pháp học tập đúng đắn, bạn đã không đạt kết quả hôm nay, (3) Bày tỏ quyết tâm tiếp tục hợp tác quốc tế.",
    level2Hint: "Having completed the curriculum, I have accumulated valuable expertise. If I had not practiced daily with AtoEnglish, I would not be fluent today. Consequently, I am ready to collaborate with global partners and meet all professional criteria.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "A0-B2 Grammar Review — Tổng Hợp Ngữ Pháp Toàn Diện",
    rule: "Chúc mừng bạn đã hoàn thành toàn bộ hệ thống ngữ pháp A0-B2. Hãy xem lại bản đồ ngữ pháp cốt lõi của bạn:\n\n1. A0-A2: Verb BE, Thời gian, Số đếm, Hiện tại đơn, Quá khứ đơn, Tương lai đơn (will/going to), Hiện tại hoàn thành.\n2. B1: Quá khứ tiếp diễn, Quá khứ hoàn thành, Tương lai hoàn thành, Động từ khuyết thiếu mở rộng, Câu điều kiện loại 0 & 1, Thể bị động cơ bản, Mệnh đề quan hệ xác định, Danh động từ & Động từ nguyên mẫu.\n3. B2: Câu điều kiện loại 2 & 3, Câu điều kiện hỗn hợp, Bị động học thuật nâng cao, Mệnh đề phân từ rút gọn, Đảo ngữ, Câu chẻ nhấn mạnh, Động từ khuyết thiếu hoàn thành (Modal Perfect), Từ nối liên kết nâng cao.",
    examples: [
      { en: "Not only did she complete the assessment, but she also scored 100%. (Inversion)", vn: "Không những cô ấy hoàn thành bài đánh giá, mà cô ấy còn đạt điểm tuyệt đối 100%." },
      { en: "If we had not negotiated, we would face a dispute now. (Mixed Conditional)", vn: "Nếu chúng ta không đàm phán, chúng ta đã đối mặt với tranh chấp bây giờ." },
      { en: "It was the implementation of AI that enhanced our database. (Cleft sentence)", vn: "Chính sự triển khai trí tuệ nhân tạo đã nâng cao cơ sở dữ liệu của chúng ta." },
    ],
    tip: "Chìa khóa để giữ vững trình độ B2 và tiến lên C1 là tiếp tục đọc các tài liệu tiếng Anh thực tế (báo chí như The Economist, New Scientist) và thực hành nói phản xạ hàng ngày, áp dụng các từ nối chuyển tiếp nhuần nhuyễn.",
    vnNote: "⚠️ Hãy luôn lưu ý sửa các lỗi phát âm đuôi (coda) mà người Việt hay mắc phải: /s/, /t/, /d/, /k/ để bài nói của bạn đạt chuẩn phát âm quốc tế IELTS 6.5+.",
    dialogueExample: {
      speaker: "Trang",
      text: "Having completed the curriculum, I feel confident speaking English. Not only did I expand my vocabulary, but I also mastered B2 grammar.",
      translation: "Sau khi hoàn thành chương trình học, tôi cảm thấy tự tin nói tiếng Anh. Tôi không những mở rộng vốn từ vựng mà còn thành thạo ngữ pháp B2.",
      highlight: "Having completed (phân từ hoàn thành) | Not only did I expand (đảo ngữ) — sự tích hợp ngữ pháp B2 đỉnh cao",
    },
    ccq: {
      question: "Câu nào là ví dụ chuẩn của câu điều kiện hỗn hợp (Quá khứ giả định ảnh hưởng đến hiện tại)?",
      options: [
        "If I had time, I would help you yesterday.",
        "If I had had time yesterday, I would be helping you now.",
        "If I had had time yesterday, I would have helped you.",
        "If I have time now, I will help you.",
      ],
      answer: "If I had had time yesterday, I would be helping you now.",
      explanation: "'If I had had' (Quá khứ hoàn thành - giả định quá khứ) kết hợp với 'would be V-ing' (giả định hiện tại) tạo thành câu điều kiện hỗn hợp.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'Rarely ___ our developers encountered such a server crash.'", options: ["do", "did", "have", "had"], answer: "have" },
    { id: "pq2", type: "multiple-choice", question: "Chọn từ nối thích hợp: 'We worked hard; ___ (do đó) we achieved our target.'", options: ["consequently", "nevertheless", "furthermore", "whereas"], answer: "consequently" },
    { id: "pq3", type: "cloze", question: "Điền dạng đúng của động từ: 'If he had not invested in AI, he ___ (be/phủ định) successful now.'", answer: "would not be" },
    { id: "pq4", type: "multiple-choice", question: "Chọn từ điền: 'The company is in ___ with safety standards.'", options: ["compliance", "expertise", "resolution", "alternative"], answer: "compliance" },
    { id: "pq5", type: "cloze", question: "Điền dạng phân từ hoàn thành: '___ (complete) the assessment, he celebrated.'", answer: "Having completed" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng học thuật cấp độ B2 với nghĩa đúng",
    pairs: [
      { left: "expertise", right: "chuyên môn chuyên sâu" },
      { left: "compliance", right: "sự tuân thủ quy định" },
      { left: "resolution", right: "sự giải quyết" },
      { left: "validate", right: "xác thực / phê duyệt" },
      { left: "consequence", right: "hậu quả / hệ quả" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Chúng tôi cần tiến hành đánh giá để xác thực kết quả.",
      answer: "We need to conduct an evaluation to validate the results.",
    },
    {
      id: "pt-2",
      prompt_vn: "Sau khi hoàn thành chương trình, tôi cảm thấy tự tin giao tiếp trong môi trường quốc tế.",
      answer: "Having completed the curriculum, I feel confident communicating in an international environment.",
    },
    {
      id: "pt-3",
      prompt_vn: "Nhà máy đang tuân thủ đầy đủ các tiêu chuẩn an toàn.",
      answer: "The factory is in full compliance with all safety standards.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc42-1",
      sentence: "Had I known, I would of helped you immediately.",
      errorWord: "would of helped",
      correction: "would have helped",
      explanation_vn: "'Would HAVE helped' — 'of' là lỗi phát âm của 'have'. Luôn viết 'would have', không 'would of'.",
    },
    {
      id: "sc42-2",
      sentence: "The man whom I spoke with him was very helpful.",
      errorWord: "with him",
      correction: "with",
      explanation_vn: "'Whom I spoke with' — 'whom' đã thay thế 'him'. Không cần lặp lại 'him'. 'Spoke with whom' = 'spoke with him'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la42-1",
      audio_text: "Had I known I would have helped you right away.",
      prompt_vn: "Nếu tôi biết tôi đã giúp bạn ngay.",
      words: ["Had", "I", "known", "I", "would", "have", "helped", "you", "right", "away", ".", "would of", "knew"],
      answer: "Had I known I would have helped you right away .",
    },
    {
      id: "la42-2",
      audio_text: "The results were far better than we expected.",
      prompt_vn: "Kết quả tốt hơn nhiều so với chúng tôi mong đợi.",
      words: ["The", "results", "were", "far", "better", "than", "we", "expected", ".", "was", "good"],
      answer: "The results were far better than we expected .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Chính sự chuyển đổi số đã nâng cao hiệu suất của chúng tôi.",
      words: ["It", "was", "digital", "transformation", "that", "enhanced", "our", "performance", ".", "might", "should"],
      answer: "It was digital transformation that enhanced our performance .",
    },
    {
      id: "wb2",
      prompt_vn: "Không những họ đạt chỉ tiêu, họ còn cắt giảm chi phí.",
      words: ["Not", "only", "did", "they", "meet", "targets", ",", "they", "also", "cut", "costs", ".", "might", "should"],
      answer: "Not only did they meet targets , they also cut costs .",
    },
    {
      id: "wb3",
      prompt_vn: "Hiếm khi có học sinh nào đạt điểm tuyệt đối 100%.",
      words: ["Rarely", "does", "any", "student", "achieve", "a", "perfect", "score", ".", "might", "should"],
      answer: "Rarely does any student achieve a perfect score .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s42-1", prompt_vn: "Chính sự chuyển đổi số đã nâng cao hiệu suất của chúng tôi.", words: ["It", "was", "digital", "transformation", "that", "enhanced", "our", "performance", "."], answer: "It was digital transformation that enhanced our performance ." },
    { id: "s42-2", prompt_vn: "Không những họ đạt chỉ tiêu, họ còn cắt giảm chi phí.", words: ["Not", "only", "did", "they", "meet", "targets", ",", "they", "also", "cut", "costs", "."], answer: "Not only did they meet targets , they also cut costs ." },
    { id: "s42-3", prompt_vn: "Hiếm khi có học sinh nào đạt điểm tuyệt đối 100%.", words: ["Rarely", "does", "any", "student", "achieve", "a", "perfect", "score", "."], answer: "Rarely does any student achieve a perfect score ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn dạng đúng: 'The new system is claimed ___ performance by thirty percent.'", options: ["to enhance", "to have enhanced", "enhancing", "enhanced"], answer: "to have enhanced" },
    { id: "fq2", type: "cloze", question: "Điền từ nối: 'He was tired; ___ (tuy nhiên), he kept studying.'", answer: "nevertheless" },
    { id: "fq3", type: "multiple-choice", question: "Chọn câu đúng: '___ (trừ khi) you agree to our terms, we will terminate the contract.'", options: ["Unless", "As long as", "Provided that", "Even if"], answer: "Unless" },
    { id: "fq4", type: "translate", question: "Dịch: 'Chúng tôi cần tiến hành đánh giá để xác thực kết quả.'", answer: "We need to conduct an evaluation to validate the results." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào mô tả việc 'tác động lên hành vi của ai đó'?", options: ["validate", "influence", "leverage", "assert"], answer: "influence" },
    { id: "q-ex1", type: "multiple-choice", question: "B2 Review — Mixed Conditional đúng:", options: ["If I had known, I would tell you.", "If I had known, I would have told you.", "If I knew, I would have told you.", "If I know, I would tell you."], answer: "If I had known, I would have told you." },
    { id: "q-ex2", type: "multiple-choice", question: "Bị động hoàn thành đúng:", options: ["The work has done.", "The work has been done.", "The work had done.", "The work is been done."], answer: "The work has been done." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'Despite ___ tired, she continued working.'", answer: "being" },
    { id: "q-ex4", type: "multiple-choice", question: "Câu nhấn mạnh (cleft) đúng:", options: ["It is you who are right.", "It is you that is right.", "It was you who are right.", "It is you which is right."], answer: "It is you who are right." },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Lẽ ra anh ấy không nên nói như vậy.'", answer: "He shouldn't have said that." },
    { id: "q-ex6", type: "multiple-choice", question: "Modal perfect 'must have + V3' diễn tả:", options: ["Nghĩa vụ trong QK", "Suy luận chắc chắn về QK", "Khả năng trong TL", "Điều kiện QK"], answer: "Suy luận chắc chắn về QK" },
    { id: "q-ex7", type: "multiple-choice", question: "Từ nối học thuật tốt nhất để tương phản:", options: ["but", "however", "and", "so"], answer: "however" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr42-1", question: "Ôn tập Unit 41 — Chọn từ thích hợp: 'Urbanization has caused severe environmental ___.'", options: ["degradation", "wellbeing", "deforestation", "infrastructure"], answer: "degradation", type: "multiple-choice" },
    { id: "cr42-2", question: "Ôn tập Unit 40 — Điền: 'She practices daily, ___ (nhờ đó) improving her fluency.'", options: [], answer: "thereby", type: "cloze" },
    { id: "cr42-3", question: "Ôn tập Unit 39 — Chọn dạng đúng: 'He ___ (forget) his keys because the car is locked.'", options: ["must have forgotten", "can't have forgotten", "should have forgotten", "might forget"], answer: "must have forgotten", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "final consonants",
    description: "Ôn tập toàn bộ — focus vào 5 lỗi phổ biến nhất người Việt B2",
    examples: [
        { word: "final consonants", ipa: "/t, d, k, p/", tip: "Âm cuối /t,d,k,p/ hay bị bỏ — walked /wɔːkt/ không phải /wɔːk/" },
        { word: "long word stress", ipa: "/ˌɛnˌvaɪrənˈmɛntl/", tip: "environmental — stress âm 4: en-vi-ron-MEN-tal" },
    ],
    minimalPairs: [
        ["walked /t/", "walk (bỏ /t/ — sai)"],
        ["must've", "must have (formal)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Having completed B2, I feel ready", vn: "Sau khi hoàn thành B2, tôi thấy sẵn sàng" },
      { en: "Not only did we hit our target", vn: "Chúng tôi không những đạt chỉ tiêu" },
      { en: "If I had started sooner, I would be", vn: "Nếu tôi bắt đầu sớm hơn, giờ tôi đã..." },
      { en: "We must ensure compliance with rules", vn: "Chúng ta phải đảm bảo tuân thủ quy tắc" },
      { en: "AI is transforming digital transformation", vn: "AI đang thay đổi chuyển đổi số" },
      { en: "We need to validate the research findings", vn: "Chúng ta cần xác thực phát hiện nghiên cứu" },
      { en: "Urbanization causes environmental degradation", vn: "Đô thị hóa gây ra sự suy thoái môi trường" },
      { en: "I am ready to collaborate globally", vn: "Tôi đã sẵn sàng cộng tác trên toàn cầu" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit42-reading-1",
    title: "Your B2 Achievement",
    title_vn: "Đọc đoạn ôn tập tổng hợp B2 — Chặng đường bạn đã đi qua",
    level: "B2" as const,
    text:
      "Reaching B2 level in English is a remarkable achievement that opens significant doors. " +
      "At this level, you can understand the main ideas of complex texts on both concrete and abstract topics. " +
      "You can interact with a degree of fluency and spontaneity that makes regular interaction " +
      "with native speakers quite possible without strain for either party. " +
      "You can produce clear, detailed text on a wide range of subjects. " +
      "You can explain a viewpoint on a topical issue giving the advantages and disadvantages. " +
      "In a professional context, B2 allows you to participate confidently in negotiations, " +
      "deliver polished presentations, and write detailed reports and proposals. " +
      "You have mastered conditionals, advanced passives, modal verbs for deduction, " +
      "cohesive devices, and academic writing conventions. " +
      "The journey from A0 to B2 requires dedication, consistency, and courage. " +
      "Whatever your next goal — C1, IELTS, or simply better workplace communication — " +
      "the foundation you have built here will serve you for life.",
    questions: [
      {
        id: "u42r-q1",
        question_vn: "Ở trình độ B2, bạn có thể hiểu loại văn bản nào?",
        options: [
          "Only simple texts on familiar topics",
          "The main ideas of complex texts on concrete and abstract topics",
          "Only spoken English from native speakers",
          "Technical manuals and scientific papers",
        ],
        answer: "The main ideas of complex texts on concrete and abstract topics",
        explanation_vn: "'you can understand the main ideas of complex texts on both concrete and abstract topics.'",
      },
      {
        id: "u42r-q2",
        question_vn: "Điều gì giúp giao tiếp với người bản ngữ trở nên dễ dàng hơn ở B2?",
        options: [
          "Perfect pronunciation",
          "A degree of fluency and spontaneity",
          "Knowing every grammar rule",
          "Having a large vocabulary only",
        ],
        answer: "A degree of fluency and spontaneity",
        explanation_vn: "'You can interact with a degree of fluency and spontaneity.'",
      },
      {
        id: "u42r-q3",
        question_vn: "Điều gì cần thiết cho hành trình từ A0 đến B2?",
        options: [
          "A language school certificate",
          "Dedication, consistency, and courage",
          "Living abroad",
          "Native speaker friends",
        ],
        answer: "Dedication, consistency, and courage",
        explanation_vn: "'The journey from A0 to B2 requires dedication, consistency, and courage.'",
      },
      {
        id: "u42r-q4",
        question_vn: "Theo đoạn văn, những gì bạn đã học sẽ có ích trong bao lâu?",
        options: [
          "Until you reach C1",
          "For the next five years",
          "Only for IELTS preparation",
          "For life",
        ],
        answer: "For life",
        explanation_vn: "'the foundation you have built here will serve you for life.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Final project presentation and Q&A",
      focus: "B2 assessment in professional setting",
      context: "pitch to stakeholders",
      l1Note: "⚠️ Use advanced vocab from unit. 'Deploy' for implementation.",
      example: "We have deployed the strategy successfully. Sustainability is key."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "SKRhFCaFMpI",
};

export default unit42;
