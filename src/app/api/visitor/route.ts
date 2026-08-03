import { NextRequest, NextResponse } from "next/server";
import { fetchVisitorStats, incrementVisitorCount } from "./visitorHelpers";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await fetchVisitorStats();
    return NextResponse.json({ count: stats.total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get visitor count" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let isNew = false;
    try { isNew = !!(await request.json()).isNew; } catch (e) {}

    const total = await incrementVisitorCount(isNew);
    return NextResponse.json({ count: total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update visitor count" }, { status: 500 });
  }
}
