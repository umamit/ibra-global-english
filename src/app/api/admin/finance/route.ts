import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertTuitionRecord, logFinanceAudit } from "./financeApiHelpers";

export const dynamic = "force-dynamic";

const financeUpdateSchema = z.object({
  student_id: z.string().uuid("ID siswa tidak valid"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  status: z.enum(["lunas", "belum_bayar", "menunggu_konfirmasi"]),
  payment_method: z.string().default("Transfer Bank"),
  receipt_url: z.string().url().nullable().optional(),
  payment_date: z.string().nullable().optional(),
  payment_type: z.enum(["prepaid", "postpaid"]).nullable().optional(),
});

export const POST = withAdminAuth(async (req: NextRequest, user: any) => {
  try {
    const body = await req.json();
    const parsed = financeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Data tidak valid" }, { status: 400 });
    }
    await upsertTuitionRecord(parsed.data);
    await logFinanceAudit(user.email, parsed.data.student_id, parsed.data.month, "UPDATE_SPP", `Status: ${parsed.data.status}, Nominal: Rp ${parsed.data.amount.toLocaleString("id-ID")}`);
    revalidatePath("/admin/finance");
    revalidatePath("/parent");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui data keuangan" }, { status: 500 });
  }
});
