import { NextResponse } from "next/server";
import { detectPromptInjection } from "@/utils/security";
import { chatRequestSchema } from "@/lib/schemas";
import { getPostHogClient } from "@/lib/posthog-server";
import { logAiUsage, fetchGroqChatResponse } from "./aiChatHelpers";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: Request) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "API Key Groq belum dikonfigurasi." }, { status: 500 });
    }

    const body = await request.json();
    const validation = chatRequestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: `Format pesan tidak valid: ${errorMessages}` }, { status: 400 });
    }

    const { messages } = validation.data;
    const lastUserMessage = messages[messages.length - 1]?.content;
    if (detectPromptInjection(lastUserMessage)) {
      await logAiUsage(0, "failed", "Prompt Injection Blocked");
      return NextResponse.json({ error: "Aktivitas mencurigakan terdeteksi. Silakan kirim pesan yang wajar." }, { status: 400 });
    }

    const response = await fetchGroqChatResponse(GROQ_API_KEY, messages, lastUserMessage);
    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || "Gagal mendapat respons dari server Groq.";
      await logAiUsage(0, "failed", errMsg);
      return NextResponse.json({ error: `Kesalahan Groq: ${errMsg}` }, { status: response.status });
    }

    const aiText = data?.choices?.[0]?.message?.content;
    const tokensUsed = data?.usage?.total_tokens || 0;
    if (!aiText) {
      await logAiUsage(0, "failed", "AI text response was empty");
      return NextResponse.json({ error: "AI tidak dapat menghasilkan respons saat ini." }, { status: 500 });
    }

    await logAiUsage(tokensUsed, "success");
    const posthog = getPostHogClient();
    posthog.capture({ distinctId: "anonymous", event: "ai_chat_message_sent", properties: { tokens_used: tokensUsed, message_count: messages.length } });

    return NextResponse.json({ reply: aiText });
  } catch (err: any) {
    console.error("AI Chat error:", err);
    await logAiUsage(0, "failed", err.message);
    return NextResponse.json({ error: "Terjadi kesalahan pada server AI Groq. Silakan coba lagi." }, { status: 500 });
  }
}
