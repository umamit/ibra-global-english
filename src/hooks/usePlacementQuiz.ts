import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import {
  Question,
  PlacementResult,
  calculateSpeechAccuracy,
  determineLevelDetails,
} from "@/app/placement-test/placementHelpers";

export function usePlacementQuiz() {
  const supabase = createClient();

  const [theme, setTheme] = useState("light");
  const [step, setStep] = useState(0); // 0: Start/Intro, 1: Registration Form, 2: Quiz, 3: Success Result
  const [userData, setUserData] = useState({ fullName: "", email: "", whatsapp: "" });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(15);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTimeout(() => { setTheme(initialTheme); }, 0);
  }, []);

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
        console.warn("Gagal memuat soal dinamis.", e);
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
      alert("Browser Anda tidak mendukung Web Speech API.");
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
      setAnswers((prev) => ({ ...prev, [QUESTIONS[currentQuestionIndex].id]: point }));
    };

    recognition.onerror = (event: any) => {
      setRecognitionError(event.error === "not-allowed" ? "Izin mikrofon ditolak." : "Gagal merekam suara.");
      setIsRecording(false);
    };

    recognition.onend = () => { setIsRecording(false); };
    recognition.start();
  };

  const calculateAndSubmitResult = useCallback(async () => {
    setSubmitting(true);
    let totalScore = 0;

    QUESTIONS.forEach((q) => {
      if (q.is_speaking) {
        totalScore += answers[q.id] || 0;
      } else {
        const selectedOptIdx = answers[q.id];
        if (selectedOptIdx !== undefined && q.options[selectedOptIdx]) {
          totalScore += q.options[selectedOptIdx].score;
        }
      }
    });

    const levelDetails = determineLevelDetails(totalScore);
    const payload = {
      full_name: userData.fullName.trim(),
      email: userData.email.trim(),
      whatsapp_number: userData.whatsapp.trim(),
      score: totalScore,
      level: levelDetails.level,
      status: "pending",
      created_at: new Date().toISOString()
    };

    let serverId = "offline-mode";
    try {
      const response = await fetch("/api/placement-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const { data } = await response.json();
        if (data?.id) serverId = data.id;
      }
    } catch (err) {
      console.error("Gagal mengirimkan hasil:", err);
    }

    const resultObj: PlacementResult = {
      score: totalScore,
      level: levelDetails.level,
      description: levelDetails.description,
      programRecommendation: levelDetails.programRecommendation,
      studyTimeAdvice: levelDetails.studyTimeAdvice,
      id: serverId,
    };

    setFinalResult(resultObj);
    setSubmitting(false);
    posthog.capture("placement_test_completed", { score: totalScore, level: levelDetails.level });
    setStep(3);
  }, [QUESTIONS, answers, userData]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSecondsLeft(15);
      setTranscribedText("");
      setSpeakingScore(null);
    } else {
      calculateAndSubmitResult();
    }
  }, [currentQuestionIndex, QUESTIONS.length, calculateAndSubmitResult]);

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSecondsLeft(15);
      setTranscribedText("");
      setSpeakingScore(null);
    }
  };

  // Timer countdown 15s per question
  useEffect(() => {
    if (step !== 2 || QUESTIONS.length === 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, currentQuestionIndex, QUESTIONS.length, handleNextQuestion]);

  return {
    theme,
    toggleTheme,
    step,
    setStep,
    userData,
    handleInputChange,
    handleStartTest,
    handleRegister,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    questions,
    QUESTIONS,
    answers,
    setAnswers,
    handleOptionSelect,
    secondsLeft,
    setSecondsLeft,
    handleNextQuestion,
    handlePrevQuestion,
    submitting,
    finalResult,
    loadingQuestions,
    isAudioPlaying,
    playListeningAudio,
    isRecording,
    startSpeechRecognition,
    transcribedText,
    speakingScore,
    recognitionError,
    issueDateStr,
    calculateAndSubmitResult,
  };
}
