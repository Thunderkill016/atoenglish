"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Mic,
  Square,
  Volume2,
  RefreshCw,
  Sparkles,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveSpeakingSession, generateRoleplayTurn, evaluateSpeakingSession } from "@/app/actions/speaking";
import { SpeechRecognitionFallback } from "@/lib/utils/speech-fallback";

interface SpeechRecognitionMock {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart?: () => void;
  onresult?: (event: SpeechRecognitionEventMock) => void;
  onend?: () => void;
  onerror?: (event: SpeechRecognitionErrorEventMock) => void;
  activeTranscript?: string;
}

interface SpeechRecognitionEventMock {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventMock {
  error: string;
}

interface SpeechWindowMock extends Window {
  SpeechRecognition?: new () => SpeechRecognitionMock;
  webkitSpeechRecognition?: new () => SpeechRecognitionMock;
}


interface DialogStep {
  aiPrompt: string;
  userSuggestion: string;
  userSuggestionVi: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  aiCharacter: string;
  difficulty: "Easy" | "Medium" | "Hard";
  initialMessage: string;
  l1Note?: string; // TASK-152 VN L1 polish for job scenarios
  steps: DialogStep[];
}

export const ROLEPLAY_SCENARIOS: Scenario[] = [
  {
    id: "hotel-checkin",
    title: "Hotel Check-in",
    description: "Nhận phòng khách sạn tại quầy lễ tân.",
    aiCharacter: "Receptionist (Lễ tân)",
    difficulty: "Easy",
    initialMessage: "Welcome to the Grand Plaza Hotel! How can I assist you today?",
    steps: [
      {
        aiPrompt: "Let me check our reservation system. Ah, yes, a deluxe room for three nights under the name John. Could you please show me your ID or passport?",
        userSuggestion: "Hi, I would like to check in, please. I have a reservation under the name John.",
        userSuggestionVi: "Chào bạn, tôi muốn nhận phòng. Tôi có đặt phòng trước dưới tên John."
      },
      {
        aiPrompt: "Perfect, thank you. Yes, breakfast is included and served from seven to ten AM in the main restaurant on the first floor. Here is your room key, room five-o-three. Do you have any other questions?",
        userSuggestion: "Sure, here is my passport. By the way, is breakfast included in the room rate?",
        userSuggestionVi: "Chắc chắn rồi, đây là hộ chiếu của tôi. Nhân tiện, bữa sáng có bao gồm trong giá phòng không?"
      },
      {
        aiPrompt: "You are very welcome! If you need anything else, just dial zero on your room phone to reach the reception desk. Have a wonderful stay with us!",
        userSuggestion: "No, that's all. Thank you so much for your help!",
        userSuggestionVi: "Không, thế là đủ rồi. Cảm ơn bạn rất nhiều vì sự giúp đỡ!"
      }
    ]
  },
  {
    id: "job-interview",
    title: "Job Interview",
    description: "Phỏng vấn xin việc bằng tiếng Anh.",
    aiCharacter: "Hiring Manager (Nhà tuyển dụng)",
    difficulty: "Medium",
    initialMessage: "Good morning! Thank you for coming in today. To start, could you please tell me a little bit about yourself?",
    l1Note: "L1: nhấn âm cuối -ed/-s rõ (worked, has); intonation lên ở câu hỏi cá nhân. Tránh nuốt âm cuối. Linking 'software engineering'.",
    steps: [
      {
        aiPrompt: "That sounds impressive. We are looking for someone who works well in teams. Can you describe a time when you solved a difficult problem with your team?",
        userSuggestion: "Good morning! I have over three years of experience in software engineering and I'm passionate about building user-friendly web apps.",
        userSuggestionVi: "Chào buổi sáng! Tôi có hơn 3 năm kinh nghiệm trong lĩnh vực kỹ nghệ phần mềm và đam mê xây dựng các ứng dụng web thân thiện với người dùng."
      },
      {
        aiPrompt: "Excellent problem-solving skills. Communication is indeed key. Why do you want to work for our company specifically?",
        userSuggestion: "In my last project, we had a major bug before deployment. I organized an emergency meeting and we split the debugging tasks to fix it on time.",
        userSuggestionVi: "Trong dự án trước, chúng tôi gặp một lỗi lớn trước khi triển khai. Tôi đã tổ chức một cuộc họp khẩn cấp và chúng tôi chia nhau sửa lỗi để kịp tiến độ."
      },
      {
        aiPrompt: "I appreciate your enthusiasm. Your skills align very well with what we need. Do you have any questions for me about the role?",
        userSuggestion: "I admire your company's innovative culture and I believe my engineering skills can help accelerate your new language learning project.",
        userSuggestionVi: "Tôi ngưỡng mộ văn hóa đổi mới của công ty bạn và tin rằng các kỹ năng kỹ thuật của tôi có thể giúp thúc đẩy dự án học ngôn ngữ mới của bạn."
      },
      {
        aiPrompt: "That is a great question. A typical day involves stand-up meetings, coding core features, and collaborating with designers. We will contact you next week about the next steps. Have a great day!",
        userSuggestion: "Yes, could you tell me what a typical day looks like for a developer in this team?",
        userSuggestionVi: "Vâng, bạn có thể cho tôi biết một ngày làm việc điển hình của một lập trình viên trong đội ngũ này diễn ra thế nào không?"
      }
    ]
  },
  {
    id: "coffee-shop",
    title: "Ordering Coffee",
    description: "Gọi đồ uống tại một quán cà phê London.",
    aiCharacter: "Barista (Nhân viên pha chế)",
    difficulty: "Easy",
    initialMessage: "Hi there! What can I get started for you today?",
    steps: [
      {
        aiPrompt: "Sure, a latte. What size would you like? We have small, medium, and large. Also, do you prefer regular milk, oat milk, or soy milk?",
        userSuggestion: "Hi! I would like to order a hot latte, please.",
        userSuggestionVi: "Xin chào! Tôi muốn đặt một ly latte nóng."
      },
      {
        aiPrompt: "Got it, a medium hot latte with oat milk. And would you like any pastries or snacks to go with that today? Our croissants are freshly baked.",
        userSuggestion: "I will take a medium size with oat milk, please.",
        userSuggestionVi: "Tôi lấy cỡ vừa với sữa yến mạch, làm ơn."
      },
      {
        aiPrompt: "Perfect! That will be five pounds and fifty pence. Will you be paying by cash or card today?",
        userSuggestion: "No thanks, just the coffee. To go, please.",
        userSuggestionVi: "Không, cảm ơn, chỉ cà phê thôi. Mang đi, làm ơn."
      },
      {
        aiPrompt: "Payment approved! Thank you. Please wait a moment at the pick-up counter. Have a lovely day!",
        userSuggestion: "I will pay by card, please. Here you go.",
        userSuggestionVi: "Tôi sẽ thanh toán bằng thẻ, làm ơn. Của bạn đây."
      }
    ]
  },
  {
    id: "airport-security",
    title: "Airport Security",
    description: "Qua kiểm tra an ninh và cửa khẩu tại sân bay quốc tế.",
    aiCharacter: "Border Officer (Nhân viên hải quan)",
    difficulty: "Medium",
    initialMessage: "Good afternoon. May I see your passport and boarding pass, please?",
    steps: [
      {
        aiPrompt: "Thank you. What is the purpose of your visit to the United Kingdom?",
        userSuggestion: "Of course. Here is my passport and boarding pass.",
        userSuggestionVi: "Được chứ. Đây là hộ chiếu và thẻ lên máy bay của tôi."
      },
      {
        aiPrompt: "How long do you plan to stay in the UK?",
        userSuggestion: "I am visiting for tourism. I plan to explore London and Edinburgh.",
        userSuggestionVi: "Tôi đến để du lịch. Tôi dự định khám phá London và Edinburgh."
      },
      {
        aiPrompt: "Do you have a return ticket and proof of accommodation booked?",
        userSuggestion: "I will be staying for two weeks.",
        userSuggestionVi: "Tôi sẽ ở lại hai tuần."
      },
      {
        aiPrompt: "Everything looks in order. Welcome to the United Kingdom. Have a wonderful trip!",
        userSuggestion: "Yes, I have a return flight on the fifteenth and I am staying at a hotel in central London. Here is my booking confirmation.",
        userSuggestionVi: "Vâng, tôi có chuyến bay về vào ngày 15 và tôi sẽ ở một khách sạn ở trung tâm London. Đây là xác nhận đặt phòng của tôi."
      }
    ]
  },
  {
    id: "restaurant-dining",
    title: "Restaurant Dining",
    description: "Đặt bàn và gọi món tại nhà hàng tây.",
    aiCharacter: "Waiter (Phục vụ nhà hàng)",
    difficulty: "Easy",
    initialMessage: "Good evening! Welcome to La Maison. Do you have a reservation tonight?",
    steps: [
      {
        aiPrompt: "Perfect, a table for two. Right this way, please. Here are your menus. Can I start you off with something to drink while you look over the menu?",
        userSuggestion: "Good evening! Yes, I have a reservation for two under the name Minh.",
        userSuggestionVi: "Chào buổi tối! Vâng, tôi có đặt bàn cho hai người dưới tên Minh."
      },
      {
        aiPrompt: "Sparkling water, of course. Are you ready to order, or do you need a few more minutes?",
        userSuggestion: "We would like a bottle of sparkling water to start, please.",
        userSuggestionVi: "Chúng tôi muốn một chai nước có gas trước nhé."
      },
      {
        aiPrompt: "Excellent choices! The salmon is indeed very popular tonight. Would you like any starters or side dishes with your mains?",
        userSuggestion: "I will have the grilled salmon and my friend will have the beef steak, medium rare, please.",
        userSuggestionVi: "Tôi sẽ dùng cá hồi nướng còn bạn tôi sẽ dùng bít tết bò, chín tái, làm ơn."
      },
      {
        aiPrompt: "Of course, I will bring that right out. Enjoy your meal!",
        userSuggestion: "No starters, thank you. But could we get some extra bread on the side?",
        userSuggestionVi: "Không cần món khai vị, cảm ơn. Nhưng chúng tôi có thể có thêm bánh mì đi kèm không?"
      }
    ]
  },
  {
    id: "doctors-appointment",
    title: "Doctor's Appointment",
    description: "Khám bác sĩ tại phòng khám quốc tế.",
    aiCharacter: "Doctor (Bác sĩ)",
    difficulty: "Hard",
    initialMessage: "Hello, please come in and have a seat. What brings you in today?",
    steps: [
      {
        aiPrompt: "I see. How long have you been experiencing this headache and fever? And would you rate the pain from one to ten?",
        userSuggestion: "Hello, Doctor. I have been having a severe headache and a fever since yesterday morning.",
        userSuggestionVi: "Xin chào bác sĩ. Tôi bị đau đầu dữ dội và sốt từ sáng hôm qua."
      },
      {
        aiPrompt: "Have you taken any medication for it? And do you have any known allergies to medicine?",
        userSuggestion: "I would say the pain is about a seven. It gets worse when I stand up quickly.",
        userSuggestionVi: "Tôi đánh giá cơn đau khoảng bảy. Nó trở nên tệ hơn khi tôi đứng dậy nhanh."
      },
      {
        aiPrompt: "Alright, I am going to examine you. I think this might be a mild flu combined with dehydration. I will prescribe some paracetamol and recommend you rest and drink plenty of fluids. Can you come back in three days if you do not feel better?",
        userSuggestion: "I took some paracetamol this morning but it did not help much. I have no known allergies.",
        userSuggestionVi: "Tôi đã uống paracetamol sáng nay nhưng không giúp ích nhiều. Tôi không có dị ứng thuốc nào đã biết."
      },
      {
        aiPrompt: "Great. Take care of yourself and do not hesitate to call if your symptoms worsen. I hope you feel better soon!",
        userSuggestion: "Yes, of course. Thank you, Doctor. Should I do any blood tests?",
        userSuggestionVi: "Vâng, tất nhiên rồi. Cảm ơn bác sĩ. Tôi có cần làm xét nghiệm máu không?"
      }
    ]
  },
  {
    id: "saas-product-demo",
    title: "Product Demo",
    description: "Giới thiệu sản phẩm SaaS cho khách hàng tiềm năng qua Zoom.",
    aiCharacter: "Potential Customer (Khách hàng tiềm năng)",
    difficulty: "Hard",
    initialMessage: "Hi, thanks for jumping on this call! I checked out your website briefly. Can you give me a quick overview of what your product actually does?",
    l1Note: "L1: stress 'innovative' 'personalize'. Final -s rõ (users, apps). Nói chậm cụm 'Vietnamese-first' cho rõ.",
    steps: [
      {
        aiPrompt: "Interesting. So it's like an AI tutor built into a learning app. What makes it different from Duolingo or other apps already on the market?",
        userSuggestion: "Sure! AtoEnglish is an AI-powered English learning app designed specifically for Vietnamese speakers. It uses spaced repetition and comprehensible input to help users reach B1 level in 12 months.",
        userSuggestionVi: "Chắc chắn! AtoEnglish là ứng dụng học tiếng Anh tích hợp AI được thiết kế đặc biệt cho người Việt Nam. Nó sử dụng SRS và comprehensible input để giúp người dùng đạt B1 trong 12 tháng."
      },
      {
        aiPrompt: "Okay, that's a key differentiator. Can you show me how the placement test works? I want to understand the user onboarding flow.",
        userSuggestion: "Great question. Unlike generic apps, we focus entirely on the Vietnamese market. Our explanations are in Vietnamese, and our content addresses the specific grammar mistakes Vietnamese learners make.",
        userSuggestionVi: "Câu hỏi hay. Không giống các ứng dụng thông thường, chúng tôi tập trung hoàn toàn vào thị trường Việt Nam. Giải thích bằng tiếng Việt và nội dung giải quyết các lỗi ngữ pháp đặc trưng của người Việt."
      },
      {
        aiPrompt: "That's smart. What's your pricing model? And do you have a free trial?",
        userSuggestion: "When a new user signs up, they take a 40-question CEFR placement test. Based on the results, the app personalizes their learning roadmap from A0 all the way to B2.",
        userSuggestionVi: "Khi người dùng mới đăng ký, họ làm bài kiểm tra CEFR 40 câu. Dựa trên kết quả, ứng dụng cá nhân hóa lộ trình học từ A0 đến B2."
      },
      {
        aiPrompt: "Sounds reasonable. Let me discuss this with my team and I'll get back to you by Friday. Thanks for the demo!",
        userSuggestion: "We offer a free tier with access to the first 10 units. The premium plan is fifteen dollars per month and unlocks all 50 units, AI roleplay, and the full flashcard SRS system.",
        userSuggestionVi: "Chúng tôi có gói miễn phí với 10 unit đầu. Gói premium là 15 đô/tháng và mở khóa toàn bộ 50 unit, AI roleplay và hệ thống flashcard SRS đầy đủ."
      }
    ]
  },
  {
    id: "investor-pitch",
    title: "Investor Pitch",
    description: "Pitch ý tưởng startup cho nhà đầu tư thiên thần.",
    aiCharacter: "Angel Investor (Nhà đầu tư)",
    difficulty: "Hard",
    initialMessage: "Hi, I've got about 15 minutes. Impress me. What's the problem you're solving?",
    l1Note: "L1: rõ /v/ trong 'vision' 'value', linking 'pre-seed'. Số liệu: nói '150 thousand' rõ, stress 'middle class'.",
    steps: [
      {
        aiPrompt: "Okay, so there's a clear pain point. What's your proposed solution and why is now the right time?",
        userSuggestion: "Most Vietnamese professionals want to learn English for career growth, but existing apps like Duolingo are not designed for their specific needs. They waste months on irrelevant content and never reach conversational fluency.",
        userSuggestionVi: "Hầu hết các chuyên gia Việt Nam muốn học tiếng Anh để phát triển sự nghiệp, nhưng các ứng dụng hiện có không phù hợp với nhu cầu cụ thể của họ. Họ lãng phí nhiều tháng vào nội dung không liên quan."
      },
      {
        aiPrompt: "Impressive traction for an early stage product. What's your business model and who's your target customer?",
        userSuggestion: "We built AtoEnglish, a Vietnamese-first English learning platform powered by AI. The timing is perfect because Vietnam's middle class is growing fast and English is now the key skill for accessing global tech jobs.",
        userSuggestionVi: "Chúng tôi xây dựng AtoEnglish, nền tảng học tiếng Anh ưu tiên tiếng Việt với AI. Thời điểm hoàn hảo vì tầng lớp trung lưu Việt Nam đang tăng trưởng nhanh và tiếng Anh là kỹ năng then chốt."
      },
      {
        aiPrompt: "And what are you asking for, exactly? How will you use the investment?",
        userSuggestion: "We target Vietnamese professionals aged 22 to 35 who want to work at international tech companies or grow a global business. Our freemium model converts at 8 percent, and we currently have 500 active monthly users with a 12 dollar average revenue per user.",
        userSuggestionVi: "Chúng tôi nhắm đến các chuyên gia Việt Nam 22-35 tuổi muốn làm việc ở công ty tech quốc tế hoặc phát triển kinh doanh toàn cầu. Mô hình freemium chuyển đổi 8%, hiện có 500 MAU với ARPU 12 đô."
      },
      {
        aiPrompt: "Okay, I like the vision. Send me your deck and financial projections and I'll schedule a follow-up meeting with my partner.",
        userSuggestion: "We are raising 150 thousand dollars in pre-seed funding. The money will go toward content production, marketing in Vietnam, and hiring one full-time engineer to build the mobile app.",
        userSuggestionVi: "Chúng tôi đang kêu gọi 150 nghìn đô pre-seed. Số tiền sẽ dùng để sản xuất nội dung, marketing tại Việt Nam và thuê một kỹ sư full-time để xây dựng ứng dụng mobile."
      }
    ]
  },
  {
    id: "customer-support",
    title: "Customer Support",
    description: "Xử lý phản hồi và khiếu nại của khách hàng SaaS.",
    aiCharacter: "Unhappy Customer (Khách hàng không hài lòng)",
    difficulty: "Medium",
    initialMessage: "Hi, I'm really frustrated right now. I've been a paying customer for 3 months and I'm not seeing any progress. I want a refund.",
    l1Note: "L1: 'frustrated' /ʌ/ rõ, âm cuối 'progress' 'refund'. Giữ tone lịch sự, intonation xuống khi xin lỗi.",
    steps: [
      {
        aiPrompt: "I open the app maybe three or four times a week, but the lessons feel repetitive. I feel like I'm just clicking through the same vocabulary cards over and over.",
        userSuggestion: "Hi, I'm really sorry to hear you're frustrated. I completely understand and I want to help. Can you tell me a bit about how you've been using the app so far?",
        userSuggestionVi: "Xin chào, tôi thực sự xin lỗi vì bạn đang thất vọng. Tôi hoàn toàn hiểu và muốn giúp đỡ. Bạn có thể cho tôi biết bạn đang sử dụng ứng dụng như thế nào không?"
      },
      {
        aiPrompt: "Okay, that sounds more useful. But I still feel like I should have made more progress by now. Other apps promise fluency in 3 months.",
        userSuggestion: "Thank you for sharing that. Based on what you're describing, I think the issue might be that the flashcard review is most effective when done daily. The app is actually designed around spaced repetition, so consistency is key. Have you tried the Grammar or Roleplay features?",
        userSuggestionVi: "Cảm ơn bạn đã chia sẻ. Dựa vào những gì bạn mô tả, tôi nghĩ vấn đề có thể là flashcard hiệu quả nhất khi làm hàng ngày. Ứng dụng được thiết kế xung quanh SRS nên tính nhất quán là chìa khóa."
      },
      {
        aiPrompt: "Alright, I'm willing to give it another month. But I want something in return for my patience.",
        userSuggestion: "I hear you, and those promises are often misleading. Realistic progress takes consistent daily practice over 6 to 12 months. But I want to make this right for you. What if I gave you access to a 30-minute onboarding session to set up a personalised study plan?",
        userSuggestionVi: "Tôi hiểu bạn và những lời hứa đó thường gây hiểu lầm. Tiến bộ thực sự cần thực hành nhất quán hàng ngày trong 6-12 tháng. Nhưng tôi muốn sửa đổi điều này. Bạn có muốn buổi onboarding 30 phút để lập kế hoạch học cá nhân không?"
      },
      {
        aiPrompt: "Okay, that's actually really kind of you. I appreciate it. I'll stay for another month and see how it goes.",
        userSuggestion: "Absolutely. I'm going to extend your premium subscription by one month for free as a thank you for your patience. I'll also send you a personalised study guide by email today. We genuinely want to see you succeed.",
        userSuggestionVi: "Chắc chắn. Tôi sẽ gia hạn gói premium của bạn thêm một tháng miễn phí như lời cảm ơn vì sự kiên nhẫn. Tôi cũng sẽ gửi hướng dẫn học cá nhân qua email hôm nay. Chúng tôi thực sự muốn bạn thành công."
      }
    ]
  },
  {
    id: "online-meeting",
    title: "Online Meeting",
    description: "Tham gia cuộc họp video call tiếng Anh — đặt câu hỏi, bày tỏ ý kiến, xin phát biểu.",
    aiCharacter: "Meeting Facilitator (Người điều hành)",
    difficulty: "Medium",
    initialMessage: "Good morning everyone, let's get started. We have three agenda items today: the Q3 review, the new product launch, and resource planning. First, could someone give a quick update on Q3?",
    l1Note: "L1: linking 'Q3 review', final /z/ 'items' 'launch'. Intonation rise khi hỏi 'What does everyone think?'. Nói 'resource' rõ cụm.",
    steps: [
      {
        aiPrompt: "Thank you for that update. Numbers look solid! Does anyone have questions or comments on the Q3 results before we move on to the product launch?",
        userSuggestion: "Sure, I can take that. Q3 revenue came in at 1.2 million, which is 15% above our target. Churn stayed low at 2.3% and we added 340 new enterprise accounts.",
        userSuggestionVi: "Được, tôi sẽ cập nhật. Doanh thu Q3 đạt 1,2 triệu, tức là vượt 15% mục tiêu. Tỷ lệ hủy vẫn thấp ở mức 2,3% và chúng tôi có thêm 340 tài khoản doanh nghiệp mới."
      },
      {
        aiPrompt: "Good point on the regional split. We'll dig into that next week. Now, for the product launch — the team has proposed moving the date to November 1st. What does everyone think?",
        userSuggestion: "I just want to flag one thing — the growth in Southeast Asia was particularly strong. Could we get a regional breakdown before next week so we can double down on that market?",
        userSuggestionVi: "Tôi chỉ muốn lưu ý một điều — tăng trưởng ở Đông Nam Á đặc biệt mạnh. Chúng ta có thể có phân tích theo khu vực trước tuần tới để tập trung vào thị trường đó không?"
      },
      {
        aiPrompt: "Perfect. November 1st it is. Let's wrap up with resource planning. We're two engineers short for Q4 — any suggestions on how we bridge the gap?",
        userSuggestion: "I'm supportive of November 1st, but I'd suggest we add a soft launch in beta first — maybe October 15th. That gives us two weeks of real user feedback before the full rollout.",
        userSuggestionVi: "Tôi ủng hộ ngày 1 tháng 11, nhưng tôi đề xuất chúng ta thêm giai đoạn ra mắt mềm ở beta trước — có thể là 15 tháng 10. Điều đó cho chúng ta hai tuần thu thập phản hồi thực tế trước khi triển khai toàn diện."
      },
      {
        aiPrompt: "Great ideas everyone. I'll circulate the notes by EOD. Thanks for a productive meeting — talk soon!",
        userSuggestion: "We could consider bringing in two contractors for Q4 — it's faster than full-time hiring. I know a couple of strong React developers who are available. I can send you their portfolios.",
        userSuggestionVi: "Chúng ta có thể xem xét thuê hai nhà thầu cho Q4 — nhanh hơn tuyển dụng toàn thời gian. Tôi biết một vài lập trình viên React giỏi đang rảnh. Tôi có thể gửi portfolio của họ cho bạn."
      }
    ]
  },
  {
    id: "salary-negotiation",
    title: "Salary Negotiation",
    description: "Thương lượng lương với nhà tuyển dụng sau khi nhận offer — tự tin, chuyên nghiệp.",
    aiCharacter: "HR Manager (Quản lý nhân sự)",
    difficulty: "Hard",
    initialMessage: "Congratulations! We'd like to offer you the senior developer position. The package includes a base salary of 2,500 USD per month, plus health insurance and 14 days annual leave. What do you think?",
    l1Note: "L1: final cons /s/ /d/ (dollars, days) + linking '2,500 USD per'. Nói rõ số + stress từ 'research'.",
    steps: [
      {
        aiPrompt: "I understand your research shows a higher range. I have to be transparent — our budget for this role is firm at 2,500. However, we do offer a performance review after 6 months with potential for adjustment. Does that work for you?",
        userSuggestion: "Thank you so much — I'm really excited about this opportunity. I've done some market research and for a senior developer with my level of experience in this industry, the typical range in Ho Chi Minh City is between 2,800 and 3,200 USD. Would you be able to meet me somewhere in that range?",
        userSuggestionVi: "Cảm ơn rất nhiều — tôi thực sự hào hứng về cơ hội này. Tôi đã nghiên cứu thị trường và mức lương phổ biến cho senior developer với kinh nghiệm của tôi trong ngành này ở TP.HCM là từ 2.800 đến 3.200 đô. Bạn có thể đáp ứng mức đó không?"
      },
      {
        aiPrompt: "That's a fair point. I can offer a signing bonus of 1,000 USD and an extra 3 days of annual leave — bringing it to 17 days. We could also add a 500 USD training budget per year. Would that package work for you?",
        userSuggestion: "I appreciate the transparency. Could we perhaps structure it differently — keep the base at 2,500 but include a guaranteed 6-month review with a minimum 10% increase if targets are met? That would give me the income trajectory I'm looking for.",
        userSuggestionVi: "Tôi đánh giá cao sự minh bạch đó. Chúng ta có thể cơ cấu khác được không — giữ mức cơ bản 2.500 nhưng thêm đánh giá 6 tháng được đảm bảo với mức tăng tối thiểu 10% nếu đạt mục tiêu? Điều đó sẽ cho tôi lộ trình thu nhập tôi đang tìm kiếm."
      },
      {
        aiPrompt: "Excellent! Welcome to the team. HR will send over the formal offer letter by tomorrow with all the agreed terms. We're looking forward to having you on board!",
        userSuggestion: "That sounds like a great package. I'm happy to accept on those terms. Could I have the full offer in writing by Friday so I can review it before signing?",
        userSuggestionVi: "Nghe có vẻ là một gói tuyệt vời. Tôi vui lòng chấp nhận với những điều khoản đó. Tôi có thể nhận offer đầy đủ bằng văn bản trước thứ Sáu để xem lại trước khi ký không?"
      }
    ]
  },
  {
    id: "networking-event",
    title: "Networking Event",
    description: "Giao lưu và xây dựng quan hệ tại sự kiện nghề nghiệp — small talk chuyên nghiệp.",
    aiCharacter: "Industry Professional (Chuyên gia ngành)",
    difficulty: "Easy",
    initialMessage: "Hi there! Great turnout tonight, isn't it? I don't think we've met — I'm David from Techvify. What brings you to this event?",
    steps: [
      {
        aiPrompt: "EdTech is booming right now! What kind of product are you building — more B2C or enterprise?",
        userSuggestion: "Hi David, nice to meet you! I'm Lan, a product manager at a startup called AtoEnglish. We're building an AI-powered English learning app for Vietnamese professionals. I came here hoping to connect with people in the EdTech and SaaS space.",
        userSuggestionVi: "Chào David, rất vui được gặp bạn! Tôi là Lan, product manager tại một startup tên AtoEnglish. Chúng tôi đang xây dựng ứng dụng học tiếng Anh bằng AI cho các chuyên gia Việt Nam. Tôi đến đây để kết nối với mọi người trong lĩnh vực EdTech và SaaS."
      },
      {
        aiPrompt: "That's a smart angle — the B2B market is much more predictable. I actually know a few HR managers at multinationals who complain about this exact problem. Would it be useful if I connected you with them?",
        userSuggestion: "Primarily B2C right now, but we're exploring B2B — selling to companies who want to upskill their employees' business English. The ROI is clearer for enterprise buyers.",
        userSuggestionVi: "Chủ yếu là B2C lúc này, nhưng chúng tôi đang khám phá B2B — bán cho các công ty muốn nâng cao tiếng Anh kinh doanh cho nhân viên. ROI rõ ràng hơn cho người mua doanh nghiệp."
      },
      {
        aiPrompt: "Perfect, I'll send you a LinkedIn message tonight. Let me grab another drink — enjoy the rest of the evening and looking forward to seeing where AtoEnglish goes!",
        userSuggestion: "That would be incredibly helpful, thank you! Here's my business card. It would be great to stay in touch — maybe we could grab a coffee next week to discuss further?",
        userSuggestionVi: "Điều đó thực sự hữu ích, cảm ơn bạn! Đây là danh thiếp của tôi. Sẽ tuyệt nếu chúng ta giữ liên lạc — có thể chúng ta có thể uống cà phê tuần tới để thảo luận thêm?"
      }
    ]
  },
  {
    id: "performance-review",
    title: "Performance Review",
    description: "Buổi đánh giá hiệu suất với quản lý — thảo luận thành tích, mục tiêu và phát triển.",
    aiCharacter: "Direct Manager (Quản lý trực tiếp)",
    difficulty: "Medium",
    initialMessage: "Thanks for coming in. So, it's been six months since your last review. Overall I'd say it's been a strong period. How do you feel you've been performing?",
    l1Note: "L1: intonation flat -> nhấn 'strong' 'growth'. Âm cuối -d -t (led, shipped). Dùng rising cho câu hỏi 'How do you see that?'.",
    steps: [
      {
        aiPrompt: "Those are great examples. I agree — your technical output has been excellent. One area I'd like to see growth in is cross-team communication. Some stakeholders mentioned they sometimes feel out of the loop on your projects. How do you see that?",
        userSuggestion: "Overall, I feel this has been one of my stronger periods. I led the API migration that reduced load times by 40%, mentored two junior developers, and shipped the mobile dashboard feature two weeks ahead of schedule.",
        userSuggestionVi: "Nhìn chung, tôi cảm thấy đây là một trong những giai đoạn mạnh mẽ nhất của tôi. Tôi đã dẫn dắt việc di chuyển API giúp giảm thời gian tải 40%, hướng dẫn hai lập trình viên junior và hoàn thành tính năng mobile dashboard sớm hai tuần so với kế hoạch."
      },
      {
        aiPrompt: "That's a mature way to look at it. A bi-weekly stakeholder update email could work well. Now, for your development goals next quarter — what areas would you like to focus on?",
        userSuggestion: "I take that feedback seriously. Looking back, I think I focused too much on execution and not enough on keeping stakeholders informed. I'd like to set up a bi-weekly project update email and make myself more available for quick syncs.",
        userSuggestionVi: "Tôi coi trọng phản hồi đó. Nhìn lại, tôi nghĩ tôi tập trung quá nhiều vào thực thi mà không đủ vào việc thông báo cho các bên liên quan. Tôi muốn thiết lập email cập nhật dự án hai tuần một lần và sẵn sàng hơn cho các cuộc họp nhanh."
      },
      {
        aiPrompt: "I love that ambition. I'll support you for the tech lead role. Let's set a 90-day plan — I'll send you a template. One last thing: is there anything you need from me to perform even better?",
        userSuggestion: "I'd really like to grow into a tech lead role by end of year. To get there, I want to take on more system design responsibilities and run at least two cross-team projects. I'd also like to attend one technical conference this year.",
        userSuggestionVi: "Tôi thực sự muốn phát triển lên vai trò tech lead vào cuối năm. Để đạt được điều đó, tôi muốn đảm nhận nhiều trách nhiệm thiết kế hệ thống hơn và dẫn dắt ít nhất hai dự án liên nhóm. Tôi cũng muốn tham dự một hội nghị kỹ thuật trong năm nay."
      },
      {
        aiPrompt: "Noted. I'll block time for us to meet every two weeks. This was a great conversation — I'm really pleased with your trajectory. Keep it up!",
        userSuggestion: "It would really help to have clearer priorities when multiple urgent tasks come in at the same time. Sometimes I'm not sure which fires to fight first. A quick daily or weekly check-in to align on priorities would make a big difference.",
        userSuggestionVi: "Sẽ thực sự hữu ích nếu có thứ tự ưu tiên rõ ràng hơn khi nhiều công việc khẩn cấp đến cùng lúc. Đôi khi tôi không chắc nên xử lý việc gì trước. Một cuộc kiểm tra nhanh hàng ngày hoặc hàng tuần để căn chỉnh ưu tiên sẽ tạo ra sự khác biệt lớn."
      }
    ]
  }
];


interface ChatMessage {
  sender: "ai" | "user";
  text: string;
  accuracyScore?: number | null;
  missingCodas?: string[];
  grammarFeedback?: string;
  grammarCorrection?: string;
}

export function AIRoleplay() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(ROLEPLAY_SCENARIOS[0].id);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1); // -1: chưa bắt đầu hoặc đang chào
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // AI-powered dynamic roleplay states
  const [dynamicStep, setDynamicStep] = useState<{ userSuggestion: string; userSuggestionVi: string } | null>(null);
  const [aiEvaluation, setAiEvaluation] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const activeScenario = ROLEPLAY_SCENARIOS.find(s => s.id === selectedScenarioId) || ROLEPLAY_SCENARIOS[0];
  const currentStep: DialogStep | undefined = activeScenario.steps[currentStepIndex];

  const displaySuggestion = dynamicStep ? dynamicStep.userSuggestion : currentStep?.userSuggestion;
  const displaySuggestionVi = dynamicStep ? dynamicStep.userSuggestionVi : currentStep?.userSuggestionVi;

  // Speech Recognition & Synthesis Setup
  const SpeechRecognition = typeof window !== "undefined"
    ? ((window as unknown as SpeechWindowMock).SpeechRecognition ||
       (window as unknown as SpeechWindowMock).webkitSpeechRecognition ||
       (SpeechRecognitionFallback as unknown as new () => SpeechRecognitionMock))
    : null;
  const recognitionRef = useRef<SpeechRecognitionMock | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextTurnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cuộn xuống cuối hội thoại
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Vòng đời chung của component (mount / unmount)
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current);
      if (nextTurnTimeoutRef.current) clearTimeout(nextTurnTimeoutRef.current);
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  // Khởi động cuộc trò chuyện khi chọn Scenario
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    startRoleplay();
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
      // Stop microphone on scenario-switch to release browser mic lock
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current);
      if (nextTurnTimeoutRef.current) clearTimeout(nextTurnTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenarioId]);

  const startRoleplay = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    setChatHistory([{ sender: "ai", text: activeScenario.initialMessage }]);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setRecognizedText("");
    setIsAiSpeaking(false);
    setIsListening(false);
    setDynamicStep(null);
    setAiEvaluation(null);
    setIsEvaluating(false);
    // eslint-disable-next-line react-hooks/purity
    startTimeRef.current = Date.now();
    
    // Tự động phát câu chào đầu tiên của AI
    if (greetingTimeoutRef.current) clearTimeout(greetingTimeoutRef.current);
    greetingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        speakText(activeScenario.initialMessage);
      }
    }, 300);
  };

  // Hàm phát giọng đọc AI
  const speakText = (text: string) => {
    if (typeof window === "undefined") return;
    
    window.speechSynthesis.cancel();
    setIsAiSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // Đọc chậm một chút để người học dễ nghe

    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(voice => voice.lang === "en-US" && voice.name.includes("Google")) 
                   || voices.find(voice => voice.lang.startsWith("en-"));
    if (usVoice) {
      utterance.voice = usVoice;
    }

    utterance.onend = () => {
      if (isMountedRef.current) {
        setIsAiSpeaking(false);
      }
    };

    utterance.onerror = () => {
      if (isMountedRef.current) {
        setIsAiSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Hàm lắng nghe giọng nói của người học
  const startListening = () => {
    if (typeof window === "undefined" || !SpeechRecognition) {
      toast.error("Trình duyệt của bạn không hỗ trợ Nhận diện giọng nói.");
      return;
    }

    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);

    try {
      const recognition = new SpeechRecognition();
      if (SpeechRecognition === (SpeechRecognitionFallback as unknown as new () => SpeechRecognitionMock)) {
        recognition.activeTranscript = displaySuggestion || "";
      }
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setIsListening(true);
        setRecognizedText("");
      };

      recognition.onresult = (event: SpeechRecognitionEventMock) => {
        if (!isMountedRef.current) return;
        const text = event.results[0][0].transcript;
        setRecognizedText(text);
        handleUserAnswer(text, true);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventMock) => {
        if (!isMountedRef.current) return;
        // Speech recognition error — UI state already handles this
        setIsListening(false);
        if (event.error === "no-speech") {
          toast.error("Không nghe thấy bạn nói gì. Hãy thử lại!");
        }
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      if (isMountedRef.current) {
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Hàm tính toán độ trùng khớp từ vựng
  const calculateAccuracy = (original: string, recognized: string) => {
    const cleanWord = (w: string) => w.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    const origWords = original.split(/\s+/).map(cleanWord).filter(Boolean);
    const recWords = recognized.split(/\s+/).map(cleanWord).filter(Boolean);

    if (origWords.length === 0) return 0;
    
    let matches = 0;
    const recSet = new Set(recWords);
    origWords.forEach(word => {
      if (recSet.has(word)) {
        matches++;
      }
    });

    return Math.round((matches / origWords.length) * 100);
  };

  // Helper: detect specific missing English final consonants (codas) commonly deleted by Vietnamese learners
  const detectMissingCodas = (expected: string, actual: string): string[] => {
    const missingWarnings: string[] = [];
    const cleanExpected = expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const cleanActual = actual.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

    const expectedWords = cleanExpected.split(/\s+/);
    const actualWords = cleanActual.split(/\s+/);

    expectedWords.forEach((word) => {
      // Check if the expected word ends in a target coda sound
      if (word.endsWith("k") || word.endsWith("t") || word.endsWith("s") || word.endsWith("d") || word.endsWith("ce") || word.endsWith("se")) {
        // Find matching word base in actual spoken phrase
        const baseWordWithoutCoda = word.replace(/(k|t|s|d|ce|se)$/, "");
        
        // If user pronounced the base but omitted the ending
        const foundOmission = actualWords.some(
          (aWord) => aWord === baseWordWithoutCoda && aWord !== word
        );

        if (foundOmission) {
          let soundExplanation = "";
          if (word.endsWith("k")) soundExplanation = "âm /k/ (ví dụ: 'like' -> 'lai-kờ')";
          else if (word.endsWith("t")) soundExplanation = "âm /t/ (ví dụ: 'cat' -> 'ca-tờ')";
          else if (word.endsWith("s") || word.endsWith("ce") || word.endsWith("se")) soundExplanation = "âm /s/ (ví dụ: 'face' -> 'fây-sờ')";
          else if (word.endsWith("d")) soundExplanation = "âm /d/ (ví dụ: 'red' -> 're-dờ')";

          missingWarnings.push(`Từ "${word}" phát âm thiếu ${soundExplanation}`);
        }
      }
    });

    return missingWarnings;
  };

  // Helper hoàn thành và đánh giá hội thoại bằng AI
  const handleRoleplayCompletion = async (finalHistory: ChatMessage[], lastText: string) => {
    setIsCompleted(true);
    toast.success("Tuyệt vời! Bạn đã hoàn thành buổi hội thoại nhập vai này.");

    // eslint-disable-next-line react-hooks/purity
    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    
    // Nối toàn bộ câu thoại của user để lưu lại làm transcript
    const userTexts = finalHistory
      .filter(m => m.sender === "user")
      .map(m => m.text)
      .join(" | ");
    const fullTranscript = userTexts ? `${userTexts} | ${lastText}` : lastText;

    // Tạo chuỗi hội thoại hoàn chỉnh cho AI chấm điểm
    const fullDialogueText = [...finalHistory, { sender: "user", text: lastText }]
      .map(m => `${m.sender === "ai" ? "AI" : "User"}: ${m.text}`)
      .join("\n");

    let savedTranscript = fullDialogueText;
    setIsEvaluating(true);
    try {
      const evalRes = await evaluateSpeakingSession("roleplay", fullDialogueText);
      if (evalRes.success && evalRes.feedback) {
        setAiEvaluation(evalRes.feedback);
        savedTranscript = `${fullDialogueText}\n\n=== ĐÁNH GIÁ CHI TIẾT TỪ AI ===\n${evalRes.feedback}`;
      } else if (evalRes.error) {
        toast.error(`Không thể lấy đánh giá AI: ${evalRes.error}`);
      }
    } catch (err) {
      // Bỏ qua lỗi đánh giá, lưu transcript thô
    } finally {
      setIsEvaluating(false);
    }

    const saveRes = await saveSpeakingSession({
      practiceType: "roleplay",
      duration,
      transcript: savedTranscript,
      scenarioId: activeScenario.id
    });
    if (!isMountedRef.current) return;
    if (saveRes.success && saveRes.xpEarned) {
      toast.success("Buổi hội thoại đã được lưu.");
    } else if (saveRes.success) {
      // Guest: persist local history for viz in dashboard/speaking (TASK-152)
      try {
        const key = "guest_speaking_sessions";
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        // eslint-disable-next-line react-hooks/purity -- local guest timestamp id only
        const entry = { id: `guest-${Date.now()}`, practice_type: "roleplay" as const, duration, accuracy_score: null, scenario_id: activeScenario.id, created_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify([entry, ...prev].slice(0, 20)));
      } catch {}
    }
  };

  // Xử lý sau khi người học trả lời xong
  const handleUserAnswer = (text: string, isSpoken: boolean = false) => {
    if (!text.trim()) return;

    let score: number | null = null;
    let omissions: string[] = [];

    if (isSpoken && displaySuggestion) {
      score = calculateAccuracy(displaySuggestion, text);
      omissions = detectMissingCodas(displaySuggestion, text);
      
      if (score >= 80) {
        if (omissions.length > 0) {
          toast.warning(`Tuyệt vời! ${score}%. Lưu ý: ${omissions[0]}`);
        } else {
          toast.success(`Tuyệt vời! ${score}%`);
        }
      } else if (score >= 50) {
        if (omissions.length > 0) {
          toast.warning(`Khá tốt! ${score}%. Cảnh báo: ${omissions[0]}`);
        } else {
          toast.info(`Khá tốt! ${score}%`);
        }
      } else {
        if (omissions.length > 0) {
          toast.error(`Chưa đạt (${score}%). Lỗi: ${omissions.join(", ")}`);
        } else {
          toast.warning(`Hãy cố gắng nói to, rõ ràng hơn. Độ chính xác: ${score}%`);
        }
      }
    }

    // 1. Thêm tin nhắn của user vào history
    const updatedHistory = [
      ...chatHistory,
      {
        sender: "user" as const,
        text,
        accuracyScore: score,
        missingCodas: omissions
      }
    ];
    setChatHistory(updatedHistory);

    // 2. Kích hoạt AI trả lời ở bước tiếp theo
    if (nextTurnTimeoutRef.current) clearTimeout(nextTurnTimeoutRef.current);
    nextTurnTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      // Thử gọi Gemini API để tạo phản hồi thực
      try {
        const historyParams = chatHistory.map(m => ({
          sender: m.sender,
          text: m.text
        }));
        historyParams.push({ sender: "user", text });

        const response = await generateRoleplayTurn(activeScenario.id, historyParams, text);
        if (response.success && response.aiPrompt) {
          // Show grammar correction on the user's last message if AI caught an error
          if (response.grammarFeedback) {
            setChatHistory(prev =>
              prev.map((m, i) =>
                i === prev.length - 1
                  ? { ...m, grammarFeedback: response.grammarFeedback, grammarCorrection: response.grammarCorrection }
                  : m
              )
            );
          }
          setChatHistory(prev => [...prev, { sender: "ai", text: response.aiPrompt }]);
          speakText(response.aiPrompt);

          if (response.isEnd) {
            handleRoleplayCompletion(updatedHistory, response.aiPrompt);
          } else {
            setDynamicStep({
              userSuggestion: response.userSuggestion,
              userSuggestionVi: response.userSuggestionVi
            });
            setCurrentStepIndex(prev => prev + 1);
          }
          return;
        }
      } catch (err) {
        // Fallback về hội thoại tĩnh dưới đây
      }

      // Fallback: Sử dụng kịch bản hội thoại tĩnh có sẵn
      if (currentStepIndex < activeScenario.steps.length) {
        const step = activeScenario.steps[currentStepIndex];
        
        // Đưa câu thoại tiếp theo của AI vào chat
        setChatHistory(prev => [...prev, { sender: "ai", text: step.aiPrompt }]);
        speakText(step.aiPrompt);

        // Chuyển step tiếp theo
        setDynamicStep(null); // Reset để sử dụng câu thoại tĩnh tiếp theo
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Hoàn thành đoạn hội thoại
        handleRoleplayCompletion(chatHistory, text);
      }
    }, 1500);
  };

  // Bỏ qua bước nói và nộp trực tiếp bằng cách click vào Suggestion
  const handleUseSuggestion = () => {
    if (!displaySuggestion) return;
    setRecognizedText(displaySuggestion);
    handleUserAnswer(displaySuggestion, false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Scenarios Header Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ROLEPLAY_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedScenarioId(s.id)}
            className={`shrink-0 snap-start px-4 h-10 rounded-2xl text-xs font-bold transition-all border flex items-center justify-center max-w-[130px] sm:max-w-none ${
              selectedScenarioId === s.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-violet-500/10"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <span className="truncate">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Chat Box */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-8 space-y-4 shadow-sm relative overflow-hidden flex flex-col min-h-[350px] sm:min-h-[500px] justify-between">
        
        {/* Chat Header info */}
        <div className="flex items-center justify-between border-b border-foreground/[0.04] pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <MessageSquare className="size-4.5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">{activeScenario.title}</h4>
              <p className="text-[10px] text-muted-foreground font-normal">Đóng vai cùng: {activeScenario.aiCharacter}</p>
              {activeScenario.l1Note && (
                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 mt-0.5">💡 {activeScenario.l1Note}</p>
              )}
            </div>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
            activeScenario.difficulty === "Easy"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : activeScenario.difficulty === "Medium"
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
              : "bg-red-500/10 text-red-600 border-red-500/20"
          }`}>
            {activeScenario.difficulty}
          </span>
        </div>

        {/* Chat History Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[220px] sm:max-h-[300px] pr-2 scrollbar-thin">
          {chatHistory.map((msg, index) => {
            const isAi = msg.sender === "ai";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Character avatar indicator */}
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isAi ? "bg-violet-500/10 text-violet-500" : "bg-primary/10 text-primary"
                }`}>
                  {isAi ? "AI" : "ME"}
                </span>

                <div className="space-y-1 max-w-[85%]">
                  <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? "bg-foreground/[0.03] text-foreground rounded-tl-none border border-foreground/[0.04]"
                      : "bg-primary text-primary-foreground rounded-tr-none shadow-sm font-medium"
                  }`}>
                    {msg.text}
                  </div>
                  
                  {isAi && (
                    <button
                      onClick={() => speakText(msg.text)}
                      className="text-[10px] text-muted-foreground font-bold hover:text-primary flex items-center gap-1 mt-1 px-1 transition-colors"
                    >
                      <Volume2 className="size-3" />
                      Nghe phát âm
                    </button>
                  )}

                  {!isAi && msg.accuracyScore !== null && msg.accuracyScore !== undefined && (
                    <div className="flex flex-col gap-1 items-end mt-1">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        msg.accuracyScore >= 80
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : msg.accuracyScore >= 50
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        Độ chính xác: {msg.accuracyScore}%
                      </span>
                      {msg.missingCodas && msg.missingCodas.length > 0 && (
                        <div className="text-right text-[9px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 border border-amber-500/15 px-2 py-1 rounded-xl max-w-[200px] leading-relaxed">
                          ⚠️ Thiếu âm: {msg.missingCodas.map(w => w.replace(/^Từ\s+/, "")).join(", ")}
                        </div>
                      )}
                      {!isAi && msg.grammarFeedback && (
                        <div className="mt-1.5 text-right">
                          <div className="inline-flex flex-col gap-0.5 text-[10px] font-semibold bg-amber-500/8 border border-amber-500/20 px-2.5 py-1.5 rounded-xl text-left max-w-[220px]">
                            <span className="text-amber-600 dark:text-amber-400 font-black text-[9px] uppercase tracking-wider">✏️ Sửa lỗi</span>
                            <span className="text-zinc-600 dark:text-zinc-400 leading-snug">{msg.grammarFeedback}</span>
                            {msg.grammarCorrection && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">&quot;{msg.grammarCorrection}&quot;</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* User Interaction Controls */}
        <div className="pt-4 border-t border-foreground/[0.04] space-y-4">
          
          {/* Scenario Completed Screen */}
          {isCompleted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 sm:p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3"
            >
              <div className="inline-flex size-12 items-center justify-center bg-emerald-500 text-white rounded-full">
                <CheckCircle className="size-6" />
              </div>
              <h5 className="font-bold text-foreground">Hội thoại hoàn thành xuất sắc!</h5>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto font-normal">
                Chúc mừng bạn đã luyện nói phản xạ thành công toàn bộ kịch bản giao tiếp &quot;{activeScenario.title}&quot;.
              </p>

              {isEvaluating && (
                <div className="p-4 bg-violet-500/5 rounded-2xl border border-dashed border-violet-500/20 text-center space-y-2 my-4">
                  <div className="inline-block size-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-muted-foreground">AI đang phân tích và chuẩn bị phản hồi cho bạn...</p>
                </div>
              )}

              {aiEvaluation && (
                <div className="my-4 p-5 rounded-2xl bg-violet-500/[0.03] border border-violet-500/10 text-left space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                  <h6 className="font-bold text-xs uppercase tracking-widest text-violet-500 flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    Nhận xét chi tiết từ AI Tutor
                  </h6>
                  <div className="text-xs text-foreground/80 leading-relaxed font-sans prose prose-sm prose-invert whitespace-pre-wrap">
                    {aiEvaluation}
                  </div>
                </div>
              )}

              <Button
                onClick={startRoleplay}
                variant="outline"
                className="h-10 rounded-xl gap-2 font-bold text-xs uppercase border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 bg-transparent mt-2"
              >
                <RefreshCw className="size-3.5" />
                Luyện lại hội thoại
              </Button>
            </motion.div>
          ) : (
            // Active interaction step
            <div className="space-y-4">
              
              {/* Suggestion Card for User */}
              {displaySuggestion && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-primary">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Gợi ý câu thoại nói
                    </span>
                    <button
                      onClick={handleUseSuggestion}
                      className="hover:underline flex items-center gap-0.5 normal-case font-bold"
                    >
                      Bỏ qua và Đi tiếp <ArrowRight className="size-3" />
                    </button>
                  </div>
                  
                  <p className="text-xs sm:text-sm font-semibold text-foreground font-sans">
                    &quot;{displaySuggestion}&quot;
                  </p>
                  
                  <p className="text-[11px] text-muted-foreground font-normal italic">
                    Dịch nghĩa: {displaySuggestionVi}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-stretch sm:items-center gap-3">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isAiSpeaking}
                  className={`flex-1 h-14 sm:h-12 rounded-2xl font-bold transition-all duration-300 gap-2 flex items-center justify-center ${
                    isListening
                      ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white animate-pulse shadow-lg shadow-red-500/20"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 active:scale-[0.98]"
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="size-4.5 fill-white" />
                      <span>Đang lắng nghe... Nói đi bạn</span>
                    </>
                  ) : (
                    <>
                      <Mic className="size-4.5" />
                      <span>Nhấn để trả lời AI</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={startRoleplay}
                  variant="outline"
                  size="icon"
                  className="size-14 sm:size-12 rounded-2xl border-border/60 shrink-0 active:scale-[0.98] hover:bg-white/5 flex items-center justify-center"
                  title="Khởi động lại cuộc trò chuyện"
                >
                  <RefreshCw className="size-4.5 text-muted-foreground" />
                </Button>
              </div>

              {/* Interim recognized text feedback & waveform */}
              <div className="flex flex-col items-center justify-center gap-3">
                {isListening && (
                  <div className="flex items-center gap-1.5 h-6 px-3 bg-violet-500/5 rounded-full border border-violet-500/10">
                    {([14, 22, 10, 26, 8, 18, 12, 20, 16, 24] as const).map((maxH, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-violet-500 rounded-full"
                        animate={{ height: [6, maxH, 6] }}
                        transition={{
                          duration: 0.4 + (i % 5) * 0.05,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.03,
                        }}
                      />
                    ))}
                  </div>
                )}
                {isListening && recognizedText && (
                  <div className="p-3 bg-foreground/[0.02] border border-dashed border-foreground/10 rounded-xl text-xs font-mono text-muted-foreground italic text-center w-full">
                    Nhận diện: &quot;{recognizedText}...&quot;
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
