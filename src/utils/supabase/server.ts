import { createServerClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig } from "@/utils/supabase/config";

export async function createClient() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const { url, anonKey } = getSupabaseConfig();

  let domain = "";
  if (host.includes("localhost")) {
    domain = "localhost";
  } else if (host.endsWith("ibraglobalenglish.uk")) {
    domain = ".ibraglobalenglish.uk";
  }

  const cookieOptions = {
    domain,
    path: "/",
    sameSite: "lax" as const,
    secure: !host.includes("localhost"),
  };

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, ...cookieOptions })
            );
          } catch {
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const { url } = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY tidak dikonfigurasi di environment variables.");
  }

  return createCoreClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
