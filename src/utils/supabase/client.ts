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
    const hostname = window.location.hostname;
    let domain = "";
    if (hostname.includes("localhost")) {
      domain = "localhost";
    } else if (hostname.endsWith("ibraglobalenglish.uk")) {
      domain = ".ibraglobalenglish.uk";
    }

    clientInstance = createBrowserClient(url, anonKey, {
      cookieOptions: {
        domain,
        path: "/",
        sameSite: "lax",
        secure: !hostname.includes("localhost"),
      },
    });
  }

  return clientInstance;
}

export function createAdminClient() {
  return createClient();
}

export function createServiceRoleClient() {
  return createClient();
}
