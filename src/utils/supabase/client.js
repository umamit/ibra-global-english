import { createBrowserClient } from "@supabase/ssr";
import { createClient as createCoreClient } from "@supabase/supabase-js";

let clientInstance;

/**
 * Membuat klien Supabase untuk digunakan pada Client Components (browser-side)
 */
export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uszukipvrvjrgrikxfwh.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenVraXB2cnZqcmdyaWt4ZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTQ2MTQsImV4cCI6MjA5NjQzMDYxNH0.M6rlLPNiOFowcZODVj-mmNnv8X6ZkkY-m77Lg4vdXHA"
    );
  }

  if (!clientInstance) {
    clientInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uszukipvrvjrgrikxfwh.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenVraXB2cnZqcmdyaWt4ZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTQ2MTQsImV4cCI6MjA5NjQzMDYxNH0.M6rlLPNiOFowcZODVj-mmNnv8X6ZkkY-m77Lg4vdXHA"
    );
  }

  return clientInstance;
}

export function createAdminClient() {
  return createServiceRoleClient();
}

export function createServiceRoleClient() {
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createCoreClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uszukipvrvjrgrikxfwh.supabase.co",
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


