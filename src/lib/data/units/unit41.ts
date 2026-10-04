import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-41 — IELTS & TOEIC Topics  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit41: UnitData = {
  unitId: "unit-41",
  title: "Unit 41: IELTS & TOEIC Topics",
  level: "B2",
  xp: 120,
  estimatedTime: 65,
  description: "Academic Vocabulary — 20 từ vựng học thuật cao cấp bao trùm 5 chủ đề IELTS phổ biến nhất: môi trường, công nghệ, giáo dục, y tế và xã hội. Cực kỳ quan trọng để chinh phục IELTS 6.5+ và TOEIC 800+.",
  badgeName: "Chuyên Gia Học Thuật",
  badgeEmoji: "🏫",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn tham gia một buổi thảo luận chuyên sâu về tác động của chuyển đổi số và đô thị hóa đối với sức khỏe cộng đồng và môi trường. Bạn cần sử dụng từ vựng học thuật chuẩn CEFR B2 để diễn đạt các ý tưởng phức tạp một cách trôi chảy.",
  learningOutcomes: [
    "Sử dụng thành thạo từ vựng học thuật cao cấp thuộc 5 chủ đề IELTS phổ biến",
    "Kết hợp linh hoạt các cấu trúc ngữ pháp B2 để thảo luận các vấn đề vĩ mô",
    "Nâng cao khả năng đọc hiểu và nghe hiểu văn bản học thuật phức tạp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong các kỳ thi như IELTS và TOEIC, để đạt điểm từ vựng (Lexical Resource) từ 6.5 trở lên, bạn phải chứng minh khả năng sử dụng <span class="text-emerald-400">"less common lexical items"</span> (từ vựng ít thông dụng) và <span class="text-emerald-400">"collocations"</span> chuẩn xác. Thay vì dùng các từ đơn giản như "city growth", hãy dùng <span class="text-emerald-400">"urbanization"</span>; thay vì nói "dirty environment", hãy dùng <span class="text-emerald-400">"environmental degradation"</span>.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🌱", en: "Renewable energy is crucial to prevent environmental degradation.", vn: "Năng lượng tái tạo là cực kỳ quan trọng để ngăn chặn sự suy thoái môi trường.", context: "renewable energy & environmental degradation" },
    { emoji: "🤖", en: "Artificial intelligence has accelerated digital transformation globally.", vn: "Trí tuệ nhân tạo đã đẩy nhanh quá trình chuyển đổi số trên toàn cầu.", context: "AI & digital transformation" },
    { emoji: "🏫", en: "Socio-economic factors heavily influence academic performance.", vn: "Các yếu tố kinh tế xã hội ảnh hưởng nặng nề đến kết quả học tập.", context: "socio-economic & academic performance" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "environmental degradation", emoji: "🍂", phonetic: "/ɪnˌvaɪrənˈmentəl ˌdeɡrəˈdeɪʃən/", meaning: "sự suy thoái môi trường", example: "Urbanization has led to severe environmental degradation.", example2: "We must implement policies to slow down environmental degradation.", collocation: "prevent environmental degradation / cause environmental degradation / combat environmental degradation", audio: "/audio/unit-41/environmental_degradation.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "deforestation", emoji: "🪓", phonetic: "/diːˌfɒrɪˈsteɪʃən/", meaning: "nạn phá rừng", example: "Deforestation threatens the habitats of many endangered species.", example2: "The government is trying to combat illegal deforestation.", collocation: "illegal deforestation / halt deforestation / cause deforestation", audio: "/audio/unit-41/deforestation.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'deforestation' trong câu trang trọng." },
    { id: 3, word: "renewable energy", emoji: "☀️", phonetic: "/rɪˈnjuːəbəl ˈenədʒi/", meaning: "năng lượng tái tạo", example: "We should invest more in renewable energy sources like wind and solar.", example2: "The transition to renewable energy is accelerating globally.", collocation: "renewable energy sources / invest in renewable energy / clean and renewable energy", audio: "/audio/unit-41/renewable_energy.mp3", l1_interference_vn: "⚠️ 'renewable energy' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "artificial intelligence", emoji: "🤖", phonetic: "/ˌɑːtɪˈfɪʃəl ɪnˈtelɪdʒəns/", meaning: "trí tuệ nhân tạo (AI)", example: "Artificial intelligence is transforming the medical industry.", example2: "Many fear that artificial intelligence will replace human workers.", collocation: "development of artificial intelligence / artificial intelligence system", audio: "/audio/unit-41/artificial_intelligence.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'artificial intelligence' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "digital transformation", emoji: "💻", phonetic: "/ˈdɪdʒɪtəl ˌtrænsfəˈmeɪʃən/", meaning: "chuyển đổi số", example: "The company's digital transformation was completed last year.", example2: "We must leverage technology for successful digital transformation.", collocation: "lead digital transformation / corporate digital transformation", audio: "/audio/unit-41/digital_transformation.mp3", l1_interference_vn: "⚠️ 'digital transformation' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "automation", emoji: "⚙️", phonetic: "/ˌɔːtəˈmeɪʃən/", meaning: "sự tự động hóa", example: "Factory automation has increased production efficiency.", example2: "Automation will inevitably eliminate some manual labor jobs.", collocation: "process automation / factory automation / increase automation", audio: "/audio/unit-41/automation.mp3", l1_interference_vn: "⚠️ Trong email B2, 'automation' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "curriculum", emoji: "📖", phonetic: "/kəˈrɪkjʊləm/", meaning: "chương trình học / chương trình giảng dạy", example: "The school is designing a new science curriculum.", example2: "They decided to add financial literacy to the national curriculum.", collocation: "school curriculum / national curriculum / design curriculum", audio: "/audio/unit-41/curriculum.mp3", l1_interference_vn: "⚠️ 'curriculum' + that/which clause: người Việt hay lặp chủ ngữ thừa (redundant subject)." },
    { id: 8, word: "pedagogy", emoji: "👩‍🏫", phonetic: "/ˈpedəɡɒdʒi/", meaning: "phương pháp sư phạm / giảng dạy", example: "Modern pedagogy places the student at the center of learning.", example2: "Teachers need to adapt their pedagogy to online classes.", collocation: "modern pedagogy / teaching pedagogy / pedagogical skills", audio: "/audio/unit-41/pedagogy.mp3", l1_interference_vn: "⚠️ Dùng 'pedagogy' với thì phù hợp ngữ cảnh — không lẫn present perfect với past simple." },
    { id: 9, word: "academic performance", emoji: "🎓", phonetic: "/ˌækəˈdemɪk pəˈfɔːməns/", meaning: "kết quả học tập / học lực", example: "Regular attendance is directly linked to academic performance.", example2: "The tutor helped improve my academic performance in math.", collocation: "excel in academic performance / track academic performance / evaluate academic performance", audio: "/audio/unit-41/academic_performance.mp3" },
    { id: 10, word: "chronic disease", emoji: "🏥", phonetic: "/ˈkrɒnɪk dɪˈziːz/", meaning: "bệnh mãn tính", example: "Diabetes and heart disease are common chronic diseases.", example2: "Healthy eating helps in the prevention of chronic disease.", collocation: "suffer from chronic disease / treat chronic disease / chronic disease prevention", audio: "/audio/unit-41/chronic_disease.mp3" },
    { id: 11, word: "immune system", emoji: "🛡️", phonetic: "/ɪˈmjuːn ˌsɪstəm/", meaning: "hệ miễn dịch", example: "Vitamin C helps strengthen your immune system.", example2: "Stress can weaken the body's immune system.", collocation: "boost the immune system / weak immune system / immune system response", audio: "/audio/unit-41/immune_system.mp3" },
    { id: 12, word: "wellbeing", emoji: "🧘", phonetic: "/ˌwelˈbiːɪŋ/", meaning: "sự khỏe mạnh, hạnh phúc / sự an yên", example: "Exercise is essential for physical and mental wellbeing.", example2: "The school is concerned with the wellbeing of its students.", collocation: "mental wellbeing / employee wellbeing / promote wellbeing", audio: "/audio/unit-41/wellbeing.mp3" },
    { id: 13, word: "urbanization", emoji: "🏢", phonetic: "/ˌɜːbənaɪˈzeɪʃən/", meaning: "sự đô thị hóa", example: "Rapid urbanization has put pressure on the city's infrastructure.", example2: "Urbanization often leads to migration from rural areas.", collocation: "rapid urbanization / effects of urbanization / process of urbanization", audio: "/audio/unit-41/urbanization.mp3" },
    { id: 14, word: "demographic", emoji: "👥", phonetic: "/ˌdeməˈɡræfɪk/", meaning: "thuộc nhân khẩu học / nhóm dân số", example: "The app targets the young corporate demographic.", example2: "There is a major demographic shift in aging societies.", collocation: "demographic shift / target demographic / demographic data", audio: "/audio/unit-41/demographic.mp3" },
    { id: 15, word: "socio-economic", emoji: "📊", phonetic: "/ˌsəʊsiəʊˌiːkəˈnɒmɪk/", meaning: "thuộc kinh tế xã hội", example: "Socio-economic background should not limit education opportunities.", example2: "We analyzed the socio-economic impact of the pandemic.", collocation: "socio-economic development / socio-economic status / socio-economic factors", audio: "/audio/unit-41/socio_economic.mp3" },
    { id: 16, word: "infrastructure", emoji: "🛣️", phonetic: "/ˈɪnfrəˌstrʌktʃər/", meaning: "cơ sở hạ tầng", example: "The country needs to upgrade its transport infrastructure.", example2: "Building internet infrastructure in rural areas is essential.", collocation: "transport infrastructure / public infrastructure / digital infrastructure", audio: "/audio/unit-41/infrastructure.mp3" },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Tác động của đô thị hóa và công nghệ",
      audio: "/audio/unit-41/dialogue_1.mp3",
      desc: "Linh và Huy trao đổi về sự thay đổi xã hội do công nghệ và quy hoạch đô thị.",
      lines: [
        { id: "d1-1", speaker: "Linh", text: "Huy, have you read the report on rapid urbanization in Southeast Asia? It outlines the socio-economic impacts.", translation: "Huy, bạn đã đọc báo cáo về sự đô thị hóa nhanh chóng ở Đông Nam Á chưa? Nó phác thảo các tác động kinh tế xã hội." },
        { id: "d1-2", speaker: "Huy", text: "Yes. Deforestation and environmental degradation are worsening due to poor infrastructure. It is crucial that we transition to renewable energy.", translation: "Rồi. Nạn phá rừng và sự suy thoái môi trường đang trở nên tồi tệ hơn do cơ sở hạ tầng kém. Việc chúng ta chuyển dịch sang năng lượng tái tạo là cực kỳ quan trọng." },
        { id: "d1-3", speaker: "Linh", text: "I agree. Furthermore, digital transformation and automation are changing the labor demographic.", translation: "Tôi đồng ý. Hơn nữa, chuyển đổi số và tự động hóa đang thay đổi nhân khẩu học lao động." },
        { id: "d1-4", speaker: "Huy", text: "Indeed. Modern pedagogy must adapt to prepare students. Otherwise, their academic performance will decline.", translation: "Đúng vậy. Phương pháp sư phạm hiện đại phải thích ứng để chuẩn bị cho học sinh. Nếu không, học lực của họ sẽ giảm sút." },
        { id: "d1-5", speaker: "Linh", text: "Right. We should also place emphasis on mental wellbeing. Working in automated offices can weaken the immune system.", translation: "Đúng thế. Chúng ta cũng nên chú trọng đến sự an yên tinh thần. Làm việc trong các văn phòng tự động hóa có thể làm suy yếu hệ miễn dịch." },
      ],
    },
    {
      id: 2,
      title: "Học trực tuyến và sức khỏe học đường",
      audio: "/audio/unit-41/dialogue_2.mp3",
      desc: "Trang và Emma thảo luận về chương trình học thời đại số.",
      lines: [
        { id: "d2-1", speaker: "Trang", text: "The new school curriculum is claimed to have integrated digital tools to enhance academic performance.", translation: "Chương trình học mới của trường được khẳng định là đã tích hợp các công cụ kỹ thuật số để nâng cao kết quả học tập." },
        { id: "d2-2", speaker: "Emma", text: "That is great. However, sitting all day during distance learning can cause chronic diseases.", translation: "Tuyệt quá. Tuy nhiên, việc ngồi cả ngày trong quá trình học từ xa có thể gây ra các bệnh mãn tính." },
        { id: "d2-3", speaker: "Trang", text: "True. We must encourage children to exercise to boost their immune system and promote physical wellbeing.", translation: "Đúng vậy. Chúng ta phải khuyến khích trẻ em tập thể dục để tăng cường hệ miễn dịch và thúc đẩy sự khỏe mạnh thể chất." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "Urbanization has led to severe environmental degradation.", options: ["Urbanization has improved the environment.", "Urbanization has led to severe environmental degradation.", "We must stop urbanization in rural areas.", "Environmental degradation has no connection to urbanization."], answer: "Urbanization has led to severe environmental degradation." },
    { id: "lac2", audio_text: "We should invest more in renewable energy sources.", options: ["We should stop investing in renewable energy.", "We should invest more in renewable energy sources.", "Coal and oil are cheap renewable energy sources.", "Investing in energy is not necessary today."], answer: "We should invest more in renewable energy sources." },
    { id: "lac3", audio_text: "Artificial intelligence is transforming the medical industry.", options: ["Artificial intelligence is transforming the medical industry.", "Medical industry rejected artificial intelligence.", "AI will never be used in medicine.", "Digital transformation has failed in clinics."], answer: "Artificial intelligence is transforming the medical industry." },
    { id: "lac4", audio_text: "Socio-economic background should not limit education opportunities.", options: ["Only rich people should get education opportunities.", "Socio-economic background should not limit education opportunities.", "Education has no connection to economy.", "We need to analyze the socio-economic status of students."], answer: "Socio-economic background should not limit education opportunities." },
    { id: "lac5", audio_text: "Vitamin C helps strengthen your immune system.", options: ["Vitamin C damages your immune system.", "Vitamin C helps strengthen your immune system.", "We need to eat organic food to weaken our body.", "Chronic disease can be cured by vitamins."], answer: "Vitamin C helps strengthen your immune system." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "To prevent {input}, we must invest in {input} and promote {input}.",
    level1Placeholder: "Ví dụ: environmental degradation — renewable energy — digital transformation...",
    level2Situation: "Bạn đang tham gia buổi thuyết trình thảo luận về phát triển đô thị thông minh. Hãy: (1) Nêu tác động của sự đô thị hóa nhanh chóng, (2) Đề xuất giải pháp năng lượng tái tạo để bảo vệ môi trường, (3) Nhấn mạnh việc nâng cao chất lượng cuộc sống người dân.",
    level2Hint: "Rapid urbanization has put heavy pressure on public infrastructure and caused environmental degradation. To combat this, we should leverage artificial intelligence to optimize resources and invest in renewable energy. This is essential to enhance the physical and mental wellbeing of citizens.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "B2 Grammar Synthesis in Academic Writing — Tổng Hợp Ngữ Pháp B2 Trong Văn Viết",
    rule: "Tổng hợp các cấu trúc ngữ pháp B2 giúp bạn viết bài luận IELTS Task 2 một cách học thuật, thuyết phục:\n\n1. Second & Third Conditionals (Giả định):\n   → 'If governments had invested in renewable energy, environmental degradation would be less severe now.' (Hỗn hợp)\n2. Advanced Passive (Bị động khách quan):\n   → 'The curriculum is claimed to have been modified to meet student needs.'\n3. Participle Clauses (Mệnh đề phân từ rút gọn):\n   → 'Having implemented digital transformation, the company enhanced its productivity.'\n4. Inversion (Đảo ngữ tạo điểm nhấn):\n   → 'Not only did urbanization cause pollution, but it also threatened biodiversity.'\n5. Cleft Sentences (Câu chẻ nhấn mạnh):\n   → 'It was the rapid automation that eliminated manual labor jobs.'",
    examples: [
      { en: "Not only did automation increase efficiency, but it also reduced errors. (Inversion)", vn: "Tự động hóa không những tăng hiệu quả, mà còn giảm sai sót." },
      { en: "Having modified the pedagogy, teachers observed better academic performance. (Participle clause)", vn: "Sau khi điều chỉnh phương pháp sư phạm, các giáo viên quan sát thấy kết quả học tập tốt hơn." },
      { en: "It was the digital infrastructure that enabled distance learning. (Cleft sentence)", vn: "Chính cơ sở hạ tầng kỹ thuật số đã tạo điều kiện cho việc học từ xa." },
    ],
    tip: "Trong bài thi IELTS Writing Task 2, việc phân bổ đều 5 cấu trúc ngữ pháp này vào các đoạn văn sẽ giúp bài viết của bạn đạt Band 7.0+ về mặt cấu trúc. Hãy thực hành viết đi viết lại các câu học thuật này.",
    vnNote: "⚠️ Chú ý cấu trúc từ vựng: Học các từ ghép học thuật như 'environmental degradation' hay 'digital transformation' thay vì ghép từ riêng lẻ. Tránh nói 'environment damage' hay 'digitizing change'.",
    dialogueExample: {
      speaker: "Huy",
      text: "Deforestation and environmental degradation are worsening due to poor infrastructure.",
      translation: "Nạn phá rừng và sự suy thoái môi trường đang trở nên tồi tệ hơn do cơ sở hạ tầng kém.",
      highlight: "environmental degradation (suy thoái môi trường) | infrastructure (cơ sở hạ tầng)",
    },
    ccq: {
      question: "Câu nào kết hợp ĐÚNG cấu trúc đảo ngữ nâng cao?",
      options: [
        "Rarely did urbanization cause so much deforestation.",
        "Rarely urbanization did cause so much deforestation.",
        "Rarely did urbanization caused so much deforestation.",
        "Rarely did urbanization cause so much deforestation yesterday.",
      ],
      answer: "Rarely did urbanization cause so much deforestation.",
      explanation: "Đảo ngữ với trợ động từ 'did' + chủ ngữ 'urbanization' + động từ nguyên thể 'cause'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn từ điền: 'We must halt ___ to protect the rainforest ecosystem.'", options: ["pedagogy", "deforestation", "wellbeing", "automation"], answer: "deforestation" },
    { id: "pq2", type: "multiple-choice", question: "Chọn dạng đúng: 'Not only ___ the software enhance performance, but it also simplified the code.'", options: ["does", "did", "was", "has"], answer: "did" },
    { id: "pq3", type: "cloze", question: "Điền từ: 'The school has designed a new ___ (chương trình giảng dạy) for English.'", answer: "curriculum" },
    { id: "pq4", type: "multiple-choice", question: "Từ nào mô tả tình trạng 'sức khỏe, hạnh phúc'?", options: ["degradation", "wellbeing", "urbanization", "infrastructure"], answer: "wellbeing" },
    { id: "pq5", type: "cloze", question: "Điền dạng đúng của động từ: 'Having ___ (compile) the results, the scientist published the paper.'", answer: "compiled" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng học thuật IELTS với nghĩa đúng",
    pairs: [
      { left: "urbanization", right: "sự đô thị hóa" },
      { left: "pedagogy", right: "phương pháp sư phạm" },
      { left: "deforestation", right: "nạn phá rừng" },
      { left: "infrastructure", right: "cơ sở hạ tầng" },
      { left: "degradation", right: "sự suy thoái" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Học lực của cô ấy đã được cải thiện rõ rệt.",
      answer: "Her academic performance has improved significantly.",
    },
    {
      id: "pt-2",
      prompt_vn: "Chuyển đổi số sẽ tác động đến mọi ngành nghề.",
      answer: "Digital transformation will affect every industry.",
    },
    {
      id: "pt-3",
      prompt_vn: "Năng lượng tái tạo giúp giảm suy thoái môi trường.",
      answer: "Renewable energy helps reduce environmental degradation.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc41-1",
      sentence: "Regarding to the graph, sales increased by 20%.",
      errorWord: "Regarding to",
      correction: "Regarding",
      explanation_vn: "'Regarding + noun' (không có 'to'). 'With regard TO' mới có 'to'. Lỗi phổ biến trong IELTS Task 1.",
    },
    {
      id: "sc41-2",
      sentence: "The data show that temperatures have risen sharply.",
      errorWord: "show",
      correction: "shows",
      explanation_vn: "Trong văn học thuật tiếng Anh, 'data' thường đi với động từ số ít: 'the data SHOWS'. (Hoặc chấp nhận 'show' trong British).",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la41-1",
      audio_text: "The graph shows a significant increase in sales.",
      prompt_vn: "Biểu đồ cho thấy mức tăng đáng kể trong doanh số.",
      words: ["The", "graph", "shows", "a", "significant", "increase", "in", "sales", ".", "show", "indicating"],
      answer: "The graph shows a significant increase in sales .",
    },
    {
      id: "la41-2",
      audio_text: "In conclusion further research is needed in this area.",
      prompt_vn: "Tóm lại cần có thêm nghiên cứu trong lĩnh vực này.",
      words: ["In", "conclusion", "further", "research", "is", "needed", "in", "this", "area", ".", "To conclude", "needs"],
      answer: "In conclusion further research is needed in this area .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Năng lượng tái tạo là cực kỳ quan trọng cho tương lai.",
      words: ["Renewable", "energy", "is", "extremely", "important", "for", "the", "future", ".", "might", "should"],
      answer: "Renewable energy is extremely important for the future .",
    },
    {
      id: "wb2",
      prompt_vn: "Chính sự đô thị hóa nhanh chóng đã làm suy thoái môi trường.",
      words: ["It", "was", "rapid", "urbanization", "that", "caused", "environmental", "degradation", ".", "might", "should"],
      answer: "It was rapid urbanization that caused environmental degradation .",
    },
    {
      id: "wb3",
      prompt_vn: "Không những tự động hóa giúp tăng sản lượng, nó còn giảm lỗi.",
      words: ["Not", "only", "did", "automation", "increase", "output", ",", "it", "also", "reduced", "errors", ".", "might", "should"],
      answer: "Not only did automation increase output , it also reduced errors .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s41-1", prompt_vn: "Năng lượng tái tạo là cực kỳ quan trọng cho tương lai.", words: ["Renewable", "energy", "is", "extremely", "important", "for", "the", "future", "."], answer: "Renewable energy is extremely important for the future ." },
    { id: "s41-2", prompt_vn: "Chính sự đô thị hóa nhanh chóng đã làm suy thoái môi trường.", words: ["It", "was", "rapid", "urbanization", "that", "caused", "environmental", "degradation", "."], answer: "It was rapid urbanization that caused environmental degradation ." },
    { id: "s41-3", prompt_vn: "Không những tự động hóa giúp tăng sản lượng, nó còn giảm lỗi.", words: ["Not", "only", "did", "automation", "increase", "output", ",", "it", "also", "reduced", "errors", "."], answer: "Not only did automation increase output , it also reduced errors ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn từ điền: 'The company is leading the ___ transformation of the banking sector.'", options: ["corporate", "digital", "sustainable", "infrastructure"], answer: "digital" },
    { id: "fq2", type: "cloze", question: "Điền: 'Diabetes is a common ___ (mãn tính) disease.'", answer: "chronic" },
    { id: "fq3", type: "multiple-choice", question: "Chọn dạng đúng: 'Having ___ (integrate) AI, the system became highly efficient.'", options: ["integrated", "integrates", "integrating", "integrate"], answer: "integrated" },
    { id: "fq4", type: "translate", question: "Dịch: 'Học lực của cô ấy đã được cải thiện rõ rệt.'", answer: "Her academic performance has improved significantly." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào liên quan đến 'hệ thống phòng vệ cơ thể'?", options: ["infrastructure", "immune system", "wellbeing", "deforestation"], answer: "immune system" },
    { id: "q-ex1", type: "multiple-choice", question: "IELTS Task 2 — cấu trúc đoạn body chuẩn:", options: ["Ý kiến + Ví dụ + Phân tích", "Topic sentence + Detail + Example + Concluding", "Chỉ cần ví dụ", "Kết luận trước, ví dụ sau"], answer: "Topic sentence + Detail + Example + Concluding" },
    { id: "q-ex2", type: "multiple-choice", question: "Từ học thuật thay cho 'big':", options: ["large", "significant", "substantial", "Cả B và C đều đúng"], answer: "Cả B và C đều đúng" },
    { id: "q-ex3", type: "cloze", question: "Điền: 'The data ___ that urban populations are growing.'", answer: "suggests" },
    { id: "q-ex4", type: "multiple-choice", question: "'Paraphrase' câu hỏi IELTS có nghĩa là:", options: ["Copy nguyên văn câu hỏi", "Dùng từ đồng nghĩa để viết lại câu hỏi", "Không nhắc đến câu hỏi", "Trả lời bằng câu đơn"], answer: "Dùng từ đồng nghĩa để viết lại câu hỏi" },
    { id: "q-ex5", type: "translate", question: "Dịch học thuật: 'Vấn đề này đang ngày càng phổ biến.'", answer: "This issue is becoming increasingly prevalent." },
    { id: "q-ex6", type: "multiple-choice", question: "TOEIC Part 7 — Reading Comprehension: kỹ năng chính cần:", options: ["Đọc từng từ một", "Skimming và scanning", "Dịch từng câu", "Học thuộc lòng đoạn văn"], answer: "Skimming và scanning" },
    { id: "q-ex7", type: "multiple-choice", question: "'Coherence' trong bài viết nghĩa là:", options: ["Dùng từ vựng phong phú", "Ý tưởng liên kết logic, rõ ràng", "Không có lỗi ngữ pháp", "Dùng nhiều câu dài"], answer: "Ý tưởng liên kết logic, rõ ràng" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr41-1", question: "Ôn tập Unit 40 — Chọn từ nối: 'He was late; ___ (do đó) the meeting was delayed.'", options: ["consequently", "nevertheless", "furthermore", "whereas"], answer: "consequently", type: "multiple-choice" },
    { id: "cr41-2", question: "Ôn tập Unit 39 — Điền: 'She ___ have left the office because her keys are here.'", options: [], answer: "can't", type: "cloze" },
    { id: "cr41-3", question: "Ôn tập Unit 38 — Chọn câu chẻ đúng:", options: ["It was the marketing campaign that boosted sales.", "It was the marketing campaign who boosted sales.", "What we need that boosted sales is marketing.", "The marketing campaign it was boosted sales."], answer: "It was the marketing campaign that boosted sales.", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "academic /ˌækəˈdɛmɪk/",
    description: "IELTS/academic vocabulary — stress đặc trưng của từ học thuật",
    examples: [
        { word: "academic", ipa: "/ˌækəˈdɛmɪk/", tip: "Stress âm 3: ac-a-DEM-ic — 4 âm tiết. Âm đầu /æ/ ngắn" },
        { word: "significant", ipa: "/sɪɡˈnɪfɪkənt/", tip: "Stress âm 2: sig-NIF-i-cant — 4 âm tiết. Âm cuối /kənt/ schwa" },
    ],
    minimalPairs: [
        ["ac-a-DEM-ic (đúng)", "A-ca-dem-ic (sai)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Urbanization causes environmental degradation", vn: "Đô thị hóa gây ra sự suy thoái môi trường" },
      { en: "We must halt illegal deforestation", vn: "Chúng ta phải ngăn chặn nạn phá rừng trái phép" },
      { en: "Transition to renewable energy is vital", vn: "Chuyển đổi sang năng lượng tái tạo là thiết yếu" },
      { en: "Artificial intelligence transforms industries", vn: "Trí tuệ nhân tạo biến đổi các ngành công nghiệp" },
      { en: "Factory automation increases efficiency", vn: "Tự động hóa nhà máy tăng hiệu quả sản xuất" },
      { en: "They designed a new school curriculum", vn: "Họ đã thiết kế chương trình học mới" },
      { en: "Modern pedagogy places students first", vn: "Sư phạm hiện đại coi học sinh là hàng đầu" },
      { en: "Exercise boosts the immune system", vn: "Tập thể dục giúp tăng cường hệ miễn dịch" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit41-reading-1",
    title: "Understanding IELTS Band Scores",
    title_vn: "Đọc đoạn về điểm IELTS và kỹ năng thi",
    level: "B2" as const,
    text:
      "The International English Language Testing System (IELTS) is widely recognised " +
      "by universities, employers, and immigration authorities worldwide. " +
      "The test assesses four skills: Listening, Reading, Writing, and Speaking. " +
      "Each section is scored on a scale from 0 to 9, and an overall Band Score is calculated. " +
      "A Band 6 corresponds approximately to B2 level, while Band 7 indicates C1. " +
      "Many prestigious universities require a minimum Band 6.5 or 7 for admission. " +
      "In the Writing section, candidates are assessed on task achievement, " +
      "coherence and cohesion, lexical resource, and grammatical range and accuracy. " +
      "In the Speaking section, fluency, vocabulary, pronunciation, and grammatical accuracy are evaluated. " +
      "Vietnamese candidates often score lower in Speaking and Writing due to less exposure " +
      "to productive language use. " +
      "Regular practice with authentic materials and feedback from qualified teachers " +
      "can significantly improve your score within three to six months.",
    questions: [
      {
        id: "u41r-q1",
        question_vn: "IELTS đánh giá bao nhiêu kỹ năng?",
        options: ["Two", "Three", "Four", "Five"],
        answer: "Four",
        explanation_vn: "'The test assesses four skills: Listening, Reading, Writing, and Speaking.'",
      },
      {
        id: "u41r-q2",
        question_vn: "Band 6 tương đương với trình độ CEFR nào?",
        options: ["A2", "B1", "B2", "C1"],
        answer: "B2",
        explanation_vn: "'A Band 6 corresponds approximately to B2 level.'",
      },
      {
        id: "u41r-q3",
        question_vn: "Trong phần Writing, thí sinh được đánh giá theo những tiêu chí nào?",
        options: [
          "Speed and accuracy",
          "Task achievement, coherence, lexical resource, and grammatical range",
          "Spelling and punctuation only",
          "Length and topic relevance",
        ],
        answer: "Task achievement, coherence, lexical resource, and grammatical range",
        explanation_vn: "'candidates are assessed on task achievement, coherence and cohesion, lexical resource, and grammatical range and accuracy.'",
      },
      {
        id: "u41r-q4",
        question_vn: "Thí sinh Việt Nam thường gặp khó khăn ở phần nào?",
        options: [
          "Listening and Reading",
          "Reading and Speaking",
          "Speaking and Writing",
          "Listening and Writing",
        ],
        answer: "Speaking and Writing",
        explanation_vn: "'Vietnamese candidates often score lower in Speaking and Writing.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Discussing sustainability in corporate strategy",
      focus: "IELTS topic in business context",
      context: "board meeting on green policies",
      l1Note: "⚠️ Environmental collocations. 'Renewable energy' vs 'fossil fuels'.",
      example: "We must invest in renewable energy to combat climate change."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "o0rJkAiqcZs",
};

export default unit41;
