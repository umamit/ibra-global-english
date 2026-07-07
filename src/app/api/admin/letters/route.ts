import { NextResponse, NextRequest } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";
const adminSupabase = getAdminSupabase();

// Fungsi self-migration mandiri untuk memastikan tabel official_letters ada di database
async function ensureLettersTableExists() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.official_letters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        letter_number TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        sender_name TEXT NOT NULL DEFAULT 'Husnita Usman',
        sender_role TEXT NOT NULL DEFAULT 'Direktur Utama',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `;
  try {
    await adminSupabase.rpc("exec_sql", { sql });
  } catch (err: any) {
    console.warn("Self-migration warning (non-blocking):", err.message);
  }
}

// GET: Mengambil semua surat terdaftar
const getLettersHandler = async () => {
  await ensureLettersTableExists();
  try {
    const { data, error } = await adminSupabase
      .from("official_letters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// POST: Membuat surat baru
const createLetterHandler = async (request: NextRequest) => {
  await ensureLettersTableExists();
  try {
    const body = await request.json();
    const { title, letter_number, recipient, subject, content, sender_name, sender_role } = body;

    if (!title || !letter_number || !recipient || !subject || !content) {
      return NextResponse.json({ error: "Mohon isi semua bidang wajib." }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("official_letters")
      .insert({
        title,
        letter_number,
        recipient,
        subject,
        content,
        sender_name: sender_name || "Husnita Usman",
        sender_role: sender_role || "Direktur Utama",
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// PATCH: Memperbarui surat yang ada
const updateLetterHandler = async (request: NextRequest) => {
  await ensureLettersTableExists();
  try {
    const body = await request.json();
    const { id, title, letter_number, recipient, subject, content, sender_name, sender_role } = body;

    if (!id || !title || !letter_number || !recipient || !subject || !content) {
      return NextResponse.json({ error: "Mohon lengkapi data yang akan diupdate." }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("official_letters")
      .update({
        title,
        letter_number,
        recipient,
        subject,
        content,
        sender_name: sender_name || "Husnita Usman",
        sender_role: sender_role || "Direktur Utama",
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

// DELETE: Menghapus surat
const deleteLetterHandler = async (request: NextRequest) => {
  await ensureLettersTableExists();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID surat tidak disediakan." }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from("official_letters")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: "Surat berhasil dihapus." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};

export const GET = withAdminAuth(getLettersHandler);
export const POST = withAdminAuth(createLetterHandler);
export const PATCH = withAdminAuth(updateLetterHandler);
export const DELETE = withAdminAuth(deleteLetterHandler);
