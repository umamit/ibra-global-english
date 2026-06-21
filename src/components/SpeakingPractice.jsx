"use client";

import { useState, useEffect, useRef } from "react";

const PRACTICE_SENTENCES = [
  { id: 1, topic: "Penyapaan (Greetings)", text: "Hello! Good morning. How are you today?", translate: "Halo! Selamat pagi. Bagaimana kabarmu hari ini?" },
  { id: 2, topic: "Perkenalan (Introducing)", text: "My name is student and I am ten years old.", translate: "Nama saya siswa dan saya berumur sepuluh tahun." },
  { id: 3, topic: "Tentang Ibra (About Ibra)", text: "I love learning English at Ibra Global English Bobong.", translate: "Saya suka belajar bahasa Inggris di Ibra Global English Bobong." },
  { id: 4, topic: "Keseharian (Daily Habits)", text: "I speak English with my tutor and my friends in class.", translate: "Saya berbicara bahasa Inggris dengan tutor dan teman-teman saya di kelas." },
  { id: 5, topic: "Ungkapan (Expressions)", text: "Learning English is very easy, fun and exciting!", translate: "Belajar bahasa Inggris itu sangat mudah, menyenangkan dan seru!" }
];

export default function SpeakingPractice({ student }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isListeningTTS, setIsListeningTTS] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsRecording(true);
      setTranscript("");
      setScore(null);
      setFeedback("");
    };

    rec.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      evaluateSpeech(resultText);
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error === "not-allowed") {
        alert("Akses mikrofon ditolak! Harap izinkan akses mikrofon di pengaturan browser Anda.");
      } else {
        setFeedback("Terjadi kesalahan mikrofon. Silakan coba rekam kembali.");
      }
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
  }, [activeIdx]);

  const targetSentence = PRACTICE_SENTENCES[activeIdx].text.replace("student", student?.name || "Alex");

  // Speak the target sentence (Text-to-Speech)
  const handleListenTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    utterance.lang = "en-US";
    
    // Select an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith("en-"));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsListeningTTS(true);
    utterance.onend = () => setIsListeningTTS(false);
    utterance.onerror = () => setIsListeningTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Recording (Speech-to-Text)
  const handleToggleRecord = () => {
    if (!recognitionSupported) {
      alert("Browser Anda tidak mendukung fitur perekaman suara. Gunakan Google Chrome atau Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Clean strings helper
  const cleanString = (str) => {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  };

  // Grade student pronunciation based on word match
  const evaluateSpeech = (spokenText) => {
    const targetClean = cleanString(targetSentence);
    const spokenClean = cleanString(spokenText);

    const targetWords = targetClean.split(/\s+/).filter(Boolean);
    const spokenWords = spokenClean.split(/\s+/).filter(Boolean);

    if (targetWords.length === 0) return;

    let matches = 0;
    targetWords.forEach(word => {
      if (spokenWords.includes(word)) {
        matches++;
      }
    });

    const accuracyScore = Math.round((matches / targetWords.length) * 100);
    setScore(accuracyScore);

    // Provide feedback
    if (accuracyScore >= 90) {
      setFeedback("🤩 Sempurna! Pengucapan Anda sangat jelas dan fasih!");
    } else if (accuracyScore >= 75) {
      setFeedback("😊 Sangat Bagus! Pengucapan sudah baik, terus berlatih beberapa kata lagi.");
    } else if (accuracyScore >= 50) {
      setFeedback("👍 Cukup Baik! Cobalah dengarkan pelafalan tutor (tombol dengar) lalu rekam ulang.");
    } else {
      setFeedback("💪 Semangat! Coba rekam ulang secara perlahan dan dekatkan mikrofon.");
    }
  };

  return (
    <div className="portal-card" style={{ padding: "2.5rem 2rem", maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>
          🎙️ AI English Speaking Practice
        </h3>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginTop: "4px" }}>
          Latih pengucapan bahasa Inggris Anda secara mandiri di rumah dan dapatkan penilaian instan!
        </p>
      </div>

      {/* Topic Switcher Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
        {PRACTICE_SENTENCES.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveIdx(idx);
              setTranscript("");
              setScore(null);
              setFeedback("");
              if (isRecording) recognitionRef.current?.stop();
            }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "1px solid var(--color-gray-250)",
              fontSize: "0.75rem",
              fontWeight: "800",
              backgroundColor: activeIdx === idx ? "var(--color-primary)" : "white",
              color: activeIdx === idx ? "white" : "var(--color-gray-600)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {item.topic}
          </button>
        ))}
      </div>

      {/* Target Sentence Box */}
      <div style={{
        backgroundColor: "var(--color-gray-50)",
        border: "1.5px solid var(--color-gray-150)",
        padding: "1.75rem",
        borderRadius: "14px",
        textAlign: "center",
        position: "relative",
        marginBottom: "2rem"
      }}>
        <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--color-primary)", textTransform: "uppercase", backgroundColor: "white", padding: "3px 10px", borderRadius: "20px", border: "1px solid var(--color-primary-light)", position: "absolute", top: "0", left: "50%", transform: "translate(-50%, -50%)" }}>
          Kalimat Target
        </span>
        
        <p style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--color-gray-900)", lineHeight: "1.5", margin: "0.5rem 0" }}>
          "{targetSentence}"
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontStyle: "italic", margin: 0 }}>
          {PRACTICE_SENTENCES[activeIdx].translate}
        </p>

        {/* TTS Pronounce Button */}
        <button
          onClick={handleListenTTS}
          disabled={isListeningTTS}
          style={{
            marginTop: "1.25rem",
            padding: "0.45rem 1.15rem",
            fontSize: "0.8rem",
            fontWeight: "800",
            backgroundColor: "white",
            border: "1px solid var(--color-gray-300)",
            color: "var(--color-primary)",
            borderRadius: "30px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s"
          }}
        >
          {isListeningTTS ? (
            <>
              <span className="tts-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-primary)", display: "inline-block" }} />
              <span>Mendengarkan...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <span>Dengar Contoh Pengucapan</span>
            </>
          )}
        </button>
      </div>

      {/* Recording Area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Pulsing Mic Button */}
        <div style={{ position: "relative" }}>
          {isRecording && (
            <div style={{
              position: "absolute",
              inset: "-12px",
              borderRadius: "50%",
              border: "3px solid #ef4444",
              animation: "mic-ping 1.5s infinite"
            }} />
          )}
          <button
            onClick={handleToggleRecord}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: isRecording ? "#ef4444" : "var(--color-primary)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              transition: "all 0.3s"
            }}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            )}
          </button>
        </div>

        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: isRecording ? "#ef4444" : "var(--color-gray-500)" }}>
          {isRecording ? "🔴 PEREKAMAN AKTIF - Ucapkan Kalimat Di Atas..." : "Ketuk Mikrofon untuk Mulai Perekaman"}
        </span>

        {/* Results Block */}
        {transcript && (
          <div style={{
            width: "100%",
            padding: "1.25rem",
            backgroundColor: "white",
            border: "1.5px solid var(--color-gray-150)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <p style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--color-gray-400)", textTransform: "uppercase", marginBottom: "4px" }}>Hasil Transkrip Suara Anda</p>
            <p style={{ fontSize: "1.05rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0, fontStyle: "italic" }}>
              "{transcript}"
            </p>
          </div>
        )}

        {/* Score Ring Visualization */}
        {score !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", width: "100%", padding: "1.5rem", borderRadius: "12px", border: `1.5px solid ${score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}33`, backgroundColor: `${score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}07` }}>
            <div style={{ position: "relative", width: "70px", height: "70px" }}>
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="#e2e8f0" strokeWidth="5.5" />
                <circle
                  cx="35" cy="35" r="28"
                  fill="none"
                  stroke={score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="5.5"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - score / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyCenter: "center", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: "900", color: score >= 75 ? "#10b981" : score >= 50 ? "#d97706" : "#dc2626" }}>{score}%</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-gray-900)" }}>Akurasi Pelafalan</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "4px", lineHeight: "1.4" }}>
                {feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Global CSS for mic animation */}
      <style jsx>{`
        @keyframes mic-ping {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes tts-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0.4; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .tts-pulse {
          animation: tts-pulse 1.2s infinite;
        }
      `}</style>
    </div>
  );
}
