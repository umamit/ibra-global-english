import { NextResponse, NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { withAdminAuth } from "@/app/api/_middleware";

const revalidateHandler = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get("path") || "/";
    
    // Pemicu revalidasi path (Next.js Edge Cache-Busting)
    revalidatePath(path);
    
    return NextResponse.json({
      revalidated: true,
      path,
      now: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Gagal me-revalidate cache: ${err.message}` },
      { status: 500 }
    );
  }
};

export const POST = withAdminAuth(revalidateHandler);
export const GET = withAdminAuth(revalidateHandler);
