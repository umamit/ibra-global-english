import { z } from "zod";

/**
 * Schema untuk jadwal online
 * Validasi request body di API route online-schedule
 */
export const onlineScheduleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(200).trim(),
  program: z.string().min(1, "Program wajib diisi").max(100).trim(),
  meeting_link: z.string().url("Link meeting harus URL valid").trim(),
  meeting_platform: z.string().max(50).trim().default("Google Meet"),
  scheduled_at: z.string().min(1, "Waktu kegiatan wajib diisi"),
  duration_minutes: z.number().int().positive().max(480).default(60),
  tutor_name: z.string().max(100).trim().default(""),
  notes: z.string().max(1000).trim().default(""),
  is_active: z.boolean().default(true),
});

export const onlineScheduleUpdateSchema = z.object({
  id: z.union([z.string().uuid(), z.number()]),
  title: z.string().min(1).max(200).trim().optional(),
  program: z.string().min(1).max(100).trim().optional(),
  meeting_link: z.string().url().trim().optional(),
  meeting_platform: z.string().max(50).trim().optional(),
  scheduled_at: z.string().optional(),
  duration_minutes: z.number().int().positive().max(480).optional(),
  tutor_name: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
  is_active: z.boolean().optional(),
});