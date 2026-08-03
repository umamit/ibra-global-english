import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { submitClassFeedback, fetchAllClassFeedback } from "./feedbackHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

    const { tutorId, rating, comments } = await request.json();
    const ratingVal = parseInt(rating);
    if (!tutorId || isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: "Rating (1-5) dan Tutor wajib diisi dengan benar." }, { status: 400 });
    }

    const res = await submitClassFeedback(user.id, tutorId, ratingVal, comments);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });

    const res = await fetchAllClassFeedback(user.id);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ data: res.data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
