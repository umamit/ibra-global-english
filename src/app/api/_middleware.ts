import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { NextResponse } from "next/server";
import { checkAdminAuth } from "@/utils/supabase/adminAuth";

const { url: supabaseUrl } = getSupabaseConfig();

export function getAdminSupabase() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
    { auth: { persistSession: false } }
  );
}

export function withAdminAuth(handler: any) {
  return async (request: any) => {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Tidak diizinkan. Hanya admin yang diizinkan." },
        { status: 403 }
      );
    }
    return handler(request);
  };
}
