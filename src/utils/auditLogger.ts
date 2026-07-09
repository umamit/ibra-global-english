import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { cookies } from "next/headers";

const { url: supabaseUrl } = getSupabaseConfig();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

// Helper to get Admin Supabase client
function getAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Log activity to the system_audit_logs table.
 * Resolves current user from supabase auth session.
 * 
 * @param action - Action name (e.g., 'Verifikasi SPP', 'Persetujuan Pendaftaran')
 * @param details - Human-readable details
 */
export async function logActivity(action: string, details: string) {
  try {
    const adminSupabase = getAdminClient();
    
    // Resolve user from cookies/session
    // In Next.js App Router API, we can initialize a client supabase to get user session
    const cookieStore = await cookies();
    const clientSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });

    const { data: { user } } = await clientSupabase.auth.getUser();
    
    let userId = null;
    let actorName = "System";

    if (user) {
      userId = user.id;
      // Get user full_name from public.profiles
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        actorName = `${profile.full_name} (${profile.role})`;
      } else {
        actorName = user.email || user.id;
      }
    }

    // Insert log
    await adminSupabase.from("system_audit_logs").insert({
      user_id: userId,
      actor_name: actorName,
      action,
      details,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
