import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getAdminSupabase();

    // Fetch count of students from students table
    const { count, error } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Failed to fetch student count:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch student count",
      },
      { status: 500 },
    );
  }
}
