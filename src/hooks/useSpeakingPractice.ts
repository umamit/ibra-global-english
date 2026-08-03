"use client";

import { useState, useEffect, useRef } from "react";

export const PRACTICE_SENTENCES = [
  { id: 1, topic: "Penyapaan (Greetings)", text: "Hello! Good morning. How are you today?", translate: "Halo! Selamat pagi. Bagaimana kabarmu hari ini?" },
  { id: 2, topic: "Perkenalan (Introducing)", text: "My name is student and I am ten years old.", translate: "Nama saya siswa dan saya berumur sepuluh tahun." },
  { id: 3, topic: "Tentang Ibra (About Ibra)", text: "I love learning English at Ibra Global English Bobong.", translate: "Saya suka belajar bahasa Inggris di Ibra Global English Bobong." },
  { id: 4, topic: "Keseharian (Daily Habits)", text: "I speak English with my tutor and my friends in class.", translate: "Saya berbicara bahasa Inggris dengan tutor dan teman-teman saya di kelas." },
  { id: 5, topic: "Ungkapan (Expressions)", text: "Learning English is very easy, fun and exciting!", translate: "Belajar bahasa Inggris itu sangat mudah, menyenangkan dan seru!" }
];

export function useSpeakingPractice(student: any) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isListeningTTS, setIsListeningTTS] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const targetSentence = PRACTICE_SENTENCES[activeIdx].text.replace("student", student?.name || "Alex");

  function cleanString(str: string) {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  }

  function evaluateSpeech(spokenText: string) {
    const targetClean = cleanString(targetSentence);
    const spokenClean = cleanString(spokenText);

    const targetWords = targetClean.split(/\s+/).filter(Boolean);
    const spokenWords = spokenClean.split(/\s+/).filter(Boolean);

    if (targetWords.length === 0) return;

    let matches = 0;
    targetWords.forEach((word: string) => {
      if (spokenWords.includes(word)) {
        matches++;
      }
    });

    const accuracyScore = Math.round((matches / targetWords.length) * 100);
    setScore(accuracyScore);

    if (accuracyScore >= 90) {
      setFeedback("Sempurna! Pengucapan Anda sangat jelas dan fasih!");
    } else if (accuracyScore >= 75) {
      setFeedback("Sangat Bagus! Pengucapan sudah baik, terus berlatih beberapa kata lagi.");
    } else if (accuracyScore >= 50) {
      setFeedback("Cukup Baik! Cobalah dengarkan pelafalan tutor (tombol dengar) lalu rekam ulang.");
    } else {
      setFeedback("Semangat! Coba rekam ulang secara perlahan dan dekatkan mikrofon.");
    }
  }

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTimeout(() => setRecognitionSupported(false), 0);
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

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      evaluateSpeech(resultText);
    };

    rec.onerror = (event: any) => {
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
  }, [activeIdx, targetSentence]);

  const handleListenTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    utterance.lang = "en-US";
    
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith("en-"));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsListeningTTS(true);
    utterance.onend = () => setIsListeningTTS(false);
    utterance.onerror = () => setIsListeningTTS(false);

    window.speechSynthesis.speak(utterance);
  };

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

  return {
    activeIdx, setActiveIdx, isRecording, transcript, score, feedback,
    isListeningTTS, recognitionSupported, targetSentence, handleListenTTS, handleToggleRecord
  };
}
