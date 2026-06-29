import { z } from "zod";

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
