import { z } from "zod";

/**
 * Skema validasi untuk input saat membuat user baru.
 * Skema ini cocok dengan model `User` di Prisma.
 */
export const UserCreateInputSchema = z.object({
  email: z.string({ required_error: "Email wajib diisi." }).email({ message: "Format email tidak valid." }),
  name: z.string().min(2, { message: "Nama harus memiliki minimal 2 karakter." }).optional(),
});

/**
 * Tipe data TypeScript yang diekstrak dari UserCreateInputSchema.
 */
export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;