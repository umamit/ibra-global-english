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
 * Shared supabase auth client creation to avoid code duplication.
 */
async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });
}

/**
 * Get the current user from the session, or null if not authenticated.
 */
async function getCurrentUser() {
  try {
    const supabaseAuth = await createAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Get the profile role for a given user ID.
 */
async function getUserRole(userId) {
  try {
    const supabaseAuth = await createAuthClient();
    const { data: profile } = await supabaseAuth
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    return profile?.role || null;
  } catch {
    return null;
  }
}

/**
 * Check if the current user is an admin by querying the profiles table.
 * More reliable than user_metadata which can become stale.
 */
export async function checkAdminAuth() {
  const user = await getCurrentUser();
  if (!user) return false;
  const role = await getUserRole(user.id);
  return role === "admin";
}

/**
 * Check if the current user is an admin OR tutor by querying the profiles table.
 */
export async function checkAdminOrTutorAuth() {
  const user = await getAdminOrTutorUser();
  return user !== null;
}

/**
 * Resolve the currently authenticated admin/tutor user.
 * Returns { id, email, role } when the caller is an admin or tutor, otherwise null.
 * Use this when the route needs to attribute actions to the user (e.g. usage logs).
 */
export async function getAdminOrTutorUser() {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = await getUserRole(user.id);
  if (role !== "admin" && role !== "tutor") return null;
  return { id: user.id, email: user.email, role };
}
