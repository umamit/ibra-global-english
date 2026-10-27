import { z } from "zod";
import { getAdminSupabase } from "@/app/api/_middleware";
import { logActivity } from "@/utils/auditLogger";

export const manageUserSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_role"),
    userId: z.string().uuid("ID pengguna tidak valid."),
    role: z.enum([
      "parent",
      "student",
      "tutor",
      "admin",
      "pending_parent",
      "pending_student",
      "pending_tutor",
    ]),
  }),
  z.object({
    action: z.literal("reset_password"),
    userId: z.string().uuid("ID pengguna tidak valid."),
    password: z.string().min(6, "Kata sandi minimal 6 karakter."),
  }),
]);

export async function processManageUser(body: unknown) {
  const parsed = manageUserSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data permintaan tidak valid.",
      status: 400,
    };
  }

  const data = parsed.data;
  const adminSupabase = getAdminSupabase();

  const { data: targetProfile } = await adminSupabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", data.userId)
    .single();

  const targetName = targetProfile
    ? `${targetProfile.full_name} (${targetProfile.email || data.userId})`
    : data.userId;

  if (data.action === "update_role") {
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({ role: data.role, updated_at: new Date().toISOString() })
      .eq("id", data.userId);

    if (profileError) {
      return {
        success: false,
        error: "Gagal memperbarui peran di profil: " + profileError.message,
        status: 500,
      };
    }

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      data.userId,
      {
        app_metadata: { role: data.role },
        user_metadata: { role: data.role },
        email_confirm: true,
      },
    );

    if (authError) {
      return {
        success: false,
        error: "Gagal menyinkronkan peran autentikasi: " + authError.message,
        status: 500,
      };
    }

    await logActivity(
      "Perbarui Peran Akun",
      `Mengubah peran akun ${targetName} menjadi ${data.role}`,
    );

    return { success: true, status: 200 };
  }

  if (data.action === "reset_password") {
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      data.userId,
      {
        password: data.password,
        email_confirm: true,
      },
    );

    if (authError) {
      return {
        success: false,
        error: "Gagal mengatur ulang kata sandi: " + authError.message,
        status: 500,
      };
    }

    await logActivity(
      "Reset Sandi Pengguna",
      `Mengatur ulang kata sandi untuk akun ${targetName}`,
    );

    return { success: true, status: 200 };
  }

  return { success: false, error: "Aksi tidak dikenali.", status: 400 };
}
