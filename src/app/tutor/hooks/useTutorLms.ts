import { useState } from "react";
import { createServiceRoleClient } from "@/utils/supabase/client";
import { LmsMaterial, LmsSubmission } from "@/types";

export function useTutorLms(showToast: (msg: string, type?: "success" | "error") => void) {
  const adminSupabase = createServiceRoleClient();

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

  const handleSaveLmsMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsTitle.trim()) { showToast("Judul materi/tugas wajib diisi!", "error"); return; }
    setLmsUploading(true);

    try {
      let fileUrl = "";
      if (lmsFile) {
        const fileExt = lmsFile.name.split(".").pop();
        const fileName = `lms_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await adminSupabase.storage.from("lms_files").upload(fileName, lmsFile);
        if (uploadError) throw uploadError;
        fileUrl = adminSupabase.storage.from("lms_files").getPublicUrl(fileName).data.publicUrl;
      }

      const { error } = await adminSupabase.from("lms_materials").insert({
        title: lmsTitle.trim(), description: lmsDesc.trim() || null, program: lmsProgram, type: lmsType,
        due_date: lmsDueDate || null, file_url: fileUrl || null, created_at: new Date().toISOString()
      });
      if (error) throw error;

      showToast("Materi/tugas berhasil diterbitkan!");
      setLmsTitle(""); setLmsDesc(""); setLmsFile(null); setLmsDueDate("");
      const { data: lmsMatList } = await adminSupabase.from("lms_materials").select("*").order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
    } catch (err: any) {
      showToast("Gagal menerbitkan: " + err.message, "error");
    } finally {
      setLmsUploading(false);
    }
  };

  const handleDeleteLmsMaterial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus materi/tugas ini?")) return;
    try {
      const { error } = await adminSupabase.from("lms_materials").delete().eq("id", id);
      if (error) throw error;
      showToast("Materi/tugas berhasil dihapus!");
      const { data: lmsMatList } = await adminSupabase.from("lms_materials").select("*").order("created_at", { ascending: false });
      setLmsMaterials((lmsMatList as LmsMaterial[]) || []);
      if (activeLmsGrading?.id === id) setActiveLmsGrading(null);
    } catch (err: any) {
      showToast("Gagal menghapus: " + err.message, "error");
    }
  };

  const handleViewSubmissions = async (material: LmsMaterial) => {
    setActiveLmsGrading(material); setSelectedSubmission(null); setStudentGrade(""); setStudentFeedback("");
    try {
      const { data: subList, error } = await adminSupabase.from("lms_submissions").select("*, students(name)").eq("material_id", material.id);
      if (error) throw error;
      setLmsSubmissions(subList || []);
    } catch (err: any) {
      showToast("Gagal memuat jawaban siswa: " + err.message, "error");
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    setGradingLoading(true);
    try {
      const { error } = await adminSupabase.from("lms_submissions").update({ grade: studentGrade.trim() || null, feedback: studentFeedback.trim() || null }).eq("id", submissionId);
      if (error) throw error;
      showToast("Penilaian berhasil disimpan!");
      if (activeLmsGrading) handleViewSubmissions(activeLmsGrading);
    } catch (err: any) {
      showToast("Gagal menilai: " + err.message, "error");
    } finally {
      setGradingLoading(false);
    }
  };

  return {
    lmsMaterials, setLmsMaterials, lmsTitle, setLmsTitle, lmsDesc, setLmsDesc, lmsProgram, setLmsProgram,
    lmsType, setLmsType, lmsDueDate, setLmsDueDate, lmsFile, setLmsFile, lmsUploading,
    activeLmsGrading, lmsSubmissions, studentGrade, setStudentGrade, studentFeedback, setStudentFeedback,
    selectedSubmission, setSelectedSubmission, gradingLoading,
    handleSaveLmsMaterial, handleDeleteLmsMaterial, handleViewSubmissions, handleSaveGrade,
  };
}
