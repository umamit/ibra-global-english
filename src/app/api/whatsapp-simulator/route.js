import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { withAdminAuth, getAdminSupabase } from "@/app/api/_middleware";

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

// POST: Kirim pesan WhatsApp via Fonnte (Mendukung pengiriman ke banyak nomor sekaligus)
export const POST = withAdminAuth(async (request) => {

  try {
    const { phone, message, type } = await request.json();

    if (!phone || !message) {
      return jsonResponse(
        { error: "Nomor telepon dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    // Pisahkan nomor telepon berdasarkan koma untuk pengiriman massal
    const numbers = phone
      .split(",")
      .map((n) => n.trim().replace(/[^0-9]/g, ""))
      .filter((n) => n.length >= 9);

    if (numbers.length === 0) {
      return jsonResponse(
        { error: "Tidak ada nomor telepon yang valid." },
        { status: 400 }
      );
    }

    const fonnteToken = process.env.FONNTE_API_TOKEN;

    // Kirim pesan ke semua nomor secara paralel
    const results = await Promise.all(
      numbers.map(async (cleanPhone) => {
        let sentReal = false;
        let fonnteResult = null;

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
            sentReal = fonnteResult.status === true;
          } catch (waErr) {
            console.error(`Gagal mengirim ke ${cleanPhone}:`, waErr);
          }
        }

        // Tulis log untuk masing-masing nomor
        const status = sentReal ? "SENT" : fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" ? "FAILED" : "SIMULATED";
        const logEntry = `[${new Date().toISOString()}] TYPE: ${type || "manual"} | TO: ${cleanPhone} | STATUS: ${status} | MSG: ${message}\n`;
        fs.appendFileSync(logPath, logEntry, "utf8");

        return { phone: cleanPhone, sentReal, status, fonnteResult };
      })
    );

    const sentCount = results.filter((r) => r.sentReal).length;
    const simulatedCount = results.filter((r) => r.status === "SIMULATED").length;
    const failedCount = results.filter((r) => r.status === "FAILED").length;

    return jsonResponse({
      success: true,
      logged: true,
      results,
      stats: {
        total: numbers.length,
        sent: sentCount,
        simulated: simulatedCount,
        failed: failedCount,
      },
    });
  } catch (error) {
    console.error("WA Gateway error:", error);
    return jsonResponse(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

// GET: Ambil log pengiriman, status perangkat Fonnte, atau daftar kontak
export const GET = withAdminAuth(async (request) => {

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // 1. Cek status perangkat Fonnte
    if (action === "device") {
      const fonnteToken = process.env.FONNTE_API_TOKEN;

      if (!fonnteToken || fonnteToken === "GANTI_DENGAN_TOKEN_FONNTE_ANDA") {
        return jsonResponse({
          connected: false,
          reason: "Token Fonnte belum dikonfigurasi di environment variable.",
        });
      }

      try {
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

    // 2. Ambil seluruh kontak dari Registrasi dan Placement Test (otomatis)
    if (action === "contacts") {
      try {
        const supabaseAdmin = getAdminSupabase();

        // Ambil data pendaftaran
        const { data: regData } = await supabaseAdmin
          .from("registrations")
          .select("student_name, parent_name, whatsapp")
          .order("created_at", { ascending: false });

        // Ambil data tes penempatan
        const { data: testData } = await supabaseAdmin
          .from("placement_test_submissions")
          .select("full_name, whatsapp_number")
          .order("created_at", { ascending: false });

        const contacts = [];
        const seen = new Set();

        if (regData) {
          regData.forEach((r) => {
            const clean = r.whatsapp.replace(/[^0-9]/g, "");
            if (clean && !seen.has(clean)) {
              seen.add(clean);
              contacts.push({
                name: r.parent_name ? `${r.parent_name} (Ortu ${r.student_name})` : r.student_name,
                phone: clean,
                source: "Pendaftaran",
              });
            }
          });
        }

        if (testData) {
          testData.forEach((t) => {
            const clean = t.whatsapp_number.replace(/[^0-9]/g, "");
            if (clean && !seen.has(clean)) {
              seen.add(clean);
              contacts.push({
                name: `${t.full_name}`,
                phone: clean,
                source: "Tes Penempatan",
              });
            }
          });
        }

        return jsonResponse({ contacts });
      } catch (dbErr) {
        console.error("Gagal memuat kontak dari DB:", dbErr);
        return jsonResponse({ contacts: [], error: dbErr.message });
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
});