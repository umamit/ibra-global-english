import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

let clientInstance: SupabaseClient | undefined;

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
  return createClient();
}

export function createServiceRoleClient() {
  return createClient();
}
