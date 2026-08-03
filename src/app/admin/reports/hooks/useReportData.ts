"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";
import { Student, Report } from "@/types";

export function useReportData() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [printReport, setPrintReport] = useState<Report | null>(null);
  const [contactAddress, setContactAddress] = useState<string>(
    "Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794"
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Form State
  const [studentId, setStudentId] = useState<string>("");
  const [exportFilterId, setExportFilterId] = useState<string>("");
  const [selectedStudentProgram, setSelectedStudentProgram] = useState<string>("");
  const [moduleName, setModuleName] = useState<string>("");
  const [speakingScore, setSpeakingScore] = useState<string>("");
  const [grammarScore, setGrammarScore] = useState<string>("");
  const [vocabularyScore, setVocabularyScore] = useState<string>("");
  const [activeScore, setActiveScore] = useState<string>("");
  const [tutorNotes, setTutorNotes] = useState<string>("");

  // AI State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiProgressLoading, setAiProgressLoading] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiFocus, setAiFocus] = useState<string>("");
  const [aiAchievements, setAiAchievements] = useState<string>("");
  const [aiChallenges, setAiChallenges] = useState<string>("");

  // Rubric Modal
  const [isRubricModalOpen, setIsRubricModalOpen] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: studentData, error: errS } = await supabase
        .from("students").select("id, name, program").order("name", { ascending: true });
      if (errS) throw errS;
      setStudents(studentData || []);

      const { data: reportData, error: errR } = await supabase
        .from("reports")
        .select(`id, student_id, module_name, speaking_score, grammar_score, vocabulary_score, active_score, tutor_notes, created_at, students (id, name, program, age)`)
        .order("created_at", { ascending: false });
      if (errR) throw errR;
      setReports((reportData as any[]) || []);

      const { data: settingsData } = await supabase
        .from("landing_settings").select("value").eq("key", "contact_address").maybeSingle();
      if (settingsData?.value) setContactAddress(settingsData.value);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + err.message });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const handleApplyRubricScores = (
    scores: { speaking: number; grammar: number; vocabulary: number; active: number },
    notes: string
  ) => {
    setSpeakingScore(String(scores.speaking));
    setGrammarScore(String(scores.grammar));
    setVocabularyScore(String(scores.vocabulary));
    setActiveScore(String(scores.active));
    setTutorNotes(notes);
    setStatusMsg({ type: "success", text: "Nilai dan draf catatan deskriptif berhasil diterapkan dari rubrik indikator!" });
  };

  const handleGenerateAiNotes = async () => {
    if (!studentId) { alert("Harap pilih siswa terlebih dahulu!"); return; }
    const studentObj = students.find((s) => s.id === studentId);
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "auto-draft", payload: { name: studentObj?.name || "Siswa", program: studentObj?.program || "General English", module_name: moduleName, speaking: speakingScore || 80, grammar: grammarScore || 80, vocabulary: vocabularyScore || 80, active: activeScore || 80 } }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setTutorNotes(data.reply);
        posthog.capture("admin_ai_notes_generated", { program: studentObj?.program });
      } else {
        alert(`Gagal menulis catatan: ${data.error || "Error tidak diketahui"}`);
      }
    } catch { alert("Gagal menghubungi server AI."); }
    finally { setAiLoading(false); }
  };

  const handleOpenAiModal = () => {
    if (!studentId) { alert("Harap pilih siswa terlebih dahulu!"); return; }
    setAiFocus(moduleName || ""); setAiAchievements(""); setAiChallenges("");
    setIsAiModalOpen(true);
  };

  const handleGenerateAiProgressReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    const studentObj = students.find((s) => s.id === studentId);
    const thisMonth = new Date().toLocaleString("id-ID", { month: "long" });
    setAiProgressLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "progress-report-draft", payload: { name: studentObj?.name || "Siswa", program: studentObj?.program || "General English", month: thisMonth, focus_areas: aiFocus.trim() || "Materi harian sesuai silabus", achievements: aiAchievements.trim() || "Mengikuti kelas dengan baik", challenges: aiChallenges.trim() || "Perlu latihan lebih mandiri di rumah" } }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setTutorNotes(data.reply);
        posthog.capture("admin_ai_progress_report_generated", { program: studentObj?.program });
        setIsAiModalOpen(false);
      } else { alert(`Gagal membuat draf laporan: ${data.error || "Error tidak diketahui"}`); }
    } catch { alert("Gagal menghubungi server AI."); }
    finally { setAiProgressLoading(false); }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: "", text: "" }); setSubmitting(true);
    if (!studentId || !moduleName.trim() || !speakingScore || !grammarScore || !vocabularyScore || !activeScore) {
      setStatusMsg({ type: "error", text: "Mohon lengkapi semua isian formulir rapor." }); setSubmitting(false); return;
    }
    const speak = parseInt(speakingScore), gram = parseInt(grammarScore), vocab = parseInt(vocabularyScore), active = parseInt(activeScore);
    if ([speak, gram, vocab, active].some((n) => n < 0 || n > 100)) {
      setStatusMsg({ type: "error", text: "Semua nilai harus berada di skala 0-100." }); setSubmitting(false); return;
    }
    try {
      const { error } = await supabase.from("reports").insert({ student_id: studentId, module_name: moduleName.trim(), speaking_score: speak, grammar_score: gram, vocabulary_score: vocab, active_score: active, tutor_notes: tutorNotes.trim() || null });
      if (error) throw error;
      posthog.capture("admin_report_created", { program: selectedStudentProgram, module_name: moduleName.trim(), avg_score: Math.round((speak + gram + vocab + active) / 4) });
      setStatusMsg({ type: "success", text: "Rapor digital berhasil diterbitkan!" });
      setStudentId(""); setModuleName(""); setSpeakingScore(""); setGrammarScore(""); setVocabularyScore(""); setActiveScore(""); setTutorNotes("");
      fetchData();
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Gagal menerbitkan rapor: " + err.message });
    } finally { setSubmitting(false); }
  };

  const handleDeleteReport = async (id: string, mName: string, sName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus rapor "${mName}" milik siswa "${sName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const { error } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) { alert("Gagal menghapus rapor: " + err.message); }
  };

  const triggerPrint = (report: Report) => {
    setPrintReport(report);
    setTimeout(() => {
      document.body.classList.add("print-raport");
      window.print();
      const cleanup = () => { document.body.classList.remove("print-raport"); window.removeEventListener("afterprint", cleanup); };
      window.addEventListener("afterprint", cleanup);
    }, 800);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => { if (cancelled) return; fetchData(); };
    load();
    return () => { cancelled = true; };
  }, []);

  return {
    students, reports, printReport, setPrintReport, contactAddress,
    loading, submitting, statusMsg,
    studentId, setStudentId, exportFilterId, setExportFilterId,
    selectedStudentProgram, setSelectedStudentProgram,
    moduleName, setModuleName, speakingScore, setSpeakingScore,
    grammarScore, setGrammarScore, vocabularyScore, setVocabularyScore,
    activeScore, setActiveScore, tutorNotes, setTutorNotes,
    aiLoading, aiProgressLoading, isAiModalOpen, setIsAiModalOpen,
    aiFocus, setAiFocus, aiAchievements, setAiAchievements,
    aiChallenges, setAiChallenges, isRubricModalOpen, setIsRubricModalOpen,
    handleApplyRubricScores, handleGenerateAiNotes, handleOpenAiModal,
    handleGenerateAiProgressReport, handleCreateReport, handleDeleteReport, triggerPrint,
  };
}
