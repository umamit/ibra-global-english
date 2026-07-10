import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";
const adminSupabase = getAdminSupabase();

// Helper to ensure the wedding_rsvps table exists
async function ensureTableExists() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.wedding_rsvps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wedding_id VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      attendance VARCHAR(20) NOT NULL,
      guests INTEGER DEFAULT 1,
      wish TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `;
  try {
    await adminSupabase.rpc("exec_sql", { sql });
  } catch (e) {
    console.warn("exec_sql RPC not available or failed, proceeding assuming table exists.");
  }
}

// GET: Fetch wishes for a specific wedding
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get("weddingId") || "mike-lila";

    await ensureTableExists();

    // Select only required columns, limit to latest 50 records to conserve bandwidth (Rule 5 compliance)
    const { data, error } = await adminSupabase
      .from("wedding_rsvps")
      .select("name, wish, attendance, created_at")
      .eq("wedding_id", weddingId)
      .not("wish", "is", null)
      .neq("wish", "")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Gagal memuat doa restu:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat doa restu." },
      { status: 500 }
    );
  }
}

// POST: Submit a new RSVP/wish
export async function POST(request: Request) {
  try {
    await ensureTableExists();

    const body = await request.json();
    const { weddingId, name, attendance, guests, wish } = body;

    if (!name || !attendance) {
      return NextResponse.json(
        { error: "Nama dan konfirmasi kehadiran wajib diisi." },
        { status: 400 }
      );
    }

    const guestCount = parseInt(guests) || 1;

    const { error } = await adminSupabase
      .from("wedding_rsvps")
      .insert({
        wedding_id: weddingId || "mike-lila",
        name: name.trim(),
        attendance,
        guests: guestCount,
        wish: wish ? wish.trim() : null,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Gagal mengirim RSVP:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengirim konfirmasi kehadiran." },
      { status: 500 }
    );
  }
}
