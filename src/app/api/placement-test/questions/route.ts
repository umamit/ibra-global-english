import { NextResponse } from "next/server";
import { generateFromGroq, fetchDatabaseQuestionsFallback } from "./placementQuestionHelpers";

export const dynamic = "force-dynamic";
const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const dynamicQuestions = await generateFromGroq();
    if (dynamicQuestions) {
      return NextResponse.json(dynamicQuestions, { headers: NO_CACHE_HEADERS });
    }

    const fallbackQuestions = await fetchDatabaseQuestionsFallback();
    return NextResponse.json(fallbackQuestions, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    return NextResponse.json({ error: "Gagal memuat soal." }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Endpoint publik ini hanya mendukung GET." }, { status: 405 });
}
