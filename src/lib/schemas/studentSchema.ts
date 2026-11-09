import { z } from "zod";

export const studentInsertSchema = z.object({
  name: z.string().min(1, "Nama lengkap siswa wajib diisi"),
  age: z.coerce.number().min(1, "Usia minimal 1 tahun").max(100, "Usia tidak valid"),
  program: z.string().min(1, "Program kursus wajib dipilih"),
  status: z.enum(["aktif", "cuti", "alumnus", "non_aktif"]).default("aktif"),
  parent_id: z.string().uuid().nullable().optional(),
  parent_name: z.string().max(100).trim().nullable().optional(),
  parent_email: z.preprocess((v) => (v === "" ? null : v), z.string().email("Format email orang tua tidak valid").max(200).trim().nullable().optional()),
  whatsapp: z.preprocess((v) => {
    const d = String(v || "").replace(/[^0-9]/g, "");
    return d.length > 0 ? d : null;
  }, z.string().max(20).nullable().optional()),
  billing_cycle: z.enum(["prepaid", "postpaid"]).optional(),
});

export const studentUpdateSchema = studentInsertSchema.partial().extend({
  id: z.string().uuid("ID siswa tidak valid"),
});
