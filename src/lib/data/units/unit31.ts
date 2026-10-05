import { UnitData } from "@/lib/lessons/lesson-spec";

// ─────────────────────────────────────────────────────────────────────────────
// UNIT-31 — Business Communication  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// UNIT 31 — Business Communication (B1) — Formal register + reporting verbs
// Per TASK-060: bring L1 interference >=50% (B1 target 0.5)
// Reference: lesson-center-reference (VN CLT pragmatic + L1 contrast for business)
// Blueprint: vocab (l1 for reporting verbs: suggest/recommend/advise)
// Gold: unit1.ts — ⚠️ L1 notes focus common VN: 'suggest to do', 'confirm to', preps
// ─────────────────────────────────────────────────────────────────────────────

export const unit31: UnitData = {
  unitId: "unit-31",
  title: "Unit 31: Business Communication",
  level: "B1",
  xp: 100,
  estimatedTime: 55,
  description:
    "Formal Writing — Làm quen với ngôn ngữ trang trọng trong công sở, viết email và báo cáo chuyên nghiệp. Bài học cốt lõi cho TOEIC Reading và IELTS Writing Task 1.",
  badgeName: "Chuyên Gia Công Sở",
  badgeEmoji: "💼",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation:
    "Soạn thảo email gửi đối tác quốc tế để giải thích về sự chậm trễ của dự án và đề xuất lịch họp mới. Bạn cần viết trang trọng, lịch sự và sử dụng các động từ báo cáo (suggest, recommend, advise) đúng ngữ pháp doanh nghiệp.",
  learningOutcomes: [
    "Viết email và báo cáo công sở bằng từ vựng trang trọng (formal register)",
    "Sử dụng các động từ đề xuất suggest, recommend, advise đúng cấu trúc ngữ pháp",
    "Trình bày lý do chậm trễ và đề xuất lịch trình mới một cách lịch sự, chuyên nghiệp",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote:
    'Trong email công sở tiếng Anh, việc dùng <span class="text-primary">"inform"</span> trang trọng hơn <span class="text-muted-foreground">"tell"</span>, và <span class="text-primary">"request"</span> trang trọng hơn <span class="text-muted-foreground">"ask for"</span>. Để tạo sự chuyên nghiệp, email thường bắt đầu bằng <span class="text-primary">"I am writing to inform you that..."</span> thay vì đi thẳng vào vấn đề một cách đột ngột.',

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    {
      emoji: "📧",
      en: "Please find the attached proposal for your review.",
      vn: "Vui lòng xem bản đề xuất đính kèm để xem xét.",
      context: "attached proposal — cụm từ email cực kỳ phổ biến",
    },
    {
      emoji: "📅",
      en: "I would like to confirm our meeting scheduled for Thursday.",
      vn: "Tôi muốn xác nhận cuộc họp của chúng ta được lên lịch vào thứ Năm.",
      context: "confirm scheduled meeting — xác nhận lịch họp",
    },
    {
      emoji: "⏳",
      en: "We apologize for the delay in completing the report.",
      vn: "Chúng tôi xin lỗi vì sự chậm trễ trong việc hoàn thành báo cáo.",
      context: "apologize for the delay — xin lỗi vì chậm trễ",
    },
  ],

  // ── VOCABULARY: 12 từ formal — pre-teach trước dialogue (CLT business)
  // L1: reporting verb structures (suggest/recommend/advise), confirm/that, prepositions
  // Center: VN CLT — so sánh formal VN vs EN; lỗi hay gặp ở email công sở

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    {
      id: 1,
      word: "confirm",
      review: true,
      emoji: "✅",
      phonetic: "/kənˈfɜːm/",
      meaning: "xác nhận",
      example: "I am writing to confirm our appointment for tomorrow.",
      example2: "The manager confirmed that the budget was approved.",
      collocation:
        "confirm a booking / confirm an appointment / confirm details",
      audio: "/audio/unit-31/confirm.mp3",
      l1_interference_vn:
        "⚠️ \'Confirm that...\': \'confirm that the meeting is on Friday\'. Không phải \'confirm to/for\'.",
    },
    {
      id: 2,
      word: "request",
      emoji: "📝",
      phonetic: "/rɪˈkwest/",
      meaning: "yêu cầu (trang trọng)",
      example: "You can request additional funding if needed.",
      example2: "We received a request for more information from the client.",
      collocation: "submit a request / make a request / request assistance",
      audio: "/audio/unit-31/request.mp3",
      l1_interference_vn:
        "⚠️ 'request' (v/n) trang trọng hơn 'ask'. 'Request that...' hoặc +N. Không 'request to do' trực tiếp.",
    },
    {
      id: 3,
      word: "inform",
      emoji: "📢",
      phonetic: "/ɪnˈfɔːm/",
      meaning: "thông báo / cho biết",
      example: "I regret to inform you that your application was unsuccessful.",
      example2: "Please inform us of any changes to your schedule.",
      collocation:
        "inform someone of / keep someone informed / write to inform",
      audio: "/audio/unit-31/inform.mp3",
      l1_interference_vn:
        "⚠️ Formal: 'inform of/about'. 'I am writing to inform you that...' — chuẩn email. Không 'tell' trong business.",
    },
    {
      id: 4,
      word: "clarify",
      emoji: "🔍",
      phonetic: "/ˈklærɪfaɪ/",
      meaning: "làm rõ / giải thích rõ",
      example: "Could you clarify the third point in the proposal?",
      example2: "We need to clarify our goals before starting the project.",
      collocation: "clarify a point / clarify the situation / need to clarify",
      audio: "/audio/unit-31/clarify.mp3",
      l1_interference_vn:
        "⚠️ 'Clarify + N' (không 'clarify about'). Dùng khi email cần làm rõ — 'Please clarify...' lịch sự.",
    },
    {
      id: 5,
      word: "recommend",
      review: true,
      emoji: "👍",
      phonetic: "/ˌrekəˈmend/",
      meaning: "khuyến nghị / khuyên",
      example: "We recommend that the company invest in new technology.",
      example2: "She recommended hiring an assistant.",
      collocation: "highly recommend / recommend that / recommend doing",
      audio: "/audio/unit-31/recommend.mp3",
      l1_interference_vn:
        "⚠️ Sau 'recommend': Ving hoặc that-clause. 'I recommend trying' hoặc 'recommend that you try'.",
    },
    {
      id: 6,
      word: "advise",
      emoji: "👨‍💼",
      phonetic: "/ədˈvaɪz/",
      meaning: "khuyên / cố vấn",
      example: "The legal team advised us not to sign the contract yet.",
      example2: "I would advise caution in this business deal.",
      collocation: "advise someone to do / advise against / legal adviser",
      audio: "/audio/unit-31/advise.mp3",
      l1_interference_vn:
        "⚠️ 'advise + object + to-V' hoặc 'advise against'. KHÔNG 'advise to do' không object. Lỗi VN hay 'I advise you do'.",
    },
    {
      id: 7,
      word: "agenda",
      emoji: "📋",
      phonetic: "/əˈdʒendə/",
      meaning: "chương trình họp / nội dung thảo luận",
      example: "What is the next item on the meeting agenda?",
      example2: "The main agenda today is the marketing plan.",
      collocation: "meeting agenda / set the agenda / top of the agenda",
      audio: "/audio/unit-31/agenda.mp3",
      l1_interference_vn:
        "⚠️ 'on the agenda' (không 'in'). 'Set the agenda' = định hướng cuộc họp. Không dịch thẳng 'chương trình'.",
    },
    {
      id: 8,
      word: "proposal",
      review: true,
      emoji: "📂",
      phonetic: "/prəˈpəʊzəl/",
      meaning: "bản đề xuất / kế hoạch",
      example: "We have submitted a proposal for the project.",
      example2: "The board rejected the business proposal.",
      collocation: "project proposal / submit a proposal / review a proposal",
      audio: "/audio/unit-31/proposal.mp3",
      l1_interference_vn:
        "⚠️ \'Proposal FOR\': \'a proposal for a new project\'. \'Make/submit a proposal\'.",
    },
    {
      id: 9,
      word: "attachment",
      emoji: "📎",
      phonetic: "/əˈtætʃmənt/",
      meaning: "tệp đính kèm",
      example: "Please review the attachment for details.",
      example2: "I forgot to open the email attachment.",
      collocation: "email attachment / send an attachment / see attachment",
      audio: "/audio/unit-31/attachment.mp3",
      l1_interference_vn:
        "⚠️ 'Please find the attachment' (formal). 'Attached file' cũng đúng nhưng 'attachment' chuẩn email. Không 'attach file' lặp.",
    },
    {
      id: 10,
      word: "delay",
      emoji: "⏳",
      phonetic: "/dɪˈleɪ/",
      meaning: "sự chậm trễ / trì hoãn",
      example: "The train delay caused me to miss the meeting.",
      example2: "We apologize for the delay in delivery.",
      collocation: "cause a delay / project delay / apologize for the delay",
      audio: "/audio/unit-31/delay.mp3",
      l1_interference_vn:
        "⚠️ 'The flight is delayed' (bị động). Stress: de-LAY (âm 2). 'A 3-hour delay' (danh từ).",
    },
    {
      id: 11,
      word: "deadline",
      review: true,
      emoji: "🏁",
      phonetic: "/ˈdedlaɪn/",
      meaning: "hạn chót / thời hạn cuối",
      example: "We must work hard to meet the project deadline.",
      example2: "The deadline for submission is next Friday.",
      collocation: "meet a deadline / miss a deadline / strict deadline",
      audio: "/audio/unit-31/deadline.mp3",
      l1_interference_vn:
        "⚠️ \'MEET a deadline\' (kịp hạn) hoặc \'MISS a deadline\' (trễ). Không phải \'do/finish the deadline\'.",
    },
    {
      id: 12,
      word: "corporate",
      emoji: "🏢",
      phonetic: "/ˈkɔːpərət/",
      meaning: "thuộc doanh nghiệp / tập đoàn",
      example: "She is climbing the corporate ladder rapidly.",
      example2: "The company has a strong corporate culture.",
      collocation: "corporate client / corporate culture / corporate strategy",
      audio: "/audio/unit-31/corporate.mp3",
      l1_interference_vn:
        "⚠️ 'Corporate' (adj) = công ty. 'Corporate ladder' = thăng tiến. Không 'corporation' nhầm khi nói tính từ.",
    },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Soạn thảo email gửi đối tác",
      audio: "/audio/unit-31/dialogue_1.mp3",
      desc: "Trọng và sếp thảo luận về email phản hồi việc trễ hạn chót.",
      lines: [
        {
          id: "d1-1",
          speaker: "Manager",
          text: "Trong, did we inform the corporate client about the project delay?",
          translation:
            "Trọng, chúng ta đã thông báo cho khách hàng doanh nghiệp về việc chậm trễ dự án chưa?",
        },
        {
          id: "d1-2",
          speaker: "Trong",
          text: "Yes, I am drafting an email now. I apologize for the delay and clarify the reasons.",
          translation:
            "Vâng, tôi đang soạn nháp email đây. Tôi xin lỗi vì sự chậm trễ và làm rõ các lý do.",
        },
        {
          id: "d1-3",
          speaker: "Manager",
          text: "What do you propose regarding the new deadline?",
          translation: "Cậu đề xuất gì liên quan đến hạn chót mới?",
        },
        {
          id: "d1-4",
          speaker: "Trong",
          text: "I recommend that we extend the deadline by two weeks. I will also attach the revised proposal.",
          translation:
            "Tôi kiến nghị chúng ta kéo dài hạn chót thêm hai tuần. Tôi cũng sẽ đính kèm bản đề xuất đã sửa đổi.",
        },
        {
          id: "d1-5",
          speaker: "Manager",
          text: "Good. Please request that they confirm their availability for a meeting on Thursday to set the new agenda.",
          translation:
            "Tốt. Hãy yêu cầu họ xác nhận sự có mặt cho một cuộc họp vào thứ Năm để thiết lập chương trình họp mới.",
        },
      ],
    },
    {
      id: 2,
      title: "Yêu cầu tài liệu hỗ trợ",
      audio: "/audio/unit-31/dialogue_2.mp3",
      desc: "Hội thoại qua điện thoại yêu cầu tệp đính kèm.",
      lines: [
        {
          id: "d2-1",
          speaker: "Alice",
          text: "Hello, I am calling to request the contract attachment.",
          translation:
            "Xin chào, tôi gọi điện để yêu cầu tệp đính kèm hợp đồng.",
        },
        {
          id: "d2-2",
          speaker: "Trong",
          text: "Sure, let me check. I advise you to review the terms carefully before signing.",
          translation:
            "Chắc chắn rồi, để tôi kiểm tra. Tôi khuyên chị nên xem xét kỹ các điều khoản trước khi ký.",
        },
        {
          id: "d2-3",
          speaker: "Alice",
          text: "Thank you. Please confirm once you have sent it.",
          translation: "Cảm ơn cậu. Vui lòng xác nhận một khi cậu đã gửi nó.",
        },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    {
      id: "lac1",
      audio_text: "I am writing to confirm our scheduled meeting.",
      options: [
        "I am writing to confirm our scheduled meeting.",
        "I want to cancel the scheduled meeting.",
        "We had a meeting on Friday afternoon.",
        "Please write a proposal about meetings.",
      ],
      answer: "I am writing to confirm our scheduled meeting.",
    },
    {
      id: "lac2",
      audio_text: "We recommend that the company invest in new technology.",
      options: [
        "We recommend that the company invest in new technology.",
        "We demand the company stop using old technology.",
        "The company invested in a new factory last year.",
        "IT staff recommended repairing the computer.",
      ],
      answer: "We recommend that the company invest in new technology.",
    },
    {
      id: "lac3",
      audio_text: "Please find the attached proposal for your review.",
      options: [
        "Please delete the proposal immediately.",
        "Please find the attached proposal for your review.",
        "I have sent the physical contract by post.",
        "The agenda of the meeting is not attached.",
      ],
      answer: "Please find the attached proposal for your review.",
    },
    {
      id: "lac4",
      audio_text: "We apologize for the delay in completing the report.",
      options: [
        "We apologize for the delay in completing the report.",
        "We finished the report ahead of the deadline.",
        "The corporate client was happy with the report.",
        "The delay was caused by the weather yesterday.",
      ],
      answer: "We apologize for the delay in completing the report.",
    },
    {
      id: "lac5",
      audio_text: "The deadline for submission is next Friday.",
      options: [
        "The deadline for submission is next Friday.",
        "We must submit the proposal this Tuesday.",
        "Friday is the first day of the corporate event.",
        "The client requested a meeting on Friday.",
      ],
      answer: "The deadline for submission is next Friday.",
    },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt:
      "I am writing to {input} you that we need to extend the {input}. I recommend that we {input}.",
    level1Placeholder: "Ví dụ: inform — deadline — reschedule the meeting...",
    level2Situation:
      "Bạn viết một email gửi quản lý của mình để báo cáo tiến độ công việc. Hãy: (1) Thông báo về việc đã gửi bản đề xuất đính kèm, (2) Khuyên sếp nên làm rõ các mục tiêu của dự án với khách hàng doanh nghiệp, (3) Xác nhận thời hạn hoàn thành.",
    level2Hint:
      "Please find the attached project proposal. I recommend that we clarify the project goals with our corporate client. I would like to confirm that we can meet the final deadline next Friday.",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title:
      "Reporting Verbs with Subjunctive — Động Từ Khuyến Nghị & Câu Giả Định",
    rule: "Trong văn phong trang trọng, các động từ như suggest (đề xuất), recommend (khuyến nghị), advise (khuyên) được dùng để đưa ra ý kiến với các cấu trúc sau:\n\n1. Động từ + V-ing (Đề xuất chung chung)\n   → 'I recommend extending the deadline.'\n2. Động từ + that + Subject + Verb-infinitive (Cấu trúc giả định - Subjunctive)\n   → 'I recommend that we extend the deadline.' (Động từ 'extend' không chia cho dù chủ ngữ là gì)\n3. Advise / Recommend + object + to + Verb\n   → 'I advise you to review the attachment.'",
    examples: [
      {
        en: "I suggest that she send the email today. (subjunctive: 'send' instead of 'sends')",
        vn: "Tôi đề xuất cô ấy gửi email trong ngày hôm nay.",
      },
      {
        en: "The legal advisor recommended changing the terms. (recommend + V-ing)",
        vn: "Cố vấn pháp lý đã khuyến nghị thay đổi các điều khoản.",
      },
      {
        en: "We advise our clients to confirm appointments in writing. (advise + object + to-V)",
        vn: "Chúng tôi khuyên khách hàng nên xác nhận cuộc hẹn bằng văn bản.",
      },
    ],
    tip: "Trong bài thi TOEIC Part 5, cấu trúc giả định rất hay xuất hiện: 'The manager recommends that employee [do/does/doing]...' Đáp án đúng luôn là động từ nguyên thể không chia (do).",
    vnNote:
      "⚠️ Lỗi thường gặp của người Việt: Dùng 'suggest to do' (Ví dụ: 'I suggest to reschedule...'). Cấu trúc này SAI hoàn toàn. Phải dùng: 'I suggest rescheduling' hoặc 'I suggest that we reschedule'.",
    dialogueExample: {
      speaker: "Trong",
      text: "I recommend that we extend the deadline by two weeks. I will also attach the revised proposal.",
      translation:
        "Tôi kiến nghị chúng ta kéo dài hạn chót thêm hai tuần. Tôi cũng sẽ đính kèm bản đề xuất đã sửa đổi.",
      highlight:
        "recommend that we extend (recommend + that clause + subjunctive mood)",
    },
    ccq: {
      question: "Chọn câu viết đúng ngữ pháp tiếng Anh doanh nghiệp:",
      options: [
        "The director suggested to schedule a new meeting.",
        "The director suggested that we scheduled a new meeting.",
        "The director suggested scheduling a new meeting.",
        "The director suggested us to schedule a new meeting.",
      ],
      answer: "The director suggested scheduling a new meeting.",
      explanation:
        "Sau 'suggest' chỉ có thể dùng danh động từ (V-ing) hoặc mệnh đề 'that'. Không được dùng 'suggest + to-V' hay 'suggest someone to-V'.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    {
      id: "pq1",
      type: "multiple-choice",
      question:
        "Chọn câu đúng: 'I advise you ___ the corporate policy carefully.'",
      options: ["read", "reading", "to read", "reads"],
      answer: "to read",
    },
    {
      id: "pq2",
      type: "multiple-choice",
      question:
        "Chọn dạng đúng của động từ: 'The manager recommended that he ___ the email immediately.'",
      options: ["sends", "send", "sending", "to send"],
      answer: "send",
    },
    {
      id: "pq3",
      type: "cloze",
      question: "Điền: 'He suggested ___ (attach) the file to the email.'",
      answer: "attaching",
    },
    {
      id: "pq4",
      type: "multiple-choice",
      question: "Từ nào đồng nghĩa với 'formal plan/suggestion'?",
      options: ["delay", "agenda", "proposal", "deadline"],
      answer: "proposal",
    },
    {
      id: "pq5",
      type: "cloze",
      question: "Điền: 'Please inform us ___ (giới từ) any project delays.'",
      answer: "of",
    },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối từ vựng email công sở với nghĩa đúng",
    pairs: [
      { left: "confirm", right: "xác nhận" },
      { left: "attachment", right: "tệp đính kèm" },
      { left: "deadline", right: "hạn chót" },
      { left: "agenda", right: "chương trình họp" },
      { left: "corporate", right: "thuộc doanh nghiệp" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Hạn chót cho bản đề xuất là ngày mai.",
      answer: "The deadline for the proposal is tomorrow.",
    },
    {
      id: "pt-2",
      prompt_vn: "Anh ấy khuyên tôi xác nhận lại thông tin.",
      answer: "He advised me to confirm the information again.",
    },
    {
      id: "pt-3",
      prompt_vn: "Họ yêu cầu chúng tôi làm rõ yêu cầu trước thứ Sáu.",
      answer: "They requested that we clarify the requirements before Friday.",
    },
  ],

  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc31-1",
      sentence:
        "I am writing to you about the meeting which was held on yesterday.",
      errorWord: "on yesterday",
      correction: "yesterday",
      explanation_vn:
        "Không dùng giới từ 'on' trước 'yesterday/today/tomorrow'. Đúng: 'held yesterday'.",
    },
    {
      id: "sc31-2",
      sentence: "Please be advise that the meeting is cancelled.",
      errorWord: "advise",
      correction: "advised",
      explanation_vn:
        "Dạng bị động đúng: 'Please be advised' (quá khứ phân từ). 'Advise' là động từ nguyên thể, sai cấu trúc.",
    },
  ],

  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la31-1",
      audio_text: "I am writing to inquire about the job position.",
      prompt_vn: "Tôi viết để hỏi thêm về vị trí công việc.",
      words: [
        "I",
        "am",
        "writing",
        "to",
        "inquire",
        "about",
        "the",
        "job",
        "position",
        ".",
        "inform",
        "confirm",
      ],
      answer: "I am writing to inquire about the job position .",
    },
    {
      id: "la31-2",
      audio_text: "Please find the report attached to this email.",
      prompt_vn: "Vui lòng xem báo cáo đính kèm trong email này.",
      words: [
        "Please",
        "find",
        "the",
        "report",
        "attached",
        "to",
        "this",
        "email",
        ".",
        "confirm",
        "review",
      ],
      answer: "Please find the report attached to this email .",
    },
  ],

  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Tôi khuyên bạn nên xem tệp đính kèm hợp đồng.",
      words: [
        "I",
        "advise",
        "you",
        "to",
        "review",
        "the",
        "contract",
        "attachment",
        ".",
        "would",
        "could",
      ],
      answer: "I advise you to review the contract attachment .",
    },
    {
      id: "wb2",
      prompt_vn: "Vui lòng xác nhận sự có mặt của bạn trước thứ Năm.",
      words: [
        "Please",
        "confirm",
        "your",
        "availability",
        "before",
        "Thursday",
        ".",
        "would",
        "could",
      ],
      answer: "Please confirm your availability before Thursday .",
    },
    {
      id: "wb3",
      prompt_vn: "Chúng tôi xin lỗi vì sự chậm trễ trong dự án này.",
      words: [
        "We",
        "apologize",
        "for",
        "the",
        "delay",
        "in",
        "this",
        "project",
        ".",
        "would",
        "could",
      ],
      answer: "We apologize for the delay in this project .",
    },
  ],

  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    {
      id: "s31-1",
      prompt_vn: "Tôi khuyên bạn nên xem tệp đính kèm hợp đồng.",
      words: [
        "I",
        "advise",
        "you",
        "to",
        "review",
        "the",
        "contract",
        "attachment",
        ".",
      ],
      answer: "I advise you to review the contract attachment .",
    },
    {
      id: "s31-2",
      prompt_vn: "Vui lòng xác nhận sự có mặt của bạn trước thứ Năm.",
      words: [
        "Please",
        "confirm",
        "your",
        "availability",
        "before",
        "Thursday",
        ".",
      ],
      answer: "Please confirm your availability before Thursday .",
    },
    {
      id: "s31-3",
      prompt_vn: "Chúng tôi xin lỗi vì sự chậm trễ trong dự án này.",
      words: [
        "We",
        "apologize",
        "for",
        "the",
        "delay",
        "in",
        "this",
        "project",
        ".",
      ],
      answer: "We apologize for the delay in this project .",
    },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    {
      id: "fq1",
      type: "multiple-choice",
      question: "Điền động từ: 'The legal team advised us ___ the contract.'",
      options: ["not sign", "not to sign", "not signing", "don't sign"],
      answer: "not to sign",
      explanation_vn:
        "'Advise + object + to-V': 'advised us NOT TO sign'. 'Not signing' không dùng sau 'advise + object'.",
    },
    {
      id: "fq2",
      type: "cloze",
      question: "Điền: 'I am writing to ___ (thông báo) you of our decisions.'",
      answer: "inform",
    },
    {
      id: "fq3",
      type: "multiple-choice",
      question: "Tìm từ đồng nghĩa với 'make clear':",
      options: ["confirm", "clarify", "request", "inform"],
      answer: "clarify",
    },
    {
      id: "fq4",
      type: "translate",
      question: "Dịch: 'Hạn chót cho bản đề xuất là ngày mai.'",
      answer: "The deadline for the proposal is tomorrow.",
    },
    {
      id: "fq5",
      type: "multiple-choice",
      question: "Từ nào dùng để nói về nội dung cuộc họp?",
      options: ["attachment", "agenda", "corporate", "delay"],
      answer: "agenda",
    },
    {
      id: "q-ex1",
      type: "multiple-choice",
      question: "Email kinh doanh trang trọng bắt đầu bằng:",
      options: [
        "Hey!",
        "Hi there,",
        "Dear Mr./Ms. [Last name],",
        "Hello everyone,",
      ],
      answer: "Dear Mr./Ms. [Last name],",
    },
    {
      id: "q-ex2",
      type: "multiple-choice",
      question: "'I am writing with regard to...' dùng để:",
      options: [
        "Kết thúc email",
        "Giới thiệu chủ đề email",
        "Yêu cầu thông tin",
        "Xin lỗi",
      ],
      answer: "Giới thiệu chủ đề email",
    },
    {
      id: "q-ex3",
      type: "cloze",
      question: "Điền kết thúc email trang trọng: '___ sincerely, ...'",
      answer: "Yours",
    },
    {
      id: "q-ex4",
      type: "multiple-choice",
      question: "'I would appreciate it if you could...' dùng để:",
      options: [
        "Ra lệnh",
        "Đưa ra yêu cầu lịch sự",
        "Từ chối đề nghị",
        "Xác nhận thông tin",
      ],
      answer: "Đưa ra yêu cầu lịch sự",
    },
    {
      id: "q-ex5",
      type: "translate",
      question: "Dịch: 'Tôi mong nhận được phản hồi từ bạn.'",
      answer: "I look forward to hearing from you.",
    },
    {
      id: "q-ex6",
      type: "multiple-choice",
      question: "Trong cuộc họp, 'I'd like to add that...' dùng để:",
      options: [
        "Ngắt lời",
        "Bổ sung thêm ý kiến",
        "Kết thúc cuộc họp",
        "Bác bỏ ý kiến",
      ],
      answer: "Bổ sung thêm ý kiến",
    },
    {
      id: "q-ex7",
      type: "multiple-choice",
      question: "'Action points' trong meeting có nghĩa là:",
      options: [
        "Điểm tranh luận",
        "Các việc cần làm sau họp",
        "Chương trình họp",
        "Kết luận cuộc họp",
      ],
      answer: "Các việc cần làm sau họp",
    },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    {
      id: "cr31-1",
      question:
        "Ôn tập Unit 30 — Điền: 'It is essential to protect the local ___.'",
      options: ["ecosystem", "prevention", "medical", "pollution"],
      answer: "ecosystem",
      type: "multiple-choice",
    },
    {
      id: "cr31-2",
      question:
        "Ôn tập Unit 29 — Điền từ: 'The team reached a ___ (sự đồng nhất) after discussion.'",
      options: [],
      answer: "consensus",
      type: "cloze",
    },
    {
      id: "cr31-3",
      question:
        "Ôn tập Unit 28 — Chọn thì đúng: 'She ___ on this corporate project since January.'",
      options: ["is working", "has been working", "was working", "worked"],
      answer: "has been working",
      type: "multiple-choice",
    },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "professional /prəˈfɛʃənl/",
    description:
      "Business vocabulary stress — professional, collaboration, agenda",
    examples: [
      {
        word: "professional",
        ipa: "/prəˈfɛʃənl/",
        tip: "Stress âm 2: pro-FES-sion-al — 4 âm tiết",
      },
      {
        word: "agenda",
        ipa: "/əˈdʒɛndə/",
        tip: "Stress âm 2: a-GEN-da — âm /dʒ/ không phải /g/ hay /j/",
      },
    ],
    minimalPairs: [["pro-FES-sion-al", "PRO-fes-sion-al (sai)"]],
  },

  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "Please see the attached file", vn: "Vui lòng xem tệp đính kèm" },
      {
        en: "I am writing to confirm our meeting",
        vn: "Tôi viết thư để xác nhận cuộc họp",
      },
      {
        en: "We apologize for the delay",
        vn: "Chúng tôi xin lỗi vì sự chậm trễ",
      },
      {
        en: "Please inform us of changes",
        vn: "Vui lòng thông báo cho chúng tôi về thay đổi",
      },
      { en: "The deadline is next Friday", vn: "Hạn chót là thứ Sáu tới" },
      { en: "We recommend that you sign", vn: "Chúng tôi khuyên bạn nên ký" },
      {
        en: "Could you clarify this point?",
        vn: "Bạn có thể làm rõ điểm này không?",
      },
      { en: "Here is the meeting agenda", vn: "Đây là chương trình cuộc họp" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit31-reading-1",
    title: "Writing Professional Emails",
    title_vn: "Đọc đoạn về giao tiếp kinh doanh chuyên nghiệp",
    level: "B1" as const,
    text:
      "Professional communication is a key skill in any workplace. " +
      "When writing a business email, you should always use a clear subject line. " +
      "Begin with a formal greeting such as 'Dear Mr. Smith' or 'Dear Team'. " +
      "State your purpose in the first sentence: 'I am writing to follow up on our meeting.' " +
      "Use polite, direct language and avoid slang or very informal expressions. " +
      "Always proofread your email before sending — spelling mistakes look unprofessional. " +
      "If you need to attach a document, mention it in the email body: 'Please find attached the report.' " +
      "Close with a professional sign-off: 'Best regards', 'Kind regards', or 'Yours sincerely'. " +
      "Response time matters too. " +
      "Aim to reply to business emails within 24 hours. " +
      "In Vietnamese work culture, it is also common to add a brief personal touch, " +
      "such as asking about the recipient's health or family, before getting to the main point.",
    questions: [
      {
        id: "u31r-q1",
        question_vn: "Điều gì nên xuất hiện đầu tiên trong email kinh doanh?",
        options: [
          "The attachment",
          "A clear subject line",
          "The closing sign-off",
          "Your phone number",
        ],
        answer: "A clear subject line",
        explanation_vn: "'you should always use a clear subject line.'",
      },
      {
        id: "u31r-q2",
        question_vn: "Tại sao cần đọc lại email trước khi gửi?",
        options: [
          "To make it longer",
          "To add more attachments",
          "Because spelling mistakes look unprofessional",
          "To translate it to Vietnamese",
        ],
        answer: "Because spelling mistakes look unprofessional",
        explanation_vn:
          "'Always proofread your email before sending — spelling mistakes look unprofessional.'",
      },
      {
        id: "u31r-q3",
        question_vn: "Nên trả lời email kinh doanh trong bao lâu?",
        options: [
          "Within 6 hours",
          "Within 12 hours",
          "Within 24 hours",
          "Within 48 hours",
        ],
        answer: "Within 24 hours",
        explanation_vn: "'Aim to reply to business emails within 24 hours.'",
      },
      {
        id: "u31r-q4",
        question_vn:
          "Điều gì phổ biến trong văn hoá làm việc của người Việt khi viết email?",
        options: [
          "Writing very short emails",
          "Using English slang",
          "Adding a brief personal touch before the main point",
          "Only using formal language",
        ],
        answer: "Adding a brief personal touch before the main point",
        explanation_vn:
          "'it is also common to add a brief personal touch... before getting to the main point.'",
      },
    ],
  },

  jobScenarios: [
    {
      id: 1,
      title: "Thuyết trình ý tưởng cải tiến quy trình cho lãnh đạo",
      focus: "Business presentation: problem, data, proposed solution, ROI",
      context: "Internal pitch meeting với directors",
      l1Note:
        "⚠️ 'Currently it takes 4 days. Our proposal cuts it to 1 day.' 'Expected ROI is 3x in 6 months.'",
      example:
        "The bottleneck is manual approval. Automating saves 15 hours/week. We can pilot in two teams next month.",
    },
  ],
  // ── OUTPUT: shadowing
  shadowingVideoId: "U0pnDXS_KWc",
};

export default unit31;
