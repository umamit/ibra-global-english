import { z } from "zod";

export const sessionNoteSchema = z.object({
  id: z.string().uuid().optional(),
  student_id: z.string().uuid({ message: "ID Siswa harus berupa UUID yang valid" }),
  session_date: z.string().min(1, { message: "Tanggal pertemuan harus diisi" }),
  meeting_number: z.coerce.number().int().positive().optional().nullable(),
  topic_covered: z.string().min(2, { message: "Materi pembelajaran minimal 2 karakter" }),
  vocabulary_learned: z.string().optional().nullable(),
  comprehension_level: z.enum(["Sangat Baik", "Baik", "Cukup", "Perlu Latihan"]).default("Baik"),
  student_behavior: z.string().optional().nullable(),
  individual_feedback: z.string().min(2, { message: "Catatan evaluasi siswa minimal 2 karakter" }),
  homework_assigned: z.string().optional().nullable(),
  created_by_role: z.enum(["admin", "tutor"]).default("admin"),
  tutor_name: z.string().optional().nullable(),
});

export const sessionNoteUpdateSchema = sessionNoteSchema.partial().extend({
  id: z.string().uuid({ message: "ID catatan harus berupa UUID yang valid" }),
});

export type SessionNoteInput = z.infer<typeof sessionNoteSchema>;
export type SessionNoteUpdate = z.infer<typeof sessionNoteUpdateSchema>;
