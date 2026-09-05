import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET Handler: Verifikasi Webhook Meta WhatsApp
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "ibra_global_english_secret_token";

  if (mode === "subscribe" && token === expectedToken) {
    return new Response(challenge || "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ error: "Token verifikasi webhook tidak cocok." }, { status: 403 });
}

/**
 * POST Handler: Menerima Status Pengiriman & Pesan Masuk Meta WhatsApp
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Log aman di server jika ada status pengiriman pesan dari Meta
    if (body.object === "whatsapp_business_account") {
      return NextResponse.json({ status: "success" }, { status: 200 });
    }
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses webhook." }, { status: 500 });
  }
}
