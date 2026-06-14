import { createBrowserClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";

const browserStorage = typeof window !== "undefined" ? window.sessionStorage : undefined;

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      auth: {
        storage: browserStorage,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );
}

export function createAdminClient() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      serviceRoleKey,
      {
        auth: {
          storage: browserStorage,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
  }
  return createClient();
}

export function createServiceRoleClient() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createCoreClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }
  return createClient();
}


