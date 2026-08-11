import { NextResponse } from "next/server";

export async function GET() {
  return handleDisabledCron();
}

export async function POST() {
  return handleDisabledCron();
}

function handleDisabledCron() {
  return NextResponse.json({
    success: true,
    message: "Pengiriman WA tagihan SPP otomatis dinonaktifkan. Pengiriman tagihan dilakukan secara manual oleh Admin melalui Dasbor Keuangan Admin.",
    remindedCount: 0,
    autoSendEnabled: false,
  });
}
