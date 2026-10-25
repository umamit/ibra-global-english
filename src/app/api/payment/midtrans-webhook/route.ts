import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyMidtransSignature, markSppAsPaid } from "../paymentHelpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body;
    if (!verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: "Invalid Midtrans signature" }, { status: 403 });
    }
    const isPaid = transaction_status === "settlement" || (transaction_status === "capture" && fraud_status === "accept");
    if (isPaid) {
      await markSppAsPaid(order_id, parseInt(String(gross_amount), 10), "Midtrans Otomatis");
      revalidatePath("/parent"); revalidatePath("/admin/finance");
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Midtrans webhook error" }, { status: 500 });
  }
}
