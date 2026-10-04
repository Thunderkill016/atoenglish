"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createRateLimiter } from "@/lib/security/rate-limit";
import { geminiGenerateUrl } from "@/lib/ai/gemini";
import { SpeakingSessionSchema } from "@/lib/security/validation";
import {
  analyzeSpeaking,
  basicWordCountFeedback,
} from "@/lib/utils/speech-analysis";

const speakingLimiter = createRateLimiter(20, 60 * 1000, "speaking");
const aiLimiter = createRateLimiter(30, 60 * 1000, "ai-gen");

const SCENARIO_DETAILS: Record<
  string,
  { title: string; character: string; difficulty: string }
> = {
  "hotel-checkin": {
    title: "Hotel Check-in",
    character: "Receptionist (Lễ tân)",
    difficulty: "Easy",
  },
  "job-interview": {
    title: "Job Interview",
    character: "Hiring Manager (Nhà tuyển dụng)",
    difficulty: "Medium",
  },
  "coffee-shop": {
    title: "Ordering Coffee",
    character: "Barista (Nhân viên pha chế)",
    difficulty: "Easy",
  },
  "airport-security": {
    title: "Airport Security",
    character: "Border Officer (Nhân viên hải quan)",
    difficulty: "Medium",
  },
  "restaurant-dining": {
    title: "Restaurant Dining",
    character: "Waiter (Phục vụ nhà hàng)",
    difficulty: "Easy",
  },
  "doctors-appointment": {
    title: "Doctor's Appointment",
    character: "Doctor (Bác sĩ)",
    difficulty: "Hard",
  },
  "saas-product-demo": {
    title: "Product Demo",
    character: "Potential Customer (Khách hàng tiềm năng)",
    difficulty: "Hard",
  },
  "investor-pitch": {
    title: "Investor Pitch",
    character: "Angel Investor (Nhà đầu tư)",
    difficulty: "Hard",
  },
  "customer-support": {
    title: "Customer Support",
    character: "Unhappy Customer (Khách hàng không hài lòng)",
    difficulty: "Medium",
  },
  // New high-value job-focused (research: practical situational practice = Babbel strength)
  "team-meeting-update": {
    title: "Team Meeting - Project Update",
    character: "Team Lead (Trưởng nhóm)",
    difficulty: "Medium",
  },
  "client-negotiation": {
    title: "Client Negotiation Call",
    character: "Client (Khách hàng)",
    difficulty: "Hard",
  },
  "performance-review": {
    title: "Performance Review Discussion",
    character: "Manager (Quản lý)",
    difficulty: "Medium",
  },
  "salary-negotiation": {
    title: "Salary Negotiation",
    character: "HR Manager (Quản lý nhân sự)",
    difficulty: "Hard",
  },
  "team-presentation": {
    title: "Team Presentation Q&A",
    character: "Colleague (Đồng nghiệp)",
    difficulty: "Medium",
  },
};

interface ChatMessageParam {
  sender: "ai" | "user";
  text: string;
}

interface SaveSpeakingSessionParams {
  practiceType: "shadowing" | "roleplay" | "journal";
  duration: number;
  transcript?: string | null;
  accuracyScore?: number | null;
  scenarioId?: string | null;
}

/**
 * Server Action lưu lại lịch sử một buổi luyện nói vào bảng speaking_sessions.
 */
export async function saveSpeakingSession(params: SaveSpeakingSessionParams) {
  try {
    // Rate Limiting
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitCheck = await speakingLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    // Input Validation
    const validated = SpeakingSessionSchema.safeParse(params);
    if (!validated.success) {
      return {
        success: false,
        error: `Dữ liệu không hợp lệ: ${validated.error.issues.map((e) => e.message).join(", ")}`,
      };
    }
    const cleanParams = validated.data;

    const supabase = await createClient();

    // 1. Kiểm tra trạng thái đăng nhập — guest: vẫn cho luyện (local analysis), skip persist/XP
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const isGuest = authError || !user;

    if (!isGuest) {
      // 2. Chèn bản ghi mới (chỉ cho user thật)
      const { error } = await supabase.from("speaking_sessions").insert({
        user_id: user!.id,
        practice_type: cleanParams.practiceType,
        duration: cleanParams.duration,
        transcript: cleanParams.transcript || null,
        accuracy_score:
          cleanParams.accuracyScore !== undefined
            ? cleanParams.accuracyScore
            : null,
        scenario_id: cleanParams.scenarioId || null,
      });

      if (error) {
        return {
          success: false,
          error: `Lỗi lưu lịch sử: ${error.message}`,
        };
      }
    }

    // For guests: silently succeed (analysis + feedback is local + free). Seamless self-study.

    // 3. Award XP + streak only for logged-in users (guest: local only, already handled in lesson progress)
    if (isGuest) {
      return {
        success: true,
        guestMode: true,
      };
    }

    const XP_BY_TYPE: Record<string, number> = {
      shadowing: 5,
      roleplay: 8,
      journal: 5,
    };
    const xpEarned = XP_BY_TYPE[cleanParams.practiceType] ?? 5;
    const today = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    const { data: userProgress } = await supabase
      .from("user_progress")
      .select("total_xp, streak, last_active_date")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userProgress) {
      const lastActive = userProgress.last_active_date;
      let nextStreak = 1;
      if (lastActive === today) {
        nextStreak = userProgress.streak;
      } else {
        const d = new Date(today);
        d.setDate(d.getDate() - 1);
        const yesterday = d.toLocaleDateString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        nextStreak = lastActive === yesterday ? userProgress.streak + 1 : 1;
      }
      await supabase
        .from("user_progress")
        .update({
          total_xp: userProgress.total_xp + xpEarned,
          streak: nextStreak,
          last_active_date: today,
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        current_level: "A0",
        streak: 1,
        total_xp: xpEarned,
        last_active_date: today,
      });
    }

    // Revalidate speaking + dashboard so XP and streak update immediately
    revalidatePath("/me/speaking");
    revalidatePath("/learn");

    return {
      success: true,
      xpEarned,
      message: `Đã lưu! +${xpEarned} XP`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}

/**
 * Server Action lấy danh sách lịch sử luyện nói gần đây của người dùng.
 */
export async function getRecentSpeakingSessions(limit: number = 5) {
  try {
    const supabase = await createClient();

    // 1. Kiểm tra trạng thái đăng nhập — guest: return empty (local practice still works)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: true,
        sessions: [],
        guestMode: true,
      };
    }

    // 2. Truy vấn (user thật)
    const { data, error } = await supabase
      .from("speaking_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: `Lỗi truy vấn lịch sử: ${error.message}`,
      };
    }

    return {
      success: true,
      sessions: data || [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}

/**
 * Server Action gọi Gemini Flash tạo câu thoại tiếp theo của AI và gợi ý câu thoại cho User.
 * v2: Native multi-turn contents array + systemInstruction + grammar feedback (Speak.com pattern)
 */
export async function generateRoleplayTurn(
  scenarioId: string,
  history: ChatMessageParam[],
  userMessage: string,
) {
  try {
    // 1. Rate Limiting
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitCheck = await aiLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    // 2. Check Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện tác vụ này.",
      };
    }

    const scenario = SCENARIO_DETAILS[scenarioId];
    if (!scenario) return { success: false, error: "Kịch bản không tồn tại." };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // World-class free fallback (research: low-stakes output + specific VN L1 feedback) — TASK-152 polish
      const lastUser =
        history.filter((h) => h.sender === "user").pop()?.text || userMessage;
      const analysis = analyzeSpeaking(
        "Thank you. Tell me more about your experience.",
        lastUser,
        "roleplay",
      );

      // Scenario-aware free responses (no Gemini dep, always available)
      const s = scenario || { title: "Conversation", character: "Partner" };
      const isJob =
        /job|interview|meeting|salary|performance|client|pitch|demo|presentation/i.test(
          s.title,
        );
      const aiPrompt = isJob
        ? `Thank you for sharing. In the context of ${s.title.toLowerCase()}, can you elaborate on how you handled a similar challenge?`
        : "Thank you. How can I assist you today?";
      const userSuggestion = isJob
        ? "I led a project where we improved the process by 30% through team collaboration."
        : "I'd like to check in for my reservation.";
      const userSuggestionVi = isJob
        ? "Tôi đã dẫn dắt dự án giúp cải thiện quy trình 30% nhờ hợp tác nhóm."
        : "Tôi muốn nhận phòng theo đặt chỗ.";

      let grammarFeedback =
        analysis.specificTips.slice(0, 2).join(" ") ||
        (isJob
          ? "Nhấn âm cuối -ed/-s, linking rõ cho chuyên nghiệp."
          : "Nói rõ âm cuối và dùng cụm từ tự nhiên.");
      let grammarCorrection = "";

      return {
        success: true,
        aiPrompt,
        userSuggestion,
        userSuggestionVi,
        grammarFeedback,
        grammarCorrection,
        isEnd: false,
      };
    }

    // 3. Build native multi-turn contents array (Gemini multi-turn format)
    // History alternates user → model. Gemini requires this strict alternation.
    const turnNumber = Math.floor(history.length / 2) + 1;
    const difficultyNote =
      turnNumber <= 2
        ? "Use simple vocabulary (A1-A2 CEFR). Short sentences."
        : turnNumber <= 5
          ? "Use natural conversational English (A2-B1 CEFR)."
          : "Use richer vocabulary and more complex structures (B1-B2 CEFR). Challenge the learner.";

    // System instruction sets persistent AI behavior across all turns
    const systemInstruction = `You are roleplaying as "${scenario.character}" in the scenario: "${scenario.title}" (${scenario.difficulty}).
You are talking to a Vietnamese English learner at approximately A1-B1 level.
RULES:
- Stay fully in character. Never break the roleplay.
- Keep AI responses to 1-3 sentences max.
- ${difficultyNote}
- After each user message, provide inline grammar/naturalness feedback if there is an error (max 1 correction per turn).
- Always suggest a helpful next reply the user could give (in English + Vietnamese translation).
- Reply in strict JSON only.`;

    // Convert history to Gemini multi-turn contents format
    // Gemini requires strict user→model→user→model alternation
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> =
      [];
    for (const msg of history) {
      contents.push({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
    // Add current user message as the final turn
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    // JSON schema embedded in the final user turn for reliable structured output
    const schemaInstruction = `\n\nRespond ONLY with valid JSON matching this schema exactly:
{
  "aiPrompt": "your in-character response (1-3 sentences)",
  "userSuggestion": "suggested English reply for next turn",
  "userSuggestionVi": "Vietnamese translation of suggestion",
  "grammarFeedback": "brief correction if user made an error, or empty string if correct",
  "grammarCorrection": "the corrected sentence, or empty string if no error",
  "isEnd": false
}
Set isEnd=true only if the conversation reached a natural conclusion.`;

    // Inject schema hint into the last user message
    if (contents.length > 0) {
      const last = contents[contents.length - 1];
      if (last) {
        last.parts = [
          { text: (last.parts[0]?.text ?? "") + schemaInstruction },
        ];
      }
    }

    const response = await fetch(
      geminiGenerateUrl("gemini-1.5-flash", apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.85,
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Gemini API error: ${errText}` };
    }

    const resData = await response.json();
    const responseText = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText)
      return { success: false, error: "Gemini returned empty response." };

    const cleanJson = JSON.parse(responseText.trim());
    return {
      success: true,
      aiPrompt: cleanJson.aiPrompt || "",
      userSuggestion: cleanJson.userSuggestion || "",
      userSuggestionVi: cleanJson.userSuggestionVi || "",
      grammarFeedback: cleanJson.grammarFeedback || "",
      grammarCorrection: cleanJson.grammarCorrection || "",
      isEnd: !!cleanJson.isEnd,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Lỗi hệ thống: ${errorMessage}` };
  }
}

/**
 * Server Action gọi Gemini Flash phân tích hội thoại/nhật ký nói và trả về đánh giá chi tiết.
 */
export async function evaluateSpeakingSession(
  practiceType: "roleplay" | "journal",
  transcript: string,
) {
  try {
    // 1. Rate Limiting
    const reqHeaders = await headers();
    const ip =
      reqHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitCheck = await aiLimiter.check(ip);
    if (!rateLimitCheck.success) {
      return {
        success: false,
        error: "Yêu cầu quá thường xuyên. Vui lòng thử lại sau.",
      };
    }

    // 2. Check Auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện tác vụ này.",
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // High-quality free analysis (no Gemini) — TASK-152 improved
      const ref =
        "I had a productive meeting today and discussed the new project timeline with the team.";
      const analysis = analyzeSpeaking(ref, transcript || "", practiceType);

      let fb = `**Đánh giá chung**\n${analysis.feedback}\n\n**Độ chính xác:** ${analysis.similarity}% (${analysis.wordsCorrect}/${analysis.totalWords} từ chính).\n\n`;

      if (analysis.specificTips.length > 0) {
        fb +=
          "**Mẹo cụ thể cho người Việt (L1 tips):**\n" +
          analysis.specificTips.map((t, i) => `${i + 1}. ${t}`).join("\n") +
          "\n\n";
      }

      fb +=
        "Tiếp tục luyện shadowing + roleplay job scenarios để tăng phản xạ tự nhiên. Miễn phí hoàn toàn.";

      return { success: true, feedback: fb };
    }

    const prompt = `You are an expert English language tutor. Analyze the following English speaking practice session transcript of a Vietnamese learner.
Practice Type: ${practiceType}
Transcript:
"${transcript}"

Please provide a detailed, encouraging, and highly constructive evaluation in Vietnamese.
Break your response down into the following sections using Markdown:
1. **Nhận xét chung**: General assessment of their speaking flow, vocabulary level, and progress.
2. **Sửa lỗi Ngữ pháp & Từ vựng**: Point out any grammatical errors or unnatural word choices, and suggest the correct/more natural way to say them.
3. **Gợi ý diễn đạt hay hơn (Alternative Phrases)**: Give 2-3 alternative phrases or expressions that would make their speech sound more native and premium.
4. **Mẹo phát âm cho người Việt**: Based on typical pronunciation issues Vietnamese speakers face with these words (like final consonants /s/, /t/, /k/, /d/ or word stress), give 2 specific pronunciation tips.
`;

    const response = await fetch(
      geminiGenerateUrl("gemini-1.5-flash", apiKey),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Gemini API error: ${errText}`,
      };
    }

    const resData = await response.json();
    const feedback = resData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!feedback) {
      return {
        success: false,
        error: "Gemini returned empty response.",
      };
    }

    return {
      success: true,
      feedback: feedback.trim(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Lỗi hệ thống: ${errorMessage}`,
    };
  }
}
