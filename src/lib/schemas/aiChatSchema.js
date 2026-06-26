import { z } from "zod";

/**
 * Schema untuk pesan AI Chat
 * Digunakan untuk validasi request body di API route ai-chat
 */
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1, "Pesan tidak boleh kosong"),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, "Minimal 1 pesan diperlukan")
    .max(50, "Maksimal 50 pesan dalam satu request"),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
});