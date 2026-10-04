import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-40 — Linking & Cohesion  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit40: UnitData = {
  unitId: "unit-40",
  title: "Unit 40: Linking & Cohesion",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Discourse Markers — Các từ nối và liên từ liên kết nâng cao (nevertheless, consequently, furthermore, thereby, whereas). Công cụ tối quan trọng để đạt điểm 6.5+ tiêu chí Coherence & Cohesion trong IELTS Writing Task 2.",
  badgeName: "Nhà Hùng Biện",
  badgeEmoji: "✒️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Soạn thảo bài luận học thuật hoặc báo cáo phân tích chiến lược của công ty. Bạn cần liên kết các ý kiến tương phản, nguyên nhân - kết quả và bổ sung thông tin một cách mượt mà, logic bằng các liên từ chuyển tiếp nâng cao.",
  learningOutcomes: [
    "Sử dụng các từ nối nâng cao để thể hiện sự đối lập, kết quả và bổ sung ý nghĩa",
    "Đảm bảo sự mạch lạc (coherence) và tính liên kết (cohesion) trong văn bản dài",
    "Sử dụng từ vựng về cấu trúc văn bản học thuật ở mức độ B2+",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong viết học thuật tiếng Anh, việc lặp đi lặp lại các từ nối cơ bản như "but", "so", "and" hoặc "because" sẽ kéo băng điểm Cohesion xuống dưới 6.0. Sử dụng các từ thay thế trang trọng hơn như <span class="text-emerald-400">"nevertheless"</span> (tuy nhiên), <span class="text-emerald-400">"consequently"</span> (do đó), và <span class="text-emerald-400">"furthermore"</span> (hơn nữa) giúp văn bản mang sắc thái học thuật rõ nét.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "✒️", en: "Furthermore, the new policy will enhance workplace safety.", vn: "Hơn nữa, chính sách mới sẽ nâng cao an toàn nơi làm việc.", context: "Furthermore — bổ sung thông tin (in addition)" },
    { emoji: "⚖️", en: "Sales increased; nevertheless, profits declined due to high costs.", vn: "Doanh số tăng; tuy nhiên, lợi nhuận lại giảm do chi phí cao.", context: "nevertheless = tuy nhiên (however)" },
    { emoji: "📈", en: "We optimized the code, thereby reducing the loading time.", vn: "Chúng tôi đã tối ưu hóa mã nguồn, bằng cách đó giảm thời gian tải trang.", context: "thereby + V-ing = bằng cách đó" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "nevertheless", emoji: "⚖️", phonetic: "/ˌnevəðəˈles/", meaning: "tuy nhiên / mặc dù vậy", example: "The match was wet; nevertheless, we enjoyed it.", example2: "Profits declined; nevertheless, the company expanded.", collocation: "nevertheless, S + V / but nevertheless / nevertheless true", audio: "/audio/unit-40/nevertheless.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "consequently", emoji: "💥", phonetic: "/ˈkɒnsɪkwəntli/", meaning: "do đó / kết quả là", example: "He forgot his passport; consequently, he missed the flight.", example2: "The system crashed; consequently, data was lost.", collocation: "consequently, S + V / and consequently", audio: "/audio/unit-40/consequently.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'consequently' trong câu trang trọng." },
    { id: 3, word: "furthermore", emoji: "➕", phonetic: "/ˌfɜːðəˈmɔːr/", meaning: "hơn nữa / vả lại", example: "The smartphone has a great camera; furthermore, it has long battery life.", example2: "He is highly qualified; furthermore, he has ten years of experience.", collocation: "furthermore, S + V / and furthermore", audio: "/audio/unit-40/furthermore.mp3", l1_interference_vn: "⚠️ 'furthermore' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "thereby", emoji: "🎯", phonetic: "/ˌðeəˈbaɪ/", meaning: "bằng cách đó / nhờ đó", example: "She practice daily, thereby improving her speaking skills.", example2: "He signed the contract, thereby securing the deal.", collocation: "thereby + V-ing / thereby obtaining", audio: "/audio/unit-40/thereby.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'thereby' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "whereas", emoji: "↔️", phonetic: "/weərˈæz/", meaning: "trong khi / ngược lại", example: "Some people prefer tea, whereas others prefer coffee.", example2: "In Vietnam, traffic keeps to the right, whereas in the UK it keeps to the left.", collocation: "whereas S + V / but whereas", audio: "/audio/unit-40/whereas.mp3", l1_interference_vn: "⚠️ 'whereas' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "hence", emoji: "💡", phonetic: "/hens/", meaning: "vì thế / do đó", example: "The company lost capital; hence, the expansion was cancelled.", example2: "He was late, hence the manager was angry.", collocation: "hence, S + V / hence the name / ten years hence", audio: "/audio/unit-40/hence.mp3", l1_interference_vn: "⚠️ Trong email B2, 'hence' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "likewise", emoji: "🤝", phonetic: "/ˈlaɪkwaɪz/", meaning: "tương tự như vậy", example: "Water the plants daily; likewise, ensure they get sunlight.", example2: "Just as you respect others, likewise you will be respected.", collocation: "likewise, S + V / do likewise / and likewise", audio: "/audio/unit-40/likewise.mp3" },
    { id: 8, word: "transition", emoji: "🔄", phonetic: "/trænˈzɪʃən/", meaning: "sự chuyển tiếp / chuyển đổi", example: "The transition from B1 to B2 is very challenging.", example2: "The company is undergoing a digital transition.", collocation: "smooth transition / transition period / digital transition", audio: "/audio/unit-40/transition.mp3" },
    { id: 9, word: "cohesion", emoji: "🔗", phonetic: "/kəʊˈhiːʒən/", meaning: "sự liên kết / sự gắn kết", example: "The essay lacks cohesion; the paragraphs are disconnected.", example2: "Social cohesion is vital for a peaceful community.", collocation: "cohesion and coherence / lack cohesion / social cohesion", audio: "/audio/unit-40/cohesion.mp3" },
    { id: 10, word: "coherent", emoji: "🧠", phonetic: "/kəʊˈhɪərənt/", meaning: "chặt chẽ / mạch lạc / rõ ràng", example: "You must present a coherent argument in your writing.", example2: "She was too tired to give a coherent explanation.", collocation: "coherent argument / coherent strategy / make coherent", audio: "/audio/unit-40/coherent.mp3" },
    { id: 11, word: "subsequent", emoji: "📅", phonetic: "/ˈsʌbsɪkwənt/", meaning: "xảy ra sau đó / theo sau", example: "The subsequent investigation proved our innocence.", example2: "Subsequent events showed that we were wrong.", collocation: "subsequent years / subsequent events / subsequent analysis", audio: "/audio/unit-40/subsequent.mp3" },
    { id: 12, word: "notwithstanding", emoji: "🛡️", phonetic: "/ˌnɒtwɪðˈstændɪŋ/", meaning: "mặc dù / bất kể", example: "Notwithstanding the rain, the soccer match continued.", example2: "His achievements, notwithstanding his poor background, are amazing.", collocation: "notwithstanding the fact that / notwithstanding the difficulties", audio: "/audio/unit-40/notwithstanding.mp3" },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Biên tập bài luận IELTS Writing Task 2",
      audio: "/audio/unit-40/dialogue_1.mp3",
      desc: "Trang nhờ Linh sửa đổi từ nối để tăng điểm Cohesion cho bài viết.",
      lines: [
        { id: "d1-1", speaker: "Trang", text: "Linh, can you review my essay? I want to make sure the paragraphs are coherent.", translation: "Linh, bạn có thể xem bài luận của tôi không? Tôi muốn đảm bảo các đoạn văn mạch lạc." },
        { id: "d1-2", speaker: "Linh", text: "Sure. The arguments are logical; however, you used 'but' and 'so' too many times. It lacks academic cohesion.", translation: "Chắc chắn rồi. Các lập luận logic; tuy nhiên, bạn đã dùng 'but' và 'so' quá nhiều lần. Nó thiếu tính liên kết học thuật." },
        { id: "d1-3", speaker: "Trang", text: "What do you recommend? Should I substitute them with advanced discourse markers?", translation: "Bạn đề xuất gì? Tôi có nên thay thế chúng bằng các từ nối nâng cao không?" },
        { id: "d1-4", speaker: "Linh", text: "Yes. For example, replace 'so' with 'consequently'. Furthermore, you can use 'whereas' to contrast ideas.", translation: "Đúng vậy. Ví dụ, hãy thay 'so' bằng 'consequently'. Hơn nữa, bạn có thể dùng 'whereas' để so sánh đối lập các ý." },
        { id: "d1-5", speaker: "Trang", text: "Excellent. I will also use 'thereby' followed by a gerund. It will make the transition smoother.", translation: "Tuyệt quá. Tôi cũng sẽ dùng 'thereby' theo sau bởi danh động từ. Nó sẽ giúp sự chuyển tiếp mượt mà hơn." },
      ],
    },
    {
      id: 2,
      title: "Báo cáo tài chính doanh nghiệp",
      audio: "/audio/unit-40/dialogue_2.mp3",
      desc: "Huy và Sarah thảo luận về kết quả tài chính bất chấp khó khăn.",
      lines: [
        { id: "d2-1", speaker: "Sarah", text: "Notwithstanding the economic crisis, our division achieved a smooth transition to the new market.", translation: "Bất chấp cuộc khủng hoảng kinh tế, bộ phận của chúng ta đã đạt được sự chuyển tiếp suôn sẻ sang thị trường mới." },
        { id: "d2-2", speaker: "Huy", text: "Indeed. Consequently, our market share increased, whereas our competitors faced a decline.", translation: "Thực sự vậy. Do đó, thị phần của chúng ta tăng lên, trong khi đối thủ của chúng ta phải đối mặt với sự sụt giảm." },
        { id: "d2-3", speaker: "Sarah", text: "Likewise, our corporate reputation was enhanced. Hence, the board is pleased.", translation: "Tương tự như vậy, uy tín doanh nghiệp của chúng ta đã được nâng cao. Vì thế, ban giám đốc rất hài lòng." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "He forgot his passport; consequently, he missed the flight.", options: ["He missed the flight despite having his passport.", "He forgot his passport; consequently, he missed the flight.", "He will buy a passport after he flies.", "Consequently, he forgot his passport on the flight."], answer: "He forgot his passport; consequently, he missed the flight." },
    { id: "lac2", audio_text: "Notwithstanding the rain, the soccer match continued.", options: ["The soccer match was cancelled because of rain.", "Notwithstanding the rain, the soccer match continued.", "We played soccer yesterday before it rained.", "It rained but the soccer match was delayed."], answer: "Notwithstanding the rain, the soccer match continued." },
    { id: "lac3", audio_text: "Furthermore, the new policy will enhance workplace safety.", options: ["Furthermore, the new policy will enhance workplace safety.", "The new policy will damage workplace safety.", "We need to write a proposal about safety.", "Furthermore, safety is not important in this corporate."], answer: "Furthermore, safety is not important in this corporate." },
    { id: "lac4", audio_text: "She practice daily, thereby improving her speaking skills.", options: ["She does not practice but her speaking is good.", "She practice daily, thereby improving her speaking skills.", "She will improve her speaking tomorrow by practicing.", "Thereby, she practiced speaking skills daily."], answer: "She practice daily, thereby improving her speaking skills." },
    { id: "lac5", audio_text: "The essay lacks cohesion; the paragraphs are disconnected.", options: ["The essay is very coherent and well-structured.", "The essay lacks cohesion; the paragraphs are disconnected.", "We need to connect the writer with the editor.", "The essay had no paragraphs yesterday."], answer: "The essay lacks cohesion; the paragraphs are disconnected." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Sales increased; {input}, profits declined. {input}, we must cut costs.",
    level1Placeholder: "Ví dụ: nevertheless — consequently...",
    level2Situation: "Bạn đang viết phần kết luận của bài luận IELTS bàn về giao thông công cộng. Hãy: (1) Nói rằng bất chấp chi phí cao, tàu cao tốc mang lại lợi ích lớn, (2) Giải thích rằng nó giúp giảm ô nhiễm, nhờ đó nâng cao sức khỏe cộng đồng, (3) Tương tự như vậy, nó giúp tiết kiệm thời gian đi lại.",
    level2Hint: "Notwithstanding the high construction costs, high-speed trains offer great benefits. They reduce air pollution, thereby enhancing public health. Likewise, they help commuters save travel time. Consequently, governments should fund these projects.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Advanced Discourse Markers — Các Từ Nối Chuyển Tiếp Nâng Cao",
    rule: "Liên kết ý tưởng chặt chẽ giúp đạt điểm cao trong văn viết học thuật (IELTS Task 2) và giao tiếp doanh nghiệp:\n\n1. Contrast (Đối lập/Trái ngược):\n- nevertheless (tuy nhiên): Đứng đầu câu hoặc sau dấu chấm phẩy.\n  → 'Sales fell; nevertheless, we made profit.'\n- whereas (trong khi): Nối hai mệnh đề có tính chất so sánh đối lập.\n  → 'I love coding, whereas he prefers designing.'\n- notwithstanding (mặc dù / bất kể): Đứng trước danh từ.\n  → 'Notwithstanding the difficulties, we succeeded.'\n\n2. Cause & Effect (Nguyên nhân - Kết quả):\n- consequently (do đó/kết quả là): Diễn tả hệ quả logic.\n  → 'He broke the rules; consequently, he was dismissed.'\n- thereby + V-ing (bằng cách đó/nhờ đó): Nối mệnh đề chỉ phương thức và kết quả.\n  → 'We optimized the database, thereby saving storage.'\n- hence (vì thế): 'He studied hard, hence his success.'\n\n3. Addition (Bổ sung):\n- furthermore (hơn nữa): Thêm một ý kiến bổ trợ mạnh mẽ vào lập luận.",
    examples: [
      { en: "The technology is expensive; nevertheless, it is essential. (contrast with nevertheless)", vn: "Công nghệ đó rất đắt; tuy nhiên, nó rất thiết yếu." },
      { en: "He worked late, thereby finishing the report. (result with thereby + V-ing)", vn: "Anh ấy làm việc muộn, nhờ đó đã hoàn thành báo cáo." },
      { en: "She is highly skilled; furthermore, she speaks three languages. (addition with furthermore)", vn: "Cô ấy có kỹ năng rất cao; hơn nữa, cô ấy nói ba thứ tiếng." },
    ],
    tip: "Trong văn viết học thuật, tránh viết 'and' hoặc 'so' ở đầu câu. Hãy thay thế 'so' ở đầu câu bằng 'Consequently,' hoặc 'Hence,'. Cấu trúc này giúp bài viết của bạn trông trang trọng hơn hẳn.",
    vnNote: "⚠️ Chú ý cấu trúc với 'thereby': Sau 'thereby', động từ bắt buộc phải ở dạng V-ing. Lỗi phổ biến của người Việt: 'thereby reduces' hoặc 'thereby we reduce'. Đúng phải là: 'thereby reducing'.",
    dialogueExample: {
      speaker: "Linh",
      text: "Consequently, our market share increased, whereas our competitors faced a decline.",
      translation: "Do đó, thị phần của chúng ta tăng lên, trong khi đối thủ của chúng ta phải đối mặt với sự sụt giảm.",
      highlight: "Consequently (do đó) | whereas (trong khi) — sự kết hợp từ nối so sánh nguyên nhân hoàn hảo",
    },
    ccq: {
      question: "Chọn câu viết ĐÚNG cấu trúc ngữ pháp với từ nối 'thereby':",
      options: [
        "We reduced prices, thereby we attracted more customers.",
        "We reduced prices, thereby attracting more customers.",
        "We reduced prices, thereby to attract more customers.",
        "We reduced prices, thereby attracted more customers.",
      ],
      answer: "We reduced prices, thereby attracting more customers.",
      explanation: "Sau 'thereby' bắt buộc phải dùng V-ing (attracting) để chỉ kết quả/hệ quả của hành động trước đó.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn từ nối thích hợp: 'The company lost money; ___ it closed down.'", options: ["furthermore", "nevertheless", "consequently", "whereas"], answer: "consequently" },
    { id: "pq2", type: "multiple-choice", question: "Chọn từ điền: 'Some countries invest in solar energy, ___ others rely on coal.'", options: ["nevertheless", "consequently", "whereas", "hence"], answer: "whereas" },
    { id: "pq3", type: "cloze", question: "Điền dạng đúng của động từ: 'We digitized all files, thereby ___ (save) paper.'", answer: "saving" },
    { id: "pq4", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'in spite of':", options: ["nevertheless", "consequently", "furthermore", "notwithstanding"], answer: "notwithstanding" },
    { id: "pq5", type: "cloze", question: "Điền từ nối: 'Just as water is essential to life, ___ (tương tự như vậy) oxygen is necessary.'", answer: "likewise" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ nối học thuật với nghĩa đúng",
    pairs: [
      { left: "nevertheless", right: "tuy nhiên / mặc dù vậy" },
      { left: "consequently", right: "do đó / kết quả là" },
      { left: "whereas", right: "trong khi / trái lại" },
      { left: "thereby", right: "bằng cách đó / nhờ đó" },
      { left: "furthermore", right: "hơn nữa" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Một số người thích làm việc tại văn phòng, trong khi số khác thích làm việc từ xa.",
      answer: "Some people prefer working at the office, whereas others prefer working remotely.",
    },
    {
      id: "pt-2",
      prompt_vn: "Do đó, chúng tôi đã thay đổi chiến lược tiếp cận.",
      answer: "Consequently, we changed our approach strategy.",
    },
    {
      id: "pt-3",
      prompt_vn: "Tuy nhiên, kết quả vẫn chưa đạt như mong đợi.",
      answer: "Nevertheless, the results have not met expectations.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc40-1",
      sentence: "However, he went. But he didn't stay long.",
      errorWord: "However, he went. But",
      correction: "However, he went, but",
      explanation_vn: "'However' và 'but' đều là từ tương phản — dùng một trong hai, không cả hai trong cùng ý.",
    },
    {
      id: "sc40-2",
      sentence: "In addition of that, we need more resources.",
      errorWord: "In addition of",
      correction: "In addition to",
      explanation_vn: "'In addition TO + noun'. 'In addition of' không tồn tại trong tiếng Anh chuẩn.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la40-1",
      audio_text: "Moreover the study shows very positive results.",
      prompt_vn: "Hơn nữa nghiên cứu cho thấy kết quả rất tích cực.",
      words: ["Moreover", "the", "study", "shows", "very", "positive", "results", ".", "Furthermore", "However"],
      answer: "Moreover the study shows very positive results .",
    },
    {
      id: "la40-2",
      audio_text: "However we need more evidence to confirm this finding.",
      prompt_vn: "Tuy nhiên chúng ta cần thêm bằng chứng để xác nhận điều này.",
      words: ["However", "we", "need", "more", "evidence", "to", "confirm", "this", "finding", ".", "Therefore", "Despite"],
      answer: "However we need more evidence to confirm this finding .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Hệ thống bị sập; do đó, dữ liệu đã bị mất.",
      words: ["The", "system", "crashed", ";", "consequently", ",", "data", "was", "lost", ".", "might", "should"],
      answer: "The system crashed ; consequently , data was lost .",
    },
    {
      id: "wb2",
      prompt_vn: "Chúng tôi đã tối ưu hóa mã nguồn, nhờ đó nâng cao hiệu suất.",
      words: ["We", "optimized", "the", "code", ",", "thereby", "enhancing", "performance", ".", "might", "should"],
      answer: "We optimized the code , thereby enhancing performance .",
    },
    {
      id: "wb3",
      prompt_vn: "Mặc dù gặp khó khăn, chúng tôi đã hoàn thành thời hạn.",
      words: ["Notwithstanding", "the", "difficulties", ",", "we", "met", "the", "deadline", ".", "might", "should"],
      answer: "Notwithstanding the difficulties , we met the deadline .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s40-1", prompt_vn: "Hệ thống bị sập; do đó, dữ liệu đã bị mất.", words: ["The", "system", "crashed", ";", "consequently", ",", "data", "was", "lost", "."], answer: "The system crashed ; consequently , data was lost ." },
    { id: "s40-2", prompt_vn: "Chúng tôi đã tối ưu hóa mã nguồn, nhờ đó nâng cao hiệu suất.", words: ["We", "optimized", "the", "code", ",", "thereby", "enhancing", "performance", "."], answer: "We optimized the code , thereby enhancing performance ." },
    { id: "s40-3", prompt_vn: "Mặc dù gặp khó khăn, chúng tôi đã hoàn thành thời hạn.", words: ["Notwithstanding", "the", "difficulties", ",", "we", "met", "the", "deadline", "."], answer: "Notwithstanding the difficulties , we met the deadline ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn từ nối: 'He was late; ___ the meeting started without him.'", options: ["furthermore", "consequently", "whereas", "likewise"], answer: "consequently" },
    { id: "fq2", type: "cloze", question: "Điền từ nối: 'The project was successful; ___ (tuy nhiên), the costs were too high.'", answer: "nevertheless" },
    { id: "fq3", type: "multiple-choice", question: "Chọn dạng đúng của động từ: 'We hired a consultant, thereby ___ the conflict.'", options: ["resolves", "resolving", "to resolve", "resolved"], answer: "resolving" },
    { id: "fq4", type: "translate", question: "Dịch: 'Một số người thích làm việc tại văn phòng, trong khi số khác thích làm việc từ xa.'", answer: "Some people prefer working at the office, whereas others prefer working remotely." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào mô tả một văn bản mạch lạc, các ý liên kết tốt?", options: ["transition", "cohesion", "coherent", "subsequent"], answer: "coherent" },
    { id: "q-ex1", type: "multiple-choice", question: "'Furthermore' dùng để:", options: ["Tương phản", "Bổ sung ý kiến thêm", "Đưa ra ví dụ", "Kết luận"], answer: "Bổ sung ý kiến thêm" },
    { id: "q-ex2", type: "multiple-choice", question: "'Nevertheless' = :", options: ["Thêm vào đó", "Tuy nhiên/mặc dù vậy", "Ví dụ như", "Do đó"], answer: "Tuy nhiên/mặc dù vậy" },
    { id: "q-ex3", type: "cloze", question: "Điền: '___ to conclude, I believe this approach is effective.'", answer: "In order" },
    { id: "q-ex4", type: "multiple-choice", question: "'As a result' chỉ mối quan hệ:", options: ["Tương phản", "Thêm thông tin", "Nguyên nhân-kết quả", "Ví dụ"], answer: "Nguyên nhân-kết quả" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Mặt khác, có nhiều bằng chứng ủng hộ quan điểm này.'", answer: "On the other hand, there is much evidence supporting this view." },
    { id: "q-ex6", type: "multiple-choice", question: "'For instance' = :", options: ["Tuy nhiên", "Ví dụ như", "Hơn nữa", "Do đó"], answer: "Ví dụ như" },
    { id: "q-ex7", type: "multiple-choice", question: "Discourse marker kết luận trang trọng nhất:", options: ["So", "Anyway", "In conclusion", "Well"], answer: "In conclusion" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr40-1", question: "Ôn tập Unit 39 — Chọn câu đúng: 'The password is encrypted. She ___ have decrypted it without the key.'", options: ["must", "can't", "should", "might"], answer: "can't", type: "multiple-choice" },
    { id: "cr40-2", question: "Ôn tập Unit 38 — Điền: 'Not only ___ she design the code, but she also optimized it.'", options: [], answer: "did", type: "cloze" },
    { id: "cr40-3", question: "Ôn tập Unit 37 — Chọn đúng: '___ (complete) the research, he published his findings.'", options: ["Having completed", "Completed", "Completing", "To complete"], answer: "Having completed", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "discourse marker tone",
    description: "Discourse markers — however, furthermore — luôn có pause sau",
    examples: [
        { word: "however", ipa: "/haʊˈɛvər/", tip: "However, [pause]... — luôn ngừng nhẹ sau however. Stress âm 2: how-EV-er" },
        { word: "furthermore", ipa: "/ˈfɜːðəmɔːr/", tip: "Stress âm 1: FUR-ther-more — 3 âm tiết. Âm /ð/ giữa rõ ràng" },
    ],
    minimalPairs: [
        ["however [,] (có pause)", "however không pause (sai tone)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "He missed the flight consequently", vn: "Do đó anh ấy đã bị lỡ chuyến bay" },
      { en: "Notwithstanding the economic crisis", vn: "Bất chấp cuộc khủng hoảng kinh tế" },
      { en: "Sales increased nevertheless", vn: "Tuy nhiên doanh số vẫn tăng" },
      { en: "We optimized the code thereby enhancing", vn: "Chúng tôi tối ưu hóa code nhờ đó nâng cao" },
      { en: "He likes coding whereas she prefers", vn: "Anh ấy thích code trong khi cô ấy thích" },
      { en: "The essay lacks coherence and cohesion", vn: "Bài luận thiếu sự mạch lạc và liên kết" },
      { en: "We made a smooth transition today", vn: "Hôm nay chúng tôi đã chuyển tiếp suôn sẻ" },
      { en: "The subsequent investigation proved", vn: "Cuộc điều tra sau đó đã chứng minh" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit40-reading-1",
    title: "The Importance of Cohesion in Writing",
    title_vn: "Đọc đoạn về liên kết và mạch lạc trong văn viết",
    level: "B2" as const,
    text:
      "Cohesion is what makes a piece of writing feel unified rather than fragmented. " +
      "It is achieved through a variety of linking devices. " +
      "Firstly, pronouns replace repeated nouns: instead of 'The report was long. " +
      "The report was detailed.' we write 'The report was long and detailed, and it covered all key areas.' " +
      "Secondly, discourse markers guide the reader: 'Furthermore', 'Nevertheless', 'As a result', " +
      "'In contrast', and 'To summarise' signal transitions between ideas. " +
      "Thirdly, lexical cohesion is created through synonyms and related words. " +
      "Instead of repeating 'problem', use 'issue', 'challenge', or 'difficulty'. " +
      "Finally, sentence variety — mixing short punchy sentences with longer analytical ones — " +
      "maintains the reader's interest and controls the pace of the writing. " +
      "Academic and professional writing that lacks cohesion feels disjointed and unconvincing. " +
      "With practice, cohesive writing becomes second nature.",
    questions: [
      {
        id: "u40r-q1",
        question_vn: "Cohesion (sự liên kết) giúp văn bản trở nên như thế nào?",
        options: [
          "Longer and more detailed",
          "Unified rather than fragmented",
          "More technical and complex",
          "Easier to translate",
        ],
        answer: "Unified rather than fragmented",
        explanation_vn: "'Cohesion is what makes a piece of writing feel unified rather than fragmented.'",
      },
      {
        id: "u40r-q2",
        question_vn: "Đại từ (pronouns) được sử dụng để làm gì trong văn bản có liên kết?",
        options: [
          "To make sentences shorter",
          "To replace repeated nouns",
          "To add emphasis",
          "To introduce new ideas",
        ],
        answer: "To replace repeated nouns",
        explanation_vn: "'pronouns replace repeated nouns'",
      },
      {
        id: "u40r-q3",
        question_vn: "Thay vì lặp từ 'problem', nên dùng từ nào để tạo liên kết từ vựng?",
        options: [
          "'Question'",
          "'Topic'",
          "'Challenge' or 'difficulty'",
          "'Point'",
        ],
        answer: "'Challenge' or 'difficulty'",
        explanation_vn: "'Instead of repeating problem, use issue, challenge, or difficulty.'",
      },
      {
        id: "u40r-q4",
        question_vn: "Sự đa dạng câu (sentence variety) giúp ích điều gì?",
        options: [
          "Makes writing longer",
          "Maintains the reader's interest and controls the pace",
          "Makes grammar simpler",
          "Reduces the need for punctuation",
        ],
        answer: "Maintains the reader's interest and controls the pace",
        explanation_vn: "'sentence variety...maintains the reader's interest and controls the pace of the writing.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "wBBJk2E8UYU",

  // jobScenarios for world-class VN adult career content (TASK-153)
  jobScenarios: [
    { id: 1, title: "Advanced team negotiation", focus: "B2 career", context: "client meeting" },
  ],
};

export default unit40;
