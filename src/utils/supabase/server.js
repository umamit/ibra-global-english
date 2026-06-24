import { createServerClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";
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

/**
 * Membuat klien Supabase admin dengan Service Role Key untuk operasi yang membutuhkan
 * hak akses penuh (bypass RLS). HANYA boleh digunakan di Server Components & API Routes.
 * Menggunakan SUPABASE_SERVICE_ROLE_KEY (tanpa prefix NEXT_PUBLIC_) agar tidak terekspos ke browser.
 */
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
