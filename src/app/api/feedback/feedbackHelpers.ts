import { getAdminSupabase } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

export async function submitClassFeedback(userId: string, tutorId: string, ratingVal: number, comments?: string) {
  const { data: parentProfile } = await adminSupabase.from("profiles").select("full_name, role").eq("id", userId).single();
  if (!parentProfile) return { success: false, error: "Profil orang tua tidak ditemukan.", status: 404 };
  if (parentProfile.role !== "parent" && parentProfile.role !== "admin") {
    return { success: false, error: "Hanya akun dengan peran Orang Tua yang dapat memberikan penilaian.", status: 403 };
  }

  const { data: tutorData } = await adminSupabase.from("tutors").select("name").eq("id", tutorId).single();
  if (!tutorData) return { success: false, error: "Tutor tidak ditemukan.", status: 404 };

  const { error: insertErr } = await adminSupabase.from("class_feedback").insert({
    parent_id: userId,
    parent_name: parentProfile.full_name,
    tutor_id: tutorId,
    tutor_name: tutorData.name,
    rating: ratingVal,
    comments: comments || null,
    created_at: new Date().toISOString(),
  });

  if (insertErr) return { success: false, error: "Gagal menyimpan umpan balik: " + insertErr.message, status: 500 };
  return { success: true };
}

export async function fetchAllClassFeedback(userId: string) {
  const { data: profile } = await adminSupabase.from("profiles").select("role").eq("id", userId).single();
  if (!profile || profile.role !== "admin") return { success: false, error: "Akses ditolak. Khusus Administrator.", status: 403 };

  const { data, error } = await adminSupabase.from("class_feedback").select("*").order("created_at", { ascending: false });
  if (error) return { success: false, error: "Gagal mengambil data umpan balik: " + error.message, status: 500 };
  return { success: true, data };
}
