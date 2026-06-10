import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
}

export function createAdminClient() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      serviceRoleKey
    );
  }
  return createClient();
}

