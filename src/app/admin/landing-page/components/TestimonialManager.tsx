"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface TestimonialItem {
  id: string;
  author: string;
  role: string;
  rating: number;
  text: string;
  is_active?: boolean;
  status?: "pending" | "approved" | "rejected";
  created_at?: string;
}

interface TestimonialManagerProps {
  showToast: (msg: string, type?: "success" | "error") => void;
  triggerRevalidation: () => Promise<void>;
}

export default function TestimonialManager({
  showToast,
  triggerRevalidation
}: TestimonialManagerProps) {
  const supabase = createClient();

  const [testimonialsList, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState<boolean>(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  
  // Tab Filter
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active">("all");

  // Form Fields
  const [author, setAuthor] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [savingTestimonial, setSavingTestimonial] = useState<boolean>(false);

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error("Gagal mengambil data testimoni:", err);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !role.trim() || !testimonialText.trim()) {
      showToast("Nama penulis, peran, dan teks ulasan wajib diisi.", "error");
      return;
    }

    setSavingTestimonial(true);
    try {
      if (editingTestimonialId) {
        // Update
        const { error } = await supabase
          .from("testimonials")
          .update({
            author: author.trim(),
            role: role.trim(),
            rating: parseInt(rating as any),
            text: testimonialText.trim(),
          })
          .eq("id", editingTestimonialId);

        if (error) throw error;
        showToast("Testimonial berhasil disunting.");
        setEditingTestimonialId(null);
      } else {
        // Create manual (Admin langsung setujui / is_active: true)
        const { error } = await supabase.from("testimonials").insert([
          {
            author: author.trim(),
            role: role.trim(),
            rating: parseInt(rating as any),
            text: testimonialText.trim(),
            is_active: true,
            status: "approved",
          },
        ]);

        if (error) throw error;
        showToast("Testimonial ulasan baru berhasil ditambahkan dan dipublikasi!");
      }

      setAuthor("");
      setRole("");
      setRating(5);
      setTestimonialText("");
      fetchTestimonials();
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan simpan testimoni:", err);
      showToast("Gagal menyimpan data ulasan testimoni.", "error");
    } finally {
      setSavingTestimonial(false);
    }
  };

  const handleToggleApprove = async (id: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_active: newStatus,
          status: newStatus ? "approved" : "pending",
        })
        .eq("id", id);

      if (error) throw error;
      showToast(newStatus ? "Ulasan disetujui & ditayangkan di halaman publik!" : "Ulasan disembunyikan dari publik.");
      fetchTestimonials();
      await triggerRevalidation();
    } catch (err) {
      console.error("Gagal mengubah status publikasi:", err);
      showToast("Gagal mengubah status ulasan.", "error");
    }
  };

  const handleEditTestimonialClick = (t: TestimonialItem) => {
    setEditingTestimonialId(t.id);
    setAuthor(t.author);
    setRole(t.role);
    setRating(t.rating);
    setTestimonialText(t.text);
  };

  const handleCancelEditTestimonial = () => {
    setEditingTestimonialId(null);
    setAuthor("");
    setRole("");
    setRating(5);
    setTestimonialText("");
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan testimoni ini?")) return;

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      showToast("Ulasan testimoni berhasil dihapus.");
      fetchTestimonials();
      await triggerRevalidation();
    } catch (err) {
      console.error("Kesalahan hapus testimoni:", err);
      showToast("Gagal menghapus testimoni.", "error");
    }
  };

  const pendingCount = testimonialsList.filter((t) => !t.is_active || t.status === "pending").length;

  const filteredList = testimonialsList.filter((t) => {
    if (filterTab === "pending") return !t.is_active || t.status === "pending";
    if (filterTab === "active") return t.is_active === true;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Form Testimoni Manual oleh Admin */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>
          {editingTestimonialId ? "Sunting Ulasan Testimoni" : "➕ Tambah Testimoni Manual (Admin)"}
        </h2>

        <form onSubmit={handleSaveTestimonial} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Nama Penulis *</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                placeholder="Contoh: Bapak Andi / Rania"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Peran / Identitas *</label>
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                placeholder="Contoh: Orang Tua Siswa / Siswa SMP"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Rating Bintang</label>
              <select
                className="form-input"
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value={5}>5 Bintang (Sangat Puas)</option>
                <option value={4}>4 Bintang (Puas)</option>
                <option value={3}>3 Bintang (Cukup)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontWeight: "600", color: "var(--color-gray-700)", fontSize: "0.9rem" }}>Teks Isi Ulasan *</label>
            <textarea
              className="form-input"
              style={{ width: "100%", height: "100px", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-gray-300)" }}
              placeholder="Ketik komentar, ulasan positif, atau saran di sini..."
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="submit"
              className="btn-portal-primary"
              style={{ padding: "0.6rem 1.2rem", fontWeight: "700" }}
              disabled={savingTestimonial}
            >
              {savingTestimonial ? "Menyimpan..." : editingTestimonialId ? "Simpan Perubahan" : "Publikasikan Testimoni"}
            </button>
            {editingTestimonialId && (
              <button
                type="button"
                onClick={handleCancelEditTestimonial}
                className="btn-portal-outline"
                style={{ padding: "0.6rem 1.2rem", fontWeight: "600" }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List & Kurasi Testimoni */}
      <div className="portal-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0 }}>
              Daftar & Kurasi Testimoni
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem", margin: 0 }}>
              Ulasan yang dikirim oleh publik harus disetujui Admin sebelum ditayangkan.
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", background: filterTab === "all" ? "#216c7e" : "#fff", color: filterTab === "all" ? "#fff" : "#333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              Semua ({testimonialsList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("pending")}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", background: filterTab === "pending" ? "#e0a800" : "#fff", color: filterTab === "pending" ? "#fff" : "#333", fontSize: "0.85rem", cursor: "pointer", fontWeight: pendingCount > 0 ? "bold" : "normal" }}
            >
              🟡 Menunggu Kurasi ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("active")}
              style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid #ccc", background: filterTab === "active" ? "#198754" : "#fff", color: filterTab === "active" ? "#fff" : "#333", fontSize: "0.85rem", cursor: "pointer" }}
            >
              🟢 Aktif Tayang ({testimonialsList.filter(t => t.is_active).length})
            </button>
          </div>
        </div>

        {testimonialsLoading ? (
          <p style={{ color: "var(--color-gray-400)" }}>Memuat ulasan testimoni...</p>
        ) : filteredList.length === 0 ? (
          <p style={{ color: "var(--color-gray-400)" }}>Tidak ada testimoni pada kategori ini.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px", width: "90px" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px", width: "90px" }}>Bintang</th>
                  <th style={{ textAlign: "left", padding: "10px", width: "180px" }}>Penulis</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Teks Isi Ulasan</th>
                  <th style={{ textAlign: "right", padding: "10px", width: "200px" }}>Aksi Kurasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                    <td style={{ padding: "10px" }}>
                      {t.is_active ? (
                        <span style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: "#d1e7dd", color: "#0f5132", fontSize: "0.75rem", fontWeight: 700 }}>🟢 Tayang</span>
                      ) : (
                        <span style={{ padding: "0.25rem 0.5rem", borderRadius: "6px", background: "#fff3cd", color: "#664d03", fontSize: "0.75rem", fontWeight: 700 }}>🟡 Pending</span>
                      )}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{"★".repeat(t.rating)}</span>
                    </td>
                    <td style={{ padding: "10px" }}>
                      <div style={{ fontWeight: "700", color: "var(--color-gray-800)" }}>{t.author}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--color-gray-500)" }}>{t.role}</div>
                    </td>
                    <td style={{ padding: "10px", fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                      &ldquo;{t.text}&rdquo;
                    </td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleToggleApprove(t.id, t.is_active)}
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.78rem",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            background: t.is_active ? "#ffc107" : "#198754",
                            color: t.is_active ? "#000" : "#fff",
                            fontWeight: 700,
                          }}
                        >
                          {t.is_active ? "Sembunyikan" : "🟢 Setujui"}
                        </button>
                        <button
                          onClick={() => handleEditTestimonialClick(t)}
                          className="btn-portal-outline"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="btn-portal-danger"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.78rem" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
