/**
 * Shared admin/tutor authentication utilities for API routes.
 * Queries the profiles table directly (not user_metadata) to ensure
 * role changes are reflected immediately without requiring re-login.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

/**
 * Check if the current user is an admin by querying the profiles table.
 * More reliable than user_metadata which can become stale.
 */
export async function checkAdminAuth() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return false;

    // Query profiles table for the real role (more reliable than user_metadata)
    const { data: profile } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Check if the current user is an admin OR tutor by querying the profiles table.
 */
export async function checkAdminOrTutorAuth() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return profile?.role === "admin" || profile?.role === "tutor";
  } catch {
    return false;
  }
}