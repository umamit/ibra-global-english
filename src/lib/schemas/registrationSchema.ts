import { z } from "zod";

export const registrationSchema = z.object({
  student_name: z
    .string()
    .min(2, "Nama siswa minimal 2 karakter")
    .max(100, "Nama siswa maksimal 100 karakter")
    .trim(),
  student_age: z
    .preprocess((val) => (val === "" ? null : val), z.union([z.coerce.number().int().positive("Usia harus positif").max(100), z.null()]))
    .optional(),
  parent_name: z
    .preprocess((val) => (val === "" ? null : val), z.string().max(100, "Nama orang tua maksimal 100 karakter").trim().nullable())
    .optional(),
  parent_email: z
    .preprocess((val) => (val === "" ? null : val), z.string().email("Format email tidak valid").max(200).trim().nullable())
    .optional(),
  whatsapp: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(20, "Nomor WhatsApp maksimal 20 digit")
    .transform((val) => val.replace(/[^0-9]/g, "")),
  program: z
    .string()
    .min(2, "Program harus diisi")
    .max(100)
    .trim(),
});

export const registrationUpdateSchema = z.object({
  id: z.union([z.string().uuid(), z.number()]),
  status: z.enum(["pending", "approved", "rejected"]),
  notes: z.string().max(500).optional().nullable(),
});
