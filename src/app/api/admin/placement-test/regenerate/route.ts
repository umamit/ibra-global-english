import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
export const dynamic = "force-dynamic";

export const POST = withAdminAuth(async (request: Request) => {
  const body = await request.json().catch(() => ({}));
  const { mode = "ping" } = body;

  if (mode === "ping") {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ status: "failed", message: "Kunci API (GROQ_API_KEY) tidak ditemukan di konfigurasi server (.env.local)." });
    }
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", temperature: 0.1, max_tokens: 5, messages: [{ role: "user", content: "Hello" }] })
      });
      if (response.ok) {
        return NextResponse.json({ status: "success", message: "Koneksi Groq AI sukses dan siap digunakan." });
      } else {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json({ status: "failed", message: errorData?.error?.message || "Groq API menolak koneksi (kunci tidak valid atau limit habis)." });
      }
    } catch (err: any) {
      return NextResponse.json({ status: "failed", message: "Gagal menghubungi server Groq: " + err.message });
    }
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
});
