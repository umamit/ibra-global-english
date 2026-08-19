import { z } from "zod";

export const studentInsertSchema = z.object({
  name: z.string().min(1, "Nama lengkap siswa wajib diisi"),
  age: z.coerce.number().min(1, "Usia minimal 1 tahun").max(100, "Usia tidak valid"),
  program: z.string().min(1, "Program kursus wajib dipilih"),
  status: z.enum(["aktif", "cuti", "alumnus", "non_aktif"]).default("aktif"),
  parent_id: z.string().uuid().nullable().optional(),
});

export const studentUpdateSchema = studentInsertSchema.partial().extend({
  id: z.string().uuid("ID siswa tidak valid"),
});
