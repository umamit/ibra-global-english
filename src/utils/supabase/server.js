import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "@/utils/supabase/config";

/**
 * Membuat klien Supabase untuk digunakan pada Server Components, Server Actions, dan Route Handlers.
 * Mendukung pembacaan dan penulisan cookie sesi secara aman di sisi server.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseConfig();

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
              cookieStore.set(name, value, options)
            );
          } catch {
            // Dipanggil dari Server Component (bersifat read-only untuk penulisan cookie).
            // Hal ini aman diabaikan jika middleware menangani pembaruan sesi (token refresh).
          }
        },
      },
    }
  );
}
