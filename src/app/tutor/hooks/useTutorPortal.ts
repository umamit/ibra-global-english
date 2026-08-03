import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/utils/supabase/client";
import { Student, LmsMaterial, LmsSubmission } from "@/types";

export interface AttendanceEntry {
  status: string;
  notes: string;
  isExisting?: boolean;
}

export interface Toast {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export function useTutorPortal() {
  const router = useRouter();
  const supabase = createClient();
  const adminSupabase = createServiceRoleClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [tutorName, setTutorName] = useState<string>("Tutor Pendamping");
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("attendance");

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceEntry>>({});
  const [toast, setToast] = useState<Toast>({ show: false, message: "", type: "success" });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [moduleName, setModuleName] = useState<string>("");
  const [speakingScore, setSpeakingScore] = useState<number>(85);
  const [grammarScore, setGrammarScore] = useState<number>(85);
  const [vocabularyScore, setVocabularyScore] = useState<number>(85);
  const [activeScore, setActiveScore] = useState<number>(85);
  const [tutorNotes, setTutorNotes] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportsList, setReportsList] = useState<Record<string, unknown>[]>([]);
  const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);

  const [lmsMaterials, setLmsMaterials] = useState<LmsMaterial[]>([]);
  const [lmsTitle, setLmsTitle] = useState<string>("");
  const [lmsDesc, setLmsDesc] = useState<string>("");
  const [lmsProgram, setLmsProgram] = useState<string>("Kids Program");
  const [lmsType, setLmsType] = useState<string>("materi");
  const [lmsDueDate, setLmsDueDate] = useState<string>("");
  const [lmsFile, setLmsFile] = useState<File | null>(null);
  const [lmsUploading, setLmsUploading] = useState<boolean>(false);

  const [activeLmsGrading, setActiveLmsGrading] = useState<LmsMaterial | null>(null);
  const [lmsSubmissions, setLmsSubmissions] = useState<LmsSubmission[]>([]);
  const [studentGrade, setStudentGrade] = useState<string>("");
  const [studentFeedback, setStudentFeedback] = useState<string>("");
  const [selectedSubmission, setSelectedSubmission] = useState<LmsSubmission | null>(null);
  const [gradingLoading, setGradingLoading] = useState<boolean>(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleGenerateAiNotes = async () => {
    if (!selectedStudent) {
      alert("Harap pilih siswa terlebih dahulu!");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "auto-draft",
          payload: {
            name: selectedStudent.name,
            program: selectedStudent.program,
            module_name: moduleName,
            speaking: speakingScore || 80,
            grammar: grammarScore || 80,
            vocabulary: vocabularyScore || 80,
            active: activeScore || 80,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setTutorNotes(data.reply);
      } else {
        alert(`Gagal menulis catatan: ${data.error || "Error tidak diketahui"}`);
      }
    } catch {
      alert("Gagal menghubungi server AI.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setAttendanceDate(new Date().toISOString().split("T")[0]);
    }, 0);

    async function checkAuthAndLoad() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: errP } = await adminSupabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (errP || (profile?.role !== "tutor" && profile?.role !== "admin")) {
          alert("Akses ditolak: Portal khusus untuk pengajar / Tutor.");
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        setTutorName(profile?.full_name || "Tutor Pendamping");

        const { data: stdList, error: errS } = await adminSupabase
          .from("students")
          .select("id, name, program")
          .order("name", { ascending: true });

        if (errS) throw errS;
        setStudents((stdList as Student[]) || []);
        setSelectedStudent(null);

        const { data: repList } = await adminSupabase
          .from("reports")
          .select("*, students(name)")
          .order("created_at", { ascending: false })
          .limit(10);
        setReportsList(repList || []);

        const { data: certList } = await adminSupabase.from("certificates").select("*");
        setCertificates(certList || []);

        const { data: lmsMatList } = await adminSupabase
          .from("lms_materials")
          .select("*")
          .order("created_at", { ascending: false });
        setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
      } catch (err) {
        console.error("Error loading tutor portal:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [router, supabase, adminSupabase]);

  useEffect(() => {
    if (!attendanceDate || students.length === 0) return;

    async function loadAttendanceForDate() {
      setAttendanceLoading(true);
      try {
        const { data: attList, error } = await adminSupabase
          .from("attendance")
          .select("student_id, status, notes")
          .eq("date", attendanceDate);

        if (error) throw error;

        const initialData: Record<string, AttendanceEntry> = {};
        students.forEach((s) => {
          const match = attList?.find((a: { student_id: string; status: string; notes: string }) => a.student_id === s.id);
          initialData[s.id] = {
            status: match ? match.status : "hadir",
            notes: match && match.notes ? match.notes : "",
            isExisting: !!match,
          };
        });
        setAttendanceData(initialData);
      } catch (err) {
        console.error("Gagal memuat absensi harian:", err);
      } finally {
        setAttendanceLoading(false);
      }
    }

    loadAttendanceForDate();
  }, [attendanceDate, students, adminSupabase]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
  };

  const handleSaveAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const payload = Object.keys(attendanceData).map((studentId) => ({
        student_id: studentId,
        date: attendanceDate,
        status: attendanceData[studentId].status,
        notes: attendanceData[studentId].notes.trim() || null,
      }));

      const { error } = await adminSupabase
        .from("attendance")
        .upsert(payload, { onConflict: "student_id, date" });

      if (error) throw error;

      try {
        const absentStudents = payload.filter((p) => p.status === "alfa");
        for (const ast of absentStudents) {
          const studentObj = students.find((s) => s.id === ast.student_id);
          const studentName = studentObj ? studentObj.name : "Siswa";
          await fetch("/api/whatsapp-simulator", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: "6281357001357",
              message: `Pemberitahuan Ketidakhadiran: Siswa atas nama *${studentName}* tercatat tidak hadir (ALFA) pada kelas bimbingan hari ini tanggal *${attendanceDate}* tanpa keterangan. Harap hubungi Admin Ibra Global English jika berhalangan.`,
              type: "Absensi Alfa",
            }),
          });
        }
      } catch (waErr) {
        console.error("Gagal mengirim notifikasi WhatsApp simulasi:", waErr);
      }

      showToast("Absensi siswa berhasil disimpan!");
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      showToast("Gagal menyimpan absensi: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSaveReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent || !moduleName.trim()) {
      alert("Harap lengkapi nama modul dan pilih siswa!");
      return;
    }

    setReportLoading(true);
    try {
      const payload = {
        student_id: selectedStudent.id,
        module_name: moduleName.trim(),
        speaking_score: parseInt(String(speakingScore)) || 0,
        grammar_score: parseInt(String(grammarScore)) || 0,
        vocabulary_score: parseInt(String(vocabularyScore)) || 0,
        active_score: parseInt(String(activeScore)) || 0,
        tutor_notes: tutorNotes.trim() || null,
      };

      const { error } = await adminSupabase.from("reports").insert(payload);
      if (error) throw error;

      showToast(`Rapor belajar untuk ${selectedStudent.name} berhasil diterbitkan!`);
      setModuleName("");
      setTutorNotes("");

      const { data: repList } = await adminSupabase
        .from("reports")
        .select("*, students(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      setReportsList(repList || []);

      const { data: certList } = await adminSupabase.from("certificates").select("*");
      setCertificates(certList || []);
    } catch (err) {
      console.error("Gagal menerbitkan rapor:", err);
      showToast("Gagal menerbitkan rapor: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveLmsMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!lmsTitle.trim() || !lmsProgram) {
      alert("Judul dan Program harus diisi!");
      return;
    }

    setLmsUploading(true);
    try {
      let fileUrl: string | null = null;

      if (lmsFile) {
        const fileExt = lmsFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `materials/${fileName}`;

        const { error: uploadError } = await adminSupabase.storage.from("lms-files").upload(filePath, lmsFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = adminSupabase.storage.from("lms-files").getPublicUrl(filePath);
        fileUrl = publicUrl;
      }

      const payload = {
        title: lmsTitle.trim(),
        description: lmsDesc.trim() || null,
        program: lmsProgram,
        type: lmsType,
        file_url: fileUrl,
        due_date: lmsType === "tugas" && lmsDueDate ? new Date(lmsDueDate).toISOString() : null,
        tutor_name: tutorName,
      };

      const { error } = await adminSupabase.from("lms_materials").insert(payload);
      if (error) throw error;

      showToast(`${lmsType === "materi" ? "Materi" : "Tugas"} berhasil diterbitkan!`);

      setLmsTitle("");
      setLmsDesc("");
      setLmsDueDate("");
      setLmsFile(null);
      const fileInput = document.getElementById("lms-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";

      const { data: lmsMatList } = await adminSupabase
        .from("lms_materials")
        .select("*")
        .order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
    } catch (err) {
      console.error("Gagal menerbitkan LMS:", err);
      showToast("Gagal menerbitkan: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setLmsUploading(false);
    }
  };

  const handleDeleteLmsMaterial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi/tugas ini? Semua pengumpulan tugas siswa terkait juga akan terhapus!")) return;
    try {
      const { error } = await adminSupabase.from("lms_materials").delete().eq("id", id);
      if (error) throw error;
      showToast("Materi/tugas berhasil dihapus!");

      const { data: lmsMatList } = await adminSupabase
        .from("lms_materials")
        .select("*")
        .order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
      if (activeLmsGrading?.id === id) {
        setActiveLmsGrading(null);
      }
    } catch (err) {
      console.error("Gagal menghapus:", err);
      showToast("Gagal menghapus: " + (err instanceof Error ? err.message : String(err)), "error");
    }
  };

  const handleViewSubmissions = async (material: LmsMaterial) => {
    setActiveLmsGrading(material);
    setSelectedSubmission(null);
    setStudentGrade("");
    setStudentFeedback("");
    try {
      const { data: subList, error } = await adminSupabase
        .from("lms_submissions")
        .select("*, students(name)")
        .eq("material_id", material.id);
      if (error) throw error;
      setLmsSubmissions(subList || []);
    } catch (err) {
      console.error("Gagal memuat jawaban siswa:", err);
      showToast("Gagal memuat jawaban siswa: " + (err instanceof Error ? err.message : String(err)), "error");
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    setGradingLoading(true);
    try {
      const { error } = await adminSupabase
        .from("lms_submissions")
        .update({
          grade: studentGrade.trim() || null,
          feedback: studentFeedback.trim() || null,
        })
        .eq("id", submissionId);
      if (error) throw error;
      showToast("Penilaian berhasil disimpan!");

      if (activeLmsGrading) {
        handleViewSubmissions(activeLmsGrading);
      }
    } catch (err) {
      console.error("Gagal menyimpan penilaian:", err);
      showToast("Gagal menilai: " + (err instanceof Error ? err.message : String(err)), "error");
    } finally {
      setGradingLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Tutor?")) {
      await supabase.auth.signOut();
      sessionStorage.clear();
      document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["No", "Nama Siswa", "Program", "Status Kehadiran", "Catatan"];
    const rows = students.map((s, idx) => {
      const data = attendanceData[s.id] || { status: "hadir", notes: "" };
      return [idx + 1, s.name, s.program, data.status, data.notes || "-"];
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-presensi-${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading, tutorName, mobileOpen, setMobileOpen, activeTab, setActiveTab,
    students, attendanceDate, setAttendanceDate, attendanceLoading, attendanceData, toast,
    selectedStudent, setSelectedStudent, moduleName, setModuleName, speakingScore, setSpeakingScore,
    grammarScore, setGrammarScore, vocabularyScore, setVocabularyScore, activeScore, setActiveScore,
    tutorNotes, setTutorNotes, aiLoading, handleGenerateAiNotes, reportLoading, reportsList, certificates,
    lmsMaterials, lmsTitle, setLmsTitle, lmsDesc, setLmsDesc, lmsProgram, setLmsProgram,
    lmsType, setLmsType, lmsDueDate, setLmsDueDate, lmsFile, setLmsFile, lmsUploading,
    activeLmsGrading, lmsSubmissions, studentGrade, setStudentGrade, studentFeedback, setStudentFeedback,
    selectedSubmission, setSelectedSubmission, gradingLoading,
    handleStatusChange, handleNotesChange, handleSaveAttendance, handleSaveReport,
    handleSaveLmsMaterial, handleDeleteLmsMaterial, handleViewSubmissions, handleSaveGrade,
    handleLogout, handlePrintReport, handleExportCSV,
  };
}
