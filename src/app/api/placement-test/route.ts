import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/app/api/_middleware";
import { placementSchema } from "@/lib/schemas/placementSchema";
import fs from "fs";
import path from "path";
import os from "os";

const supabaseAdmin = getAdminSupabase();
const logPath = path.join(os.tmpdir(), "whatsapp_logs.txt");

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validasi input
    const validation = placementSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json(
        { error: `Data tidak valid: ${errorMessages}` },
        { status: 400 }
      );
    }

    const { full_name, email, whatsapp_number, score, level, status, created_at } = validation.data;

    // Simpan ke database menggunakan admin client (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from("placement_test_submissions")
      .insert({
        full_name,
        email,
        whatsapp_number,
        score,
        level,
        status,
        created_at: created_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Gagal menyimpan hasil tes penempatan:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan hasil tes. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // Mengirim notifikasi WhatsApp simulated / real via Fonnte
    try {
      const cleanPhone = whatsapp_number.replace(/[^0-9]/g, "");
      const fonnteToken = process.env.FONNTE_API_TOKEN;
      const message = `Halo *${full_name}*! Hasil Tes Penempatan Bahasa Inggris Anda di Ibra Global English Bobong telah terbit. *Skor Anda:* ${score} / 17. *Rekomendasi Level:* ${level}. Terima kasih telah mengikuti tes penempatan!`;
      
      let sentReal = false;
      if (fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" && cleanPhone.length >= 9) {
        try {
          const formData = new FormData();
          formData.append("target", cleanPhone);
          formData.append("message", message);
          formData.append("countryCode", "62");

          const waRes = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              Authorization: fonnteToken,
            },
            body: formData,
          });

          const fonnteResult = await waRes.json();
          sentReal = fonnteResult.status === true;
        } catch (waErr) {
          console.error(`Gagal mengirim WhatsApp via Fonnte ke ${cleanPhone}:`, waErr);
        }
      }

      // Tulis log pengiriman WhatsApp
      const waStatus = sentReal ? "SENT" : fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" ? "FAILED" : "SIMULATED";
      const logEntry = `[${new Date().toISOString()}] TYPE: Hasil Placement Test | TO: ${cleanPhone} | STATUS: ${waStatus} | MSG: ${message}\n`;
      fs.appendFileSync(logPath, logEntry, "utf8");

    } catch (waErr) {
      console.error("Gagal memproses notifikasi WhatsApp:", waErr);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Server error saat menyimpan hasil kuis:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
