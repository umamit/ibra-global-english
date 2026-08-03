import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export interface StudentData {
  id: string;
  name: string;
  program: string;
  age: number;
  parent_id?: string;
  [key: string]: unknown;
}

export interface Module {
  name: string;
  size: string;
  url: string;
}

export function useStudentPortal() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const [reports, setReports] = useState<Record<string, unknown>[]>([]);
  const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [totalCoins, setTotalCoins] = useState<number>(0);

  const [lmsMaterials, setLmsMaterials] = useState<Record<string, unknown>[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Record<string, unknown>[]>([]);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submittingMaterialId, setSubmittingMaterialId] = useState<string | null>(null);
  const [submissionUploading, setSubmissionUploading] = useState<boolean>(false);
  const [lmsSubTab, setLmsSubTab] = useState<string>("materi");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [onlineSchedules, setOnlineSchedules] = useState<any[]>([]);

  const getModulesList = (program: string | undefined): Module[] => {
    if (program?.toLowerCase()?.includes("calistung")) {
      return [
        { name: "Modul 1: Lancar Membaca Suku Kata Basika", size: "2.4 MB", url: "#" },
        { name: "Lembar Kerja Menulis Huruf Hijaiyah & Angka", size: "1.8 MB", url: "#" },
        { name: "Modul Berhitung Cepat Kreatif (Calistung)", size: "3.1 MB", url: "#" },
      ];
    }
    if (program === "Teens Program") {
      return [
        { name: "Teens Speaking Practice: Daily Conversations", size: "4.2 MB", url: "#" },
        { name: "Grammar Handbook Level 2: Tenses & Sentence Structure", size: "3.5 MB", url: "#" },
        { name: "Vocab Booster: TOEFL & IELTS Foundations", size: "5.0 MB", url: "#" },
      ];
    }
    return [
      { name: "Kids Fun English Workbook Volume 1", size: "3.8 MB", url: "#" },
      { name: "Coloring & Vocabulary Activity Sheets", size: "2.1 MB", url: "#" },
      { name: "Interactive Songs & Chants Study Guide", size: "1.5 MB", url: "#" },
    ];
  };

  useEffect(() => {
    async function checkAuthAndLoad() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error: errP } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (errP || (profile?.role !== "student" && profile?.role !== "admin")) {
          alert("Akses ditolak: Akun Anda bukan bertipe peran Siswa.");
          await supabase.auth.signOut();
          router.push("/login");
          return;
        }

        const { data: studentsList, error: errS } = await supabase
          .from("students")
          .select("*")
          .eq("parent_id", user.id);

        if (errS || !studentsList || studentsList.length === 0) {
          setStudent({
            id: user.id,
            name: profile.full_name,
            program: "Kids Program",
            age: 10,
          });
          return;
        }

        const activeStudent = studentsList[0] as StudentData;
        setStudent(activeStudent);

        const { data: repList } = await supabase
          .from("reports")
          .select("*")
          .eq("student_id", activeStudent.id)
          .order("created_at", { ascending: false });
        setReports(repList || []);

        const { data: certList } = await supabase
          .from("certificates")
          .select("*")
          .eq("student_id", activeStudent.id);
        setCertificates(certList || []);

        const { data: lmsList } = await supabase
          .from("lms_materials")
          .select("*")
          .eq("program", activeStudent.program)
          .order("created_at", { ascending: false });
        setLmsMaterials(lmsList || []);

        const { data: subList } = await supabase
          .from("lms_submissions")
          .select("*")
          .eq("student_id", activeStudent.id);
        setMySubmissions(subList || []);

        const { data: rewList } = await supabase
          .from("student_rewards")
          .select("*")
          .eq("student_id", activeStudent.id)
          .order("created_at", { ascending: false });
        setRewards(rewList || []);

        const sumCoins = (rewList || []).reduce((sum: number, r: Record<string, unknown>) => sum + (r.coins as number), 0);
        setTotalCoins(sumCoins);

        try {
          const annRes = await fetch(`/api/announcements?program=${encodeURIComponent(activeStudent.program)}`);
          const { data: annData } = await annRes.json();
          setAnnouncements(annData || []);
        } catch (_) {}

        try {
          const schRes = await fetch(`/api/online-schedule?program=${encodeURIComponent(activeStudent.program)}&upcoming=true`);
          const { data: schData } = await schRes.json();
          setOnlineSchedules(schData || []);
        } catch (_) {}

      } catch (err) {
        console.error("Error loading student portal:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoad();
  }, [router, supabase]);

  const handleSaveSubmission = async (materialId: string) => {
    if (!submissionFile) {
      alert("Harap pilih berkas jawaban terlebih dahulu!");
      return;
    }

    setSubmissionUploading(true);
    setSubmittingMaterialId(materialId);
    try {
      const fileExt = submissionFile.name.split(".").pop();
      const fileName = `${student!.id}-${materialId}-${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from("lms-files")
        .upload(filePath, submissionFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase
        .storage
        .from("lms-files")
        .getPublicUrl(filePath);

      const payload = {
        material_id: materialId,
        student_id: student!.id,
        file_url: publicUrl,
      };

      const { error } = await supabase
        .from("lms_submissions")
        .insert(payload);

      if (error) throw error;

      alert("Jawaban tugas berhasil dikirim!");

      setSubmissionFile(null);
      setSubmittingMaterialId(null);

      const { data: subList } = await supabase
        .from("lms_submissions")
        .select("*")
        .eq("student_id", student!.id);
      setMySubmissions(subList || []);

    } catch (err) {
      console.error("Gagal mengirim jawaban tugas:", err);
      alert("Gagal mengirim jawaban: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmissionUploading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari portal Siswa?")) {
      await supabase.auth.signOut();
      sessionStorage.clear();
      document.cookie = "login_time=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    }
  };

  return {
    loading, student, mobileOpen, setMobileOpen, activeTab, setActiveTab,
    reports, certificates, rewards, totalCoins, lmsMaterials, mySubmissions,
    submissionFile, setSubmissionFile, submittingMaterialId, submissionUploading,
    lmsSubTab, setLmsSubTab, announcements, onlineSchedules, getModulesList,
    handleSaveSubmission, handleLogout,
  };
}
