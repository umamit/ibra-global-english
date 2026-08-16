import { NextResponse } from "next/server";
import { generateFromGroq } from "./placementQuestionHelpers";

export const dynamic = "force-dynamic";
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const dynamicQuestions = await generateFromGroq();
    if (dynamicQuestions && Array.isArray(dynamicQuestions) && dynamicQuestions.length === 20) {
      return NextResponse.json(dynamicQuestions, { headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ error: "Gagal memuat soal dinamis AI Groq." }, { status: 503, headers: NO_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server saat memuat soal AI." }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Endpoint publik ini hanya mendukung GET." }, { status: 405 });
}
