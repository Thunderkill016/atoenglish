import { UnitData } from "@/components/learn/UnitTemplate";


// ─────────────────────────────────────────────────────────────────────────────
// UNIT-25 — Describing People & Places  (B1)
// Standardized header + section comments per lesson-blueprint.ts (CONTENT_BLOCK_ORDER)
// + lesson-center-reference.ts (ESA Engage/Study/Activate, CELTA, Nation, CLT VN)
// Gold sample: src/lib/data/units/unit1.ts — field order meta→hook→warmup→vocab→grammar→exercises→dialogues→fluency→output→review
// ─────────────────────────────────────────────────────────────────────────────
export const unit25: UnitData = {
  unitId: "unit-25",
  title: "Unit 25: Describing People & Places",
  level: "B1",
  xp: 100,
  estimatedTime: 50,
  description: "Dùng Relative Clauses (who, which, that, where, whose) để mô tả chi tiết và phức tạp hơn — nâng cấp câu từ A2 lên B1+ ngay lập tức.",
  badgeName: "Người Mô Tả",
  badgeEmoji: "🔍",

  // ── HOOK: situation (real VN context) + learningOutcomes (2–5 can-do) + culturalNote (pragmatic VN↔EN)
  situation: "Bạn đang giới thiệu nhóm dự án và văn phòng mới cho đối tác nước ngoài. Thay vì nói hai câu ngắn: 'This is our manager. She led the project.' — bạn dùng relative clause: 'This is our manager, who led the entire project.' — nghe tự nhiên và B1+ hơn nhiều.",
  learningOutcomes: [
    "Dùng who/which/that/where/whose để gắn kết thông tin trong một câu",
    "Phân biệt defining relative clauses (không có dấu phẩy) và mô tả thiết yếu",
    "Giới thiệu người và địa điểm bằng câu phức tự nhiên ở B1+",
  ],

  // ── HOOK (cultural): pragmatic note
  culturalNote: 'Relative clauses là dấu hiệu rõ nhất của người nói tiếng Anh B1+. Người A2 nói: <span class="text-zinc-400">"She is our engineer. She designed the system."</span> Người B1 nói: <span class="text-emerald-400">"She is our engineer <strong>who designed the entire system</strong>."</span> Luyện tập ghép câu → câu nói của bạn ngay lập tức nghe chuyên nghiệp và tự nhiên hơn.',

  // ── JOB SCENARIOS (TASK-153 raise bar) ───────────────────────────────────
  jobScenarios: [
    { id: 1, title: "Project team intro to foreign partner", focus: "relative clauses + department + remote collab", context: "B1 job meeting" },
    { id: 2, title: "Office tour for client", focus: "which/where clauses + facility", context: "client visit at new branch" },
  ],

  // ── WARMUP: ≥3 short phrases (SRS + prior knowledge activation)
  warmupGreetings: [
    { emoji: "👩‍💼", en: "This is Lan, who leads our marketing department.", vn: "Đây là Lan, người dẫn dắt bộ phận marketing của chúng tôi.", context: "who — mô tả người" },
    { emoji: "🏢", en: "This is the office where the R&D team works.", vn: "Đây là văn phòng nơi nhóm R&D làm việc.", context: "where — mô tả địa điểm" },
    { emoji: "💻", en: "The software that we developed won a national award.", vn: "Phần mềm mà chúng tôi phát triển đã giành giải thưởng quốc gia.", context: "that — mô tả vật" },
  ],

  // ── VOCABULARY: 8–20 words, pre-teach BEFORE dialogues; l1_interference_vn (A1 100%, B1+ ≥50%)
  vocab: [
    { id: 1, word: "headquarters", emoji: "🏢", phonetic: "/ˈhedkwɔːtəz/", meaning: "trụ sở chính", example: "Our headquarters, which is located in Hanoi, has 500 employees.", example2: "The company moved its headquarters to a new building.", collocation: "company headquarters / regional headquarters / based at HQ", audio: "/audio/unit-25/headquarters.mp3" },
    { id: 2, word: "department", emoji: "🏬", phonetic: "/dɪˈpɑːtmənt/", meaning: "phòng / bộ phận", example: "She works in the finance department, which handles all company accounts.", example2: "Each department has its own manager and budget.", collocation: "HR department / finance department / head of department", audio: "/audio/unit-25/department.mp3", l1_interference_vn: "⚠️ Viết hoa khi là tên chính thức: \'the Department of Education\'. Thường: \'marketing department\'." },
    { id: 3, word: "qualified", emoji: "🎓", phonetic: "/ˈkwɒlɪfaɪd/", meaning: "có trình độ / đủ tiêu chuẩn", example: "We need a qualified engineer who has at least five years of experience.", example2: "She is highly qualified for the position.", collocation: "highly qualified / qualified professional / well qualified", audio: "/audio/unit-25/qualified.mp3", l1_interference_vn: "⚠️ \'Qualified FOR\' hoặc \'qualified TO DO\': \'qualified for the job\'. Không dùng \'qualified in doing\'." },
    { id: 4, word: "specialist", emoji: "🧑‍🔬", phonetic: "/ˈspeʃəlɪst/", meaning: "chuyên gia", example: "Dr. Minh is the specialist who developed our AI system.", example2: "We brought in a specialist to solve the technical problem.", collocation: "IT specialist / marketing specialist / subject specialist", audio: "/audio/unit-25/specialist.mp3", l1_interference_vn: "⚠️ \'Specialist IN\': \'a specialist in oncology\'. Giới từ \'in\'. Tương tự \'expert in\'." },
    { id: 5, word: "facility", emoji: "🏭", phonetic: "/fəˈsɪlɪti/", meaning: "cơ sở / phương tiện", example: "This is the facility where all our products are tested.", example2: "The new facility has state-of-the-art equipment.", collocation: "production facility / research facility / modern facility", audio: "/audio/unit-25/facility.mp3" },
    { id: 6, word: "remote", emoji: "🌐", phonetic: "/rɪˈməʊt/", meaning: "từ xa", example: "We have team members who work remotely from across Southeast Asia.", example2: "Remote work has become standard in our industry.", collocation: "remote work / remote team / work remotely", audio: "/audio/unit-25/remote.mp3", l1_interference_vn: "⚠️ \'Remote work\' = làm việc từ xa (tính từ). \'Work remotely\' (trạng từ). Không dùng \'remote\' như danh từ." },
    { id: 7, word: "collaborate", emoji: "🤝", phonetic: "/kəˈlæbəreɪt/", meaning: "cộng tác / hợp tác", example: "Our team collaborates with partners who are based in three countries.", example2: "We collaborate closely with the design team.", collocation: "collaborate with / collaborate on / collaborative project", audio: "/audio/unit-25/collaborate.mp3" },
    { id: 8, word: "experienced", emoji: "💪", phonetic: "/ɪkˈspɪəriənst/", meaning: "có kinh nghiệm", example: "We're looking for a candidate whose background is in digital marketing.", example2: "She is the most experienced member of the team.", collocation: "highly experienced / experienced professional / experienced in", audio: "/audio/unit-25/experienced.mp3" },
    { id: 9, word: "innovative", emoji: "💡", phonetic: "/ˈɪnəveɪtɪv/", meaning: "sáng tạo / đổi mới", example: "The team, whose ideas have won several awards, is expanding.", example2: "We pride ourselves on our innovative approach.", collocation: "innovative solution / innovative approach / highly innovative", audio: "/audio/unit-25/innovative.mp3" },
    { id: 10, word: "client", emoji: "👥", phonetic: "/ˈklaɪənt/", meaning: "khách hàng", example: "The client whose contract we signed last week is very satisfied.", example2: "Our biggest client is based in Singapore.", collocation: "key client / client base / serve clients", audio: "/audio/unit-25/client.mp3", l1_interference_vn: "⚠️ = khách hàng dịch vụ chuyên nghiệp. Phân biệt \'customer\' (mua hàng hóa)." },
    { id: 11, word: "branch", emoji: "🌿", phonetic: "/brɑːntʃ/", meaning: "chi nhánh", example: "We have a branch in Singapore where 50 staff are based.", example2: "The company opened a new branch in Ho Chi Minh City.", collocation: "open a branch / branch office / regional branch", audio: "/audio/unit-25/branch.mp3", l1_interference_vn: "⚠️ = chi nhánh (đếm được): \'open a branch\'. Phân biệt \'department\' (phòng ban trong cùng công ty)." },
    { id: 12, word: "portfolio", emoji: "💼", phonetic: "/pɔːtˈfəʊliəʊ/", meaning: "danh mục / hồ sơ năng lực", example: "Her portfolio, which includes 20+ projects, is very impressive.", example2: "Please send your portfolio before the interview.", collocation: "project portfolio / investment portfolio / build a portfolio", audio: "/audio/unit-25/portfolio.mp3", l1_interference_vn: "⚠️ Đếm được: \'a portfolio\'. Dùng cả trong tài chính (danh mục đầu tư) và sáng tạo (hồ sơ tác phẩm)." },
  ],

  // ── DIALOGUES: ≥1 dialogue AFTER vocab (98% coverage)
  dialogues: [
    {
      id: 1,
      title: "Giới thiệu nhóm dự án",
      audio: "/audio/unit-25/dialogue_1.mp3",
      desc: "Minh giới thiệu các thành viên nhóm với đối tác nước ngoài.",
      lines: [
        { id: "d1-1", speaker: "Partner", text: "Can you introduce your team before we start?", translation: "Bạn có thể giới thiệu nhóm của bạn trước khi chúng ta bắt đầu không?" },
        { id: "d1-2", speaker: "Minh", text: "Of course. This is Lan, who leads our engineering department. She is the specialist who designed our core platform.", translation: "Được chứ. Đây là Lan, người dẫn dắt bộ phận kỹ thuật của chúng tôi. Cô ấy là chuyên gia đã thiết kế nền tảng cốt lõi của chúng tôi." },
        { id: "d1-3", speaker: "Partner", text: "Impressive. And who handles marketing?", translation: "Ấn tượng đấy. Và ai phụ trách marketing?" },
        { id: "d1-4", speaker: "Minh", text: "That's Tom, whose portfolio includes campaigns for three Fortune 500 companies. He works remotely from Singapore, where our regional branch is.", translation: "Đó là Tom, người có danh mục bao gồm các chiến dịch cho ba công ty Fortune 500. Anh ấy làm việc từ xa từ Singapore, nơi chi nhánh khu vực của chúng tôi đặt tại đó." },
        { id: "d1-5", speaker: "Partner", text: "That's quite an international team.", translation: "Đó là một đội ngũ khá quốc tế đấy." },
        { id: "d1-6", speaker: "Minh", text: "Yes! We collaborate with partners who are based in six countries. Our headquarters, which was founded in 2018, now has 150 staff globally.", translation: "Vâng! Chúng tôi hợp tác với các đối tác có trụ sở tại sáu quốc gia. Trụ sở của chúng tôi, được thành lập năm 2018, hiện có 150 nhân viên toàn cầu." },
      ],
    },
    {
      id: 2,
      title: "Tham quan văn phòng mới",
      audio: "/audio/unit-25/dialogue_2.mp3",
      desc: "Lan giới thiệu văn phòng mới với khách hàng.",
      lines: [
        { id: "d2-1", speaker: "Client", text: "This is a beautiful office! Can you tell me about the different areas?", translation: "Đây là văn phòng đẹp! Bạn có thể kể cho tôi nghe về các khu vực khác nhau không?" },
        { id: "d2-2", speaker: "Lan", text: "Of course. This is the innovation lab, where our product team develops new ideas. The equipment that you see here was imported from Germany.", translation: "Được chứ. Đây là phòng thí nghiệm đổi mới, nơi nhóm sản phẩm phát triển ý tưởng mới. Thiết bị mà bạn thấy ở đây được nhập khẩu từ Đức." },
        { id: "d2-3", speaker: "Client", text: "And the room with the glass walls?", translation: "Còn căn phòng có tường kính thì sao?" },
        { id: "d2-4", speaker: "Lan", text: "That's our client meeting room, which seats up to 20 people. It's where we host all our important presentations.", translation: "Đó là phòng họp khách hàng của chúng tôi, có chỗ ngồi lên đến 20 người. Đó là nơi chúng tôi tổ chức tất cả các buổi thuyết trình quan trọng." },
      ],
    },
  ],

  // ── EXERCISES_INPUT: listenAndChoose ≥5 (controlled practice)
  listenAndChoose: [
    { id: "lac1", audio_text: "This is Lan who leads our marketing department", options: ["This is Lan which leads our marketing department", "This is Lan who leads our marketing department", "This is Lan whom leads our marketing department", "This is Lan whose leads our marketing department"], answer: "This is Lan who leads our marketing department" },
    { id: "lac2", audio_text: "The software that we developed won a national award", options: ["The software who we developed won a national award", "The software which we developed won a national award", "The software that we developed won a national award", "The software where we developed won a national award"], answer: "The software that we developed won a national award" },
    { id: "lac3", audio_text: "This is the office where the R&D team works", options: ["This is the office which the R&D team works", "This is the office where the R&D team works", "This is the office that the R&D team works", "This is the office who the R&D team works"], answer: "This is the office where the R&D team works" },
    { id: "lac4", audio_text: "Tom whose portfolio includes Fortune 500 campaigns works remotely", options: ["Tom who portfolio includes Fortune 500 campaigns works remotely", "Tom which portfolio includes Fortune 500 campaigns works remotely", "Tom whose portfolio includes Fortune 500 campaigns works remotely", "Tom where portfolio includes Fortune 500 campaigns works remotely"], answer: "Tom whose portfolio includes Fortune 500 campaigns works remotely" },
    { id: "lac5", audio_text: "The equipment that you see here was imported from Germany", options: ["The equipment who you see here was imported from Germany", "The equipment that you see here was imported from Germany", "The equipment where you see here was imported from Germany", "The equipment whose you see here was imported from Germany"], answer: "The equipment that you see here was imported from Germany" },
  ],

  // ── OUTPUT: speaking prompts (freer production)
  speaking: {
    level1Prompt: "This is {input}, who {input}. She/He works in {input}, which {input}.",
    level1Placeholder: "Ví dụ: Lan — leads our engineering team — the innovation lab — has the latest equipment...",
    level2Situation: "Giới thiệu công ty hoặc nhóm của bạn với đối tác nước ngoài. Sử dụng ít nhất 4 relative clauses khác nhau (who, which, that, where, whose). Mô tả: người (tên + vai trò), địa điểm, sản phẩm/dự án, và một thành tích của nhóm.",
    level2Hint: "This is [name], who [role/achievement]. She/He is the [title] whose [possession/quality]. We work in [place], where [activity]. The [product/project] that we [created/launched] [achievement]. Our [team/company], which was founded in [year], now [current status].",
  },

  // ── GRAMMAR: Inductive (Meaning→Form→CCQ) + vnNote L1
  grammar: {
    title: "Relative Clauses — Ghép Câu Như Người Bản Ngữ",
    rule: "Relative pronouns dùng cho:\nWHO → người (subject or object)\n→ 'The engineer WHO designed this'\nWHICH → vật/ý tưởng\n→ 'The software WHICH we built'\nTHAT → người hoặc vật (informal)\n→ 'The project THAT won the award'\nWHERE → địa điểm\n→ 'The office WHERE we work'\nWHOSE → sở hữu (của ai)\n→ 'The manager WHOSE team won'\n\nDefining (thiết yếu — không có dấu phẩy):\n→ 'The employee who handles accounts is on leave.'\n(chỉ rõ nhân viên cụ thể nào)",
    examples: [
      { en: "This is the specialist who designed our AI system. (who — người làm chủ ngữ)", vn: "Đây là chuyên gia đã thiết kế hệ thống AI của chúng tôi." },
      { en: "The platform that we launched last year has 1 million users. (that — vật, object)", vn: "Nền tảng mà chúng tôi ra mắt năm ngoái có 1 triệu người dùng." },
      { en: "This is the lab where our team develops new products. (where — địa điểm)", vn: "Đây là phòng thí nghiệm nơi nhóm chúng tôi phát triển sản phẩm mới." },
    ],
    tip: "Bí quyết: WHO cho người, WHICH/THAT cho vật, WHERE cho nơi chốn, WHOSE cho sở hữu. Khi ghép 2 câu → tìm danh từ chung → thay bằng relative pronoun → bỏ câu lặp. 'She is the manager. The manager won the award.' → 'She is the manager WHO won the award.'",
    vnNote: "⚠️ Lưu ý người Việt: Tiếng Việt dùng 'mà/người mà/nơi mà' và đặt ở cuối mệnh đề quan hệ. Trong tiếng Anh, relative pronoun đứng NGAY SAU danh từ nó mô tả — vị trí khác hoàn toàn tiếng Việt.",
    dialogueExample: {
      speaker: "Minh",
      text: "This is Lan, who leads our engineering department. Tom, whose portfolio includes Fortune 500 campaigns, works from Singapore, where our regional branch is.",
      translation: "Đây là Lan, người dẫn dắt bộ phận kỹ thuật. Tom, người có danh mục Fortune 500, làm việc từ Singapore, nơi chi nhánh khu vực chúng tôi đặt.",
      highlight: "who (người — chủ ngữ) | whose (sở hữu) | where (địa điểm)",
    },
    ccq: {
      question: "Câu Relative Clause nào ĐÚNG?",
      options: [
        "This is the manager which won the award.",
        "This is the manager who won the award.",
        "This is the manager whom won the award.",
        "This is the manager whose won the award.",
      ],
      answer: "This is the manager who won the award.",
      explanation: "'Who' dùng cho NGƯỜI khi đóng vai trò chủ ngữ trong mệnh đề quan hệ. 'Which' cho vật, 'whose' cho sở hữu.",
    },
  },

  // ── EXERCISES_INPUT: practiceQuiz (active recall)
  practiceQuiz: [
    { id: "pq1", type: "multiple-choice", question: "Chọn đúng: 'She is the colleague ___ helped me with the project.'", options: ["which", "whose", "who", "where"], answer: "who" },
    { id: "pq2", type: "multiple-choice", question: "Chọn đúng: 'This is the room ___ we hold all our presentations.'", options: ["who", "which", "that", "where"], answer: "where" },
    { id: "pq3", type: "cloze", question: "Điền: 'The report ___ you sent yesterday was very helpful.'", answer: "that / which" },
    { id: "pq4", type: "multiple-choice", question: "Chọn đúng sở hữu: 'The manager ___ team won the contract is being promoted.'", options: ["who", "which", "whose", "where"], answer: "whose" },
    { id: "pq5", type: "multiple-choice", question: "Ghép câu: 'She is our engineer. She designed the system.' → ?", options: ["She is our engineer which designed the system.", "She is our engineer who designed the system.", "She is our engineer whose designed the system.", "She is our engineer that she designed the system."], answer: "She is our engineer who designed the system." },
  ],

  // ── EXERCISES_INPUT: matching
  matchingExercise: {
    title: "Nối relative pronoun với cách dùng đúng",
    pairs: [
      { left: "who", right: "mô tả người" },
      { left: "which", right: "mô tả vật" },
      { left: "where", right: "mô tả địa điểm" },
      { left: "whose", right: "mô tả sở hữu" },
      { left: "that", right: "người hoặc vật (informal)" },
    ],
  },

  // ── OUTPUT: practiceTranslate (VN→EN ≥3) + speaking (level1/2)
  practiceTranslate: [
    {
      id: "pt-1",
      prompt_vn: "Đây là văn phòng nơi toàn bộ nhóm R&D làm việc hàng ngày.",
      answer: "This is the office where the entire R&D team works every day.",
    },
    {
      id: "pt-2",
      prompt_vn: "Người phụ trách là chuyên gia có bằng cấp cao.",
      answer: "The person in charge is a specialist with high qualifications.",
    },
    {
      id: "pt-3",
      prompt_vn: "Trụ sở chính nằm ở khu vực có cơ sở vật chất hiện đại.",
      answer: "The headquarters is located in an area with modern facilities.",
    },
  ],


  // ── EXERCISES_INPUT: sentenceCorrection
  sentenceCorrectionExercises: [
    {
      id: "sc25-1",
      sentence: "The man who he works here is my manager.",
      errorWord: "who he",
      correction: "who",
      explanation_vn: "'Who' đã thay thế chủ ngữ 'he' — không viết cả hai. 'The man who works here' (không có 'he').",
    },
    {
      id: "sc25-2",
      sentence: "That is the city where I was born in.",
      errorWord: "born in",
      correction: "born",
      explanation_vn: "'Where' đã bao gồm nghĩa giới từ 'in'. Không viết thêm 'in' sau 'where I was born'.",
    },
  ],



  // ── EXERCISES_INPUT: listenAndArrange
  listenAndArrangeExercises: [
    {
      id: "la25-1",
      audio_text: "She is the person who helped me with the project.",
      prompt_vn: "Cô ấy là người đã giúp tôi trong dự án.",
      words: ["She", "is", "the", "person", "who", "helped", "me", "with", "the", "project", ".", "which", "whom"],
      answer: "She is the person who helped me with the project .",
    },
    {
      id: "la25-2",
      audio_text: "That is the city where I was born.",
      prompt_vn: "Đó là thành phố nơi tôi sinh ra.",
      words: ["That", "is", "the", "city", "where", "I", "was", "born", ".", "which", "in"],
      answer: "That is the city where I was born .",
    },
  ],



  // ── EXERCISES_INPUT: wordBank
  wordBankExercises: [
    {
      id: "wb1",
      prompt_vn: "Đây là Lan, người dẫn dắt bộ phận kỹ thuật của chúng tôi.",
      words: ["This", "is", "Lan", ",", "who", "leads", "our", "engineering", "department", ".", "would", "could"],
      answer: "This is Lan , who leads our engineering department .",
    },
    {
      id: "wb2",
      prompt_vn: "Đây là văn phòng nơi nhóm R&D làm việc.",
      words: ["This", "is", "the", "office", "where", "the", "R&D", "team", "works", ".", "would", "could"],
      answer: "This is the office where the R&D team works .",
    },
    {
      id: "wb3",
      prompt_vn: "Phần mềm mà chúng tôi phát triển đã giành giải thưởng quốc gia.",
      words: ["The", "software", "that", "we", "developed", "won", "a", "national", "award", ".", "would", "could"],
      answer: "The software that we developed won a national award .",
    },
  ],


  // ── EXERCISES_INPUT: scramble
  scrambleExercises: [
    { id: "s25-1", prompt_vn: "Đây là Lan, người dẫn dắt bộ phận kỹ thuật của chúng tôi.", words: ["This", "is", "Lan", ",", "who", "leads", "our", "engineering", "department", "."], answer: "This is Lan , who leads our engineering department ." },
    { id: "s25-2", prompt_vn: "Đây là văn phòng nơi nhóm R&D làm việc.", words: ["This", "is", "the", "office", "where", "the", "R&D", "team", "works", "."], answer: "This is the office where the R&D team works ." },
    { id: "s25-3", prompt_vn: "Phần mềm mà chúng tôi phát triển đã giành giải thưởng quốc gia.", words: ["The", "software", "that", "we", "developed", "won", "a", "national", "award", "."], answer: "The software that we developed won a national award ." },
  ],

  // ── REVIEW: Final quiz ≥5 (retrieval practice)
  quiz: [
    { id: "fq1", type: "multiple-choice", question: "Ghép câu đúng: 'He is a specialist. He has 10 years of experience.'", options: ["He is a specialist which has 10 years of experience.", "He is a specialist who has 10 years of experience.", "He is a specialist whose has 10 years of experience.", "He is a specialist where has 10 years of experience."], answer: "He is a specialist who has 10 years of experience." },
    { id: "fq2", type: "cloze", question: "Điền: 'The client ___ contract we signed is very satisfied.'", answer: "whose" },
    { id: "fq3", type: "multiple-choice", question: "Chọn câu B1+ tự nhiên nhất:", options: ["Lan works here. Lan leads the marketing team.", "Here works Lan who the marketing team leads.", "This is Lan, who leads our marketing team.", "Lan is leading the marketing team here."], answer: "This is Lan, who leads our marketing team." },
    { id: "fq4", type: "translate", question: "Dịch: 'Đây là văn phòng nơi toàn bộ nhóm R&D làm việc hàng ngày.'", answer: "This is the office where the entire R&D team works every day." },
    { id: "fq5", type: "multiple-choice", question: "Câu nào dùng WHOSE đúng?", options: ["The manager whose won the award is being promoted.", "The manager whose team won the award is being promoted.", "The manager who's team won the award is being promoted.", "The manager which team won the award is being promoted."], answer: "The manager whose team won the award is being promoted." },
    { id: "q-ex1", type: "multiple-choice", question: "'Who' trong mệnh đề quan hệ dùng cho:", options: ["Vật", "Người", "Địa điểm", "Thời gian"], answer: "Người" },
    { id: "q-ex2", type: "multiple-choice", question: "Mệnh đề quan hệ đúng:", options: ["The girl which is singing is my sister.", "The girl who is singing is my sister.", "The girl whom is singing is my sister.", "The girl what is singing is my sister."], answer: "The girl who is singing is my sister." },
    { id: "q-ex3", type: "cloze", question: "Điền: 'The city ___ I was born is beautiful.'", answer: "where" },
    { id: "q-ex4", type: "multiple-choice", question: "'Which' dùng cho:", options: ["Người", "Địa điểm", "Vật/sự việc", "Thời gian"], answer: "Vật/sự việc" },
    { id: "q-ex5", type: "multiple-choice", question: "Mệnh đề quan hệ không xác định — dấu hiệu:", options: ["Không có dấu phẩy", "Có dấu phẩy", "Dùng 'that'", "Đứng đầu câu"], answer: "Có dấu phẩy" },
    { id: "q-ex6", type: "translate", question: "Dịch: 'Người đàn ông đang nói chuyện với sếp tôi là anh trai tôi.'", answer: "The man who is talking to my boss is my brother." },
    { id: "q-ex7", type: "multiple-choice", question: "'Where' dùng trong mệnh đề quan hệ cho:", options: ["Người", "Vật", "Địa điểm", "Lý do"], answer: "Địa điểm" },
  ],

  // ── REVIEW: Exit quiz + cumulativeReview (spiral) + reading (B1+)
  cumulativeReviewQuestions: [
    { id: "cr25-1", question: "Ôn tập Unit 24 — Passive Present đúng: 'The products ___ (test) before shipping.'", options: ["test", "are tested", "were tested", "have tested"], answer: "are tested", type: "multiple-choice" },
    { id: "cr25-2", question: "Ôn tập Unit 23 — Điền First Conditional: 'If you ___ (confirm) today, we ___ (start) immediately.'", options: [], answer: "confirm / will start", type: "cloze" },
    { id: "cr25-3", question: "Ôn tập Unit 22 — 'You ___ (không bắt buộc) stay past 6pm.'", options: ["mustn't", "must not", "don't have to", "should not"], answer: "don't have to", type: "multiple-choice" },
  ],

  // ── FLUENCY: pronunciationFocus
  pronunciationFocus: {
    phoneme: "who /huː/ which /wɪtʃ/ where /weər/",
    description: "Relative pronouns — phát âm và stress",
    examples: [
        { word: "who", ipa: "/huː/", tip: "Âm /h/ đầu rõ ràng — không bỏ /h/. The man WHO is... không phải oo is" },
        { word: "which", ipa: "/wɪtʃ/", tip: "Âm /tʃ/ cuối rõ — which /wɪtʃ/ không phải /wɪk/" },
    ],
    minimalPairs: [
        ["who /huː/", "oo (thiếu /h/)"],
        ["which /wɪtʃ/", "witch /wɪtʃ/ (đồng âm!)"],
    ],
  },


  // ── FLUENCY: fluencyDrill ≥5 (Nation Strand 4 automaticity)
  fluencyDrill: {
    items: [
      { en: "This is Lan, who leads our marketing team", vn: "Đây là Lan, người dẫn dắt nhóm marketing" },
      { en: "The project that we launched won an award", vn: "Dự án mà chúng tôi ra mắt đã giành giải thưởng" },
      { en: "This is the room where we hold presentations", vn: "Đây là phòng nơi chúng tôi tổ chức thuyết trình" },
      { en: "The manager whose team won is being promoted", vn: "Người quản lý có nhóm chiến thắng đang được thăng chức" },
      { en: "She is the specialist who designed our system", vn: "Cô ấy là chuyên gia đã thiết kế hệ thống của chúng tôi" },
      { en: "The software which we built is used globally", vn: "Phần mềm mà chúng tôi xây dựng được sử dụng toàn cầu" },
      { en: "Do you know the colleague who handles accounts?", vn: "Bạn có biết đồng nghiệp phụ trách kế toán không?" },
      { en: "The city where our headquarters is located is Hanoi", vn: "Thành phố nơi trụ sở của chúng tôi đặt là Hà Nội" },
    ],
  },

  // ── REVIEW: Reading passage for skills integration
  readingPassage: {
    id: "unit25-reading-1",
    title: "My Dream City",
    title_vn: "Đọc đoạn mô tả thành phố bằng mệnh đề quan hệ",
    level: "B1" as const,
    text:
      "The city where I grew up is a small coastal town in central Vietnam. " +
      "It's the kind of place that makes you feel calm the moment you arrive. " +
      "The beach, which stretches for miles, is one of the cleanest in Southeast Asia. " +
      "The local market, where farmers sell fresh produce every morning, is full of colour and life. " +
      "There is an ancient temple that was built over 400 years ago. " +
      "The people who live there are known for their warmth and hospitality. " +
      "The food, which uses fresh seafood from the ocean, is absolutely delicious. " +
      "The streets, which are lined with ancient trees, are perfect for evening walks. " +
      "I moved to Hanoi five years ago, but the town where I was born is still the place " +
      "that holds my heart. I go back every Tet holiday.",
    questions: [
      {
        id: "u25r-q1",
        question_vn: "Bãi biển của thành phố như thế nào?",
        options: [
          "It is very crowded",
          "It stretches for miles and is one of the cleanest in Southeast Asia",
          "It is only open in summer",
          "It was recently built",
        ],
        answer: "It stretches for miles and is one of the cleanest in Southeast Asia",
        explanation_vn: "'The beach, which stretches for miles, is one of the cleanest in Southeast Asia.'",
      },
      {
        id: "u25r-q2",
        question_vn: "Ngôi đền cổ được xây dựng khi nào?",
        options: [
          "100 years ago",
          "200 years ago",
          "Over 400 years ago",
          "Over 500 years ago",
        ],
        answer: "Over 400 years ago",
        explanation_vn: "'There is an ancient temple that was built over 400 years ago.'",
      },
      {
        id: "u25r-q3",
        question_vn: "Người kể chuyện đã chuyển đến Hà Nội khi nào?",
        options: [
          "Two years ago",
          "Three years ago",
          "Five years ago",
          "Ten years ago",
        ],
        answer: "Five years ago",
        explanation_vn: "'I moved to Hanoi five years ago.'",
      },
      {
        id: "u25r-q4",
        question_vn: "Người kể chuyện trở về quê nhà vào dịp nào?",
        options: [
          "Every summer",
          "Every weekend",
          "Every Tet holiday",
          "Every Christmas",
        ],
        answer: "Every Tet holiday",
        explanation_vn: "'I go back every Tet holiday.'",
      },
    ],
  },

  // ── OUTPUT: shadowing
  shadowingVideoId: "W-jAfgQm_00",
};

export default unit25;
