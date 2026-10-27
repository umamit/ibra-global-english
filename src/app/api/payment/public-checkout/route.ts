import { NextResponse } from "next/server";
import { publicCheckoutSchema } from "@/lib/schemas";
import { processPublicCheckout } from "../paymentHelpers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = publicCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid." }, { status: 400 });
    }
    const result = await processPublicCheckout(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal membuat invoice pembayaran." }, { status: 500 });
  }
}
