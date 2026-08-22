import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("students")
      .select("id, name, program, status, parent_phone")
      .or(`name.ilike.%${query}%,parent_phone.ilike.%${query}%`)
      .limit(8);

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    console.error("Quick search student error:", err);
    return NextResponse.json({ data: [] });
  }
});
