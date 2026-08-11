import fs from "fs";
import path from "path";
import os from "os";
import { getAdminSupabase } from "@/app/api/_middleware";

const logPath = path.join(os.tmpdir(), "whatsapp_logs.txt");
const supabase = getAdminSupabase();

export async function sendBulkWhatsappMessages(phone: string, message: string, type?: string) {
  const numbers = phone.split(",").map((n) => n.trim().replace(/[^0-9]/g, "")).filter((n) => n.length >= 9);
  if (numbers.length === 0) return { success: false, error: "Tidak ada nomor telepon yang valid.", status: 400 };

  const fonnteToken = process.env.FONNTE_API_TOKEN;
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
            headers: { Authorization: fonnteToken },
            body: formData,
          });
          fonnteResult = await waRes.json();
          sentReal = fonnteResult.status === true;
        } catch (waErr) {
          console.error(`Gagal mengirim ke ${cleanPhone}:`, waErr);
        }
      }

      const status = sentReal ? "SENT" : fonnteToken && fonnteToken !== "GANTI_DENGAN_TOKEN_FONNTE_ANDA" ? "FAILED" : "SIMULATED";
      const logEntry = `[${new Date().toISOString()}] TYPE: ${type || "manual"} | TO: ${cleanPhone} | STATUS: ${status} | MSG: ${message}\n`;
      fs.appendFileSync(logPath, logEntry, "utf8");

      return { phone: cleanPhone, sentReal, status, fonnteResult };
    })
  );

  const sentCount = results.filter((r) => r.sentReal).length;
  const simulatedCount = results.filter((r) => r.status === "SIMULATED").length;
  const failedCount = results.filter((r) => r.status === "FAILED").length;

  return {
    success: true,
    total: numbers.length,
    sentCount,
    simulatedCount,
    failedCount,
    results,
    status: 200
  };
}

export async function fetchWhatsappLogs() {
  let fileLogs: any[] = [];
  if (fs.existsSync(logPath)) {
    try {
      const content = fs.readFileSync(logPath, "utf8");
      fileLogs = content
        .trim()
        .split("\n")
        .filter(Boolean)
        .reverse()
        .map((line, idx) => {
          const match = line.match(/^\[(.*?)\] TYPE: (.*?) \| TO: (.*?) \| STATUS: (.*?) \| MSG: (.*)$/);
          if (match) {
            return { id: `file-${idx}`, timestamp: match[1], type: match[2], to: match[3], status: match[4], message: match[5] };
          }
          return { id: `file-${idx}`, raw: line };
        });
    } catch (e) {
      console.error("Gagal membaca file log:", e);
    }
  }

  let dbLogs: any[] = [];
  try {
    const { data } = await supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) {
      dbLogs = data.map((item) => ({
        id: `db-${item.id}`,
        timestamp: item.created_at,
        type: item.type || "placement-test",
        to: item.recipient_phone,
        status: item.status?.toUpperCase() || "SENT",
        message: item.message_body,
      }));
    }
  } catch (e) {}

  return [...fileLogs, ...dbLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function checkFonnteDeviceStatus() {
  const fonnteToken = process.env.FONNTE_API_TOKEN;
  if (!fonnteToken || fonnteToken === "GANTI_DENGAN_TOKEN_FONNTE_ANDA") {
    return {
      connected: false,
      reason: "FONNTE_API_TOKEN belum diisi di Environment Variables server (Vercel / .env.local).",
    };
  }

  try {
    const res = await fetch("https://api.fonnte.com/device", {
      method: "POST",
      headers: { Authorization: fonnteToken },
    });
    const data = await res.json();
    const statusStr = String(data.status || data.device_status || "").toLowerCase();
    const isConnected = statusStr === "connect" || statusStr === "connected" || statusStr === "true" || data.status === true;
    return {
      connected: isConnected,
      device: { device: data.device || data.phone || "", name: data.name || "" },
      reason: isConnected ? undefined : data.reason || data.message || (statusStr === "disconnect" ? "QR Code Fonnte belum discan atau perangkat terputus." : `Fonnte: ${data.detail || JSON.stringify(data)}`),
    };
  } catch (err: any) {
    return {
      connected: false,
      reason: "Gagal menghubungi Fonnte API: " + (err.message || String(err)),
    };
  }
}
