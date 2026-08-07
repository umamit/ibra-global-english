import { useState, useEffect } from "react";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  program: string;
  priority: string;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
}

export function useAnnouncementsData() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error"; message: string }>({ show: false, type: "success", message: "" });
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [program, setProgram] = useState<string>("Semua Program");
  const [priority, setPriority] = useState<string>("normal");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleAiPolish = async (): Promise<void> => {
    if (!title.trim() && !content.trim()) {
      showToast("Harap isi judul atau isi pengumuman kasar terlebih dahulu.", "error");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "announcement-polish",
          payload: { title, content }
        })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        const reply: string = data.reply;
        const parts = reply.split("---");
        if (parts.length >= 2) {
          const polishedTitle = parts[0].replace("JUDUL:", "").trim();
          const polishedContent = parts.slice(1).join("---").trim();
          setTitle(polishedTitle);
          setContent(polishedContent);
          showToast("Pengumuman berhasil dipoles dengan AI!", "success");
        } else {
          setContent(reply);
          showToast("Pengumuman dipoles dengan AI!", "success");
        }
      } else {
        showToast(`Gagal memoles: ${data.error || "Error tidak diketahui"}`, "error");
      }
    } catch {
      showToast("Gagal menghubungi server AI.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAnnouncements = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch("/api/announcements?all=true");
      const { data } = await res.json();
      setAnnouncements(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchAnnouncements();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, program, priority, expires_at: expiresAt || null }),
    });
    if (res.ok) {
      setTitle(""); setContent(""); setProgram("Semua Program"); setPriority("normal"); setExpiresAt("");
      fetchAnnouncements();
      showToast("Pengumuman berhasil diterbitkan!", "success");
    }
    setSaving(false);
  };

  const handleToggle = async (id: string, isActive: boolean): Promise<void> => {
    await fetch("/api/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    fetchAnnouncements();
    showToast(isActive ? "Pengumuman dinonaktifkan." : "Pengumuman diaktifkan kembali.", "success");
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    fetchAnnouncements();
    showToast("Pengumuman dihapus.", "success");
  };

  return {
    announcements,
    loading,
    saving,
    toast,
    aiLoading,
    title,
    setTitle,
    content,
    setContent,
    program,
    setProgram,
    priority,
    setPriority,
    expiresAt,
    setExpiresAt,
    handleAiPolish,
    handleSubmit,
    handleToggle,
    handleDelete,
  };
}
