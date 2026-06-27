import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

const { url: supabaseUrl } = getSupabaseConfig();
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon");
    const { data, error } = await supabase
      .from("placement_test_questions")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Failed to load questions:", err);
    return NextResponse.json({ error: "Gagal memuat soal." }, { status: 500 });
  }
}

// Admin-only create via service role directly is safer; omitted here to keep public API minimal.
export async function POST() {
  return NextResponse.json({ error: "Endpoint publik ini hanya mendukung GET." }, { status: 405 });
}