import { createBrowserClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

let clientInstance;

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  const { url, anonKey } = getSupabaseConfig();

  if (typeof window === "undefined") {
    return createBrowserClient(url, anonKey);
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(url, anonKey);
  }

  return clientInstance;
}

export function createAdminClient() {
  return createServiceRoleClient();
}

export function createServiceRoleClient() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const { url } = getSupabaseConfig();
  
  if (serviceRoleKey) {
    return createCoreClient(
      url,
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


