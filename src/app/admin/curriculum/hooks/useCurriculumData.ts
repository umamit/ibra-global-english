import { useState, useEffect } from "react";

export interface Curriculum {
  id: string;
  program: string;
  level_name: string;
  duration?: string;
  topics?: string[];
  syllabus_pdf_url?: string;
  is_active: boolean;
}

export function useCurriculumData() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [program, setProgram] = useState<string>("Kids Program");
  const [levelName, setLevelName] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [topicsInput, setTopicsInput] = useState<string>("");
  const [syllabusPdfUrl, setSyllabusPdfUrl] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3500);
  };

  const fetchCurriculums = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/curriculums?all=true");
      const result = await res.json();
      if (res.ok) {
        setCurriculums(result.data || []);
      } else {
        showToast(`Gagal memuat: ${result.error}`, "error");
      }
    } catch {
      showToast("Gagal mengambil data silabus.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!levelName.trim()) {
      showToast("Nama Level wajib diisi.", "error");
      return;
    }

    setSaving(true);
    try {
      const topicsArray = topicsInput
        .split("\n")
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        program,
        level_name: levelName.trim(),
        duration: duration.trim(),
        topics: topicsArray,
        syllabus_pdf_url: syllabusPdfUrl.trim(),
        is_active: isActive,
      };

      let res: Response;
      if (editingId) {
        res = await fetch("/api/admin/curriculums", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/curriculums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await res.json();
      if (res.ok) {
        showToast(editingId ? "Silabus berhasil disunting!" : "Silabus baru berhasil ditambahkan!", "success");
        handleCancelEdit();
        fetchCurriculums();
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch {
      showToast("Gagal menyimpan data silabus.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (c: Curriculum) => {
    setEditingId(c.id);
    setProgram(c.program);
    setLevelName(c.level_name);
    setDuration(c.duration || "");
    setTopicsInput(Array.isArray(c.topics) ? c.topics.join("\n") : "");
    setSyllabusPdfUrl(c.syllabus_pdf_url || "");
    setIsActive(c.is_active !== false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setProgram("Kids Program");
    setLevelName("");
    setDuration("");
    setTopicsInput("");
    setSyllabusPdfUrl("");
    setIsActive(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus silabus ini?")) return;
    try {
      const res = await fetch(`/api/admin/curriculums?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok) {
        showToast("Silabus berhasil dihapus.", "success");
        fetchCurriculums();
        if (editingId === id) handleCancelEdit();
      } else {
        showToast(`Error: ${result.error}`, "error");
      }
    } catch {
      showToast("Gagal menghapus silabus.", "error");
    }
  };

  return {
    curriculums,
    loading,
    saving,
    toast,
    editingId,
    program,
    setProgram,
    levelName,
    setLevelName,
    duration,
    setDuration,
    topicsInput,
    setTopicsInput,
    syllabusPdfUrl,
    setSyllabusPdfUrl,
    isActive,
    setIsActive,
    handleSubmit,
    handleEditClick,
    handleCancelEdit,
    handleDelete,
  };
}
