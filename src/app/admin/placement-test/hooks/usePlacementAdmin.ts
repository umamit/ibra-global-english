"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Submission {
  id: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  score: number;
  level: string;
  status: string;
  created_at: string;
}

export interface Metrics {
  total: number;
  pending: number;
  contacted: number;
  enrolled: number;
}

export function usePlacementAdmin() {
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [followUpStudent, setFollowUpStudent] = useState<Submission | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState<string>("");
  const [followUpAiLoading, setFollowUpAiLoading] = useState<boolean>(false);
  const [aiConnectionStatus, setAiConnectionStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [aiDiagnosticMessage, setAiDiagnosticMessage] = useState<string>("");
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, pending: 0, contacted: 0, enrolled: 0 });

  const calculateMetrics = (data: Submission[]) => {
    setMetrics({
      total: data.length,
      pending: data.filter((s) => s.status === "pending").length,
      contacted: data.filter((s) => s.status === "contacted").length,
      enrolled: data.filter((s) => s.status === "enrolled").length,
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("placement_test_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
      calculateMetrics(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({ type: "error", text: "Gagal memuat data: " + msg });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const testAiConnection = async () => {
    setAiConnectionStatus("testing"); setAiDiagnosticMessage("");
    try {
      const res = await fetch("/api/admin/placement-test/regenerate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "ping" }) });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setAiConnectionStatus("success"); setAiDiagnosticMessage(data.message || "Groq AI sukses terhubung.");
      } else {
        setAiConnectionStatus("failed"); setAiDiagnosticMessage(data.message || "Gagal menghubungi AI (Kunci tidak valid/Limit habis).");
      }
    } catch (err: any) { setAiConnectionStatus("failed"); setAiDiagnosticMessage("Koneksi gagal: " + err.message); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("placement_test_submissions").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      setStatusMsg({ type: "success", text: `Status calon siswa berhasil diperbarui ke "${newStatus}"!` });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Gagal memperbarui status: " + msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data kuis milik "${name}"?`)) return;
    try {
      const { error } = await supabase.from("placement_test_submissions").delete().eq("id", id);
      if (error) throw error;
      setStatusMsg({ type: "success", text: "Data hasil kuis berhasil dihapus." });
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Gagal menghapus data: " + msg);
    }
  };

  const triggerWhatsAppFollowUp = (sub: Submission) => {
    const courseRecommendation = ["Beginner", "A1", "A2"].includes(sub.level)
      ? "Kids Program atau Fun Calistung"
      : ["Intermediate", "B1", "B2"].includes(sub.level)
        ? "Teens Program (Intermediate Class)"
        : "Teens Program (Advanced Class / TOEFL Prep)";
    const message = `Halo Kak ${sub.full_name}!\n\nKami dari *Ibra Global English Bobong* ingin mengucapkan selamat atas penyelesaian *Tes Penempatan Bahasa Inggris Online* Anda.\n\nBerikut hasil ringkasan tes Anda:\n *Rekomendasi Level:* ${sub.level}\n *Skor Tes:* ${sub.score} / 20\n *Program Belajar:* ${courseRecommendation}\n\nTutor kami sangat merekomendasikan Anda untuk bergabung bersama kami di tingkat ini guna mengembangkan kompetensi secara optimal. Apakah Kak ${sub.full_name} berminat berkonsultasi mengenai jadwal kelas dan penawaran biaya khusus? \n\nKami tunggu kehadirannya! `;
    setFollowUpStudent(sub);
    setFollowUpMessage(message);
  };

  const handleGenerateAiFollowUp = async () => {
    if (!followUpStudent) return;
    setFollowUpAiLoading(true);
    try {
      const courseRecommendation = ["Beginner", "A1", "A2"].includes(followUpStudent.level)
        ? "Kids Program atau Fun Calistung"
        : ["Intermediate", "B1", "B2"].includes(followUpStudent.level)
          ? "Teens Program (Intermediate Class)"
          : "Teens Program (Advanced Class / TOEFL Prep)";
      const res = await fetch("/api/admin/ai-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "placement-test-evaluation", payload: { name: followUpStudent.full_name, score: followUpStudent.score, level: followUpStudent.level, course: courseRecommendation } }) });
      const data = await res.json();
      if (res.ok && data.reply) { setFollowUpMessage(data.reply); }
      else { alert("Gagal membuat draf AI: " + (data.error || "Error tidak dikenal")); }
    } catch { alert("Gagal menghubungi server AI."); }
    finally { setFollowUpAiLoading(false); }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()) || s.whatsapp_number.includes(searchTerm);
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    const matchesLevel = levelFilter === "all" ? true : s.level === levelFilter;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => { if (cancelled) return; await fetchData(); await testAiConnection(); };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-submissions")
      .on("postgres_changes", { event: "*", schema: "public", table: "placement_test_submissions" }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return {
    submissions, filteredSubmissions, loading, statusMsg, metrics,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter, levelFilter, setLevelFilter,
    followUpStudent, setFollowUpStudent, followUpMessage, setFollowUpMessage, followUpAiLoading,
    aiConnectionStatus, aiDiagnosticMessage, testAiConnection,
    handleUpdateStatus, handleDelete, triggerWhatsAppFollowUp, handleGenerateAiFollowUp,
  };
}
