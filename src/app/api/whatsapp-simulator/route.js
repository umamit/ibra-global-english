import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { phone, message, type } = await request.json();
    
    console.log(`[WA SIMULATOR] Type: ${type}, To: ${phone}, Message: "${message}"`);
    
    // Log locally to txt file
    const logDir = path.join(process.cwd(), "public", "assets");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, "whatsapp_logs.txt");
    const logEntry = `[${new Date().toISOString()}] TYPE: ${type} | TO: ${phone} | MSG: ${message}\n`;
    fs.appendFileSync(logPath, logEntry, "utf8");
    
    // Send real WA via Fonnte if environment variable is present
    let sentReal = false;
    let fonnteResult = null;
    const fonnteToken = process.env.FONNTE_API_TOKEN;
    
    if (fonnteToken) {
      try {
        const formData = new FormData();
        formData.append("target", phone);
        formData.append("message", message);
        formData.append("countryCode", "62");
        
        const waRes = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": fonnteToken
          },
          body: formData
        });
        
        fonnteResult = await waRes.json();
        console.log("[WA SIMULATOR - FONNTE RESULT]", fonnteResult);
        sentReal = fonnteResult.status === true;
      } catch (waErr) {
        console.error("Gagal mengirim WA via Fonnte:", waErr);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      logged: true, 
      sentReal, 
      fonnteResult 
    });
  } catch (error) {
    console.error("WA Simulator error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logPath = path.join(process.cwd(), "public", "assets", "whatsapp_logs.txt");
    if (!fs.existsSync(logPath)) {
      return NextResponse.json({ logs: [] });
    }
    const content = fs.readFileSync(logPath, "utf8");
    const logs = content.trim().split("\n").filter(Boolean).map(line => {
      const match = line.match(/^\[(.*?)\] TYPE: (.*?) \| TO: (.*?) \| MSG: (.*?)$/);
      if (match) {
        return {
          timestamp: match[1],
          type: match[2],
          phone: match[3],
          message: match[4]
        };
      }
      return { raw: line };
    });
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
