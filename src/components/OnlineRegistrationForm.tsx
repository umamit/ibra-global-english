import React from "react";
import Button from "@/components/Button";

export function OnlineRegistrationForm({ regSuccess, setRegSuccess, setActiveTab, handleRegSubmit, regError, regForm, setRegForm, regSubmitting }: any) {
  if (regSuccess) {
    return (
      <div className="reg-success-card">
        <h4>Pendaftaran Terkirim!</h4>
        <p>Data pendaftaran Anda telah kami terima. Tim kami akan segera menghubungi Anda via WhatsApp.</p>
        <button className="form-btn" style={{ marginTop: "1rem" }} onClick={() => { setRegSuccess(false); setActiveTab("whatsapp"); }} type="button">Kembali ke Beranda Form</button>
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
