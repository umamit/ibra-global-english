import { NextResponse } from "next/server";
import { createPaymentInvoiceSchema } from "@/lib/schemas";
import { processCreateInvoice } from "../paymentHelpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createPaymentInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid." }, { status: 400 });
    }
    const result = await processCreateInvoice(parsed.data.student_id, parsed.data.month, parsed.data.gateway);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal membuat tagihan pembayaran." }, { status: 500 });
  }
}
