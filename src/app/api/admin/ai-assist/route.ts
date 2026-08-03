import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";
import { detectPromptInjection } from "@/utils/security";
import { getAdminOrTutorUser } from "@/utils/supabase/adminAuth";
import { logAiUsage, getRealtimeDatabaseContext } from "./aiAssistHelpers";
import { constructPromptForMode, fetchInsightsData, executeGroqAiAssist } from "./aiAssistDispatcherHelpers";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const adminSupabase = getAdminSupabase();

export async function POST(request: any) {
  let modeForLog = "unknown";
  let authUser: any = { id: null, email: null, role: null };

  try {
    const currentUser = await getAdminOrTutorUser();
    if (!currentUser) return NextResponse.json({ error: "Tidak diizinkan. Hanya Admin/Tutor." }, { status: 403 });
    authUser = currentUser;
    if (!GROQ_API_KEY) return NextResponse.json({ error: "API Key Groq belum dikonfigurasi." }, { status: 500 });

    const body = await request.json();
    const { mode: rawMode, payload, messages } = body;
    const mode = rawMode || "chat";
    modeForLog = mode;

    let isMalicious = false;
    if (mode === "chat" && messages?.length > 0) isMalicious = detectPromptInjection(messages[messages.length - 1]?.content);
    else if (payload) isMalicious = detectPromptInjection(JSON.stringify(payload));

    if (isMalicious) {
      await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", "Prompt Injection Blocked");
      return NextResponse.json({ error: "Aktivitas mencurigakan terdeteksi." }, { status: 400 });
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "chat") {
      const dbContext = await getRealtimeDatabaseContext();
      systemPrompt = `Kamu adalah Ibra AI Admin Copilot... ${dbContext}`;
    } else if (mode === "insights") {
      if (authUser.role !== "admin") return NextResponse.json({ error: "Hanya Admin." }, { status: 403 });
      const insightsPrompts = await fetchInsightsData();
      systemPrompt = insightsPrompts.systemPrompt;
      userPrompt = insightsPrompts.userPrompt;
    } else {
      const constructed = constructPromptForMode(mode, payload, authUser.role);
      systemPrompt = constructed.systemPrompt;
      userPrompt = constructed.userPrompt;
    }

    const response = await executeGroqAiAssist(GROQ_API_KEY, messages, systemPrompt, userPrompt, mode);
    const data = await response.json();
    if (!response.ok) {
      await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", data?.error?.message);
      return NextResponse.json({ error: data?.error?.message || "Kesalahan Groq." }, { status: response.status });
    }

    const reply = data?.choices?.[0]?.message?.content;
    await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, data?.usage?.total_tokens || 0, "success");
    return NextResponse.json({ reply });
  } catch (err: any) {
    await logAiUsage(authUser.id, authUser.email, authUser.role, modeForLog, 0, "failed", err.message);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server AI." }, { status: 500 });
  }
}
