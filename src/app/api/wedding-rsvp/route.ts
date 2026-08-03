import { NextResponse } from "next/server";
import { fetchWeddingWishes, submitWeddingRsvp } from "./weddingRsvpHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await fetchWeddingWishes(searchParams.get("weddingId") || "mike-lila");
    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat doa restu." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await submitWeddingRsvp(body);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengirim konfirmasi kehadiran." }, { status: 500 });
  }
}
