import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() {},
    },
  });
}

async function getCurrentUser() {
  try {
    const supabaseAuth = await createAuthClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
}

async function getUserRole(userId: string) {
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

export async function checkAdminAuth() {
  const user = await getCurrentUser();
  if (!user) return false;
  const role = await getUserRole(user.id);
  return role === "admin";
}

export async function checkAdminOrTutorAuth() {
  const user = await getAdminOrTutorUser();
  return user !== null;
}

export interface AdminOrTutorUser {
  id: string;
  email: string | undefined;
  role: string;
}

export async function getAdminOrTutorUser(): Promise<AdminOrTutorUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = await getUserRole(user.id);
  if (role !== "admin" && role !== "tutor") return null;
  return { id: user.id, email: user.email, role };
}
