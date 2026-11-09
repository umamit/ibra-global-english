import { getAdminSupabase } from "@/app/api/_middleware";
import { sendWhatsAppMessage } from "@/lib/whatsapp/sendWhatsAppMessage";

const supabaseAdmin = getAdminSupabase();

export async function sendPaymentReceiptNotification(
  studentId: string,
  studentName: string,
  program: string,
  month: string,
  netAmount: number,
  gatewayLabel: string
): Promise<void> {
  try {
    let whatsappNum = "";
    let parentName = "";

    const { data: reg } = await supabaseAdmin
      .from("registrations")
      .select("parent_name, whatsapp, notes")
      .ilike("notes", `%[SID:${studentId}]%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reg?.whatsapp && reg.whatsapp !== "-") {
      whatsappNum = reg.whatsapp;
      parentName = reg.parent_name || "";
    } else {
      const cleanName = studentName.trim().replace(/[%_\\]/g, "\\$&");
      const { data: regByName } = await supabaseAdmin
        .from("registrations")
        .select("parent_name, whatsapp")
        .ilike("student_name", cleanName)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (regByName?.whatsapp && regByName.whatsapp !== "-") {
        whatsappNum = regByName.whatsapp;
        parentName = regByName.parent_name || "";
      }
    }

    if (!whatsappNum) return;

    const formattedAmount = `Rp ${netAmount.toLocaleString("id-ID")}`;
    const message = [
      `Halo ${parentName || "Bapak/Ibu Wali Murid"},`,
      "",
      `Terima kasih! Pembayaran SPP untuk siswa an. *${studentName}* telah BERHASIL diverifikasi dan tercatat LUNAS.`,
      "",
      `*Rincian Pembayaran:*`,
      `- Program: ${program}`,
      `- Periode Bulan: ${month}`,
      `- Nominal: ${formattedAmount}`,
      `- Metode: ${gatewayLabel}`,
      `- Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jayapura" })} WIT`,
      "",
      `Kuitansi dan kartu SPP digital dapat diunduh kapan saja melalui Portal Orang Tua:`,
      `https://www.ibraglobalenglish.uk/parent`,
      "",
      `Salam hangat,`,
      `*LKP PT. IBRA Global English Bobong*`,
    ].join("\n");

    const res = await sendWhatsAppMessage({ to: whatsappNum, message });
    await supabaseAdmin.from("whatsapp_logs").insert({
      phone: whatsappNum,
      message,
      status: res.success ? "sent" : "failed",
      error_message: res.error || null,
      created_at: new Date().toISOString(),
    });
  } catch (err: any) {
    // Non-blocking catch to ensure payment webhook returns 200 OK
  }
}
