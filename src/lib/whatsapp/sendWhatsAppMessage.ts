/**
 * Helper Integrasi Meta WhatsApp Business Cloud API
 * Digunakan untuk mengirim notifikasi WhatsApp otomatis (Pendaftaran, Presensi, & SPP)
 */

interface SendWhatsAppParams {
  to: string; // Nomor penerima format 628xxx (E.164 tanpa tanda +)
  message: string; // Isi pesan teks
}

export async function sendWhatsAppMessage({ to, message }: SendWhatsAppParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  // Jika kredensial belum diisi di .env.local, lewati pengiriman dengan log aman
  if (!phoneNumberId || !accessToken) {
    return {
      success: false,
      error: "Kredensial Meta WhatsApp Cloud API (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN) belum dikonfigurasi.",
    };
  }

  // Format nomor penerima agar menggunakan awalan 62
  let formattedPhone = to.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "62" + formattedPhone.slice(1);
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "text",
        text: { preview_url: true, body: message },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message || "Gagal mengirim pesan via Meta WhatsApp API.",
        data,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan jaringan saat terhubung ke Meta WhatsApp API.",
    };
  }
}
