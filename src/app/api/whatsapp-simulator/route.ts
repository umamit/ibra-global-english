import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { sendBulkWhatsappMessages, fetchWhatsappLogs, checkFonnteDeviceStatus } from "./whatsappHelpers";

const HEADERS = { "Cache-Control": "private, no-cache, no-store, must-revalidate" };

export const POST = withAdminAuth(async (request: Request) => {
  try {
    const { phone, message, type } = (await request.json()) as { phone: string; message: string; type?: string };
    if (!phone || !message) {
      return NextResponse.json({ error: "Nomor telepon dan pesan wajib diisi." }, { status: 400, headers: HEADERS });
    }

    const res = await sendBulkWhatsappMessages(phone, message, type);
    if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status, headers: HEADERS });

    return NextResponse.json(res, { status: 200, headers: HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses pengiriman." }, { status: 500, headers: HEADERS });
  }
});

export const GET = withAdminAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "device") {
      const status = await checkFonnteDeviceStatus();
      return NextResponse.json(status, { status: 200, headers: HEADERS });
    }

    const logs = await fetchWhatsappLogs();
    return NextResponse.json({ logs }, { status: 200, headers: HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat log." }, { status: 500, headers: HEADERS });
  }
});
