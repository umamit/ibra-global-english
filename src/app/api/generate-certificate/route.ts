import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { fetchCertificateData, renderCertificatePdf } from "./certificateHelpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certId = searchParams.get("id");
    const origin = searchParams.get("origin") || "https://ibraglobalenglish.com";

    if (!certId) {
      return NextResponse.json({ error: "Certificate ID required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const data = await fetchCertificateData(supabase, certId);
    if (!data) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const pdfBytes = await renderCertificatePdf(data.cert, data.report, origin);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sertifikat-ige-${data.cert.cert_number || data.cert.id}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[generate-certificate] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
