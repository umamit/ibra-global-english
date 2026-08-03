import { getAdminSupabase } from "@/app/api/_middleware";
import fs from "fs";
import path from "path";
import os from "os";

const supabaseAdmin = getAdminSupabase();
const logPath = path.join(os.tmpdir(), "whatsapp_logs.txt");

export async function savePlacementSubmission(data: any) {
  const { full_name, email, whatsapp_number, score, level, status, created_at } = data;
  return await supabaseAdmin
    .from("placement_test_submissions")
    .insert({
      full_name,
      email,
      whatsapp_number,
      score,
      level,
      status,
      created_at: created_at || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function sendPlacementWaNotification(full_name: string, whatsapp_number: string, score: number, level: string) {
  try {
    const cleanPhone = whatsapp_number.replace(/[^0-9]/g, "");
    const fonnteToken = process.env.FONNTE_API_TOKEN;
    const message = `Halo *${full_name}*! Hasil Tes Penempatan Bahasa Inggris Anda di Ibra Global English Bobong telah terbit. *Skor Anda:* ${score} / 20. *Level CEFR:* ${level}. Terima kasih telah mengikuti tes penempatan!`;

    let sentReal = false;
    if (fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" && cleanPhone.length >= 9) {
      try {
        const formData = new FormData();
        formData.append("target", cleanPhone);
        formData.append("message", message);
        formData.append("countryCode", "62");

        const waRes = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: { Authorization: fonnteToken },
          body: formData,
        });

        const fonnteResult = await waRes.json();
        sentReal = fonnteResult.status === true;
      } catch (waErr) {
        console.error(`Gagal mengirim WhatsApp via Fonnte ke ${cleanPhone}:`, waErr);
      }
    }

    const waStatus = sentReal ? "SENT" : fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" ? "FAILED" : "SIMULATED";
    const logEntry = `[${new Date().toISOString()}] STATUS: ${waStatus} | TO: ${whatsapp_number} | NAME: ${full_name} | MSG: ${message}\n`;
    fs.appendFileSync(logPath, logEntry, "utf8");
  } catch (err) {
    console.error("Gagal mencatat log WhatsApp placement test:", err);
  }
}
