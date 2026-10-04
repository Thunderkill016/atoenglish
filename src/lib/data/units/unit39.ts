import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-39 — Speculation & Deduction  (B2)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit39: UnitData = {
  unitId: "unit-39",
  title: "Unit 39: Speculation & Deduction",
  level: "B2",
  xp: 120,
  estimatedTime: 60,
  description: "Modal Perfect — Động từ khuyết thiếu hoàn thành (must have, can't have, might have, should have + V3). Suy đoán và lập luận logic về các sự kiện trong quá khứ. Cốt lõi của IELTS Listening và Speaking Part 3.",
  badgeName: "Nhà Thám Tử",
  badgeEmoji: "🕵️‍♂️",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Văn phòng xảy ra sự cố rò rỉ thông tin dự án mật cho đối thủ cạnh tranh. Nhóm quản lý đang điều tra nguyên nhân. Bạn cần sử dụng các cấu trúc suy đoán quá khứ ('must have leaked', 'can't have forgotten') dựa trên các bằng chứng và manh mối thực tế để tìm ra sự thật.",
  learningOutcomes: [
    "Sử dụng các cấu trúc Modal Perfect để suy đoán mức độ chắc chắn về sự kiện quá khứ",
    "Phân tích mâu thuẫn, bác bỏ giả thuyết sai lệch và rút ra kết luận logic trong công việc",
    "Sử dụng từ vựng về lập luận, suy luận và chứng cứ ở cấp độ B2+",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Trong giao tiếp học thuật và chuyên nghiệp, khi đưa ra suy đoán (<span class="text-emerald-400">speculation</span>), việc dùng đúng động từ khuyết thiếu thể hiện độ chính xác khoa học. Dùng <span class="text-emerald-400">"must have"</span> chỉ khi có bằng chứng rõ ràng (<span class="text-emerald-400">proof</span>), dùng <span class="text-emerald-400">"might have"</span> khi chỉ là giả thuyết, và tránh bác bỏ (<span class="text-emerald-400">dismiss</span>) ý kiến của người khác một cách thiếu căn cứ.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "🔍", en: "She must have forgotten her password because the account is locked.", vn: "Cô ấy chắc chắn đã quên mật khẩu vì tài khoản đã bị khóa.", context: "must have + PP — chắc chắn đã xảy ra" },
    { emoji: "❌", en: "He can't have leaked the document; he didn't have access.", vn: "Anh ấy chắc chắn đã không làm rò rỉ tài liệu; anh ấy không có quyền truy cập.", context: "can't have + PP — chắc chắn đã không xảy ra" },
    { emoji: "💡", en: "They might have rescheduled the meeting without informing us.", vn: "Có lẽ họ đã lên lịch lại cuộc họp mà không thông báo cho chúng ta.", context: "might have + PP — có khả năng đã xảy ra" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "speculation", emoji: "💭", phonetic: "/ˌspekjʊˈleɪʃən/", meaning: "sự suy đoán / giả thuyết", example: "There is a lot of speculation about who will be the next CEO.", example2: "The report is based on facts, not speculation.", collocation: "pure speculation / fuel speculation / speculation about", audio: "/audio/unit-39/speculation.mp3", l1_interference_vn: "⚠️ Đừng dịch 'word' theo nghĩa đen từng từ — học theo collocation trong ví dụ." },
    { id: 2, word: "deduction", emoji: "🧠", phonetic: "/dɪˈdʌkʃən/", meaning: "sự suy luận / kết luận rút ra", example: "His deduction turned out to be correct.", example2: "Through logical deduction, she identified the fault.", collocation: "logical deduction / deduction from / make a deduction", audio: "/audio/unit-39/deduction.mp3", l1_interference_vn: "⚠️ Người Việt hay bỏ mạo từ 'the/a' trước 'deduction' trong câu trang trọng." },
    { id: 3, word: "proof", emoji: "📄", phonetic: "/pruːf/", meaning: "chứng cứ / bằng chứng xác thực", example: "Do you have any proof that he signed the contract?", example2: "The video is clear proof of the system failure.", collocation: "conclusive proof / proof of purchase / need proof", audio: "/audio/unit-39/proof.mp3", l1_interference_vn: "⚠️ 'proof' thường đi với giới từ cố định — xem collocation, không dùng 'of/for' tùy tiện." },
    { id: 4, word: "trace", emoji: "🐾", phonetic: "/treɪs/", meaning: "dấu vết / manh mối nhỏ", example: "The hackers left no trace of their activity in the system.", example2: "We found traces of water in the server room.", collocation: "leave a trace / find a trace / trace elements", audio: "/audio/unit-39/trace.mp3", l1_interference_vn: "⚠️ Phát âm cuối âm tiết của 'trace' rõ (/s/, /t/, /d/) — IELTS speaking." },
    { id: 5, word: "credible", emoji: "📰", phonetic: "/ˈkredəbəl/", meaning: "đáng tin cậy", example: "We need to find a credible source for this information.", example2: "Her explanation was not very credible.", collocation: "credible source / highly credible / credible evidence", audio: "/audio/unit-39/credible.mp3", l1_interference_vn: "⚠️ 'credible' là danh từ không đếm được hoặc đếm được — không thêm 's' sai ngữ cảnh." },
    { id: 6, word: "deduce", emoji: "🧐", phonetic: "/dɪˈdjuːs/", meaning: "suy ra / kết luận dựa trên thực tế", example: "From the data, we can deduce that sales will rise next quarter.", example2: "What did you deduce from the survey results?", collocation: "deduce from / manage to deduce", audio: "/audio/unit-39/deduce.mp3", l1_interference_vn: "⚠️ Trong email B2, 'deduce' đứng trong cụm trang trọng — tránh cấu trúc câu kiểu tiếng Việt." },
    { id: 7, word: "imply", emoji: "💬", phonetic: "/ɪmˈplaɪ/", meaning: "ngụ ý / ám chỉ", example: "Are you implying that the error was my fault?", example2: "The report implies that the company is facing financial trouble.", collocation: "imply that / clearly imply / imply meaning", audio: "/audio/unit-39/imply.mp3" },
    { id: 8, word: "conclude", emoji: "🏁", phonetic: "/kənˈkluːd/", meaning: "kết luận", example: "The meeting concluded with a call for action.", example2: "The investigators concluded that the crash was due to human error.", collocation: "conclude that / conclude a meeting / final conclusion", audio: "/audio/unit-39/conclude.mp3" },
    { id: 9, word: "inference", emoji: "🧠", phonetic: "/ˈɪnfərəns/", meaning: "sự suy luận / kết luận rút ra từ bằng chứng", example: "The reader must make inferences based on the text.", example2: "Your inference is not supported by the data.", collocation: "draw an inference / logical inference / inference based on", audio: "/audio/unit-39/inference.mp3" },
    { id: 10, word: "apparent", emoji: "👁️", phonetic: "/əˈpærənt/", meaning: "rõ ràng / hiển nhiên", example: "It became apparent that the project would fail.", example2: "For no apparent reason, the server stopped working.", collocation: "apparent contradiction / apparent failure / become apparent", audio: "/audio/unit-39/apparent.mp3" },
    { id: 11, word: "dismiss", emoji: "🗑️", phonetic: "/dɪsˈmɪs/", meaning: "bác bỏ / giải tán / sa thải", example: "The manager dismissed our concerns as unimportant.", example2: "He was dismissed from his job for poor performance.", collocation: "dismiss an idea / dismiss a claim / dismiss from work", audio: "/audio/unit-39/dismiss.mp3" },
    { id: 12, word: "contradict", emoji: "🔄", phonetic: "/ˌkɒntrəˈdɪkt/", meaning: "mâu thuẫn / trái ngược với", example: "His statements contradict the evidence gathered.", example2: "The two reports completely contradict each other.", collocation: "completely contradict / contradict oneself / direct contradiction", audio: "/audio/unit-39/contradict.mp3" },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Điều tra rò rỉ tài liệu mật",
      audio: "/audio/unit-39/dialogue_1.mp3",
      desc: "Linh và Huy thảo luận về nghi vấn rò rỉ dữ liệu khách hàng.",
      lines: [
        { id: "d1-1", speaker: "Linh", text: "The competitor launched a similar feature today. There is speculation that our plans were leaked.", translation: "Đối thủ đã ra mắt một tính năng tương tự hôm nay. Đang có sự suy đoán rằng các kế hoạch của chúng ta đã bị rò rỉ." },
        { id: "d1-2", speaker: "Huy", text: "We need proof. The hackers must have accessed our server because there are traces of unauthorized login.", translation: "Chúng ta cần chứng cứ. Tin tặc chắc chắn đã truy cập máy chủ của chúng ta vì có những dấu vết đăng nhập trái phép." },
        { id: "d1-3", speaker: "Linh", text: "But the security team asserts that the database is safe. Could a staff member have sent it?", translation: "Nhưng đội ngũ bảo mật khẳng định cơ sở dữ liệu an toàn. Liệu có thành viên nhân sự nào đã gửi nó đi không?" },
        { id: "d1-4", speaker: "Huy", text: "No, we can dismiss that. The file is encrypted. An employee can't have decrypted it without the key.", translation: "Không, chúng ta có thể bác bỏ điều đó. Tệp tin đã được mã hóa. Một nhân viên chắc chắn không thể giải mã nó mà không có chìa khóa." },
        { id: "d1-5", speaker: "Linh", text: "Right. From this logic, we can deduce that it was an external attack. The evidence does not contradict this inference.", translation: "Đúng vậy. Từ lập luận này, chúng ta có thể suy ra đó là một cuộc tấn công từ bên ngoài. Bằng chứng không mâu thuẫn với suy luận này." },
      ],
    },
    {
      id: 2,
      title: "Giải thích cuộc họp bị lỡ",
      audio: "/audio/unit-39/dialogue_2.mp3",
      desc: "Trọng hỏi Emma tại sao đối tác không đến họp.",
      lines: [
        { id: "d2-1", speaker: "Trong", text: "The client didn't show up. They should have arrived by nine o'clock.", translation: "Khách hàng đã không xuất hiện. Đáng lẽ họ phải đến trước chín giờ rồi." },
        { id: "d2-2", speaker: "Emma", text: "They might have missed the train. It became apparent that there was a major delay on the line today.", translation: "Có lẽ họ đã bị lỡ chuyến tàu. Rõ ràng là có một sự chậm trễ lớn trên tuyến đường hôm nay." },
        { id: "d2-3", speaker: "Trong", text: "True. But they could have called us. It implies they don't value our partnership.", translation: "Đúng thế. Nhưng đáng lẽ họ có thể gọi điện cho chúng ta. Điều đó ngụ ý họ không coi trọng sự hợp tác này." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "She must have forgotten her password because the account is locked.", options: ["She remembers her password perfectly.", "She must have forgotten her password because the account is locked.", "She might forget her password tomorrow.", "The account is locked because she didn't login."], answer: "She must have forgotten her password because the account is locked." },
    { id: "lac2", audio_text: "He can't have leaked the document; he didn't have access.", options: ["He leaked the document yesterday.", "He did not leak the document because he had no access.", "He can't have leaked the document; he didn't have access.", "He might have access to the document tomorrow."], answer: "He can't have leaked the document; he didn't have access." },
    { id: "lac3", audio_text: "They should have arrived by nine o'clock.", options: ["They arrived exactly at nine o'clock.", "They should have arrived by nine o'clock.", "They will arrive before nine o'clock tomorrow.", "They didn't arrive because it was early."], answer: "They should have arrived by nine o'clock." },
    { id: "lac4", audio_text: "The investigators concluded that the crash was due to human error.", options: ["The investigators concluded that the crash was due to human error.", "Human error did not cause the crash.", "The crash will be investigated next week.", "We dismiss the conclusion about human error."], answer: "The investigators concluded that the crash was due to human error." },
    { id: "lac5", audio_text: "His statements contradict the evidence gathered.", options: ["His statements are in compliance with the evidence.", "His statements contradict the evidence gathered.", "The evidence was gathered to prove his statement.", "We found no contradictions in his words."], answer: "His statements contradict the evidence gathered." },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "The hackers must have {input} the data because we found {input} in the system.",
    level1Placeholder: "Ví dụ: leaked — traces...",
    level2Situation: "Bạn đang đóng vai trò điều tra viên báo cáo về vụ rò rỉ mật khẩu của khách hàng. Hãy: (1) Suy đoán rằng đối thủ chắc chắn đã biết trước kế hoạch của bạn, (2) Giải thích rằng đáng lẽ đội bảo mật phải kiểm tra hệ thống sớm hơn, (3) Bác bỏ giả thuyết đây là lỗi ngẫu nhiên.",
    level2Hint: "The competitor must have obtained our plans beforehand. The security team should have updated the firewall last month. We can dismiss the claim that it was an accident because the trace of entry is apparent.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Modal Perfect — Động Từ Khuyết Thiếu Hoàn Thành (Suy Đoán Quá Khứ)",
    rule: "Dùng để đưa ra suy đoán, suy luận logic hoặc thể hiện sự tiếc nuối về một hành động trong quá khứ.\n\nCấu trúc chung: Modal Verb + have + Past Participle (V3/V-ed)\n\n1. must have + V3: Chắc chắn đã xảy ra (dựa trên bằng chứng rõ ràng)\n   → 'He must have left. His coat is gone.'\n2. can't have + V3: Chắc chắn đã KHÔNG xảy ra\n   → 'She can't have finished yet. She only started 5 minutes ago.'\n3. might / could / may have + V3: Có lẽ đã xảy ra (không chắc chắn)\n   → 'They might have missed the train.'\n4. should / could have + V3: Đáng lẽ nên / đã có thể làm gì (nhưng thực tế đã không làm)\n   → 'You should have told me earlier.' (sự trách móc hoặc hối tiếc)",
    examples: [
      { en: "He must have passed the exam; he got a perfect score. (High certainty based on proof)", vn: "Anh ấy chắc chắn đã đỗ kỳ thi; anh ấy đạt điểm tuyệt đối." },
      { en: "She can't have stolen the money; she was with me all day. (Negative certainty)", vn: "Cô ấy chắc chắn không thể đã trộm tiền; cô ấy đã ở bên tôi cả ngày." },
      { en: "I should have checked the attachment before sending the email. (Past regret)", vn: "Đáng lẽ tôi nên kiểm tra tệp đính kèm trước khi gửi email." },
    ],
    tip: "Trong bài thi nghe IELTS Listening Section 3 hoặc 4, người nói thường không khẳng định trực tiếp mà dùng Modal Perfect để thảo luận: 'We could have analyzed this better...'. Việc nhận biết cấu trúc này giúp bạn chọn đúng đáp án nói về sự việc thực tế đã KHÔNG xảy ra.",
    vnNote: "⚠️ Người Việt rất hay nhầm lẫn giữa 'must do' (phải làm ở hiện tại) và 'must have done' (chắc chắn đã làm trong quá khứ). Hãy nhớ 'must have + V3' KHÔNG CÓ NGHĨA LÀ 'phải làm gì trong quá khứ' (nghĩa đó phải dùng 'had to').",
    dialogueExample: {
      speaker: "Huy",
      text: "The hackers must have accessed our server because there are traces of unauthorized login.",
      translation: "Tin tặc chắc chắn đã truy cập máy chủ của chúng ta vì có những dấu vết đăng nhập trái phép.",
      highlight: "must have accessed (suy đoán chắc chắn dựa trên bằng chứng 'traces')",
    },
    ccq: {
      question: "Chọn câu diễn tả ý: 'Tôi khuyên bạn nên làm điều đó trong quá khứ, nhưng bạn đã không làm'?",
      options: [
        "You must have done it.",
        "You should have done it.",
        "You could do it.",
        "You had to do it.",
      ],
      answer: "You should have done it.",
      explanation: "'Should have + V3' dùng để diễn tả một hành động đáng lẽ nên làm trong quá khứ nhưng thực tế đã không làm.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn dạng đúng: 'She ___ have left the office; her computer is still turned on.'", options: ["must", "can't", "should", "might"], answer: "can't" },
    { id: "pq2", type: "multiple-choice", question: "Chọn động từ hoàn thành đúng: 'We ___ have double-checked the contract, but we forgot.'", options: ["must", "can't", "should", "might"], answer: "should" },
    { id: "pq3", type: "cloze", question: "Điền dạng đúng của động từ: 'They might have ___ (reschedule) the meeting yesterday.'", answer: "rescheduled" },
    { id: "pq4", type: "multiple-choice", question: "Từ nào mô tả việc 'không xem xét / loại bỏ một ý tưởng'?", options: ["dismiss", "contradict", "deduce", "conclude"], answer: "dismiss" },
    { id: "pq5", type: "cloze", question: "Điền: 'He must ___ (have/has) forgotten the deadline.'", answer: "have" },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng suy luận B2 với nghĩa đúng",
    pairs: [
      { left: "speculation", right: "sự suy đoán" },
      { left: "deduction", right: "sự suy luận" },
      { left: "credible", right: "đáng tin cậy" },
      { left: "dismiss", right: "bác bỏ" },
      { left: "contradict", right: "mâu thuẫn / trái ngược" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Từ dữ liệu này, chúng ta có thể suy ra kết quả.",
      answer: "From this data, we can deduce the outcome.",
    },
    {
      id: "pt-2",
      prompt_vn: "Có thể họ đã bỏ lỡ bằng chứng quan trọng.",
      answer: "They may have overlooked crucial evidence.",
    },
    {
      id: "pt-3",
      prompt_vn: "Giả thuyết phải được chứng minh bằng dữ liệu đáng tin.",
      answer: "The hypothesis must have been supported by credible data.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc39-1",
      sentence: "She must be tiredly after the long conference.",
      errorWord: "tiredly",
      correction: "tired",
      explanation_vn: "Sau 'be' (linking verb) dùng tính từ: 'must be TIRED'. 'Tiredly' là trạng từ, không đứng sau 'be'.",
    },
    {
      id: "sc39-2",
      sentence: "He could been at the office this morning.",
      errorWord: "could been",
      correction: "could have been",
      explanation_vn: "Modal deduction về quá khứ: 'could HAVE BEEN'. Không bỏ 'have' giữa modal và past participle.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la39-1",
      audio_text: "She must be very tired after the long trip.",
      prompt_vn: "Cô ấy chắc rất mệt sau chuyến đi dài.",
      words: ["She", "must", "be", "very", "tired", "after", "the", "long", "trip", ".", "tiredly", "is"],
      answer: "She must be very tired after the long trip .",
    },
    {
      id: "la39-2",
      audio_text: "He might have been at the office this morning.",
      prompt_vn: "Anh ấy có thể đã ở văn phòng sáng nay.",
      words: ["He", "might", "have", "been", "at", "the", "office", "this", "morning", ".", "could been", "maybe"],
      answer: "He might have been at the office this morning .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Họ chắc chắn đã quên khóa cửa văn phòng.",
      words: ["They", "must", "have", "forgotten", "to", "lock", "the", "office", "door", ".", "might", "should"],
      answer: "They must have forgotten to lock the office door .",
    },
    {
      id: "wb2",
      prompt_vn: "Đáng lẽ bạn nên thông báo cho chúng tôi sớm hơn.",
      words: ["You", "should", "have", "informed", "us", "much", "earlier", ".", "might"],
      answer: "You should have informed us much earlier .",
    },
    {
      id: "wb3",
      prompt_vn: "Hai lời giải thích này mâu thuẫn hoàn toàn với nhau.",
      words: ["These", "two", "explanations", "completely", "contradict", "each", "other", ".", "might", "should"],
      answer: "These two explanations completely contradict each other .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s39-1", prompt_vn: "Họ chắc chắn đã quên khóa cửa văn phòng.", words: ["They", "must", "have", "forgotten", "to", "lock", "the", "office", "door", "."], answer: "They must have forgotten to lock the office door ." },
    { id: "s39-2", prompt_vn: "Đáng lẽ bạn nên thông báo cho chúng tôi sớm hơn.", words: ["You", "should", "have", "informed", "us", "much", "earlier", "."], answer: "You should have informed us much earlier ." },
    { id: "s39-3", prompt_vn: "Hai lời giải thích này mâu thuẫn hoàn toàn với nhau.", words: ["These", "two", "explanations", "completely", "contradict", "each", "other", "."], answer: "These two explanations completely contradict each other ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Chọn vế đúng: 'If the light is on, he ___ have gone home yet.'", options: ["must", "can't", "should", "might"], answer: "can't" },
    { id: "fq2", type: "cloze", question: "Điền từ: 'The police found no ___ (dấu vết) of the thief.'", answer: "trace" },
    { id: "fq3", type: "multiple-choice", question: "Chọn dạng đúng: 'She ___ have arrived by now, but the flight is delayed.'", options: ["must", "can't", "should", "might"], answer: "should" },
    { id: "fq4", type: "translate", question: "Dịch: 'Từ dữ liệu này, chúng ta có thể suy ra kết quả.'", answer: "From this data, we can deduce the outcome." },
    { id: "fq5", type: "multiple-choice", question: "Từ nào trái nghĩa với 'credible'?", options: ["apparent", "dismissed", "incredible", "logical"], answer: "incredible" },
    { id: "q-ex1", type: "multiple-choice", question: "'Must have been' diễn tả:", options: ["Nghĩa vụ trong quá khứ", "Suy luận chắc chắn về quá khứ", "Khả năng trong tương lai", "Điều kiện quá khứ"], answer: "Suy luận chắc chắn về quá khứ" },
    { id: "q-ex2", type: "multiple-choice", question: "'She might have forgotten.' nghĩa là:", options: ["Cô ấy chắc chắn quên rồi", "Cô ấy có thể đã quên", "Cô ấy không quên", "Cô ấy sẽ quên"], answer: "Cô ấy có thể đã quên" },
    { id: "q-ex3", type: "cloze", question: "Điền: 'He ___ have left already — his car is gone.'", answer: "must" },
    { id: "q-ex4", type: "multiple-choice", question: "'Can't have done' diễn tả:", options: ["Không có khả năng đã làm (quá khứ)", "Có khả năng đã làm", "Bắt buộc đã làm", "Có thể đã làm"], answer: "Không có khả năng đã làm (quá khứ)" },
    { id: "q-ex5", type: "translate", question: "Dịch: 'Anh ấy chắc hẳn đã làm việc rất chăm chỉ.'", answer: "He must have worked very hard." },
    { id: "q-ex6", type: "multiple-choice", question: "'I wonder if she passed the exam.' — loại câu:", options: ["Trực tiếp", "Gián tiếp/tường thuật", "Điều kiện", "Mệnh đề quan hệ"], answer: "Gián tiếp/tường thuật" },
    { id: "q-ex7", type: "multiple-choice", question: "'Could have' (khả năng trong QK) vs 'should have' (tiếc nuối):", options: ["Giống nhau", "'Could have' = khả năng, 'should have' = lẽ ra phải làm", "'Should have' = khả năng, 'could have' = lẽ ra phải", "Cả hai đều là tiếc nuối"], answer: "'Could have' = khả năng, 'should have' = lẽ ra phải làm" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr39-1", question: "Ôn tập Unit 38 — Chọn cấu trúc đúng: '___ has our company faced such an issue.'", options: ["Rarely", "Seldom did", "Rarely did", "Rarely has"], answer: "Rarely has", type: "multiple-choice" },
    { id: "cr39-2", question: "Ôn tập Unit 37 — Điền dạng đúng: '___ (synthesize) the reports, he wrote a summary.'", options: [], answer: "Having synthesized", type: "cloze" },
    { id: "cr39-3", question: "Ôn tập Unit 36 — Chọn câu đúng:", options: ["The virus is claimed to have been isolated yesterday.", "The virus claimed to have isolated yesterday.", "It is claimed the virus to be isolated yesterday.", "The virus is claimed to isolate yesterday."], answer: "The virus is claimed to have been isolated yesterday.", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "must've /ˈmʌstəv/",
    description: "Modal perfect — must have, might have, could have — giảm âm cực phổ biến",
    examples: [
        { word: "must have", ipa: "/mʌst həv/", tip: "He must've left /ˈmʌstəv/ — have thu thành /əv/ hoàn toàn" },
        { word: "might have", ipa: "/maɪt həv/", tip: "might've /ˈmaɪtəv/ — âm /t/ cuối might thường rất yếu" },
    ],
    minimalPairs: [
        ["must've /ˈmʌstəv/ (spoken)", "must have /mʌst hæv/ (formal)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "They must have forgotten the key", vn: "Họ chắc chắn đã quên chìa khóa" },
      { en: "He can't have leaked the document", vn: "Anh ấy chắc chắn không thể làm rò rỉ" },
      { en: "You should have told us earlier", vn: "Đáng lẽ bạn nên nói với chúng tôi sớm hơn" },
      { en: "It became apparent that we failed", vn: "Rõ ràng là chúng ta đã thất bại" },
      { en: "We can dismiss that hypothesis", vn: "Chúng ta có thể bác bỏ giả thuyết đó" },
      { en: "The data contradicts your claim", vn: "Dữ liệu mâu thuẫn với tuyên bố của bạn" },
      { en: "What did you deduce from the report?", vn: "Bạn đã suy ra điều gì từ báo cáo?" },
      { en: "There is pure speculation about it", vn: "Đó hoàn toàn là sự suy đoán" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit39-reading-1",
    title: "Deduction and Speculation",
    title_vn: "Đọc đoạn về suy luận và phỏng đoán với modal verbs",
    level: "B2" as const,
    text:
      "When we don't have all the facts, we use modal verbs to speculate and deduce. " +
      "Consider this situation: You arrive at the office and your colleague's desk is empty. " +
      "Their coat is gone, their computer is off, and there are no personal items visible. " +
      "What can you conclude? They must have left for the day. " +
      "Or, perhaps: They might have gone to a meeting in another building. " +
      "They could have taken the afternoon off. " +
      "If their schedule showed an external appointment, they may have left early. " +
      "However, if their access card is still at the desk, they can't have left the building entirely. " +
      "This is deductive reasoning using modal verbs: " +
      "must (strong certainty), might/could/may (possibility), can't (strong impossibility). " +
      "In everyday conversation, these structures allow you to discuss situations " +
      "with nuance and intellectual confidence.",
    questions: [
      {
        id: "u39r-q1",
        question_vn: "Chúng ta sử dụng modal verbs khi nào?",
        options: [
          "When we know all the facts",
          "When we don't have all the facts and need to speculate",
          "Only in formal writing",
          "Only in past tense sentences",
        ],
        answer: "When we don't have all the facts and need to speculate",
        explanation_vn: "'When we don't have all the facts, we use modal verbs to speculate and deduce.'",
      },
      {
        id: "u39r-q2",
        question_vn: "Modal verb nào biểu thị sự chắc chắn cao?",
        options: ["Could", "Might", "May", "Must"],
        answer: "Must",
        explanation_vn: "'must (strong certainty)'",
      },
      {
        id: "u39r-q3",
        question_vn: "Nếu thẻ ra vào của đồng nghiệp vẫn còn trên bàn, điều gì có thể được suy ra?",
        options: [
          "They must have left for the day",
          "They can't have left the building entirely",
          "They might be in a meeting",
          "They could have taken the afternoon off",
        ],
        answer: "They can't have left the building entirely",
        explanation_vn: "'if their access card is still at the desk, they can't have left the building entirely.'",
      },
      {
        id: "u39r-q4",
        question_vn: "'Can't' trong ngữ cảnh suy luận biểu thị điều gì?",
        options: [
          "Possibility",
          "Weak certainty",
          "Strong impossibility",
          "Permission",
        ],
        answer: "Strong impossibility",
        explanation_vn: "'can't (strong impossibility)'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Speculating on market trends in meeting",
      focus: "deduction language in business",
      context: "team discussion on data",
      l1Note: "⚠️ 'Must have been' for deduction. Người VN hay dùng 'maybe' thay vì modal perfect.",
      example: "The sales must have increased. It can't have been a coincidence."
    }
  ], 
  // ── OUTPUT: shadowing
  shadowingVideoId: "v3FIvCDJMxg",
};

export default unit39;
