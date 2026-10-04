import { UnitData } from "@/lib/lessons/lesson-spec";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-30 — Health & Environment  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit30: UnitData = {
  unitId: "unit-30",
  title: "Unit 30: Health & Environment",
  level: "B1",
  xp: 100,
  estimatedTime: 55,
  description: "Abstract Topics — Thảo luận về các vấn đề sức khỏe cộng đồng và môi trường toàn cầu. Nền tảng từ vựng cực kỳ quan trọng cho IELTS Reading & Listening.",
  badgeName: "Đại Sứ Xanh",
  badgeEmoji: "🌱",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Thảo luận nhóm tại trường học hoặc câu lạc bộ về chủ đề bảo vệ môi trường. Các thành viên chia sẻ quan điểm về biến đổi khí hậu và lối sống bền vững. Sử dụng cấu trúc câu giả định 'It is important to...' hoặc 'It is crucial that...' để trình bày quan điểm mang tính học thuật.",
  learningOutcomes: [
    "Sử dụng từ vựng về môi trường và sức khỏe ở mức độ B1+ một cách tự tin",
    "Trình bày các quan điểm và lập luận về các vấn đề xã hội trừu tượng",
    "Sử dụng cấu trúc 'It is + adjective + to-V' để nhấn mạnh tầm quan trọng của hành động",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Khi thảo luận về môi trường và sức khỏe toàn cầu trong các kỳ thi IELTS/TOEIC, người học cần sử dụng từ vựng chuyên ngành cơ bản (collocations) như <span class="text-emerald-400">"sustainable development"</span> (phát triển bền vững) hoặc <span class="text-emerald-400">"protect the ecosystem"</span> (bảo vệ hệ sinh thái) thay vì các từ quá chung chung để đạt điểm tiêu chí Lexical Resource cao.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🌍", en: "It is crucial to protect our planet for future generations.", vn: "Việc bảo vệ hành tinh của chúng ta cho các thế hệ tương lai là cực kỳ quan trọng.", context: "It is crucial to + V — cấu trúc nhấn mạnh" },
    { emoji: "🥦", en: "A healthy diet is key to disease prevention.", vn: "Chế độ ăn lành mạnh là chìa khóa để phòng ngừa bệnh tật.", context: "prevention — danh từ từ prevent" },
    { emoji: "☀️", en: "Climate change has become a major global challenge.", vn: "Biến đổi khí hậu đã trở thành một thách thức lớn toàn cầu.", context: "climate change — biến đổi khí hậu" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "conservation", emoji: "🌲", phonetic: "/ˌkɒnsəˈveɪʃən/", meaning: "sự bảo tồn", example: "Wildlife conservation is essential for maintaining biodiversity.", example2: "The government has funded several conservation projects.", collocation: "wildlife conservation / conservation efforts / energy conservation", audio: "/audio/unit-30/conservation.mp3", l1_interference_vn: "⚠️ \'Conservation OF\': \'conservation of wildlife\'. Giới từ \'of\'. Phân biệt với \'preservation\'." },
    { id: 2, word: "environment", emoji: "🌿", phonetic: "/ɪnˈvaɪrənmənt/", meaning: "môi trường", example: "We must take action to protect the environment.", example2: "A clean environment leads to better public health.", collocation: "protect the environment / damage the environment / natural environment", audio: "/audio/unit-30/environment.mp3" },
    { id: 3, word: "pollution", emoji: "💨", phonetic: "/pəˈluːʃən/", meaning: "sự ô nhiễm", example: "Air pollution is a serious problem in big cities.", example2: "They are trying to reduce plastic pollution in the oceans.", collocation: "air pollution / water pollution / reduce pollution", audio: "/audio/unit-30/pollution.mp3", l1_interference_vn: "⚠️ Không đếm được: \'reduce pollution\'. Không có \'a pollution\' hay \'pollutions\'." },
    { id: 4, word: "sustainable", emoji: "♻️", phonetic: "/səˈsteɪnəbəl/", meaning: "bền vững", example: "We need to promote sustainable energy sources like solar power.", example2: "Organic farming is a sustainable agricultural practice.", collocation: "sustainable development / sustainable energy / sustainable lifestyle", audio: "/audio/unit-30/sustainable.mp3", l1_interference_vn: "⚠️ Thường trước danh từ: \'sustainable development/energy/growth\'." },
    { id: 5, word: "medical", emoji: "🏥", phonetic: "/ˈmedɪkəl/", meaning: "thuộc về y tế / y khoa", example: "He has been receiving medical treatment for a week.", example2: "The library has a large collection of medical journals.", collocation: "medical treatment / medical research / medical staff", audio: "/audio/unit-30/medical.mp3" },
    { id: 6, word: "prevention", emoji: "🛡️", phonetic: "/rɪˈvenʃən/", meaning: "sự phòng ngừa / ngăn chặn", example: "Crime prevention is the responsibility of everyone.", example2: "Regular exercise is important for the prevention of heart disease.", collocation: "disease prevention / fire prevention / prevention methods", audio: "/audio/unit-30/prevention.mp3" },
    { id: 7, word: "climate change", emoji: "🌡️", phonetic: "/ˈklaɪmət tʃeɪndʒ/", meaning: "biến đổi khí hậu", example: "Global warming is the main cause of climate change.", example2: "Many species are threatened by climate change.", collocation: "fight climate change / effects of climate change / climate change policy", audio: "/audio/unit-30/climate_change.mp3" },
    { id: 8, word: "resource", emoji: "💎", phonetic: "/rɪˈzɔːs/", meaning: "tài nguyên", example: "Water is one of our most precious natural resources.", example2: "The country is rich in mineral resources.", collocation: "natural resource / human resources / limited resources", audio: "/audio/unit-30/resource.mp3", l1_interference_vn: "⚠️ Thường số nhiều: \'natural resources\', \'human resources\'. \'A resource\' = một tài nguyên cụ thể." },
    { id: 9, word: "ecosystem", emoji: "🐠", phonetic: "/ˈiːkəʊˌsɪstəm/", meaning: "hệ sinh thái", example: "Deforestation damages the local ecosystem.", example2: "Coral reefs support a diverse marine ecosystem.", collocation: "marine ecosystem / delicate ecosystem / protect the ecosystem", audio: "/audio/unit-30/ecosystem.mp3", l1_interference_vn: "⚠️ Đếm được: \'an ecosystem\', \'ecosystems\'. Phân biệt với \'environment\' (rộng hơn)." },
    { id: 10, word: "organic", emoji: "🍎", phonetic: "/ɔːˈɡænɪk/", meaning: "hữu cơ", example: "More consumers are choosing organic food nowadays.", example2: "They only use organic fertilizers in their garden.", collocation: "organic food / organic farming / organic chemistry", audio: "/audio/unit-30/organic.mp3", l1_interference_vn: "⚠️ Nghĩa rộng trong tiếng Anh: \'organic food\', \'organic growth\' (tự nhiên), \'organic chemistry\'." },
    { id: 11, word: "global warming", emoji: "🥵", phonetic: "/ˈɡləʊbəl ˈwɔːmɪŋ/", meaning: "sự nóng lên toàn cầu", example: "Global warming is melting the polar ice caps.", example2: "We must reduce greenhouse gases to slow down global warming.", collocation: "slow down global warming / effects of global warming / combat global warming", audio: "/audio/unit-30/global_warming.mp3" },
    { id: 12, word: "biodiversity", emoji: "🦋", phonetic: "/ˌbaɪəʊdaɪˈvɜːsəti/", meaning: "đa dạng sinh học", example: "The rainforest is famous for its rich biodiversity.", example2: "Loss of biodiversity is a global environmental crisis.", collocation: "rich biodiversity / protect biodiversity / loss of biodiversity", audio: "/audio/unit-30/biodiversity.mp3", l1_interference_vn: "⚠️ Không đếm được — không có số nhiều. \'Protect biodiversity\' (không có \'a biodiversity\')." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Hội thảo về lối sống xanh",
      audio: "/audio/unit-30/dialogue_1.mp3",
      desc: "Nam và Emma thảo luận về các cách bảo vệ hệ sinh thái địa phương.",
      lines: [
        { id: "d1-1", speaker: "Nam", text: "It is important to protect our local ecosystem. Have you noticed the plastic pollution in the canal?", translation: "Bảo vệ hệ sinh thái địa phương của chúng ta là rất quan trọng. Bạn có nhận thấy ô nhiễm nhựa ở con kênh không?" },
        { id: "d1-2", speaker: "Emma", text: "Yes, it is terrible. We should encourage people to switch to sustainable products.", translation: "Có, thật khủng khiếp. Chúng ta nên khuyến khích mọi người chuyển sang các sản phẩm bền vững." },
        { id: "d1-3", speaker: "Nam", text: "Absolutely. Using organic food and reducing waste are good ways to start.", translation: "Hoàn toàn đồng ý. Sử dụng thực phẩm hữu cơ và giảm thiểu rác thải là những cách tốt để bắt đầu." },
        { id: "d1-4", speaker: "Emma", text: "Also, wildlife conservation efforts are needed here because of the loss of biodiversity.", translation: "Ngoài ra, các nỗ lực bảo tồn động vật hoang dã cũng cần thiết ở đây vì sự suy giảm đa dạng sinh học." },
        { id: "d1-5", speaker: "Nam", text: "Right. It is crucial that the community works together to preserve our natural resources.", translation: "Đúng vậy. Cộng đồng cùng hợp tác để gìn giữ tài nguyên thiên nhiên của chúng ta là cực kỳ quan trọng." },
      ],
    },
    {
      id: 2,
      title: "Lời khuyên về sức khỏe cộng đồng",
      audio: "/audio/unit-30/dialogue_2.mp3",
      desc: "Bác sĩ khuyên bệnh nhân về cách phòng ngừa bệnh tật.",
      lines: [
        { id: "d2-1", speaker: "Doctor", text: "Regular check-ups are key to the prevention of chronic diseases.", translation: "Kiểm tra sức khỏe định kỳ là chìa khóa để phòng ngừa các bệnh mãn tính." },
        { id: "d2-2", speaker: "Patient", text: "Is it necessary to have a medical scan every year?", translation: "Có cần thiết phải quét y khoa mỗi năm không bác sĩ?" },
        { id: "d2-3", speaker: "Doctor", text: "Not always, but it is highly recommended to maintain a balanced lifestyle and eat organic vegetables.", translation: "Không hẳn lúc nào cũng cần, nhưng duy trì một lối sống cân bằng và ăn rau hữu cơ được khuyến khích mạnh mẽ." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "It is crucial to protect our planet for future generations.", options: ["It is crucial to protect our planet for future generations.", "It is easy to destroy our environment globally.", "Climate change is not a major issue today.", "Public health has improved significantly recently."], answer: "It is crucial to protect our planet for future generations." },
    { id: "lac2", audio_text: "Air pollution is a serious problem in big cities.", options: ["Water pollution is solved in big cities.", "Air pollution is a serious problem in big cities.", "Deforestation damages the marine ecosystem.", "Organic food is cheaper in big cities."], answer: "Air pollution is a serious problem in big cities." },
    { id: "lac3", audio_text: "Water is one of our most precious natural resources.", options: ["Gold is a rare metal resource for us.", "Forests are disappearing due to farming.", "Water is one of our most precious natural resources.", "Biodiversity is decreasing in the oceans."], answer: "Water is one of our most precious natural resources." },
    { id: "lac4", audio_text: "Regular exercise is important for the prevention of heart disease.", options: ["Regular exercise is important for the prevention of heart disease.", "Medical research has found a cure for cancer.", "Healthy diet cannot prevent chronic illness.", "Conservation efforts are very expensive."], answer: "Regular exercise is important for the prevention of heart disease." },
    { id: "lac5", audio_text: "The rainforest is famous for its rich biodiversity.", options: ["The rainforest is famous for its dry weather.", "The ecosystem of the desert has no water.", "The rainforest is famous for its rich biodiversity.", "Many resources are imported from the rainforest."], answer: "The rainforest is famous for its rich biodiversity." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "It is {input} to reduce {input} because it directly damages our {input}.",
    level1Placeholder: "Ví dụ: crucial — pollution — ecosystem...",
    level2Situation: "Bạn tham gia một bài nói ngắn về biến đổi khí hậu trong buổi thi nói tiếng Anh. Hãy: (1) Nêu vấn đề biến đổi khí hậu do sự nóng lên toàn cầu gây ra, (2) Nhấn mạnh việc bảo tồn tài nguyên thiên nhiên là cực kỳ quan trọng, (3) Đề xuất lối sống bền vững.",
    level2Hint: "Climate change is caused by global warming. It is crucial to protect our natural resources and local ecosystems. We should adopt a more sustainable lifestyle to prevent further environmental damage.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "It is + Adjective + to-infinitive / that clause — Cấu Trúc Giả Định",
    rule: "Công thức để nhấn mạnh tầm quan trọng, tính cấp thiết hoặc ý kiến khách quan:\n\n1. It is + adjective + to + Verb-infinitive\n   → 'It is important to protect the environment.'\n2. It is + adjective + that + Subject + Verb-infinitive (Subjunctive mood - giả định)\n   → 'It is crucial that the community work together.' (Động từ 'work' để nguyên thể không chia)\n\nCác tính từ phổ biến: important (quan trọng), crucial (cực kỳ quan trọng), essential (thiết yếu), necessary (cần thiết), recommended (khuyến nghị).",
    examples: [
      { en: "It is essential to reduce plastic pollution. (general recommendation)", vn: "Việc giảm thiểu ô nhiễm nhựa là thiết yếu." },
      { en: "It is crucial that we take action immediately. (strong urgency)", vn: "Việc chúng ta hành động ngay lập tức là cực kỳ quan trọng." },
      { en: "It is not necessary to run medical scans every year. (opinion/advice)", vn: "Việc thực hiện các xét nghiệm quét y khoa mỗi năm là không cần thiết." },
    ],
    tip: "Khi viết bài luận IELTS Task 2, hãy thay đổi cấu trúc câu bằng cách dùng câu giả định 'It is + adj + to-V' thay vì lặp đi lặp lại 'We should' hoặc 'We must'. Cách này giúp câu văn mang tính khách quan và học thuật hơn.",
    vnNote: "⚠️ Chú ý ngữ pháp giả định: Trong cấu trúc 'It is crucial that S + V-inf', động từ ở vế 'that' luôn giữ nguyên thể (không chia theo thì hay theo ngôi chủ ngữ). Ví dụ: 'It is essential that he study' chứ không phải 'he studies'.",
    dialogueExample: {
      speaker: "Nam",
      text: "It is important to protect our local ecosystem.",
      translation: "Bảo vệ hệ sinh thái địa phương của chúng ta là rất quan trọng.",
      highlight: "It is important to protect (cấu trúc câu giả định giúp nêu quan điểm khách quan, trang trọng)",
    },
    ccq: {
      question: "Chọn câu chia đúng ngữ pháp giả định (Subjunctive mood):",
      options: [
        "It is essential that she consumes organic food.",
        "It is essential that she consume organic food.",
        "It is essential that she to consume organic food.",
        "It is essential for she to consume organic food.",
      ],
      answer: "It is essential that she consume organic food.",
      explanation: "Sau 'It is essential that', động từ ở vế sau phải ở dạng nguyên thể không chia (consume), bất kể chủ ngữ là ngôi thứ ba số ít (she).",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'It is crucial for us ___ natural resources.'", options: ["protect", "protecting", "to protect", "protected"], answer: "to protect" },
    { id: "pq2", type: "multiple-choice", question: "Tìm từ trái nghĩa với 'destructive':", options: ["pollution", "sustainable", "medical", "biodiversity"], answer: "sustainable" },
    { id: "pq3", type: "cloze", question: "Điền: 'It is important that everyone ___ (be) aware of climate change.'", answer: "be" },
    { id: "pq4", type: "multiple-choice", question: "Chọn từ điền vào chỗ trống: 'Air ___ is worsening in metropolitan areas.'", options: ["conservation", "pollution", "resource", "biodiversity"], answer: "pollution" },
    { id: "pq5", type: "cloze", question: "Điền từ: 'It is essential ___ preserve our ecosystem.'", answer: "to" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối thuật ngữ môi trường và sức khỏe với nghĩa đúng",
    pairs: [
      { left: "biodiversity", right: "đa dạng sinh học" },
      { left: "global warming", right: "sự nóng lên toàn cầu" },
      { left: "prevention", right: "sự phòng ngừa" },
      { left: "conservation", right: "sự bảo tồn" },
      { left: "sustainable", right: "bền vững" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Việc giảm thiểu lượng khí thải nhà kính là cực kỳ quan trọng.",
      answer: "It is crucial to reduce greenhouse gas emissions.",
    },
    {
      id: "pt-2",
      prompt_vn: "Bảo vệ môi trường là trách nhiệm của tất cả chúng ta.",
      answer: "Protecting the environment is the responsibility of all of us.",
    },
    {
      id: "pt-3",
      prompt_vn: "Phòng ngừa ô nhiễm tốt hơn chữa trị sau này.",
      answer: "Prevention of pollution is better than cure later.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc30-1",
      sentence: "Plastic should recycle to save the planet.",
      errorWord: "recycle",
      correction: "be recycled",
      explanation_vn: "Bi dạng bị động với modal: 'should BE recycled'. 'Should recycle' là chủ động, sai ngữ nghĩa.",
    },
    {
      id: "sc30-2",
      sentence: "Trees are cut everyday to make furniture.",
      errorWord: "everyday",
      correction: "every day",
      explanation_vn: "'Every day' (mỗi ngày) viết tách hai từ; 'everyday' (tính từ) nghĩa là hằng ngày/bình thường.",
    },
  ],


  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la30-1",
      audio_text: "Plastic should be recycled to protect the environment.",
      prompt_vn: "Nhựa phải được tái chế để bảo vệ môi trường.",
      words: ["Plastic", "should", "be", "recycled", "to", "protect", "the", "environment", ".", "recycle", "reduce"],
      answer: "Plastic should be recycled to protect the environment .",
    },
    {
      id: "la30-2",
      audio_text: "We must reduce our use of fossil fuels.",
      prompt_vn: "Chúng ta phải giảm sử dụng nhiên liệu hóa thạch.",
      words: ["We", "must", "reduce", "our", "use", "of", "fossil", "fuels", ".", "should", "stop"],
      answer: "We must reduce our use of fossil fuels .",
    },
  ],


  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Bảo vệ tài nguyên thiên nhiên là vô cùng thiết yếu.",
      words: ["It", "is", "essential", "to", "protect", "natural", "resources", ".", "would", "could"],
      answer: "It is essential to protect natural resources .",
    },
    {
      id: "wb2",
      prompt_vn: "Biến đổi khí hậu đang đe dọa hệ sinh thái biển.",
      words: ["Climate", "change", "is", "threatening", "the", "marine", "ecosystem", ".", "would", "could"],
      answer: "Climate change is threatening the marine ecosystem .",
    },
    {
      id: "wb3",
      prompt_vn: "Thực phẩm hữu cơ ngày càng trở nên phổ biến.",
      words: ["Organic", "food", "is", "becoming", "more", "popular", "nowadays", ".", "would", "could"],
      answer: "Organic food is becoming more popular nowadays .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s30-1", prompt_vn: "Bảo vệ tài nguyên thiên nhiên là vô cùng thiết yếu.", words: ["It", "is", "essential", "to", "protect", "natural", "resources", "."], answer: "It is essential to protect natural resources ." },
    { id: "s30-2", prompt_vn: "Biến đổi khí hậu đang đe dọa hệ sinh thái biển.", words: ["Climate", "change", "is", "threatening", "the", "marine", "ecosystem", "."], answer: "Climate change is threatening the marine ecosystem ." },
    { id: "s30-3", prompt_vn: "Thực phẩm hữu cơ ngày càng trở nên phổ biến.", words: ["Organic", "food", "is", "becoming", "more", "popular", "nowadays", "."], answer: "Organic food is becoming more popular nowadays ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Dịch câu: 'Việc giảm thiểu lượng khí thải nhà kính là cực kỳ quan trọng.'", options: ["It is crucial to reduce greenhouse gas emissions.", "It is easy to reduce greenhouse gas emissions.", "We should not reduce greenhouse gas emissions.", "Greenhouse gases are crucial to reduce."], answer: "It is crucial to reduce greenhouse gas emissions.",
      explanation_vn: "'It is crucial to + V' = cấu trúc giả định nhấn mạnh tầm quan trọng. 'It is easy' sai nghĩa; 'Greenhouse gases are crucial to reduce' lộn cấu trúc." },
    { id: "fq2", type: "cloze", question: "Điền từ: 'Wildlife ___ (sự bảo tồn) requires global cooperation.'", answer: "conservation" },
    { id: "fq3", type: "multiple-choice", question: "Từ nào mô tả việc giữ cho môi trường bền vững?", options: ["polluted", "sustainable", "medical", "limited"], answer: "sustainable",
      explanation_vn: "'Sustainable' = bền vững, không gây hại môi trường lâu dài. 'Polluted' = ô nhiễm; 'medical' = y tế — không liên quan." },
    { id: "fq4", type: "translate", question: "Dịch: 'Tập thể dục giúp phòng ngừa nhiều bệnh tật.'", answer: "Exercise helps in the prevention of many diseases." },
    { id: "fq5", type: "multiple-choice", question: "Điền động từ đúng: 'It is recommended that he ___ smoking.'", options: ["stops", "stop", "stopped", "to stop"], answer: "stop",
      explanation_vn: "Sau 'It is recommended that S + ...' dùng subjunctive (ngưyên thể): 'he stop', không phải 'he stops' hay 'he stopped'." },
    { id: "q-ex1", type: "multiple-choice", question: "'Should have done' diễn tả:", options: ["Kế hoạch tương lai", "Tiếc về quá khứ — đã không làm điều nên làm", "Lời khuyên hiện tại", "Khả năng"], answer: "Tiếc về quá khứ — đã không làm điều nên làm" },
    { id: "q-ex2", type: "multiple-choice", question: "Câu đúng:", options: ["You should have told me.", "You should told me.", "You should have tell me.", "You should have been telling me."], answer: "You should have told me." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'We ___ reduce plastic waste.' (cần phải)", answer: "need to" },
    { id: "q-ex4", type: "multiple-choice", question: "'Carbon footprint' nghĩa là:", options: ["Dấu chân trên carbon", "Lượng khí CO2 thải ra", "Loại nhiên liệu", "Loại cây trồng"], answer: "Lượng khí CO2 thải ra" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Chúng ta nên tái chế rác.'", answer: "We should recycle waste." },
    { id: "q-ex6", type: "multiple-choice", question: "'Renewable energy' là:", options: ["Năng lượng hóa thạch", "Năng lượng tái tạo", "Năng lượng hạt nhân", "Năng lượng tiêu thụ"], answer: "Năng lượng tái tạo" },
    { id: "q-ex7", type: "multiple-choice", question: "'Unless we act now, it ___ too late.'", options: ["will be", "would be", "is", "was"], answer: "will be" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr30-1", question: "Ôn tập Unit 29 — Chọn từ: 'I propose that we ___ our website photos.'", options: ["optimize", "optimizes", "optimized", "optimizing"], answer: "optimize", type: "multiple-choice" },
    { id: "cr30-2", question: "Ôn tập Unit 28 — Điền: 'How long ___ they ___ (work) on this environment project?'", options: [], answer: "have they been working", type: "cloze" },
    { id: "cr30-3", question: "Ôn tập Unit 27 — Chọn phrasal verb có nghĩa là 'thực hiện':", options: ["carry out", "give up", "look up", "deal with"], answer: "carry out", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "should've /ˈʃʊdəv/",
    description: "Should have — nối âm và giảm âm trong văn nói",
    examples: [
        { word: "should have", ipa: "/ʃʊd həv/", tip: "Nối âm nhanh: should've /ˈʃʊdəv/ — phổ biến hơn should have đầy đủ" },
        { word: "shouldn't have", ipa: "/ˈʃʊdənt əv/", tip: "Âm /t/ giữa thường yếu: shouldn't've trong văn nói" },
    ],
    minimalPairs: [
        ["should've /ˈʃʊdəv/", "should have (đầy đủ)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "It is important to protect the environment", vn: "Việc bảo vệ môi trường là rất quan trọng" },
      { en: "Climate change is a global challenge", vn: "Biến đổi khí hậu là thách thức toàn cầu" },
      { en: "We need sustainable development", vn: "Chúng ta cần sự phát triển bền vững" },
      { en: "Air pollution is getting worse", vn: "Ô nhiễm không khí đang trở nên tồi tệ hơn" },
      { en: "It is crucial to take action", vn: "Hành động ngay là cực kỳ quan trọng" },
      { en: "We must protect natural resources", vn: "Chúng ta phải bảo vệ tài nguyên thiên nhiên" },
      { en: "Regular exercise prevents diseases", vn: "Tập thể dục thường xuyên giúp ngăn ngừa bệnh tật" },
      { en: "Organic farming is good for soil", vn: "Canh tác hữu cơ tốt cho đất" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit30-reading-1",
    title: "Living Sustainably",
    title_vn: "Đọc đoạn về lối sống bền vững",
    level: "B1" as const,
    text:
      "Climate change is one of the most urgent challenges of our time. " +
      "Scientists warn that it is essential to reduce greenhouse gas emissions significantly. " +
      "It is crucial that governments, businesses, and individuals all take action together. " +
      "It is recommended that households reduce plastic usage by switching to reusable bags and bottles. " +
      "Conservation of natural resources such as water and energy is also vital. " +
      "In Vietnam, biodiversity loss is a growing concern, particularly in coastal areas. " +
      "Air pollution in major cities has been increasing due to rapid urbanisation and traffic. " +
      "However, there are reasons for optimism. " +
      "Organic farming is becoming more popular, reducing the use of harmful pesticides. " +
      "Solar energy investment is rising. " +
      "It is important that we all adopt more sustainable habits in our daily lives. " +
      "Prevention is always better than cure when it comes to environmental damage.",
    questions: [
      {
        id: "u30r-q1",
        question_vn: "Theo các nhà khoa học, điều gì là thiết yếu?",
        options: [
          "To increase production",
          "To reduce greenhouse gas emissions",
          "To build more factories",
          "To increase air travel",
        ],
        answer: "To reduce greenhouse gas emissions",
        explanation_vn: "'it is essential to reduce greenhouse gas emissions significantly.'",
      },
      {
        id: "u30r-q2",
        question_vn: "Các hộ gia đình được khuyến nghị làm gì?",
        options: [
          "Move to the countryside",
          "Use more electricity",
          "Reduce plastic usage by switching to reusable bags and bottles",
          "Stop using cars",
        ],
        answer: "Reduce plastic usage by switching to reusable bags and bottles",
        explanation_vn: "'It is recommended that households reduce plastic usage by switching to reusable bags and bottles.'",
      },
      {
        id: "u30r-q3",
        question_vn: "Tại sao ô nhiễm không khí đang gia tăng ở các thành phố lớn?",
        options: [
          "Due to industrial farming",
          "Due to rapid urbanisation and traffic",
          "Due to deforestation",
          "Due to ocean pollution",
        ],
        answer: "Due to rapid urbanisation and traffic",
        explanation_vn: "'Air pollution in major cities has been increasing due to rapid urbanisation and traffic.'",
      },
      {
        id: "u30r-q4",
        question_vn: "Lý do nào để lạc quan được đề cập trong đoạn văn?",
        options: [
          "Climate change has stopped",
          "Organic farming and solar energy are growing",
          "Air pollution is decreasing",
          "Biodiversity is recovering",
        ],
        answer: "Organic farming and solar energy are growing",
        explanation_vn: "'Organic farming is becoming more popular... Solar energy investment is rising.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Phỏng vấn ứng viên cho vị trí junior developer",
      focus: "Interview questions: experience, problem solving, culture fit",
      context: "Technical interview panel tại công ty VN cho vị trí IT",
      l1Note: "⚠️ 'Tell me about a project you are proud of.' 'How do you handle tight deadlines?' 'Why do you want to join us?'",
      example: "Can you walk me through a bug you fixed recently? What would you do if requirements changed mid-sprint?"
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "kX6QmBMvpkE",
};

export default unit30;
