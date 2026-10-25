import { z } from "zod";

export const createPaymentInvoiceSchema = z.object({
  student_id: z.string().uuid("ID siswa tidak valid"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  gateway: z.enum(["midtrans", "xendit"]),
});
