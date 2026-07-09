"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Tutor {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

interface FeedbackViewProps {
  selectedChild: any;
  detailsLoading: boolean;
}

export default function FeedbackView({ selectedChild, detailsLoading }: FeedbackViewProps) {
  const supabase = createClient();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: string; text: string }>({ type: "", text: "" });

  useEffect(() => {
    async function loadTutors() {
      try {
        const { data, error } = await supabase
          .from("tutors")
          .select("id, name")
          .eq("status", "active")
          .order("name", { ascending: true });

        if (error) throw error;
        setTutors(data || []);
      } catch (err) {
        console.error("Gagal memuat daftar tutor:", err);
      }
    }
    loadTutors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorId) {
      setStatusMsg({ type: "error", text: "Silakan pilih tutor terlebih dahulu." });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: "", text: "" });

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId: selectedTutorId,
          rating,
          comments: comments.trim()
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Gagal mengirimkan umpan balik.");
      }

      setStatusMsg({ type: "success", text: "Terima kasih! Umpan balik Anda telah berhasil dikirimkan ke tim Admin." });
      setSelectedTutorId("");
      setRating(5);
      setComments("");
    } catch (err: any) {
      console.error("Gagal mengirim feedback:", err);
      setStatusMsg({ type: "error", text: err.message || "Gagal mengirimkan umpan balik. Coba lagi nanti." });
    } finally {
      setSubmitting(false);
    }
  };

  if (detailsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
        <p>Memuat formulir...</p>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ padding: "2rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-primary-dark)", marginBottom: "0.5rem" }}>
        📝 Umpan Balik Kinerja Tutor
      </h2>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
        Evaluasi Anda sangat membantu kami untuk mempertahankan dan meningkatkan kualitas bimbingan belajar untuk <strong>{selectedChild?.name}</strong>.
      </p>

      {statusMsg.text && (
        <div style={{
          padding: "1rem",
          borderRadius: "10px",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          fontWeight: "600",
          backgroundColor: statusMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: statusMsg.type === "success" ? "#166534" : "#991b1b",
          border: `1px solid ${statusMsg.type === "success" ? "#bbf7d0" : "#fee2e2"}`
        }}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Tutor Selector */}
        <div>
          <label htmlFor="feedback-tutor" style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
            Pilih Tutor / Staf Pengajar
          </label>
          <select
            id="feedback-tutor"
            className="form-input"
            value={selectedTutorId}
            onChange={(e) => setSelectedTutorId(e.target.value)}
            required
            style={{ width: "100%", padding: "0.6rem 1rem" }}
            disabled={submitting}
          >
            <option value="">-- Pilih Tutor --</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Rating Stars */}
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
            Berikan Rating Penilaian
          </label>
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = hoverRating !== null ? star <= hoverRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.2rem",
                    transition: "transform 0.1s ease",
                    transform: (hoverRating === star || (!hoverRating && rating === star)) ? "scale(1.2)" : "scale(1)"
                  }}
                  disabled={submitting}
                  aria-label={`Bintang ${star}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={isActive ? "#A68849" : "none"} // Gold brand color for rating!
                    stroke="#A68849"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: "fill 0.2s ease" }}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-gray-500)", marginLeft: "0.5rem" }}>
              {rating === 5 ? "🤩 Sangat Memuaskan" :
               rating === 4 ? "😊 Memuaskan" :
               rating === 3 ? "👍 Cukup Baik" :
               rating === 2 ? "😐 Perlu Ditingkatkan" :
               "💪 Kurang Memuaskan"}
            </span>
          </div>
        </div>

        {/* Comments input */}
        <div>
          <label htmlFor="feedback-comment" style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-gray-700)", display: "block", marginBottom: "0.5rem" }}>
            Ulasan / Komentar (Kritik & Saran)
          </label>
          <textarea
            id="feedback-comment"
            placeholder="Tulis kritik, saran, atau pujian Anda untuk membantu kami menjadi lebih baik..."
            rows={4}
            className="form-input"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            style={{ width: "100%", padding: "0.75rem 1rem", minHeight: "100px", resize: "vertical" }}
            disabled={submitting}
          />
        </div>

        {/* Action Button */}
        <div style={{ marginTop: "0.5rem" }}>
          <button
            type="submit"
            className="btn-portal"
            style={{ width: "100%", padding: "0.75rem", fontWeight: "700" }}
            disabled={submitting}
          >
            {submitting ? "Mengirimkan Umpan Balik..." : "Kirim Umpan Balik"}
          </button>
        </div>
      </form>
    </div>
  );
}
