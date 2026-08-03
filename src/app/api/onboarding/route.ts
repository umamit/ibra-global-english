import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { processUserOnboarding } from "./onboardingHelpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sesi tidak valid. Silakan login kembali." }, { status: 401 });

    const { role } = await request.json();
    const res = await processUserOnboarding(user.id, user.email, user.user_metadata, role);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan server." }, { status: 500 });
  }
}
