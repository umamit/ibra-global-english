import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    // Initialize Supabase with service role key to bypass RLS safely on the server side
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch count of students from students table
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Failed to fetch student count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
