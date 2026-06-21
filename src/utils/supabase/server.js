import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Membuat klien Supabase untuk digunakan pada Server Components, Server Actions, dan Route Handlers.
 * Mendukung pembacaan dan penulisan cookie sesi secara aman di sisi server.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uszukipvrvjrgrikxfwh.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenVraXB2cnZqcmdyaWt4ZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTQ2MTQsImV4cCI6MjA5NjQzMDYxNH0.M6rlLPNiOFowcZODVj-mmNnv8X6ZkkY-m77Lg4vdXHA",
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
