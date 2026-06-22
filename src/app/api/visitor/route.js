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

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch unique_visitors_count and visitor_offset
    const { data, error } = await supabase
      .from("landing_settings")
      .select("*")
      .in("key", ["unique_visitors_count", "visitor_offset"]);

    if (error) throw error;

    let uniqueCount = 0;
    let offset = 0;

    if (data && data.length > 0) {
      data.forEach(item => {
        if (item.key === "unique_visitors_count") {
          uniqueCount = parseInt(item.value, 10) || 0;
        } else if (item.key === "visitor_offset") {
          offset = parseInt(item.value, 10) || 0;
        }
      });
    }

    return NextResponse.json({ count: uniqueCount + offset });
  } catch (error) {
    console.error("Failed to get visitor count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing environment variables" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let isNew = false;
    try {
      const body = await request.json();
      isNew = !!body.isNew;
    } catch (e) {
      // Fallback if no body or invalid json
    }

    // Fetch existing settings
    const { data, error } = await supabase
      .from("landing_settings")
      .select("*")
      .in("key", ["unique_visitors_count", "visitor_offset"]);

    if (error) throw error;

    let uniqueCount = 0;
    let offset = 0;

    if (data && data.length > 0) {
      data.forEach(item => {
        if (item.key === "unique_visitors_count") {
          uniqueCount = parseInt(item.value, 10) || 0;
        } else if (item.key === "visitor_offset") {
          offset = parseInt(item.value, 10) || 0;
        }
      });
    }

    if (isNew) {
      uniqueCount += 1;
      const { error: upsertError } = await supabase
        .from("landing_settings")
        .upsert({ key: "unique_visitors_count", value: String(uniqueCount) });
      
      if (upsertError) throw upsertError;
    }

    return NextResponse.json({ count: uniqueCount + offset });
  } catch (error) {
    console.error("Failed to update visitor count:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
