import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { checkAdminAuth } from "@/utils/supabase/adminAuth";

// Tentukan path log di temp directory agar aman di read-only file system (Vercel)
const logPath = path.join(os.tmpdir(), "whatsapp_logs.txt");

// Helper untuk respons JSON dengan Cache-Control private (sesuai aturan keamanan admin)
function jsonResponse(data, init = {}) {
  const headers = {
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
    ...(init.headers || {}),
  };
  return NextResponse.json(data, { ...init, headers });
}

// POST: Kirim pesan WhatsApp via Fonnte
export async function POST(request) {
  // Validasi hanya admin yang bisa mengirim
  if (!(await checkAdminAuth())) {
    return jsonResponse({ error: "Tidak diizinkan." }, { status: 403 });
  }

  try {
    const { phone, message, type } = await request.json();

    if (!phone || !message) {
      return jsonResponse(
        { error: "Nomor telepon dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    // Bersihkan nomor telepon (hanya angka)
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) {
      return jsonResponse(
        { error: "Nomor telepon tidak valid." },
        { status: 400 }
      );
    }

    console.log(`[WA GATEWAY] Type: ${type || "manual"}, To: ${cleanPhone}`);

    // Kirim via Fonnte jika token tersedia
    let sentReal = false;
    let fonnteResult = null;
    const fonnteToken = process.env.FONNTE_API_TOKEN;

    if (fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA") {
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

        fonnteResult = await waRes.json();
        console.log("[WA GATEWAY - FONNTE RESULT]", fonnteResult);
        sentReal = fonnteResult.status === true;
      } catch (waErr) {
        console.error("Gagal mengirim WA via Fonnte:", waErr);
      }
    }

    // Tulis log setelah percobaan pengiriman ke file di /tmp
    const status = sentReal ? "SENT" : fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" ? "FAILED" : "SIMULATED";
    const logEntry = `[${new Date().toISOString()}] TYPE: ${type || "manual"} | TO: ${cleanPhone} | STATUS: ${status} | MSG: ${message}\n`;
    fs.appendFileSync(logPath, logEntry, "utf8");

    return jsonResponse({
      success: true,
      logged: true,
      sentReal,
      status,
      fonnteResult,
    });
  } catch (error) {
    console.error("WA Gateway error:", error);
    return jsonResponse(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET: Ambil log pengiriman & status perangkat Fonnte
export async function GET(request) {
  if (!(await checkAdminAuth())) {
    return jsonResponse({ error: "Tidak diizinkan." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Cek status perangkat Fonnte
    if (action === "device") {
      const fonnteToken = process.env.FONNTE_API_TOKEN;

      if (!fonnteToken || fonnteToken === "GANTI_DENGAN_TOKEN_FONNTE_ANDA") {
        return jsonResponse({
          connected: false,
          reason: "Token Fonnte belum dikonfigurasi di environment variable.",
        });
      }

      try {
        // API Fonnte memerlukan POST untuk /device
        const res = await fetch("https://api.fonnte.com/device", {
          method: "POST",
          headers: { Authorization: fonnteToken },
        });
        const data = await res.json();
        return jsonResponse({
          connected: data.status === true,
          device: data,
        });
      } catch (err) {
        return jsonResponse({
          connected: false,
          reason: "Gagal terhubung ke Fonnte: " + err.message,
        });
      }
    }

    // Default: ambil log pengiriman
    if (!fs.existsSync(logPath)) {
      return jsonResponse({ logs: [], stats: { total: 0, today: 0, sent: 0, simulated: 0, failed: 0 } });
    }

    const content = fs.readFileSync(logPath, "utf8");
    const rawLines = content.trim().split("\n").filter(Boolean);

    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const logs = rawLines
      .map((line) => {
        const match = line.match(
          /^\[(.*?)\] TYPE: (.*?) \| TO: (.*?) \| STATUS: (.*?) \| MSG: (.*?)$/
        );
        // Support format lama (tanpa STATUS field)
        const legacyMatch = line.match(
          /^\[(.*?)\] TYPE: (.*?) \| TO: (.*?) \| MSG: (.*?)$/
        );
        if (match) {
          return {
            timestamp: match[1],
            type: match[2],
            phone: match[3],
            status: match[4],
            message: match[5],
          };
        }
        if (legacyMatch) {
          return {
            timestamp: legacyMatch[1],
            type: legacyMatch[2],
            phone: legacyMatch[3],
            status: "SIMULATED",
            message: legacyMatch[4],
          };
        }
        return { raw: line, timestamp: "", status: "UNKNOWN" };
      })
      .reverse(); // Terbaru di atas

    const stats = {
      total: logs.length,
      today: logs.filter((l) => l.timestamp?.startsWith(todayStr)).length,
      sent: logs.filter((l) => l.status === "SENT").length,
      simulated: logs.filter((l) => l.status === "SIMULATED").length,
      failed: logs.filter((l) => l.status === "FAILED").length,
    };

    return jsonResponse({ logs, stats });
  } catch (error) {
    return jsonResponse(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
