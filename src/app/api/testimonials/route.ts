import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { fetchTestimonials, submitPublicTestimonial, updateTestimonialByAdmin } from "./testimonialApiHelpers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await fetchTestimonials(searchParams.get("all") === "true");
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await submitPublicTestimonial(body);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ success: true, data: res.data }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const res = await updateTestimonialByAdmin(body);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
    return NextResponse.json({ success: true, data: res.data }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
});
