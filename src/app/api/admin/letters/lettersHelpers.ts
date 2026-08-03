import { getAdminSupabase } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

export async function ensureLettersTableExists() {
  const sqlCreate = `
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
  const sqlAlter = `
    ALTER TABLE public.official_letters ADD COLUMN IF NOT EXISTS lampiran TEXT NOT NULL DEFAULT '-';
    ALTER TABLE public.official_letters ADD COLUMN IF NOT EXISTS attachment TEXT NOT NULL DEFAULT '';
    ALTER TABLE public.official_letters ADD COLUMN IF NOT EXISTS letter_date TEXT NOT NULL DEFAULT '';
    NOTIFY pgrst, 'reload schema';
  `;
  try {
    await adminSupabase.rpc("exec_sql", { sql: sqlCreate });
    await adminSupabase.rpc("exec_sql", { sql: sqlAlter });
  } catch (err: any) {
    console.warn("Self-migration warning (non-blocking):", err.message);
  }
}

export async function fetchAllOfficialLetters() {
  await ensureLettersTableExists();
  return await adminSupabase.from("official_letters").select("*").order("created_at", { ascending: false });
}

export async function createOfficialLetter(body: any) {
  await ensureLettersTableExists();
  const { title, letter_number, recipient, subject, content, sender_name, sender_role, lampiran, attachment, letter_date } = body;
  if (!title || !letter_number || !recipient || !subject || !content) {
    return { success: false, error: "Mohon isi semua bidang wajib.", status: 400 };
  }

  const { data, error } = await adminSupabase
    .from("official_letters")
    .insert({
      title, letter_number, recipient, subject, content,
      sender_name: sender_name || "Husnita Usman",
      sender_role: sender_role || "Direktur Utama",
      lampiran: lampiran || "-",
      attachment: attachment || "",
      letter_date: letter_date || "",
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message, status: 500 };
  return { success: true, data, status: 200 };
}

export async function updateOfficialLetter(body: any) {
  await ensureLettersTableExists();
  const { id, title, letter_number, recipient, subject, content, sender_name, sender_role, lampiran, attachment, letter_date } = body;
  if (!id || !title || !letter_number || !recipient || !subject || !content) {
    return { success: false, error: "Mohon lengkapi data yang akan diupdate.", status: 400 };
  }

  const { data, error } = await adminSupabase
    .from("official_letters")
    .update({
      title, letter_number, recipient, subject, content,
      sender_name: sender_name || "Husnita Usman",
      sender_role: sender_role || "Direktur Utama",
      lampiran: lampiran || "-",
      attachment: attachment || "",
      letter_date: letter_date || "",
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: error.message, status: 500 };
  return { success: true, data, status: 200 };
}

export async function deleteOfficialLetter(id: string) {
  await ensureLettersTableExists();
  const { error } = await adminSupabase.from("official_letters").delete().eq("id", id);
  if (error) return { success: false, error: error.message, status: 500 };
  return { success: true, message: "Surat berhasil dihapus.", status: 200 };
}
