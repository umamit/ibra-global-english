import { z } from "zod";

export const createPaymentInvoiceSchema = z.object({
  student_id: z.string().uuid("ID siswa tidak valid"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  gateway: z.enum(["midtrans", "xendit"]),
});

export const publicCheckoutSchema = z.object({
  student_name: z.string().min(2, "Nama siswa minimal 2 karakter").max(100).trim(),
  parent_name: z.string().min(2, "Nama orang tua minimal 2 karakter").max(100).trim(),
  email: z.string().email("Format email tidak valid").max(200).trim(),
  whatsapp: z.string().min(9, "Nomor WhatsApp minimal 9 digit").max(20).transform((v) => v.replace(/[^0-9]/g, "")),
  program: z.enum(["Kids Program", "Teens Program", "Fun Calistung", "Matematika Dasar"]),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  gateway: z.enum(["midtrans", "xendit"]),
});
