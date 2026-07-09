"use client";

import { useState, useEffect } from "react";
import "../../dashboard-components.css";

interface FeedbackItem {
  id: string;
  parent_id: string;
  parent_name: string;
  tutor_id: string;
  tutor_name: string;
  rating: number;
  comments: string | null;
  created_at: string;
}

interface TutorStats {
  name: string;
  totalRatings: number;
  sumRatings: number;
  average: number;
}

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [tutorFilter, setTutorFilter] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");

  const fetchFeedback = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/feedback");
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal mengambil data umpan balik.");
      }

      setFeedbacks(result.data || []);
    } catch (err: any) {
      console.error("Error fetching feedbacks:", err);
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat memuat umpan balik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchTutor = tutorFilter ? fb.tutor_id === tutorFilter : true;
    const matchRating = ratingFilter ? fb.rating === parseInt(ratingFilter) : true;
    return matchTutor && matchRating;
  });

  // Calculate stats
  const totalSubmissions = feedbacks.length;
  const overallAverage = totalSubmissions > 0
    ? (feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / totalSubmissions).toFixed(1)
    : "0.0";

  // Group by tutor for statistics
  const tutorStatsMap: Record<string, TutorStats> = {};
  feedbacks.forEach((fb) => {
    if (!tutorStatsMap[fb.tutor_id]) {
      tutorStatsMap[fb.tutor_id] = {
        name: fb.tutor_name,
        totalRatings: 0,
        sumRatings: 0,
        average: 0
      };
    }
    const stats = tutorStatsMap[fb.tutor_id];
    stats.totalRatings++;
    stats.sumRatings += fb.rating;
    stats.average = parseFloat((stats.sumRatings / stats.totalRatings).toFixed(1));
  });

  const tutorStatsList = Object.values(tutorStatsMap).sort((a, b) => b.average - a.average);

  // Render stars helper
  const renderStars = (rating: number) => {
    return (
      <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={star <= rating ? "var(--color-accent)" : "none"}
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-content-wrapper" style={{ padding: "2rem" }}>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "var(--color-primary-dark)" }}>📈 Umpan Balik Kelas & Kinerja Tutor</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Rekap evaluasi dan penilaian performa mengajar tutor oleh orang tua siswa.
          </p>
        </div>
        <button
          className="btn-portal-outline"
          onClick={fetchFeedback}
          disabled={loading}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          <svg
            className={loading ? "spin" : ""}
            style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="error-banner" style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2" }}>
          {errorMsg}
        </div>
      )}

      {/* Metrics Summary Row */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="portal-card" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontWeight: "700" }}>TOTAL TANGGAPAN</span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-gray-900)", marginTop: "0.5rem" }}>{totalSubmissions}</h2>
          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Umpan balik yang masuk</p>
        </div>
        <div className="portal-card" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", fontWeight: "700" }}>RATA-RATA GLOBAL</span>
          <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "var(--color-accent)", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{overallAverage}</span>
            <span style={{ fontSize: "1.2rem", color: "var(--color-accent)" }}>★</span>
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>Skor kepuasan keseluruhan</p>
        </div>
      </div>

      {/* Two Column Layout: Tutor Rankings & Feedback Timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Tutor Performance Stats */}
        <div className="portal-card" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--color-primary-dark)", marginBottom: "1rem" }}>
            🏆 Peringkat Kepuasan Tutor
          </h2>
          {loading ? (
            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>Memuat peringkat...</p>
          ) : tutorStatsList.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", textAlign: "center", padding: "2rem 0" }}>Belum ada data peringkat.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {tutorStatsList.map((stat, idx) => (
                <div key={stat.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: "1px solid var(--color-gray-100)" }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--color-gray-900)" }}>
                      {idx + 1}. {stat.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.1rem" }}>
                      {stat.totalRatings} tanggapan
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: "900", fontSize: "1.1rem", color: "var(--color-accent)" }}>
                      ★ {stat.average}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Feedbacks Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Filters card */}
          <div className="portal-card" style={{ padding: "1.25rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "160px" }}>
                <select
                  className="form-input"
                  value={tutorFilter}
                  onChange={(e) => setTutorFilter(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  <option value="">Semua Tutor</option>
                  {Object.keys(tutorStatsMap).map((tid) => (
                    <option key={tid} value={tid}>{tutorStatsMap[tid].name}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: "150px" }}>
                <select
                  className="form-input"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  <option value="">Semua Rating</option>
                  <option value="5">★ 5 Sangat Puas</option>
                  <option value="4">★ 4 Puas</option>
                  <option value="3">★ 3 Cukup</option>
                  <option value="2">★ 2 Kurang</option>
                  <option value="1">★ 1 Sangat Kurang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedback items feed */}
          {loading ? (
            <div className="portal-card" style={{ padding: "4rem", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ color: "var(--color-gray-500)" }}>Memuat daftar umpan balik...</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="portal-card" style={{ padding: "4rem", textAlign: "center", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", color: "var(--color-gray-400)", fontWeight: "600" }}>
              Belum ada ulasan umpan balik dari orang tua.
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="portal-card"
                style={{
                  padding: "1.5rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.015)",
                  transition: "transform 0.2s ease",
                  backgroundColor: "white"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>
                      {fb.parent_name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "0.1rem" }}>
                      Menilai tutor: <strong>{fb.tutor_name}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {renderStars(fb.rating)}
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>
                      {new Date(fb.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: "0.85rem 1rem",
                  backgroundColor: "var(--color-bg-teal-50)",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  color: "var(--color-gray-800)",
                  fontStyle: fb.comments ? "normal" : "italic",
                  lineHeight: "1.5",
                  borderLeft: "3px solid var(--color-primary)"
                }}>
                  {fb.comments ? `“ ${fb.comments} ”` : "Tidak menulis komentar tertulis."}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          display: inline-block;
        }
      `}} />
    </div>
  );
}
