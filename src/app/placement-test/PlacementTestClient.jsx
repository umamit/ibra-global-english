"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";

const QUESTIONS = [
  {
    id: 1,
    category: "Grammar (Easy)",
    question: "She ________ her breakfast at 7 AM every day.",
    options: [
      { text: "eat", score: 0 },
      { text: "eats", score: 1 },
      { text: "eating", score: 0 },
      { text: "eaten", score: 0 }
    ]
  },
  {
    id: 2,
    category: "Vocabulary (Easy)",
    question: "My father's sister is my ________.",
    options: [
      { text: "Aunt", score: 1 },
      { text: "Uncle", score: 0 },
      { text: "Grandmother", score: 0 },
      { text: "Cousin", score: 0 }
    ]
  },
  {
    id: 3,
    category: "Grammar (Easy)",
    question: "They ________ soccer in the yard right now.",
    options: [
      { text: "plays", score: 0 },
      { text: "are playing", score: 1 },
      { text: "played", score: 0 },
      { text: "is playing", score: 0 }
    ]
  },
  {
    id: 4,
    category: "Reading (Easy)",
    question: "Read and answer: 'Bob is 10 years old. He has a cat named Whiskers.' How old is Bob?",
    options: [
      { text: "8 years old", score: 0 },
      { text: "10 years old", score: 1 },
      { text: "12 years old", score: 0 },
      { text: "5 years old", score: 0 }
    ]
  },
  {
    id: 5,
    category: "Vocabulary (Medium)",
    question: "If you feel extremely tired, you are ________.",
    options: [
      { text: "angry", score: 0 },
      { text: "excited", score: 0 },
      { text: "exhausted", score: 1 },
      { text: "bored", score: 0 }
    ]
  },
  {
    id: 6,
    category: "Grammar (Medium)",
    question: "Where ________ you go for your vacation last year?",
    options: [
      { text: "do", score: 0 },
      { text: "did", score: 1 },
      { text: "have", score: 0 },
      { text: "are", score: 0 }
    ]
  },
  {
    id: 7,
    category: "Grammar (Medium)",
    question: "I have been living in Bobong ________ three years.",
    options: [
      { text: "since", score: 0 },
      { text: "for", score: 1 },
      { text: "during", score: 0 },
      { text: "in", score: 0 }
    ]
  },
  {
    id: 8,
    category: "Vocabulary (Medium)",
    question: "The school library has a wide ________ of books.",
    options: [
      { text: "selection", score: 1 },
      { text: "select", score: 0 },
      { text: "selective", score: 0 },
      { text: "selector", score: 0 }
    ]
  },
  {
    id: 9,
    category: "Reading (Medium)",
    question: "Read and answer: 'Sarah loves reading. She reads a new book every week. Her favorite genre is mystery.' What kind of books does Sarah like most?",
    options: [
      { text: "Comics", score: 0 },
      { text: "Science Fiction", score: 0 },
      { text: "Mystery", score: 1 },
      { text: "History", score: 0 }
    ]
  },
  {
    id: 10,
    category: "Grammar (Hard)",
    question: "If I ________ his phone number, I would have called him yesterday.",
    options: [
      { text: "know", score: 0 },
      { text: "had known", score: 1 },
      { text: "knew", score: 0 },
      { text: "have known", score: 0 }
    ]
  },
  {
    id: 11,
    category: "Grammar (Hard)",
    question: "By the time the teacher arrived, the students ________ the classroom.",
    options: [
      { text: "already clean", score: 0 },
      { text: "had already cleaned", score: 1 },
      { text: "clean", score: 0 },
      { text: "have cleaned", score: 0 }
    ]
  },
  {
    id: 12,
    category: "Vocabulary (Hard)",
    question: "To 'postpone' a meeting means to ________.",
    options: [
      { text: "cancel it", score: 0 },
      { text: "delay or reschedule it", score: 1 },
      { text: "start it on time", score: 0 },
      { text: "shorten it", score: 0 }
    ]
  },
  {
    id: 13,
    category: "Grammar (Hard)",
    question: "He is looking forward to ________ his grandparents next month.",
    options: [
      { text: "visit", score: 0 },
      { text: "visiting", score: 1 },
      { text: "visited", score: 0 },
      { text: "visits", score: 0 }
    ]
  },
  {
    id: 14,
    category: "Vocabulary (Hard)",
    question: "Her explanation was so ________ that everyone understood the complex topic instantly.",
    options: [
      { text: "vague", score: 0 },
      { text: "ambiguous", score: 0 },
      { text: "lucid", score: 1 },
      { text: "intricate", score: 0 }
    ]
  },
  {
    id: 15,
    category: "Reading (Hard)",
    question: "Read and answer: 'Despite the challenging terrain and unpredictable weather, the expedition successfully reached the summit of Mount Taliabu, demonstrating exemplary resilience and teamwork.' What is the main message of the text?",
    options: [
      { text: "The weather was nice on the mountain.", score: 0 },
      { text: "The team failed to reach the summit.", score: 0 },
      { text: "The team succeeded through determination and cooperation.", score: 1 },
      { text: "Mount Taliabu is easy to climb.", score: 0 }
    ]
  },
  {
    id: 16,
    category: "Listening Comprehension",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: What time does the speaker wake up?",
    isAudio: true,
    audioText: "Every morning, I wake up at half past six, drink a glass of warm water, and do some light stretching before starting my day.",
    options: [
      { text: "6:00 AM", score: 0 },
      { text: "6:30 AM", score: 1 },
      { text: "7:00 AM", score: 0 },
      { text: "7:30 AM", score: 0 }
    ]
  },
  {
    id: 17,
    category: "Listening Comprehension",
    question: "Klik tombol putar untuk mendengarkan audio, kemudian pilih jawaban yang tepat untuk pertanyaan: Where is the speaker planning to go next week?",
    isAudio: true,
    audioText: "I am really looking forward to my trip to Bobong next week. I want to visit the beautiful beaches and practice my English.",
    options: [
      { text: "Jakarta", score: 0 },
      { text: "Taliabu Island (Bobong)", score: 1 },
      { text: "Bali", score: 0 },
      { text: "Makassar", score: 0 }
    ]
  },
  {
    id: 18,
    category: "Speaking Test (Oral)",
    question: "Silakan tekan tombol mikrofon dan bacalah kalimat berikut dengan keras dan jelas:",
    isSpeaking: true,
    targetSentence: "I am ready to improve my speaking skills at Ibra Global English."
  },
  {
    id: 19,
    category: "Speaking Test (Oral)",
    question: "Silakan tekan tombol mikrofon dan bacalah kalimat berikut dengan keras dan jelas:",
    isSpeaking: true,
    targetSentence: "Learning a new language opens up many opportunities for my future career."
  }
];

export default function PlacementTestClient() {
  const supabase = createClient();

  const [theme, setTheme] = useState("light");
  const [step, setStep] = useState(0); // 0: Start/Intro, 1: Registration Form, 2: Quiz, 3: Success Result
  const [userData, setUserData] = useState({ fullName: "", email: "", whatsapp: "" });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: chosenIndex }
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [speakingScore, setSpeakingScore] = useState(null);
  const [recognitionError, setRecognitionError] = useState("");

  const playListeningAudio = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Browser Anda tidak mendukung sintesis suara (TTS).");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsAudioPlaying(true);
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Anda tidak mendukung Web Speech API (Perekam Suara). Silakan gunakan Google Chrome.");
      return;
    }
    setTranscribedText("");
    setSpeakingScore(null);
    setRecognitionError("");
    setIsRecording(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscribedText(resultText);
      const target = QUESTIONS[currentQuestionIndex].targetSentence;
      const score = calculateSpeechAccuracy(resultText, target);
      setSpeakingScore(score);
      const point = score >= 70 ? 1 : 0;
      setAnswers((prev) => ({
        ...prev,
        [QUESTIONS[currentQuestionIndex].id]: point
      }));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setRecognitionError(event.error === "not-allowed" ? "Izin mikrofon ditolak." : "Gagal merekam suara.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const calculateSpeechAccuracy = (transcribed, target) => {
    const clean = (str) => str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim().split(/\s+/);
    const wordsTranscribed = clean(transcribed);
    const wordsTarget = clean(target);
    if (wordsTarget.length === 0) return 0;
    let matchCount = 0;
    wordsTarget.forEach((w) => {
      if (wordsTranscribed.includes(w)) {
        matchCount++;
      }
    });
    return Math.round((matchCount / wordsTarget.length) * 100);
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartTest = () => {
    setStep(1);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!userData.fullName.trim() || !userData.email.trim() || !userData.whatsapp.trim()) {
      alert("Mohon lengkapi semua isian.");
      return;
    }
    setStep(2);
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [QUESTIONS[currentQuestionIndex].id]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    if (currentQuestion.isSpeaking) {
      if (answers[currentQuestion.id] === undefined) {
        const confirmSkip = confirm("Anda belum menyelesaikan rekaman suara dengan sukses. Yakin ingin melanjutkan?");
        if (!confirmSkip) return;
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: 0
        }));
      }
    } else {
      if (answers[currentQuestion.id] === undefined) {
        alert("Pilih salah satu jawaban terlebih dahulu.");
        return;
      }
    }

    setTranscribedText("");
    setSpeakingScore(null);
    setRecognitionError("");

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateAndSubmitResult();
    }
  };

  const handlePrevQuestion = () => {
    setTranscribedText("");
    setSpeakingScore(null);
    setRecognitionError("");
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateAndSubmitResult = async () => {
    setSubmitting(true);
    let totalScore = 0;

    // Calculate score
    QUESTIONS.forEach((q) => {
      if (q.isSpeaking) {
        const speakingVal = answers[q.id] || 0;
        totalScore += speakingVal;
      } else {
        const selectedOptIdx = answers[q.id];
        if (selectedOptIdx !== undefined) {
          totalScore += q.options[selectedOptIdx].score;
        }
      }
    });

    // Determine level (Max 19)
    let determinedLevel = "Beginner";
    let levelDescription = "Dapat memahami kosakata dasar dan frasa sehari-hari secara sederhana. Direkomendasikan untuk Kids Program atau Basic Teens.";
    
    if (totalScore >= 15) {
      determinedLevel = "Advanced";
      levelDescription = "Mampu berkomunikasi secara lancar, memahami materi membaca tingkat tinggi, dan menguasai struktur gramatikal yang kompleks. Direkomendasikan untuk Teens Program (Advanced Kelas).";
    } else if (totalScore >= 8) {
      determinedLevel = "Intermediate";
      levelDescription = "Mampu bercakap-cakap secara fungsional, memahami gagasan utama dalam paragraf umum, dan menyusun kalimat dengan tenses bervariasi. Direkomendasikan untuk Teens Program (Intermediate Kelas).";
    }

    try {
      const payload = {
        full_name: userData.fullName.trim(),
        email: userData.email.trim(),
        whatsapp_number: userData.whatsapp.trim(),
        score: totalScore,
        level: determinedLevel,
        status: "pending",
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("placement_test_submissions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      // Send simulated WhatsApp notification
      try {
        await fetch("/api/whatsapp-simulator", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: userData.whatsapp.trim(),
            message: `Halo *${userData.fullName}*! Hasil Tes Penempatan Bahasa Inggris Anda di Ibra Global English Bobong telah terbit. *Skor Anda:* ${totalScore} / ${QUESTIONS.length}. *Rekomendasi Level:* ${determinedLevel}. Terima kasih telah mengikuti tes penempatan!`,
            type: "Hasil Placement Test"
          })
        });
      } catch (waErr) {
        console.error("Gagal mengirim notifikasi WhatsApp simulasi:", waErr);
      }

      setFinalResult({
        score: totalScore,
        level: determinedLevel,
        description: levelDescription,
        id: data?.id || "N/A"
      });
      setStep(3);
    } catch (err) {
      console.error("Gagal menyimpan hasil tes penempatan:", err);
      // Fallback local display even if DB insert fails
      setFinalResult({
        score: totalScore,
        level: determinedLevel,
        description: levelDescription,
        id: "offline-mode"
      });
      setStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppURL = () => {
    if (!finalResult) return "#";
    const targetPhone = "6281357001357";
    const text = `Halo Ibra Global English Bobong!\nSaya baru saja menyelesaikan *Tes Penempatan Bahasa Inggris Online* di website.\n\n*Nama:* ${userData.fullName}\n*Rekomendasi Level:* ${finalResult.level}\n*Skor Tes:* ${finalResult.score} / ${QUESTIONS.length}\n*Nomor Tes:* ${finalResult.id.slice(0,8).toUpperCase()}\n\nSaya ingin berkonsultasi mengenai kelas yang sesuai dengan hasil pengujian saya. Terima kasih!`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-gray-50)", padding: "5rem 1rem 8rem" }} className="placement-test-page">
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="portal-card" style={{ padding: "3rem 2.5rem", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1rem" }}>
                Tes Penempatan Bahasa Inggris Online
              </h1>
              <p style={{ color: "var(--color-gray-600)", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "600px", marginBottom: "2.5rem" }}>
                Cari tahu tingkat kemampuan bahasa Inggris Anda secara gratis dalam 10 menit! Tes ini dirancang secara ilmiah untuk mengevaluasi aspek *Grammar*, *Vocabulary*, dan *Reading Comprehension* Anda secara instan.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem", width: "100%", marginBottom: "3rem" }}>
                <div style={{ padding: "1.25rem", border: "1px solid var(--color-gray-150)", borderRadius: "var(--radius-md)", backgroundColor: "white" }}>
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>15 Soal</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Pilihan ganda interaktif</p>
                </div>
                <div style={{ padding: "1.25rem", border: "1px solid var(--color-gray-150)", borderRadius: "var(--radius-md)", backgroundColor: "white" }}>
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>Instan</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Rekomendasi level belajar</p>
                </div>
                <div style={{ padding: "1.25rem", border: "1px solid var(--color-gray-150)", borderRadius: "var(--radius-md)", backgroundColor: "white" }}>
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>Resmi</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Sertifikat digital & ulasan</p>
                </div>
              </div>

              <button className="btn-portal-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.1rem", borderRadius: "50px", fontWeight: "800", boxShadow: "0 10px 20px rgba(33, 108, 126, 0.25)" }} onClick={handleStartTest}>
                <span>Mulai Tes Penempatan Sekarang</span>
              </button>
            </div>
          )}

          {/* STEP 1: REGISTRATION */}
          {step === 1 && (
            <div className="portal-card" style={{ padding: "2.5rem 2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
                Informasi Calon Siswa
              </h2>
              <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                Lengkapi data diri Anda di bawah ini agar kami dapat memproses hasil evaluasi, menerbitkan sertifikat, dan memberikan bimbingan yang tepat.
              </p>

              <form onSubmit={handleRegister}>
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Nama Lengkap Anda</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="Contoh: Husni Tausman"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label className="form-label">Alamat Email Aktif</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Contoh: nama@domain.com"
                    value={userData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "2rem" }}>
                  <label className="form-label">Nomor WhatsApp Aktif (Untuk Pengiriman Hasil Kelas)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    className="form-input"
                    placeholder="Contoh: 08123456789"
                    value={userData.whatsapp}
                    onChange={handleInputChange}
                    required
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "6px" }}>
                    * Pastikan nomor WhatsApp diisi dengan benar agar tutor kami dapat mengirimkan ulasan khusus.
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <button type="button" className="btn-portal-outline" onClick={() => setStep(0)}>
                    Kembali
                  </button>
                  <button type="submit" className="btn-portal-primary">
                    <span>Lanjut Ke Lembar Soal →</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: QUIZ INTERACTIVE */}
          {step === 2 && (
            <div>
              {/* Progress bar */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary-dark)", backgroundColor: "var(--color-primary-light)", padding: "0.25rem 0.75rem", borderRadius: "50px" }}>
                    {QUESTIONS[currentQuestionIndex].category}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
                    Soal {currentQuestionIndex + 1} dari {QUESTIONS.length}
                  </span>
                </div>
                <div style={{ width: "100%", height: "8px", backgroundColor: "var(--color-gray-200)", borderRadius: "50px", overflow: "hidden" }}>
                  <div style={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%`, height: "100%", backgroundColor: "var(--color-primary)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>

              {/* Card Soal */}
              <div className="portal-card" style={{ padding: "2.5rem 2rem", marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", lineHeight: "1.6", marginBottom: "2rem" }}>
                  {QUESTIONS[currentQuestionIndex].question}
                </h3>

                {QUESTIONS[currentQuestionIndex].isAudio && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "1.5rem", backgroundColor: "var(--color-primary-light)", borderRadius: "12px", marginBottom: "2rem" }}>
                    <button
                      type="button"
                      onClick={() => playListeningAudio(QUESTIONS[currentQuestionIndex].audioText)}
                      aria-label={isAudioPlaying ? "Hentikan Suara Soal" : "Putar Suara Soal"}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 14px rgba(33, 108, 126, 0.4)",
                        transition: "all 0.2s ease"
                      }}
                      className={isAudioPlaying ? "skeleton-pulse" : ""}
                    >
                      {isAudioPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      )}
                    </button>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>
                      {isAudioPlaying ? "Memutar Audio Comprehension..." : "Klik untuk Mendengar Soal Percakapan"}
                    </span>
                  </div>
                )}

                {QUESTIONS[currentQuestionIndex].isSpeaking ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{
                      fontSize: "1.35rem",
                      fontWeight: "800",
                      color: "var(--color-primary-dark)",
                      padding: "2rem 1.5rem",
                      border: "2px dashed var(--color-accent)",
                      borderRadius: "12px",
                      textAlign: "center",
                      backgroundColor: "rgba(166, 136, 73, 0.05)",
                      width: "100%",
                      fontFamily: "Georgia, serif"
                    }}>
                      "{QUESTIONS[currentQuestionIndex].targetSentence}"
                    </div>

                    <button
                      type="button"
                      onClick={startSpeechRecognition}
                      disabled={isRecording}
                      style={{
                        padding: "1rem 2rem",
                        borderRadius: "50px",
                        backgroundColor: isRecording ? "var(--color-red)" : "var(--color-primary)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        boxShadow: isRecording ? "0 0 15px rgba(239, 68, 68, 0.5)" : "0 4px 14px rgba(33, 108, 126, 0.3)",
                        transition: "all 0.2s ease"
                      }}
                      className={isRecording ? "skeleton-pulse" : ""}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
                      <span>{isRecording ? "Mendengarkan... Silakan Bicara" : "Mulai Rekam Suara"}</span>
                    </button>

                    {recognitionError && (
                      <p style={{ color: "var(--color-red)", fontWeight: "700", fontSize: "0.9rem" }}>
                        ⚠️ {recognitionError}
                      </p>
                    )}

                    {transcribedText && (
                      <div style={{ width: "100%", padding: "1.25rem", border: "1px solid var(--color-gray-200)", borderRadius: "8px", backgroundColor: "var(--color-gray-50)" }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-gray-400)", textTransform: "uppercase", marginBottom: "4px" }}>Hasil Transkripsi Anda:</p>
                        <p style={{ fontWeight: "600", color: "var(--color-gray-800)" }}>"{transcribedText}"</p>
                      </div>
                    )}

                    {speakingScore !== null && (
                      <div style={{
                        padding: "1rem 2rem",
                        borderRadius: "8px",
                        backgroundColor: speakingScore >= 70 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: speakingScore >= 70 ? "var(--color-green)" : "var(--color-red)",
                        border: "1px solid",
                        borderColor: speakingScore >= 70 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)",
                        textAlign: "center",
                        width: "100%"
                      }}>
                        <h4 style={{ fontWeight: "800", fontSize: "1.1rem" }}>Akurasi Pengucapan: {speakingScore}%</h4>
                        <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                          {speakingScore >= 70 
                            ? "✓ Pelafalan Anda sangat baik! (+1 poin)" 
                            : "✗ Pelafalan kurang presisi. Klik tombol di atas untuk mengulangi."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {QUESTIONS[currentQuestionIndex].options.map((opt, optIdx) => {
                      const isSelected = answers[QUESTIONS[currentQuestionIndex].id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionSelect(optIdx)}
                          style={{
                            textAlign: "left",
                            padding: "1.15rem 1.5rem",
                            border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)",
                            backgroundColor: isSelected ? "var(--color-primary-light)" : "white",
                            color: isSelected ? "var(--color-primary-dark)" : "var(--color-gray-800)",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem"
                          }}
                          className="option-button"
                        >
                          <span style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            border: "2px solid",
                            borderColor: isSelected ? "var(--color-primary)" : "var(--color-gray-400)",
                            backgroundColor: isSelected ? "var(--color-primary)" : "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigasi kuis */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-portal-outline"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1 }}
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  className="btn-portal-primary"
                  onClick={handleNextQuestion}
                  disabled={submitting}
                >
                  <span>
                    {submitting 
                      ? "Memproses..." 
                      : currentQuestionIndex === QUESTIONS.length - 1 
                        ? "Selesaikan & Lihat Hasil" 
                        : "Lanjut"
                    }
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS RESULT (CERTIFICATE & CALL TO ACTION) */}
          {step === 3 && finalResult && (
            <div className="no-print">
              
              {/* Desain Sertifikat Kelulusan */}
              <div className="printable-report" style={{
                backgroundColor: "white",
                padding: "3.5rem 3rem",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                border: "12px double var(--color-accent)",
                position: "relative",
                marginBottom: "2.5rem",
                textAlign: "center"
              }}>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                  <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "64px" }} />
                  <div style={{ textAlign: "left" }}>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0", letterSpacing: "1px", color: "var(--color-gray-950)" }}>IBRA GLOBAL ENGLISH</h2>
                    <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-accent)", margin: "0", letterSpacing: "2px" }}>BELAJAR SERU, LANCAR BICARA</p>
                  </div>
                </div>

                <div style={{ width: "100%", height: "2px", background: "linear-gradient(to right, transparent, var(--color-accent), transparent)", margin: "1.5rem 0" }}></div>

                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontStyle: "italic", color: "var(--color-gray-500)", marginBottom: "1rem" }}>
                  Placement Test Statement of Result
                </h3>

                <p style={{ fontSize: "1rem", color: "var(--color-gray-600)", margin: "0 0 1.5rem" }}>
                  Sertifikat digital ini diberikan secara resmi kepada:
                </p>

                <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "var(--color-primary-dark)", margin: "0 0 0.5rem", fontFamily: "Georgia, serif" }}>
                  {userData.fullName}
                </h1>
                
                <p style={{ fontSize: "0.95rem", color: "var(--color-gray-500)", marginBottom: "2rem" }}>
                  untuk menyelesaikan ujian evaluasi kompetensi Bahasa Inggris umum online.
                </p>

                <div className="form-grid" style={{ gap: "2rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
                  <div style={{ padding: "1.25rem", border: "1px solid var(--color-gray-100)", borderRadius: "8px", backgroundColor: "var(--color-gray-50)" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Skor Capaian</p>
                    <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary)" }}>{finalResult.score} <span style={{ fontSize: "1.1rem", color: "var(--color-gray-400)" }}>/ 15</span></p>
                  </div>
                  <div style={{ padding: "1.25rem", border: "1px solid var(--color-gray-100)", borderRadius: "8px", backgroundColor: "var(--color-gray-50)" }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Rekomendasi Tingkat</p>
                    <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-accent)" }}>{finalResult.level}</p>
                  </div>
                </div>

                <div style={{ maxWidth: "550px", margin: "0 auto 3rem", padding: "0 1.5rem" }}>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", lineHeight: "1.6", fontWeight: "600" }}>
                    "{finalResult.description}"
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1.5rem" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Tanggal Terbit:</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Nomor Verifikasi:</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", textTransform: "uppercase" }}>IBRA-OPT-{finalResult.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>

              {/* Tombol aksi interaktif */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
                <a
                  href={getWhatsAppURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-portal-primary"
                  style={{ display: "flex", gap: "0.5rem", alignItems: "center", textDecoration: "none", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span>Daftar Kelas via WhatsApp</span>
                </a>

                <button
                  onClick={handlePrint}
                  className="btn-portal-outline"
                  style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700", backgroundColor: "white" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Cetak Sertifikat</span>
                </button>

                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                  className="btn-portal-outline"
                  style={{ padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700", backgroundColor: "white" }}
                >
                  Ulangi Tes
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* PRINT-ONLY VIEW FOR THE STATEMENT OF RESULT */}
      {step === 3 && finalResult && (
        <div className="print-only">
          <div style={{
            backgroundColor: "white",
            padding: "2.5cm",
            border: "10px double #A68849",
            textAlign: "center",
            fontFamily: "Georgia, serif"
          }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0", letterSpacing: "1px", color: "black" }}>IBRA GLOBAL ENGLISH</h2>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "#A68849", margin: "0", letterSpacing: "2px" }}>BELAJAR SERU, LANCAR BICARA</p>
              </div>
            </div>

            <hr style={{ borderColor: "#A68849" }} />

            <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", margin: "1.5rem 0" }}>
              Placement Test Statement of Result
            </h3>

            <p style={{ margin: "2rem 0" }}>
              Sertifikat digital ini diberikan secara resmi kepada:
            </p>

            <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#216c7e", margin: "1.5rem 0" }}>
              {userData.fullName}
            </h1>

            <p style={{ margin: "2rem 0" }}>
              untuk menyelesaikan ujian evaluasi kompetensi Bahasa Inggris umum online.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "3cm", margin: "2.5rem 0" }}>
              <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
                <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem" }}>SKOR CAPAIAN</p>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0" }}>{finalResult.score} / 15</p>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
                <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem" }}>REKOMENDASI TINGKAT</p>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0" }}>{finalResult.level}</p>
              </div>
            </div>

            <p style={{ fontStyle: "italic", margin: "2rem 0", lineHeight: "1.6" }}>
              "{finalResult.description}"
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4cm" }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "0.8rem", margin: "0" }}>Tanggal Terbit:</p>
                <p style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.8rem", margin: "0" }}>Nomor Verifikasi:</p>
                <p style={{ fontSize: "0.9rem", fontWeight: "bold" }}>IBRA-OPT-{finalResult.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
