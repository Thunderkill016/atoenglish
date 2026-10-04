import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-38 — Emphasis & Persuasion  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit38: UnitData = {
  unitId: "unit-38",
  title: "Unit 38: Emphasis & Persuasion",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Emphasis & Persuasion — Các cấu trúc nhấn mạnh và thuyết phục: Đảo ngữ (Inversion) và Câu chẻ (Cleft sentences). Công cụ đắc lực để nâng cao sức thuyết phục trong thuyết trình, đàm phán và đạt điểm tối đa Grammatical Range của IELTS Writing/Speaking Band 7.0+.",
  badgeName: "Nhà Thuyết Phục",
  badgeEmoji: "🗣️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn đang thuyết trình trước hội đồng quản trị để bảo vệ phương án kinh doanh mới. Bạn cần nhấn mạnh tầm quan trọng của việc thay đổi chiến lược và thuyết phục các cổ đông bằng các cấu trúc đảo ngữ ('Not only did we...') và câu chẻ ('It was the marketing team that...').",
  learningOutcomes: [
    "Sử dụng đảo ngữ với trạng từ phủ định (Not only, Rarely, Seldom) để tạo điểm nhấn mạnh mẽ",
    "Sử dụng câu chẻ (It is... that / What I need is...) để làm nổi bật thông tin quan trọng nhất",
    "Áp dụng từ vựng đàm phán, thuyết phục và hùng biện ở mức độ B2+",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong hùng biện tiếng Anh, việc nhấn mạnh (<span class="text-emerald-400">emphasis</span>) không chỉ nằm ở tông giọng mà nằm ở việc sắp xếp lại trật tự từ. Cấu trúc đảo ngữ hoặc câu chẻ giúp người nói thu hút sự chú ý của người nghe vào thông tin quan trọng nhất mà không cần phải nói to hơn, thể hiện sự tinh tế và làm tăng tính chuyên nghiệp của lập luận.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "⚡", en: "Not only did they launch the product, but they also exceeded the target.", vn: "Không những họ đã ra mắt sản phẩm, mà họ còn vượt chỉ tiêu.", context: "Not only did + S + V-inf, but... also" },
    { emoji: "🎯", en: "It was the marketing campaign that boosted our sales.", vn: "Chính chiến dịch tiếp thị đã thúc đẩy doanh số của chúng tôi.", context: "It was ... that — câu chẻ nhấn mạnh chủ ngữ" },
    { emoji: "🧠", en: "What we need now is a clear risk assessment.", vn: "Điều chúng ta cần bây giờ là một bản đánh giá rủi ro rõ ràng.", context: "What + S + V + is + noun — câu chẻ với What" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "persuasion", emoji: "🗣️", phonetic: "/pəˈsweɪʒən/", meaning: "sự thuyết phục", example: "She used all her powers of persuasion to convince the board.", example2: "The sales pitch was a masterclass in persuasion.", collocation: "powers of persuasion / gentle persuasion / political persuasion", audio: "/audio/unit-38/persuasion.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "emphasis", emoji: "📌", phonetic: "/ˈemfəsɪs/", meaning: "sự nhấn mạnh / trọng tâm", example: "The company places great emphasis on customer satisfaction.", example2: "There is an emphasis on teamwork in our corporate culture.", collocation: "place emphasis on / strong emphasis / add emphasis", audio: "/audio/unit-38/emphasis.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'emphasis' trong câu trang trọng." },
    { id: 3, word: "debate", emoji: "🗣️", phonetic: "/dɪˈbeɪt/", meaning: "cuộc tranh luận / thảo luận công khai", example: "There has been a heated debate about the new tax policy.", example2: "We debated the issue for several hours before deciding.", collocation: "heated debate / debate about / public debate", audio: "/audio/unit-38/debate.mp3", l1_interference_vn: "⚠️ 'debate' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "convince", emoji: "🤝", phonetic: "/kənˈvɪns/", meaning: "thuyết phục (ai đó tin vào điều gì)", example: "I managed to convince him that our strategy was correct.", example2: "She was convinced of his innocence.", collocation: "convince someone / convince that / highly convincing", audio: "/audio/unit-38/convince.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'convince' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "advocate", emoji: "📢", phonetic: "/ˈædvəkeɪt/", meaning: "ủng hộ / người ủng hộ / luật sư bào chữa", example: "The group advocates for the protection of human rights.", example2: "She is a strong advocate of renewable energy.", collocation: "advocate of / strongly advocate / patient advocate", audio: "/audio/unit-38/advocate.mp3", l1_interference_vn: "⚠️ 'advocate' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "dominate", emoji: "👑", phonetic: "/ˈdɒmɪneɪt/", meaning: "thống trị / chiếm ưu thế / lấn át", example: "The multinational corporation dominates the local market.", example2: "Men continue to dominate the technology sector.", collocation: "dominate the market / dominate the conversation / dominant position", audio: "/audio/unit-38/dominate.mp3", l1_interference_vn: "⚠️ Trong email B2, 'dominate' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "leverage", emoji: "📈", phonetic: "/ˈliːvərɪdʒ/", meaning: "tận dụng / lực đòn bẩy", example: "We should leverage our brand reputation to enter new markets.", example2: "The company leveraged its assets to secure the loan.", collocation: "leverage technology / leverage resources / maximum leverage", audio: "/audio/unit-38/leverage.mp3", l1_interference_vn: "⚠️ 'Leverage' trong business mang nghĩa tích cực tận dụng lợi thế. Hay bị dịch sai thành 'mượn' hoặc 'tăng'." },
    { id: 8, word: "assert", emoji: "💪", phonetic: "/əˈsɜːt/", meaning: "khẳng định / quả quyết / xác lập quyền lực", example: "The report asserts that climate change is accelerating.", example2: "You need to assert your authority as the manager.", collocation: "assert authority / assert control / assert that", audio: "/audio/unit-38/assert.mp3" },
    { id: 9, word: "counter", emoji: "🛡️", phonetic: "/ˈkaʊntər/", meaning: "phản đối / chống lại / phản bác", example: "The minister counter-argued the opposition's claims.", example2: "We implemented measures to counter the decline in sales.", collocation: "counter-argument / counter-proposal / counter a threat", audio: "/audio/unit-38/counter.mp3" },
    { id: 10, word: "logic", emoji: "🧠", phonetic: "/ˈlɒdʒɪk/", meaning: "lập luận / logic", example: "I don't understand the logic behind this decision.", example2: "His argument lacks logical structure.", collocation: "business logic / lack logic / logical reasoning", audio: "/audio/unit-38/logic.mp3", l1_interference_vn: "⚠️ 'The logic behind' = lý do đằng sau. Người VN hay nói 'logic của quyết định' thiếu giới từ." },
    { id: 11, word: "validate", emoji: "✔️", phonetic: "/ˈvælɪdeɪt/", meaning: "xác thực / phê duyệt / hợp lệ hóa", example: "The survey results validated our research hypothesis.", example2: "You must validate your parking ticket before leaving.", collocation: "validate data / validate feelings / validate a contract", audio: "/audio/unit-38/validate.mp3" },
    { id: 12, word: "influence", emoji: "🌟", phonetic: "/ˈɪnfluəns/", meaning: "sự ảnh hưởng / ảnh hưởng đến", example: "His speech had a profound influence on the audience.", example2: "We want to influence consumer behavior through advertising.", collocation: "have an influence on / under the influence / positive influence", audio: "/audio/unit-38/influence.mp3", l1_interference_vn: "⚠️ 'Have an influence on' (cụm cố định). Dùng 'affect' cho động từ tác động trực tiếp." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Thuyết trình bảo vệ chiến lược kinh doanh",
      audio: "/audio/unit-38/dialogue_1.mp3",
      desc: "Trang thuyết phục ban giám đốc về dự án mở rộng thị trường.",
      lines: [
        { id: "d1-1", speaker: "Trang", text: "Rarely has our company faced such an opportunity. If we expand now, we will dominate the market.", translation: "Hiếm khi công ty chúng ta đối mặt với cơ hội như vậy. Nếu chúng ta mở rộng bây giờ, chúng ta sẽ chiếm lĩnh thị trường." },
        { id: "d1-2", speaker: "Director", text: "I understand, but the risk is high. How will you convince the shareholders?", translation: "Tôi hiểu, nhưng rủi ro cao. Cô sẽ thuyết phục các cổ đông bằng cách nào?" },
        { id: "d1-3", speaker: "Trang", text: "It is our strong brand reputation that we should leverage. Not only did we achieve our targets last year, but we also cut operating costs.", translation: "Chính uy tín thương hiệu mạnh mẽ của chúng ta là thứ chúng ta nên tận dụng. Chúng ta không những đạt chỉ tiêu năm ngoái, mà còn cắt giảm được chi phí vận hành." },
        { id: "d1-4", speaker: "Director", text: "Your logic is sound, but we need data to validate your claims.", translation: "Lập luận của cô rất hợp lý, nhưng chúng tôi cần dữ liệu để xác thực các tuyên bố của cô." },
        { id: "d1-5", speaker: "Trang", text: "What I have prepared is a detailed risk analysis in the attachment. I strongly advocate this venture.", translation: "Điều tôi đã chuẩn bị là bản phân tích rủi ro chi tiết trong tệp đính kèm. Tôi mạnh mẽ ủng hộ dự án mạo hiểm này." },
      ],
    },
    {
      id: 2,
      title: "Tranh luận về chiến dịch quảng cáo",
      audio: "/audio/unit-38/dialogue_2.mp3",
      desc: "Huy và Sarah tranh luận về mức ảnh hưởng của chiến dịch.",
      lines: [
        { id: "d2-1", speaker: "Sarah", text: "It was the video ad that had the greatest influence on consumers.", translation: "Chính quảng cáo video đã có ảnh hưởng lớn nhất đối với người tiêu dùng." },
        { id: "d2-2", speaker: "Huy", text: "I counter that. Rarely do video ads produce long-term loyalty without email marketing.", translation: "Tôi phản bác điều đó. Hiếm khi quảng cáo video tạo ra sự trung thành lâu dài mà không có tiếp thị qua email." },
        { id: "d2-3", speaker: "Sarah", text: "Maybe, but what we need to focus on is immediate sales conversion.", translation: "Có thể, nhưng điều chúng ta cần tập trung vào là chuyển đổi doanh số bán hàng ngay lập tức." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Not only did they launch the product, but they also exceeded the target.", options: ["They launched the product but missed the target.", "They did not launch the product because of the target.", "Not only did they launch the product, but they also exceeded the target.", "They only exceeded the target after they launched."], answer: "Not only did they launch the product, but they also exceeded the target." },
    { id: "lac2", audio_text: "It was the marketing campaign that boosted our sales.", options: ["The marketing campaign did not boost our sales.", "It was the marketing campaign that boosted our sales.", "We boosted our sales without any marketing campaign.", "They will boost the marketing campaign next month."], answer: "It was the marketing campaign that boosted our sales." },
    { id: "lac3", audio_text: "Rarely has our company faced such an opportunity.", options: ["Our company often faces this kind of opportunity.", "Rarely has our company faced such an opportunity.", "We faced an opportunity last month in the company.", "It is easy to find opportunities in our company."], answer: "Rarely has our company faced such an opportunity." },
    { id: "lac4", audio_text: "What we need now is a clear risk assessment.", options: ["We don't need any risk assessment now.", "We finished the risk assessment yesterday.", "What we need now is a clear risk assessment.", "The risk assessment is not clear enough."], answer: "What we need now is a clear risk assessment." },
    { id: "lac5", audio_text: "The survey results validated our research hypothesis.", options: ["The survey results validated our research hypothesis.", "The hypothesis was proven wrong by the survey.", "We need to conduct a survey to find a hypothesis.", "There were no results from the survey yesterday."], answer: "The survey results validated our research hypothesis." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "Not only did we {input} the project on time, but we also {input} our target.",
    level1Placeholder: "Ví dụ: finish — exceeded...",
    level2Situation: "Bạn đang phát biểu bảo vệ dự án của mình trước ban giám đốc. Hãy: (1) Khẳng định rằng hiếm khi đội nhóm của bạn mắc lỗi hệ thống, (2) Nhấn mạnh rằng chính nỗ lực của toàn đội đã cứu vãn dự án, (3) Thuyết phục họ duyệt ngân sách mới.",
    level2Hint: "Rarely does our team overlook a major system error. It was the hard work of our developers that saved the project during the server crash. What we need now is your support to validate our new budget proposal.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Inversion & Cleft Sentences — Đảo Ngữ & Câu Chẻ Nhấn Mạnh",
    rule: "Để nhấn mạnh thông tin hoặc làm lập luận trở nên trang trọng và thuyết phục hơn (đặc biệt trong IELTS Writing & Speaking):\n\n1. Inversion (Đảo ngữ với trạng từ phủ định/bán phủ định):\nKhi đặt các từ như Not only, Rarely, Seldom, Hardly, Scarcely ở đầu câu, ta đảo trợ động từ lên trước chủ ngữ.\n  Cấu trúc: Trạng từ phủ định + Trợ động từ + S + Verb-infinitive\n  → 'Rarely do we see such progress.' (= We rarely see such progress)\n  → 'Not only did we hit our target, but we also saved money.'\n\n2. Cleft Sentences (Câu chẻ):\n- IT cleft (Nhấn mạnh một thành phần cụ thể: chủ ngữ, tân ngữ, thời gian):\n  Cấu trúc: It + is/was + Thành phần nhấn mạnh + that/who + phần còn lại\n  → 'It was Huy who solved the problem.' (Chính là Huy chứ không phải ai khác)\n- WHAT cleft (Nhấn mạnh hành động hoặc nhu cầu):\n  Cấu trúc: What + S + V + is/was + Noun/Clause\n  → 'What we need is more capital.' (Điều chúng ta cần là thêm vốn)",
    examples: [
      { en: "Not only did he design the software, but he also integrated it. (Inversion with Not only)", vn: "Không những anh ấy thiết kế phần mềm, mà anh ấy còn tích hợp nó." },
      { en: "It was the security error that caused the server crash. (IT cleft emphasizing the cause)", vn: "Chính lỗi bảo mật đã gây ra việc sập máy chủ." },
      { en: "What they want to negotiate is the penalty clause. (WHAT cleft emphasizing the topic)", vn: "Điều họ muốn đàm phán là điều khoản phạt." },
    ],
    tip: "Trong tiêu chí chấm điểm IELTS Speaking Part 3 và Writing Task 2, việc sử dụng thành thạo ít nhất 1-2 câu đảo ngữ (ví dụ: 'Not only did...') hoặc câu chẻ là minh chứng rõ ràng giúp bài viết/nói đạt điểm Grammatical Range & Accuracy từ 7.0 trở lên.",
    vnNote: "⚠️ Người Việt rất hay quên đảo trợ động từ (do/does/did/has/have) lên trước chủ ngữ khi dùng đảo ngữ. Lỗi phổ biến: 'Rarely we see...' thay vì 'Rarely do we see...'. Hãy nhớ cấu trúc đảo ngữ giống hệt cấu trúc đặt câu hỏi.",
    dialogueExample: {
      speaker: "Trang",
      text: "Not only did we achieve our targets last year, but we also cut operating costs.",
      translation: "Chúng ta không những đạt chỉ tiêu năm ngoái, mà còn cắt giảm được chi phí vận hành.",
      highlight: "Not only did we achieve (Trợ động từ 'did' đứng trước chủ ngữ 'we' đúng cấu trúc đảo ngữ)",
    },
    ccq: {
      question: "Viết lại câu sau sang dạng đảo ngữ bắt đầu bằng 'Seldom': 'We seldom see such a successful business venture.'",
      options: [
        "Seldom we see such a successful business venture.",
        "Seldom do we see such a successful business venture.",
        "Seldom we saw such a successful business venture.",
        "Seldom did we see such a successful business venture.",
      ],
      answer: "Seldom do we see such a successful business venture.",
      explanation: "Động từ 'see' ở hiện tại đơn, chủ ngữ 'we' → trợ động từ đảo ngữ tương ứng là 'do'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'Rarely ___ a company dominate the market so completely.'", options: ["has", "does", "did", "is"], answer: "does" },
    { id: "pq2", type: "multiple-choice", question: "Chọn câu chẻ đúng: 'It was the manager ___ approved the budget.'", options: ["which", "who", "whom", "what"], answer: "who" },
    { id: "pq3", type: "cloze", question: "Điền trợ động từ đảo ngữ: 'Not only ___ he convince the board, but he also got a promotion.'", answer: "did" },
    { id: "pq4", type: "multiple-choice", question: "Điền từ: 'You need data to ___ your claims during the debate.'", options: ["validate", "dominate", "leverage", "counter"], answer: "validate" },
    { id: "pq5", type: "cloze", question: "Điền từ: 'What we need to place emphasis ___ is user safety.'", answer: "on" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng thuyết phục và hùng biện với nghĩa đúng",
    pairs: [
      { left: "persuasion", right: "sự thuyết phục" },
      { left: "leverage", right: "tận dụng / đòn bẩy" },
      { left: "assert", right: "khẳng định / quả quyết" },
      { left: "debate", right: "tranh luận" },
      { left: "counter", right: "phản bác / chống lại" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Không những anh ấy nói trôi chảy, mà anh ấy còn viết rất giỏi.",
      answer: "Not only does he speak fluently, but he also writes very well.",
    },
    {
      id: "pt-2",
      prompt_vn: "Chỉ sau khi họp xong họ mới tiết lộ thông tin.",
      answer: "Only after the meeting did they reveal the information.",
    },
    {
      id: "pt-3",
      prompt_vn: "Chính sự thuyết phục đã giúp họ thắng cuộc tranh luận.",
      answer: "It was the persuasion that helped them win the debate.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc38-1",
      sentence: "It was him who done it first.",
      errorWord: "done",
      correction: "did",
      explanation_vn: "Sau 'who' trong relative clause dùng động từ đúng ngôi: 'who DID it'. 'Done' cần 'had/has'.",
    },
    {
      id: "sc38-2",
      sentence: "What I need it is more practice every day.",
      errorWord: "need it",
      correction: "need",
      explanation_vn: "Cleft sentence: 'What I need IS...' — 'what' đã là chủ ngữ, không thêm 'it'. 'What I need IT is' thừa 'it'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la38-1",
      audio_text: "It was the teacher who inspired me the most.",
      prompt_vn: "Chính người thầy đó đã truyền cảm hứng cho tôi nhất.",
      words: ["It", "was", "the", "teacher", "who", "inspired", "me", "the", "most", ".", "whom", "which"],
      answer: "It was the teacher who inspired me the most .",
    },
    {
      id: "la38-2",
      audio_text: "Rarely does a company succeed without teamwork.",
      prompt_vn: "Hiếm khi một công ty thành công mà thiếu tinh thần đồng đội.",
      words: ["Rarely", "does", "a", "company", "succeed", "without", "teamwork", ".", "do", "Rarely a"],
      answer: "Rarely does a company succeed without teamwork .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Chính là Huy đã giải quyết vụ sập máy chủ hôm qua.",
      words: ["It", "was", "Huy", "who", "resolved", "the", "server", "crash", "yesterday", ".", "might", "should"],
      answer: "It was Huy who resolved the server crash yesterday .",
    },
    {
      id: "wb2",
      prompt_vn: "Hiếm khi chúng tôi thấy kết quả xuất sắc như vậy.",
      words: ["Rarely", "do", "we", "see", "such", "excellent", "results", ".", "might", "should"],
      answer: "Rarely do we see such excellent results .",
    },
    {
      id: "wb3",
      prompt_vn: "Điều chúng tôi muốn thay đổi là chiến lược tiếp thị.",
      words: ["What", "we", "want", "to", "change", "is", "the", "marketing", "strategy", ".", "might", "should"],
      answer: "What we want to change is the marketing strategy .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s38-1", prompt_vn: "Chính là Huy đã giải quyết vụ sập máy chủ hôm qua.", words: ["It", "was", "Huy", "who", "resolved", "the", "server", "crash", "yesterday", "."], answer: "It was Huy who resolved the server crash yesterday ." },
    { id: "s38-2", prompt_vn: "Hiếm khi chúng tôi thấy kết quả xuất sắc như vậy.", words: ["Rarely", "do", "we", "see", "such", "excellent", "results", "."], answer: "Rarely do we see such excellent results ." },
    { id: "s38-3", prompt_vn: "Điều chúng tôi muốn thay đổi là chiến lược tiếp thị.", words: ["What", "we", "want", "to", "change", "is", "the", "marketing", "strategy", "."], answer: "What we want to change is the marketing strategy ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn dạng đúng: 'Seldom ___ they encountered such an obstacle.'", options: ["do", "did", "have", "had"], answer: "have" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'The sales pitch was a masterclass in ___ (sự thuyết phục).'", answer: "persuasion" },
    { id: "fq3", type: "multiple-choice", question: "Chọn từ điền: 'The company decided to ___ its technological assets.'", options: ["assert", "leverage", "dominate", "counter"], answer: "leverage" },
    { id: "fq4", type: "translate", question: "Dịch: 'Không những anh ấy nói trôi chảy, mà anh ấy còn viết rất giỏi.'", answer: "Not only does he speak fluently, but he also writes very well." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào đồng nghĩa với 'support/advocate'?", options: ["validate", "assert", "advocate", "convince"], answer: "advocate" },
    { id: "q-ex1", type: "multiple-choice", question: "Cleft sentence 'It is X that...' dùng để:", options: ["Rút ngắn câu", "Nhấn mạnh thành phần của câu", "Hỏi thông tin", "Tường thuật"], answer: "Nhấn mạnh thành phần của câu" },
    { id: "q-ex2", type: "multiple-choice", question: "Cleft sentence đúng:", options: ["It is hard work what makes you successful.", "It is hard work that makes you successful.", "It is hard work which makes you successful.", "It was hard work makes you successful."], answer: "It is hard work that makes you successful." },
    { id: "q-ex3", type: "cloze", question: "Điền: '___ I really need is more time.'", answer: "What" },
    { id: "q-ex4", type: "multiple-choice", question: "Nhấn mạnh bằng đảo ngữ: 'Never have I seen...' — ý nghĩa:", options: ["Thỉnh thoảng thấy", "Chưa bao giờ thấy (nhấn mạnh)", "Đã từng thấy", "Luôn luôn thấy"], answer: "Chưa bao giờ thấy (nhấn mạnh)" },
    { id: "q-ex5", type: "translate", question: "Dịch có nhấn mạnh: 'Chính sự kiên nhẫn mới là chìa khóa.'", answer: "It is patience that is the key." },
    { id: "q-ex6", type: "multiple-choice", question: "'Not only did he apologize, but he also...' — cấu trúc:", options: ["Thêm thông tin đơn giản", "Đảo ngữ để nhấn mạnh hai điều", "Điều kiện", "Tương phản"], answer: "Đảo ngữ để nhấn mạnh hai điều" },
    { id: "q-ex7", type: "multiple-choice", question: "'Hedging language' (ngôn ngữ giảm nhẹ) dùng để:", options: ["Khẳng định chắc chắn 100%", "Làm mềm quan điểm, tránh quá tuyệt đối", "Ra lệnh", "Phủ nhận"], answer: "Làm mềm quan điểm, tránh quá tuyệt đối" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr38-1", question: "Ôn tập Unit 37 — Chọn dạng đúng: '___ the proposal, she presented it to the manager.'", options: ["Having finished", "Finished", "Finishing", "To finish"], answer: "Having finished", type: "multiple-choice" },
    { id: "cr38-2", question: "Ôn tập Unit 36 — Điền: 'The drug is claimed ___ (have) no side effects.'", options: [], answer: "to have", type: "cloze" },
    { id: "cr38-3", question: "Ôn tập Unit 35 — Chọn liên từ thích hợp: 'Miễn là bạn đồng ý ký hợp đồng...':", options: ["As long as", "Unless", "Even if", "Although"], answer: "As long as", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "cleft sentence stress",
    description: "It is X that... — nhấn mạnh bằng cách thay đổi stress",
    examples: [
        { word: "It is WORK that...", ipa: "/ɪt ɪz wɜːrk ðæt/", tip: "Phần được nhấn mạnh (X) đọc to, rõ hơn hẳn" },
        { word: "What I need is...", ipa: "/wɒt aɪ niːd ɪz/", tip: "What trong cleft câu — không nhấn, nhấn vào phần sau" },
    ],
    minimalPairs: [
        ["It is WORK that matters (cleft)", "Work matters (thường)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Not only did we hit our target", vn: "Chúng tôi không những đạt chỉ tiêu" },
      { en: "It was the marketing team that won", vn: "Chính đội ngũ tiếp thị đã giành chiến thắng" },
      { en: "What we need is more capital", vn: "Điều chúng ta cần là thêm vốn" },
      { en: "Rarely has our company faced this", vn: "Hiếm khi công ty chúng tôi đối mặt với điều này" },
      { en: "She has strong powers of persuasion", vn: "Cô ấy có khả năng thuyết phục mạnh mẽ" },
      { en: "How did they validate the survey data?", vn: "Họ đã xác thực dữ liệu khảo sát như thế nào?" },
      { en: "I strongly counter this proposal", vn: "Tôi mạnh mẽ phản bác đề xuất này" },
      { en: "We must leverage our brand reputation", vn: "Chúng ta phải tận dụng uy tín thương hiệu" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit38-reading-1",
    title: "The Power of Persuasion",
    title_vn: "Đọc đoạn về kỹ năng thuyết phục và nhấn mạnh",
    level: "B2" as const,
    text:
      "Effective persuasion is one of the most valuable skills in business and public life. " +
      "It is not manipulation — it is the art of presenting ideas compellingly and logically. " +
      "What makes a persuasive argument? First, you must understand your audience deeply. " +
      "It is only when you know what they value that you can frame your argument effectively. " +
      "Emphasis is crucial. Notice the difference: 'Our product is good.' " +
      "Versus: 'What sets our product apart is its unmatched reliability.' " +
      "The second uses cleft sentence structure for emphasis. " +
      "Strong persuaders use the rule of three: 'This solution is fast, affordable, and effective.' " +
      "They also use contrast: 'While competitors cut corners, we invest in quality.' " +
      "Emotional appeal, combined with evidence, creates the most persuasive message. " +
      "The next time you prepare a proposal or presentation, ask yourself: " +
      "What do I want the audience to think, feel, and do?",
    questions: [
      {
        id: "u38r-q1",
        question_vn: "Theo đoạn văn, thuyết phục không phải là gì?",
        options: [
          "Presenting ideas logically",
          "Manipulation",
          "Understanding your audience",
          "Using emphasis",
        ],
        answer: "Manipulation",
        explanation_vn: "'It is not manipulation — it is the art of presenting ideas compellingly and logically.'",
      },
      {
        id: "u38r-q2",
        question_vn: "Điều gì tạo ra thông điệp thuyết phục nhất?",
        options: [
          "Long, detailed explanations",
          "Emotional appeal combined with evidence",
          "Using many technical terms",
          "Repeating the same point many times",
        ],
        answer: "Emotional appeal combined with evidence",
        explanation_vn: "'Emotional appeal, combined with evidence, creates the most persuasive message.'",
      },
      {
        id: "u38r-q3",
        question_vn: "Quy tắc ba (rule of three) trong ví dụ là gì?",
        options: [
          "'Fast, affordable, and effective'",
          "'Good, better, best'",
          "'Think, feel, and do'",
          "'First, second, and third'",
        ],
        answer: "'Fast, affordable, and effective'",
        explanation_vn: "'This solution is fast, affordable, and effective.'",
      },
      {
        id: "u38r-q4",
        question_vn: "Khi chuẩn bị bài thuyết trình, bạn nên tự hỏi điều gì?",
        options: [
          "How long should it be?",
          "What slides should I use?",
          "What do I want the audience to think, feel, and do?",
          "How much time do I have?",
        ],
        answer: "What do I want the audience to think, feel, and do?",
        explanation_vn: "'ask yourself: What do I want the audience to think, feel, and do?'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Persuasive pitch to investors",
      focus: "emphasis in business presentations",
      context: "sales pitch",
      l1Note: "⚠️ 'Emphasis on' . Người VN hay dịch thẳng 'nhấn mạnh vào'. 'It is crucial that...' for persuasion.",
      example: "We must emphasize the unique value. It is essential that you invest now."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "nz7LRTF-a-Q",
};

export default unit38;
