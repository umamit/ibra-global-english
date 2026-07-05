"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../dashboard-components.css";
import "./placement-test.css";
import FormInput from "@/components/FormInput";
import Button from "@/components/Button";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import {
  Question,
  PlacementResult,
  calculateSpeechAccuracy,
  determineLevelDetails,
} from "./placementHelpers";

export default function PlacementTestClient() {
  const supabase = createClient();

  const [theme, setTheme] = useState("light");
  const [step, setStep] = useState(0); // 0: Start/Intro, 1: Registration Form, 2: Quiz, 3: Success Result
  const [userData, setUserData] = useState({ fullName: "", email: "", whatsapp: "" });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // { questionId: chosenIndex }
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<PlacementResult | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [recognitionError, setRecognitionError] = useState("");
  const [issueDateStr, setIssueDateStr] = useState("");

  const QUESTIONS = questions;

  const playListeningAudio = (text: string) => {
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscribedText(resultText);
      const target = QUESTIONS[currentQuestionIndex].target_sentence || "";
      const score = calculateSpeechAccuracy(resultText, target);
      setSpeakingScore(score);
      const point = score >= 70 ? 1 : 0;
      setAnswers((prev) => ({
        ...prev,
        [QUESTIONS[currentQuestionIndex].id]: point
      }));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setRecognitionError(event.error === "not-allowed" ? "Izin mikrofon ditolak." : "Gagal merekam suara.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // calculateSpeechAccuracy is imported from placementHelpers

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
  }, []);

  // Set issue date once on mount (prevents hydration mismatch)
  useEffect(() => {
    setTimeout(() => {
      setIssueDateStr(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    }, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadQuestions = async () => {
      try {
        const res = await fetch(`/api/placement-test/questions?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data) && data.length) {
            setQuestions(data);
          }
        }
      } catch (e) {
        console.warn("Gagal memuat soal dinamis, gunakan fallback.", e);
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    };
    loadQuestions();
    return () => { cancelled = true; };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartTest = () => {
    if (loadingQuestions) return;
    if (questions.length === 0) {
      alert("Gagal memuat soal AI. Pastikan server AI Groq aktif dan muat ulang halaman.");
      return;
    }
    posthog.capture("placement_test_started");
    setStep(1);
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData.fullName.trim() || !userData.email.trim() || !userData.whatsapp.trim()) {
      alert("Mohon lengkapi semua isian.");
      return;
    }
    posthog.capture("placement_test_registered");
    setStep(2);
  };

  const handleOptionSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [QUESTIONS[currentQuestionIndex].id]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];
    if (currentQuestion.is_speaking) {
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
      if (q.is_speaking) {
        const speakingVal = answers[q.id] || 0;
        totalScore += speakingVal;
      } else {
        const selectedOptIdx = answers[q.id];
        if (selectedOptIdx !== undefined) {
          totalScore += q.options[selectedOptIdx].score;
        }
      }
    });

    // Determine CEFR level details from helper
    const levelDetails = determineLevelDetails(totalScore);
    const determinedLevel = levelDetails.level;
    const levelDescription = levelDetails.description;
    const programRecommendation = levelDetails.programRecommendation;
    const studyTimeAdvice = levelDetails.studyTimeAdvice;

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

      const response = await fetch("/api/placement-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Gagal menyimpan hasil tes");
      }

      const { data } = await response.json();

      posthog.capture("placement_test_completed", {
        score: totalScore,
        level: determinedLevel,
        total_questions: QUESTIONS.length,
      });
      setFinalResult({
        score: totalScore,
        level: determinedLevel,
        description: levelDescription,
        programRecommendation,
        studyTimeAdvice,
        id: data?.id || "N/A"
      });
      setStep(3);
    } catch (err) {
      console.error("Gagal menyimpan hasil tes penempatan:", err);
      posthog.capture("placement_test_completed", {
        score: totalScore,
        level: determinedLevel,
        total_questions: QUESTIONS.length,
      });
      // Fallback local display even if DB insert fails
      setFinalResult({
        score: totalScore,
        level: determinedLevel,
        description: levelDescription,
        programRecommendation,
        studyTimeAdvice,
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
      <main style={{ minHeight: "100vh", backgroundColor: "var(--color-gray-50)", padding: "3.5rem 1rem 6rem" }} className="placement-test-page">
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
                <div className="placement-info-card">
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>{QUESTIONS.length || 20} Soal</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Pilihan ganda interaktif</p>
                </div>
                <div className="placement-info-card">
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>Instan</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Rekomendasi level belajar</p>
                </div>
                <div className="placement-info-card">
                  <h3 style={{ fontWeight: "800", color: "var(--color-primary)" }}>Resmi</h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "4px" }}>Sertifikat digital & ulasan</p>
                </div>
              </div>

              <Button 
                variant="primary" 
                style={{ 
                  padding: "1rem 2.5rem", 
                  fontSize: "1.1rem", 
                  borderRadius: "50px", 
                  fontWeight: "800", 
                  boxShadow: questions.length === 0 && !loadingQuestions ? "none" : "0 10px 20px rgba(33, 108, 126, 0.25)",
                  opacity: loadingQuestions || (questions.length === 0 && !loadingQuestions) ? 0.6 : 1,
                  cursor: loadingQuestions ? "wait" : questions.length === 0 && !loadingQuestions ? "not-allowed" : "pointer",
                  backgroundColor: questions.length === 0 && !loadingQuestions ? "var(--color-gray-350)" : undefined,
                  borderColor: questions.length === 0 && !loadingQuestions ? "var(--color-gray-350)" : undefined,
                  color: questions.length === 0 && !loadingQuestions ? "var(--color-gray-500)" : undefined
                }} 
                onClick={handleStartTest}
                disabled={loadingQuestions || (questions.length === 0 && !loadingQuestions)}
              >
                <span>
                  {loadingQuestions 
                    ? "Menyiapkan Lembar Soal AI..." 
                    : questions.length === 0 
                      ? "Gagal Memuat Soal AI (Pastikan Server AI Aktif)" 
                      : "Mulai Tes Penempatan Sekarang"}
                </span>
              </Button>
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
                <FormInput
                  label="Nama Lengkap Anda"
                  type="text"
                  name="fullName"
                  placeholder="Contoh: Husni Tausman"
                  value={userData.fullName}
                  onChange={handleInputChange}
                  required
                />

                <FormInput
                  label="Alamat Email Aktif"
                  type="email"
                  name="email"
                  placeholder="Contoh: nama@domain.com"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />

                <FormInput
                  label="Nomor WhatsApp Aktif (Untuk Pengiriman Hasil Kelas)"
                  type="tel"
                  name="whatsapp"
                  placeholder="Contoh: 08123456789"
                  value={userData.whatsapp}
                  onChange={handleInputChange}
                  required
                  helperText="* Pastikan nomor WhatsApp diisi dengan benar agar tutor kami dapat mengirimkan ulasan khusus."
                />

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

                {QUESTIONS[currentQuestionIndex].is_audio && (
                  <div className="speaking-mic-container">
                    <button
                      type="button"
                      onClick={() => playListeningAudio(QUESTIONS[currentQuestionIndex].audio_text || "")}
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

                {QUESTIONS[currentQuestionIndex].is_speaking ? (
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
                      &ldquo;{QUESTIONS[currentQuestionIndex].target_sentence}&rdquo;
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
                        <p style={{ fontWeight: "600", color: "var(--color-gray-800)" }}>&ldquo;{transcribedText}&rdquo;</p>
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
              <div className="placement-result-card">
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
                  <div className="result-sub-box">
                    <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Skor Capaian</p>
                    <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-primary)" }}>{finalResult.score} <span style={{ fontSize: "1.1rem", color: "var(--color-gray-400)" }}>/ {QUESTIONS.length}</span></p>
                  </div>
                  <div className="result-sub-box">
                    <p style={{ fontSize: "0.8rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-gray-500)" }}>Rekomendasi Tingkat</p>
                    <p style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-accent)" }}>{finalResult.level}</p>
                  </div>
                </div>

                <div style={{ maxWidth: "550px", margin: "0 auto 2rem", padding: "0 1.5rem" }}>
                  <p style={{ fontSize: "0.95rem", color: "var(--color-gray-700)", lineHeight: "1.6", fontWeight: "600" }}>
                    &ldquo;{finalResult.description}&rdquo;
                  </p>
                </div>

                {/* Program & Study Time Recommendations */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", maxWidth: "550px", margin: "0 auto 2.5rem", padding: "0 1.5rem" }}>
                  <div className="rec-card-primary">
                    <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--color-primary-dark)", marginBottom: "6px", letterSpacing: "0.5px" }}>🎓 Program yang Direkomendasikan</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-primary-dark)", lineHeight: "1.4" }}>{finalResult.programRecommendation}</p>
                  </div>
                  <div className="rec-card-accent">
                    <p style={{ fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "6px", letterSpacing: "0.5px" }}>⏱️ Saran Waktu Belajar</p>
                    <p className="rec-card-accent-text">{finalResult.studyTimeAdvice}</p>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 1.5rem" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Tanggal Terbit:</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>{issueDateStr}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", margin: "0" }}>Nomor Verifikasi:</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)", textTransform: "uppercase" }}>IBRA-OPT-{finalResult.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
                <Button
                  href={getWhatsAppURL()}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  style={{ display: "flex", gap: "0.5rem", alignItems: "center", textDecoration: "none", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span>Daftar Kelas via WhatsApp</span>
                </Button>

                <Button onClick={handlePrint} variant="placement-action" style={{ display: "flex", gap: "0.5rem", alignItems: "center", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Cetak Sertifikat</span>
                </Button>

                <Button onClick={() => { setStep(0); setAnswers({}); setCurrentQuestionIndex(0); }} variant="placement-action" style={{ padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
                  Ulangi Tes
                </Button>

                <Button href="/" variant="placement-action" style={{ display: "flex", gap: "0.5rem", alignItems: "center", textDecoration: "none", padding: "0.85rem 2rem", borderRadius: "50px", fontWeight: "700" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  <span>Keluar Tes</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PRINT-ONLY VIEW FOR THE STATEMENT OF RESULT */}
      {step === 3 && finalResult && (
        <div className="print-only">
          <div style={{ backgroundColor: "white", padding: "2.5cm", border: "10px double #A68849", textAlign: "center", fontFamily: "Georgia, serif" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <img src="/assets/logo.png" alt="Ibra Logo" style={{ width: "60px", height: "64px" }} />
              <div style={{ textAlign: "left" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "900", margin: "0", letterSpacing: "1px", color: "black" }}>IBRA GLOBAL ENGLISH</h2>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "#A68849", margin: "0", letterSpacing: "2px" }}>BELAJAR SERU, LANCAR BICARA</p>
              </div>
            </div>
            <hr style={{ borderColor: "#A68849" }} />
            <h3 style={{ fontStyle: "italic", fontSize: "1.2rem", margin: "1.5rem 0" }}>Placement Test Statement of Result</h3>
            <p style={{ margin: "2rem 0" }}>Sertifikat digital ini diberikan secara resmi kepada:</p>
            <h1 style={{ fontSize: "2.4rem", fontWeight: "900", color: "#216c7e", margin: "1.5rem 0" }}>{userData.fullName}</h1>
            <p style={{ margin: "2rem 0" }}>untuk menyelesaikan ujian evaluasi kompetensi Bahasa Inggris umum online.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "3cm", margin: "2.5rem 0" }}>
              <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
                <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem" }}>SKOR CAPAIAN</p>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0" }}>{finalResult.score} / {QUESTIONS.length}</p>
              </div>
              <div style={{ border: "1px solid #ddd", padding: "1rem", minWidth: "4cm" }}>
                <p style={{ fontSize: "0.8rem", margin: "0 0 0.5rem" }}>REKOMENDASI TINGKAT</p>
                <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0" }}>{finalResult.level}</p>
              </div>
            </div>
            <p style={{ fontStyle: "italic", margin: "2rem 0", lineHeight: "1.6" }}>&ldquo;{finalResult.description}&rdquo;</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4cm" }}>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: "0.8rem", margin: "0" }}>Tanggal Terbit:</p>
                <p style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{issueDateStr}</p>
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
