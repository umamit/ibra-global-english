import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat klien Supabase untuk digunakan pada Server Components, Server Actions, dan Route Handlers.
 * Mendukung pembacaan dan penulisan cookie sesi secara aman di sisi server.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
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
