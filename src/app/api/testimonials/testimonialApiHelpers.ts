import { getAdminSupabase } from "@/app/api/_middleware";

const supabase = getAdminSupabase();

export async function fetchTestimonials(showAll: boolean) {
  let query = supabase.from("testimonials").select("*").order("created_at", { ascending: false });
  if (!showAll) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function submitPublicTestimonial(body: any) {
  const { author, role, text, rating } = body;
  if (!author || typeof author !== "string" || author.trim().length < 2) {
    return { success: false, error: "Nama wajib diisi minimal 2 karakter.", status: 400 };
  }
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return { success: false, error: "Pesan ulasan wajib diisi minimal 10 karakter.", status: 400 };
  }

  const numericRating = Math.min(Math.max(parseInt(rating) || 5, 1), 5);
  const cleanRole = role && typeof role === "string" ? role.trim() : "Orang Tua / Siswa";

  const { data, error } = await supabase.from("testimonials").insert([{ author: author.trim(), role: cleanRole, text: text.trim(), rating: numericRating, is_active: false, status: "pending", created_at: new Date().toISOString() }]).select();

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase.from("testimonials").insert([{ author: author.trim(), role: cleanRole, text: text.trim(), rating: numericRating, is_active: false }]).select();
    if (fallbackError) return { success: false, error: "Gagal menyimpan ulasan. Silakan coba lagi.", status: 500 };
    return { success: true, data: fallbackData, status: 200 };
  }
  return { success: true, data, status: 200 };
}

export async function updateTestimonialByAdmin(body: any) {
  const { id, is_active, status, author, role, text, rating } = body;
  if (!id) return { success: false, error: "ID testimoni diperlukan.", status: 400 };

  const updatePayload: Record<string, any> = {};
  if (typeof is_active === "boolean") updatePayload.is_active = is_active;
  if (status) updatePayload.status = status;
  if (author) updatePayload.author = author;
  if (role) updatePayload.role = role;
  if (text) updatePayload.text = text;
  if (rating) updatePayload.rating = rating;

  const { data, error } = await supabase.from("testimonials").update(updatePayload).eq("id", id).select();
  if (error) return { success: false, error: "Gagal memperbarui testimoni.", status: 500 };
  return { success: true, data, status: 200 };
}
