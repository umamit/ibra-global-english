import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AiSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function AiSchedulerModal({ isOpen, onClose, onSuccess }: AiSchedulerModalProps) {
  const supabase = createClient();

  const [aiPrompt, setAiPrompt] = useState<string>(" ");
  const [aiDraftSchedules, setAiDraftSchedules] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateAiDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "calendar-draft",
          payload: { prompt: aiPrompt }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses draf kalender.");

      let cleanedReply = data.reply || "[]";
      cleanedReply = cleanedReply.replace(/```json/gi, "").replace(/```/gi, "").trim();
      
      const parsed = JSON.parse(cleanedReply);
      if (!Array.isArray(parsed)) throw new Error("Format yang dikembalikan AI tidak sesuai (harus berupa array).");

      setAiDraftSchedules(parsed);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Terjadi kesalahan saat menyusun jadwal.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiDraft = async () => {
    if (!aiDraftSchedules || aiDraftSchedules.length === 0) return;
    setLoading(true);
    try {
      const dbInserts = aiDraftSchedules.map(s => {
        const startLocal = new Date(`${s.start_date}T${s.start_time}:00`);
        const endLocal = new Date(`${s.end_date}T${s.end_time}:00`);
        
        const startUtc = new Date(startLocal.getTime() - (9 * 60 * 60 * 1000));
        const endUtc = new Date(endLocal.getTime() - (9 * 60 * 60 * 1000));

        const recurrenceId = `rec_ai_gen_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        return {
          title: s.title,
          type: s.type || "class",
          program: s.program || "All",
          start_time: startUtc.toISOString(),
          end_time: endUtc.toISOString(),
          description: s.description || `Kelas reguler - ${s.title}`,
          instructor: s.instructor || "",
          recurrence_id: recurrenceId
        };
      });

      const { error } = await supabase.from("academic_schedules").insert(dbInserts);
      if (error) throw error;

      onSuccess(`✓ Berhasil menyimpan ${aiDraftSchedules.length} jadwal hasil penyusunan AI!`);
      setAiDraftSchedules([]);
      setAiPrompt(" ");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Gagal menyimpan jadwal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-modal-overlay" onClick={() => { if (!aiLoading) onClose(); }}>
      <div className="portal-modal" style={{
        maxWidth: "650px",
        padding: "2rem",
        animation: "slideIn 0.2s ease"
      }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            🤖 Asisten AI Penyusun Jadwal (Groq Copilot)
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            disabled={aiLoading}
            style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: aiLoading ? "not-allowed" : "pointer" }}
          >
            &times;
          </button>
        </div>

        {aiError && (
          <div className="auth-error-banner" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
            <span>⚠️ {aiError}</span>
          </div>
        )}

        {aiDraftSchedules.length === 0 ? (
          <form onSubmit={handleGenerateAiDraft}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-gray-600)" }}>
                Tulis instruksi penjadwalan dalam bahasa santai/bebas. AI Groq akan otomatis memecah hari, jam, dan minggu, serta memformatnya menjadi draf agenda akademik.
              </p>
              
              <div style={{ backgroundColor: "#f0fdf4", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.82rem" }}>
                <strong>💡 Contoh Instruksi:</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontStyle: "italic" }}>
                  "Buat kelas Teen hari Selasa dan Kamis jam 16.25-17.40 selama 4 minggu mulai tanggal 6 Juli 2026. Tutor coach Husni."
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: "800" }}>Instruksi Jadwal (Prompt)</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "100px", fontFamily: "inherit", padding: "0.75rem" }}
                  placeholder="Tulis instruksi Anda di sini..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  required
                  disabled={aiLoading}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button type="button" className="btn-portal-outline" onClick={onClose} disabled={aiLoading}>
                Batal
              </button>
              <button type="submit" className="btn-portal-primary" disabled={aiLoading || !aiPrompt.trim()}>
                <span>{aiLoading ? "🤖 Menyusun Draf..." : "Draf Jadwal dengan AI"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "var(--color-gray-700)", fontWeight: "700" }}>
              🎉 AI berhasil mendraf {aiDraftSchedules.length} jadwal! Silakan tinjau terlebih dahulu:
            </p>

            <div style={{ overflowX: "auto", maxHeight: "250px", overflowY: "auto", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--color-gray-50)", borderBottom: "1px solid var(--color-gray-200)", fontWeight: "800", color: "var(--color-gray-600)" }}>
                    <th style={{ padding: "0.5rem 0.75rem" }}>Tanggal</th>
                    <th style={{ padding: "0.5rem 0.75rem" }}>Waktu</th>
                    <th style={{ padding: "0.5rem 0.75rem" }}>Judul</th>
                    <th style={{ padding: "0.5rem 0.75rem" }}>Program</th>
                    <th style={{ padding: "0.5rem 0.75rem" }}>Tutor</th>
                  </tr>
                </thead>
                <tbody>
                  {aiDraftSchedules.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--color-gray-100)" }}>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: "700" }}>{s.start_date}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{s.start_time} - {s.end_time}</td>
                      <td style={{ padding: "0.5rem 0.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>{s.title}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{s.program}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{s.instructor || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="btn-portal-outline" onClick={() => setAiDraftSchedules([])} disabled={loading} style={{ color: "var(--color-danger)" }}>
                Ulangi (Hapus Draf)
              </button>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" className="btn-portal-outline" onClick={() => { setAiDraftSchedules([]); onClose(); }} disabled={loading}>
                  Batal
                </button>
                <button type="button" className="btn-portal-primary" onClick={handleSaveAiDraft} disabled={loading}>
                  <span>{loading ? "Menyimpan..." : "Simpan Semua ke Kalender"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
