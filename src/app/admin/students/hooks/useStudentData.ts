"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

export interface Profile {
  id: string;
  full_name: string;
  email?: string | null;
  role?: string | null;
  created_at?: string;
  [key: string]: any;
}

export interface StudentItem {
  id: string;
  name: string;
  age: number;
  program: string;
  status?: string | null;
  parent_id?: string | null;
  profiles?: Profile | null;
  [key: string]: any;
}

export interface Registration {
  id: string;
  student_name: string;
  student_age?: number | null;
  program: string;
  parent_name?: string | null;
  parent_email?: string | null;
  whatsapp: string;
  created_at: string;
  status: string;
  notes?: string | null;
  [key: string]: any;
}

export function useStudentData() {
  const supabase = createClient();

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [waSendingId, setWaSendingId] = useState<string | null>(null);
  const [waFeedback, setWaFeedback] = useState<{ id: string | null; success: boolean | null; msg: string }>({
    id: null, success: null, msg: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: studentData, error: errS } = await supabase
        .from("students")
        .select(`id, name, age, program, status, parent_id, profiles (id, full_name)`)
        .order("name", { ascending: true });
      if (errS) throw errS;
      setStudents((studentData as any[]) || []);

      const { data: parentData, error: errP } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("full_name", { ascending: true });
      if (errP) throw errP;
      setParents((parentData as Profile[]) || []);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchRegistrations = useCallback(async () => {
    setRegLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/register", { credentials: "include", cache: "no-store" });
      const result = await res.json().catch(() => null);
      if (!res.ok) {
        const serverError = (result && result.error) || `Gagal memuat data pendaftaran (HTTP ${res.status})`;
        const serverDetails = result && result.details ? `\n\nDetail: ${result.details}` : "";
        setErrorMsg(`${serverError}${serverDetails}`);
        setRegistrations([]);
        return;
      }
      setRegistrations(result?.data || []);
    } catch (err) {
      console.error("Gagal memuat data pendaftaran:", err);
      setErrorMsg("Terjadi kesalahan jaringan saat memuat data pendaftaran.");
      setRegistrations([]);
    } finally {
      setRegLoading(false);
    }
  }, []);

  const handleApprove = async (reg: Registration) => {
    if (!confirm(`Setujui pendaftaran "${reg.student_name}"? Data siswa akan otomatis ditambahkan dan notifikasi WhatsApp akan dikirim.`)) return;
    try {
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reg.id, status: "approved" }),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        const errText = result.error || "Gagal menyetujui pendaftaran.";
        const details = result.details ? `\n\nDetail: ${result.details}` : "";
        const hint = result.hint ? `\n\nSaran: ${result.hint}` : "";
        alert(` ${errText}${details}${hint}`);
        return;
      }
      if (result.message) {
        setWaFeedback({ id: reg.id, success: true, msg: ` ${result.message}` });
        setTimeout(() => setWaFeedback({ id: null, success: null, msg: "" }), 5000);
      }
      fetchRegistrations();
      fetchData();
      posthog.capture("student_registration_approved", { program: reg.program });

      // Send WA notification
      const waNumber = reg.whatsapp.replace(/[^0-9]/g, "");
      const msg = `Assalamu'alaikum, Bapak/Ibu ${reg.parent_name || "Wali"}! \n\nPendaftaran *${reg.student_name}* ke program *${reg.program}* di *Ibra Global English Bobong* telah kami *SETUJUI* .\n\nKami akan segera menghubungi Anda untuk informasi jadwal belajar perdana. Terima kasih telah mempercayakan pendidikan anak kepada kami! \n\n_Tim Ibra Global English_`;
      setWaSendingId(reg.id);
      const waRes = await fetch("/api/whatsapp-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waNumber, message: msg, type: "approval" }),
      });
      const waData = await waRes.json();
      setWaSendingId(null);

      if (waData.sentReal) {
        setWaFeedback({ id: reg.id, success: true, msg: " Notifikasi WA berhasil terkirim via Fonnte!" });
      } else if (waData.status === "SIMULATED") {
        setWaFeedback({ id: reg.id, success: null, msg: "️ WA disimulasikan (token Fonnte belum aktif). Cek log di /admin/whatsapp." });
      } else {
        setWaFeedback({ id: reg.id, success: false, msg: " Gagal kirim WA via Fonnte. Cek konfigurasi token." });
      }
      setTimeout(() => setWaFeedback({ id: null, success: null, msg: "" }), 5000);
    } catch (err: any) {
      alert(` Terjadi kesalahan: ${err.message}`);
    }
  };

  const handleReject = async (rejectModalId: string, rejectNotes: string) => {
    const reg = registrations.find((r) => r.id === rejectModalId);
    try {
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: rejectModalId, status: "rejected", notes: rejectNotes }),
      });
      if (!res.ok) throw new Error("Gagal menolak pendaftaran.");

      if (reg?.whatsapp) {
        const waNumber = reg.whatsapp.replace(/[^0-9]/g, "");
        const alasan = rejectNotes?.trim() ? `\n\nAlasan: _${rejectNotes.trim()}_` : "";
        const msg = `Assalamu'alaikum, Bapak/Ibu ${reg.parent_name || "Wali"}.\n\nMohon maaf, pendaftaran *${reg.student_name}* ke program *${reg.program}* di *Ibra Global English Bobong* belum dapat kami proses saat ini.${alasan}\n\nJika ada pertanyaan, silakan hubungi kami kembali.\n\n_Tim Ibra Global English_`;
        fetch("/api/whatsapp-simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: waNumber, message: msg, type: "rejection" }),
        }).catch(console.error);
      }
      posthog.capture("student_registration_rejected", { program: reg?.program });
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteStudent = async (id: string, sName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa "${sName}"? Semua data absensi dan rapor yang terhubung juga akan dihapus secara permanen.`)) return;
    try {
      const { data: student, error: errGet } = await supabase.from("students").select("parent_id").eq("id", id).single();
      if (errGet && errGet.code !== "PGRST116") throw errGet;
      const linkedUserId = student?.parent_id;
      const { error: errDel } = await supabase.from("students").delete().eq("id", id);
      if (errDel) throw errDel;
      if (linkedUserId) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", linkedUserId).single();
        if (profile?.role === "student") {
          const resAuth = await fetch("/api/admin/delete-user", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: linkedUserId }),
          });
          if (!resAuth.ok) {
            const errData = await resAuth.json();
            console.warn("Gagal menghapus akun login:", errData.error);
          }
        }
      }
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus siswa: " + err.message);
    }
  };

  const handleDeleteParent = async (userId: string, userName: string) => {
    const connectedCount = students.filter((s) => s.parent_id === userId).length;
    const extraWarning = connectedCount > 0 ? `\n\nPeringatan: Akun ini terhubung ke ${connectedCount} siswa.` : "";
    if (!confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${userName}" secara permanen?${extraWarning}`)) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal menghapus akun.");
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus akun pengguna: " + err.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah peran pengguna ini menjadi '${newRole}'?`)) return;
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal mengubah peran.");
      alert("Peran berhasil diperbarui!");
      fetchData();
    } catch (err: any) {
      alert("Gagal mengubah peran: " + err.message);
    }
  };

  const handleExportStudentsCSV = (studentList: StudentItem[]) => {
    if (studentList.length === 0) { alert("Tidak ada data siswa untuk diekspor."); return; }
    const headers = "No,Nama Siswa,Usia,Program Kursus,Status,Orang Tua,Email Orang Tua\n";
    const rows = studentList.map((s, idx) => {
      const pName = s.profiles?.full_name || "-";
      const pEmail = s.profiles?.email || "-";
      return `"${idx + 1}","${s.name}","${s.age}","${s.program}","${s.status || "aktif"}","${pName}","${pEmail}"`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `Daftar_Siswa_Ibra_Global_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
      await fetchRegistrations();
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("realtime-students-mgmt")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => fetchRegistrations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return {
    students, parents, registrations,
    loading, regLoading, errorMsg,
    waSendingId, waFeedback,
    fetchData, fetchRegistrations,
    handleApprove, handleReject,
    handleDeleteStudent, handleDeleteParent,
    handleUpdateRole, handleExportStudentsCSV,
  };
}
