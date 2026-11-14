import { z } from "zod";

export const createPaymentInvoiceSchema = z.object({
  student_id: z.string().uuid("ID siswa tidak valid"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  gateway: z.enum(["midtrans", "xendit"]),
  payment_method: z.string().max(40).optional(),
  website_url: z.string().max(0, "Permintaan otomatis terdeteksi.").optional(),
});

export const publicCheckoutSchema = z.object({
  student_name: z.string().min(2, "Nama siswa minimal 2 karakter").max(100).trim(),
  parent_name: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.string().max(100).trim().optional()),
  email: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.string().email("Format email tidak valid").max(200).trim().optional()),
  whatsapp: z.preprocess(
    (v) => {
      const d = String(v || "").replace(/[^0-9]/g, "");
      return d.length > 0 ? d : undefined;
    },
    z.string().min(9, "Nomor WhatsApp minimal 9 digit").max(20).optional()
  ),
  program: z.enum(["Kids Program", "Teens Program", "Fun Calistung", "Matematika Dasar"]),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  gateway: z.enum(["midtrans", "xendit"]),
  payment_method: z.string().max(40).optional(),
  website_url: z.string().max(0, "Permintaan otomatis terdeteksi.").optional(),
});
