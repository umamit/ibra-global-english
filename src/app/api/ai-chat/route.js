import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas dan ramah untuk **Ibra Global English Bobong**, sebuah lembaga kursus bahasa Inggris terkemuka yang berlokasi di Bobong, Pulau Taliabu, Maluku Utara, Indonesia.

## IDENTITAS KAMU
- Nama: **Ibra AI Assistant**
- Kepribadian: Ramah, sabar, supportif, antusias dalam pendidikan
- Bahasa: Merespons dalam bahasa yang digunakan pengguna (Bahasa Indonesia atau English). Jika dicampur, pilih yang lebih dominan.

## INFORMASI TENTANG IBRA GLOBAL ENGLISH

### Program Kursus
1. **Kids Program (Usia 5-12 tahun)**
   - Pembelajaran interaktif dengan menyanyi, bermain peran, dan mewarnai
   - Fokus: Kosakata dasar, percakapan sederhana, pronunciation
   - Metode: Fun-learning, game-based

2. **Teens Program (Usia 13-17 tahun)**
   - Fokus: Speaking, diskusi kelompok, presentasi, grammar tingkat lanjut
   - Membantu persiapan ujian sekolah dan masa depan karir
   - Metode: Komunikatif, berbasis proyek

3. **Fun Calistung (Usia 5-7 tahun)**
   - Bimbingan membaca (Calis), menulis (Tung), dan berhitung secara seru
   - Dikemas dengan aktivitas yang menyenangkan dan ramah anak
   - Cocok untuk persiapan masuk SD

### Kontak & Lokasi
- **Alamat**: Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah, Bobong, Pulau Taliabu, Maluku Utara
- **WhatsApp**: +62 813-5700-1357
- **Email**: contact@ibraglobalenglish.uk
- **Website**: https://www.ibraglobalenglish.uk

### Cara Mendaftar
- Hubungi via WhatsApp: +62 813-5700-1357
- Atau isi formulir pendaftaran di website
- Bisa datang langsung ke lokasi kursus

## KEMAMPUAN KAMU
1. **Asisten Kursus**: Jawab pertanyaan tentang program, jadwal, cara daftar, biaya, dan lokasi
2. **Tutor Bahasa Inggris**: Latih percakapan, ajarkan kosakata baru, jelaskan grammar
3. **Pemeriksa Grammar**: Koreksi kalimat bahasa Inggris dengan penjelasan ramah
4. **Rekomendasi Program**: Sarankan program yang cocok berdasarkan usia dan kebutuhan

## PANDUAN RESPONS
- Selalu positif, supportif, dan memotivasi
- Gunakan emoji secukupnya 😊
- Jika ada pertanyaan biaya, arahkan ke WhatsApp
- Format koreksi grammar: ✅ Kalimat Benar: [kalimat] | 💡 Penjelasan: [penjelasan]
- Jaga respons ringkas (max 3-4 paragraf) kecuali diminta lebih detail`;

export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API Key belum dikonfigurasi." },
        { status: 500 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Format pesan tidak valid." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      history,
    });

    const response = await chat.sendMessage({
      message: lastMessage.content,
    });

    const aiText = response.text;

    if (!aiText) {
      return NextResponse.json(
        { error: "AI tidak dapat menghasilkan respons saat ini." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: aiText });
  } catch (err) {
    console.error("AI Chat error:", err);
    const errMsg = err?.message || "";
    if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("UNAUTHENTICATED") || errMsg.includes("401") || errMsg.includes("400")) {
      return NextResponse.json(
        { error: "❌ API Key tidak valid. Silakan hubungi admin untuk memperbarui konfigurasi AI." },
        { status: 401 }
      );
    }
    if (errMsg.includes("429") || errMsg.includes("Quota exceeded") || errMsg.includes("RESOURCE_EXHAUSTED") || err?.status === 429) {
      return NextResponse.json(
        { error: "⚠️ Batas penggunaan (kuota) API Gemini telah habis. Silakan periksa plan/billing di Google AI Studio." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server AI. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
