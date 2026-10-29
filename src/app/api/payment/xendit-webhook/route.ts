import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { markSppAsPaid, verifyXenditCallbackToken } from "../paymentHelpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const callbackToken = req.headers.get("x-callback-token") || "";
    if (!verifyXenditCallbackToken(callbackToken)) {
      return NextResponse.json({ error: "Invalid Xendit callback token" }, { status: 403 });
    }
    const body = await req.json();
    if (body.status === "PAID" || body.status === "SETTLED") {
      await markSppAsPaid(body.external_id, parseInt(String(body.amount || body.paid_amount), 10), "Xendit Otomatis");
      revalidatePath("/parent"); revalidatePath("/admin/finance");
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Xendit webhook error" }, { status: 500 });
  }
}
