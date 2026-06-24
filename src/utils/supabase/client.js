import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/utils/supabase/config";

let clientInstance;

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side).
 *
 * CATATAN KEAMANAN: Hanya gunakan fungsi ini untuk operasi yang sudah melalui
 * Row Level Security (RLS) Supabase. Jangan gunakan untuk operasi admin.
 * Operasi admin (service role) hanya boleh dilakukan di Server Components
 * atau API Routes melalui @/utils/supabase/server.js dengan
 * SUPABASE_SERVICE_ROLE_KEY (tanpa prefix NEXT_PUBLIC_).
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

/**
 * Alias dari createClient() untuk kompatibilitas dengan komponen lama.
 * Komponen Client yang menggunakan createAdminClient() akan mendapatkan
 * klien browser biasa (anon key + RLS tetap aktif).
 *
 * CATATAN: Jika butuh bypass RLS, pindahkan logika ke API Route dan gunakan
 * createAdminClient() dari @/utils/supabase/server.js (server-only).
 */
export function createAdminClient() {
  return createClient();
}

/**
 * Alias dari createClient() untuk kompatibilitas dengan komponen lama.
 * @deprecated Gunakan createClient() secara langsung.
 */
export function createServiceRoleClient() {
  return createClient();
}
