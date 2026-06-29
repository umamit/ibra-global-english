import { z } from "zod";

export const placementSchema = z.object({
  full_name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter")
    .trim(),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(200)
    .trim(),
  whatsapp_number: z
    .string()
    .min(9, "Nomor WhatsApp minimal 9 digit")
    .max(20, "Nomor WhatsApp maksimal 20 digit")
    .transform((val) => val.replace(/[^0-9]/g, "")),
  score: z
    .number()
    .int()
    .min(0, "Skor minimal adalah 0")
    .max(20, "Skor maksimal adalah 20"),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  status: z.enum(["pending", "contacted", "enrolled"]).optional().default("pending"),
  created_at: z.string().optional(),
});
