import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

// GET: Fetch audit logs for admin
export const GET = withAdminAuth(async () => {
  try {
    const adminSupabase = getAdminSupabase();

    const { data, error } = await adminSupabase
      .from("system_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500); // Limit to 500 logs for performance

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      return NextResponse.json(
        { error: "Gagal mengambil log aktivitas: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Server error in audit-logs route:", err);
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
});
