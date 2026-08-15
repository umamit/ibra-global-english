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
  profiles?: any;
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
        .order("name");

      if (errS) throw errS;

      const { data: parentData, error: errP } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .in("role", ["parent", "student"])
        .order("full_name");

      if (errP) throw errP;

      setStudents((studentData as any) || []);
      setParents((parentData as any) || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memuat data siswa/orang tua.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchRegistrations = useCallback(async () => {
    setRegLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: any) {
      console.warn("Gagal memuat pendaftaran:", err.message);
    } finally {
      setRegLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    fetchRegistrations();
  }, [fetchData, fetchRegistrations]);

  const handleUpdateStudentProgram = async (studentId: string, newProgram: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ program: newProgram })
        .eq("id", studentId);
      if (error) throw error;
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, program: newProgram } : s))
      );
    } catch (err: any) {
      alert("Gagal memperbarui level siswa: " + err.message);
    }
  };

  const handleApprove = async (reg: Registration) => {
    if (!confirm(`Setujui pendaftaran "${reg.student_name}"? Data siswa akan otomatis ditambahkan.`)) return;
    try {
      const res = await fetch("/api/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reg.id, status: "approved" }),
      });
      const result = await res.json();
      if (!res.ok || result.success === false) {
        alert(` Gagal: ${result.error || "Gagal menyetujui pendaftaran."}`);
        return;
      }
      fetchRegistrations();
      fetchData();
      posthog.capture("student_registration_approved", { program: reg.program });
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
      posthog.capture("student_registration_rejected", { program: reg?.program });
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteStudent = async (id: string, sName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data siswa "${sName}"?`)) return;
    try {
      const { error: errDel } = await supabase.from("students").delete().eq("id", id);
      if (errDel) throw errDel;
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return {
    students,
    parents,
    registrations,
    loading,
    regLoading,
    errorMsg,
    waSendingId,
    waFeedback,
    fetchData,
    fetchRegistrations,
    handleApprove,
    handleReject,
    handleDeleteStudent,
    handleUpdateStudentProgram,
  };
}
