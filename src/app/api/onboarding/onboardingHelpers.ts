import { createAdminClient } from "@/utils/supabase/server";

export async function processUserOnboarding(userId: string, email: string | undefined, userMetadata: any, role: string) {
  const allowedRoles = ["student", "tutor", "parent"];
  if (!role || !allowedRoles.includes(role)) {
    return { success: false, error: "Peran (role) tidak valid untuk proses onboarding.", status: 400 };
  }

  const adminSupabase = createAdminClient();
  const fullName = userMetadata?.full_name || (email ?? "").split("@")[0];

  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    { id: userId, role, full_name: fullName, email, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );

  if (profileError) {
    return { success: false, error: "Gagal menyimpan data profil: " + profileError.message, status: 500 };
  }

  const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
    app_metadata: { role },
    user_metadata: { role },
  });

  if (authError) {
    return { success: false, error: "Gagal menyelaraskan kredensial pengguna: " + authError.message, status: 500 };
  }

  return { success: true, status: 200 };
}
