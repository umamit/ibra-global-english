import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/app/api/_middleware";
import { processManageUser } from "./manageUserHelpers";

export const dynamic = "force-dynamic";

export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const res = await processManageUser(body);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    revalidatePath("/admin/students");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Terjadi kesalahan server." }, { status: 500 });
  }
});
