import { createBrowserClient } from "@supabase/ssr";

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
}
