import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

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
- **Email**: admin@ibraglobalenglish.uk
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
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API Key Groq belum dikonfigurasi." },
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

    // Format messages for OpenAI / Groq compatibility
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error response:", data);
      const errMsg = data?.error?.message || "Gagal mendapat respons dari server Groq.";
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: "❌ API Key Groq tidak valid. Periksa konfigurasi API Anda." },
          { status: 401 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "⚠️ Batas penggunaan (kuota) API Groq telah habis. Silakan coba beberapa saat lagi." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Kesalahan Groq: ${errMsg}` },
        { status: response.status }
      );
    }

    const aiText = data?.choices?.[0]?.message?.content;

    if (!aiText) {
      return NextResponse.json(
        { error: "AI tidak dapat menghasilkan respons saat ini." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply: aiText });
  } catch (err) {
    console.error("AI Chat error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server AI Groq. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
