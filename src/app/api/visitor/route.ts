import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // Fetch unique_visitors_count and visitor_offset
    const { data, error } = await supabase
      .from("landing_settings")
      .select("*")
      .in("key", ["unique_visitors_count", "visitor_offset"]);

    if (error) throw error;

    let uniqueCount = 0;
    let offset = 0;

    if (data && data.length > 0) {
      data.forEach((item) => {
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
    const message =
      error instanceof Error ? error.message : "Failed to get visitor count";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminSupabase();

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
      data.forEach((item) => {
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
    const message =
      error instanceof Error ? error.message : "Failed to update visitor count";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
