import { createBrowserClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";

let clientInstance;

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
    );
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
    );
  }

  return clientInstance;
}

export function createAdminClient() {
  return createServiceRoleClient();
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


