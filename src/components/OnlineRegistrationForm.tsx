import React from "react";
import Button from "@/components/Button";

export function OnlineRegistrationForm({ regSuccess, setRegSuccess, lastRegistered, setActiveTab, handleRegSubmit, regError, regForm, setRegForm, regSubmitting }: any) {
  if (regSuccess) {
    const cleanProg = (lastRegistered?.program || "Kids Program").replace(/\s*\(.*\)/, "");
    const checkoutParams = new URLSearchParams({
      student_name: lastRegistered?.student_name || "",
      parent_name: lastRegistered?.parent_name || "",
      email: lastRegistered?.parent_email || "",
      whatsapp: lastRegistered?.whatsapp || "",
      program: cleanProg,
    });
    return (
      <div className="reg-success-card">
        <h4>Pendaftaran Terkirim!</h4>
        <p>Data pendaftaran Anda telah kami terima. Anda dapat langsung melanjutkan pembayaran SPP bulan pertama atau menunggu konfirmasi Admin via WhatsApp.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginTop: "1rem" }}>
          <a
            href={`/checkout?${checkoutParams.toString()}`}
            className="form-btn"
            style={{ textDecoration: "none", textAlign: "center", display: "block" }}
          >
            Lanjut ke Pembayaran / Checkout Sekarang →
          </a>
          <button
            className="form-btn"
            style={{ backgroundColor: "transparent", color: "var(--color-primary-dark)", border: "1px solid rgba(33, 108, 126, 0.25)" }}
            onClick={() => { setRegSuccess(false); setActiveTab("whatsapp"); }}
            type="button"
          >
            Kembali ke Beranda Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegSubmit} className="space-y-4">
      {regError && <div className="auth-error-banner"><span>{regError}</span></div>}
      <div className="form-group">
        <label className="form-label">Nama Lengkap Siswa *</label>
        <input type="text" className="form-input" required value={regForm.student_name} onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })} disabled={regSubmitting} />
      </div>
      <div className="form-grid" style={{ marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Usia Siswa *</label>
          <input type="number" className="form-input" required value={regForm.student_age} onChange={(e) => setRegForm({ ...regForm, student_age: e.target.value })} disabled={regSubmitting} />
        </div>
        <div className="form-group">
          <label className="form-label">Program *</label>
          <select className="form-input" required value={regForm.program} onChange={(e) => setRegForm({ ...regForm, program: e.target.value })} disabled={regSubmitting}>
            <option value="Kids Program (5-12 tahun)">Kids Program (5-12 thn)</option>
            <option value="Teens Program (13-17 tahun)">Teens Program (13-17 thn)</option>
            <option value="Fun Calistung (5-7 tahun)">Fun Calistung (5-7 thn)</option>
            <option value="Matematika Dasar (6-12 tahun)">Matematika Dasar (6-12 thn)</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Nama Orang Tua / Wali</label>
        <input type="text" className="form-input" value={regForm.parent_name} onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })} disabled={regSubmitting} />
      </div>
      <div className="form-group">
        <label className="form-label">Email Orang Tua / Wali</label>
        <input type="email" className="form-input" value={regForm.parent_email} onChange={(e) => setRegForm({ ...regForm, parent_email: e.target.value })} disabled={regSubmitting} />
      </div>
      <div className="form-group">
        <label className="form-label">Catatan Tambahan (Opsional)</label>
        <textarea className="form-input" placeholder="Tulis catatan atau permintaan khusus di sini..." rows={3} value={regForm.notes || ""} onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })} disabled={regSubmitting} />
      </div>
      <div className="form-group">
        <label className="form-label">Nomor WhatsApp *</label>
        <input type="tel" className="form-input" required value={regForm.whatsapp} onChange={(e) => setRegForm({ ...regForm, whatsapp: e.target.value })} disabled={regSubmitting} />
      </div>
      <Button type="submit" variant="form-btn" disabled={regSubmitting}><span>{regSubmitting ? "Mengirim..." : "Kirim Pendaftaran Online"}</span></Button>
    </form>
  );
}
