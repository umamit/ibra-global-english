"use client";

export default function RejectModal({ rejectModalId, rejectNotes, setRejectNotes, onClose, onConfirm }) {
  if (!rejectModalId) return null;

  return (
    <div className="portal-modal-overlay">
      <div className="portal-modal" style={{ maxWidth: "440px" }}>
        <div className="portal-modal-header">
          <h2 className="portal-modal-title">Tolak Pendaftaran</h2>
          <button className="btn-close-modal" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{ color: "var(--color-gray-500)", marginBottom: "1rem", fontSize: "0.9rem" }}>Tuliskan alasan penolakan (opsional). Informasi ini hanya untuk catatan internal admin.</p>
        <textarea className="form-input" rows={3} placeholder="Contoh: Slot penuh, usia tidak sesuai, dll." value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} style={{ resize: "vertical", marginBottom: "1.5rem" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button className="btn-portal-outline" onClick={onClose}>Batal</button>
          <button className="btn-portal-danger" onClick={onConfirm}>Konfirmasi Penolakan</button>
        </div>
      </div>
    </div>
  );
}
