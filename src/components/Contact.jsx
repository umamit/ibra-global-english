"use client";

import { useState } from "react";

export default function Contact({ form, setForm, honeypot, setHoneypot, initialSettings }) {
  const [address] = useState(initialSettings?.contact_address || "Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah");
  const [phone] = useState(initialSettings?.contact_phone || "+62 813-5700-1357");
  const [rawPhone] = useState(() => {
    const p = initialSettings?.contact_phone || "6281357001357";
    return p.replace(/[^0-9]/g, "");
  });
  const [email] = useState(initialSettings?.contact_email || "admin@ibraglobalenglish.uk");

  // Tab state: "whatsapp" | "daftar"
  const [activeTab, setActiveTab] = useState("whatsapp");

  // Registration form state
  const [regForm, setRegForm] = useState({
    student_name: "",
    student_age: "",
    parent_name: "",
    whatsapp: "",
    program: "Kids Program (5-12 tahun)",
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState("");

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (honeypot) {
      console.warn("Spam bot submission caught.");
      setForm({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
      return;
    }

    if (!form.name || !form.whatsapp) {
      alert("Mohon isi semua data pendaftaran dengan benar.");
      return;
    }

    const numericWhatsapp = form.whatsapp.replace(/[^0-9]/g, "");
    if (numericWhatsapp.length < 9) {
      alert("Mohon masukkan nomor WhatsApp yang valid.");
      return;
    }

    const targetPhone = rawPhone;
    const message = `Halo Ibra Global English, saya ingin mendaftar kursus.\n\n*Nama Lengkap:* ${form.name}\n*Nomor WhatsApp:* ${form.whatsapp}\n*Program yang Diminati:* ${form.program}`;
    const encodedMessage = encodeURIComponent(message);
    
    window.location.href = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    setForm({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });

      const result = await res.json();

      if (!res.ok) {
        setRegError(result.error || "Gagal mengirim pendaftaran.");
        return;
      }

      setRegSuccess(true);
      setRegForm({
        student_name: "",
        student_age: "",
        parent_name: "",
        whatsapp: "",
        program: "Kids Program (5-12 tahun)",
      });
    } catch {
      setRegError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="container contact-grid">
        {/* Info Left */}
        <div className="contact-info-panel" data-aos="fade-right">
          <h2>Hubungi Kami di Bobong</h2>
          <p>Siap meningkatkan kemampuan bahasa Inggris Anda di Pulau Taliabu? Hubungi kami sekarang untuk konsultasi gratis!</p>
          
          <div className="contact-links">
            <div className="contact-item">
              <div className="contact-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="contact-details">
                <h4>Alamat</h4>
                <p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="contact-address-link">
                    {address}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div className="contact-details">
                <h4>Telepon</h4>
                <p>
                  <a href={`tel:${rawPhone}`} className="contact-phone-link">
                    {phone}
                  </a>
                </p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="contact-details">
                <h4>Email</h4>
                <p>
                  <a href={`mailto:${email}`} className="contact-email-link">
                    {email}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Right */}
        <div className="form-panel" id="registration-form-panel" data-aos="fade-left">

          {/* Tab Switcher */}
          <div className="contact-tab-switcher">
            <button
              className={`contact-tab-btn ${activeTab === "whatsapp" ? "active" : ""}`}
              onClick={() => { setActiveTab("whatsapp"); setRegSuccess(false); setRegError(""); }}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.998 2.003C6.478 2.003 2 6.481 2 12.001c0 1.762.459 3.463 1.337 4.955L2.003 22l5.217-1.302c1.41.778 3.022 1.193 4.778 1.193 5.52 0 9.998-4.478 9.998-9.998 0-5.52-4.478-9.89-10-9.89zm0 18.24c-1.623 0-3.187-.45-4.545-1.3l-.325-.195-3.09.771.798-3.001-.217-.346C3.46 14.877 3 13.477 3 12.001c0-4.968 4.029-8.997 8.998-8.997 4.969 0 8.997 4.029 8.997 8.997 0 4.969-4.028 8.242-8.997 8.242z"/>
              </svg>
              <span>Hubungi WhatsApp</span>
            </button>
            <button
              className={`contact-tab-btn ${activeTab === "daftar" ? "active" : ""}`}
              onClick={() => { setActiveTab("daftar"); setRegSuccess(false); setRegError(""); }}
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span>Daftar Online</span>
            </button>
          </div>

          {/* Tab: Hubungi WhatsApp */}
          {activeTab === "whatsapp" && (
            <>
              <h3 style={{ marginTop: "1.5rem" }}>Daftar via WhatsApp</h3>
              <form id="registration-form" onSubmit={handleFormSubmit} className="space-y-4">
                {/* Honeypot Field for Spam Bot Prevention */}
                <div className="form-group" style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="honeypot-input">Leave this field blank</label>
                  <input 
                    type="text" 
                    id="honeypot-input" 
                    name="honeypot" 
                    tabIndex="-1" 
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="name-input" className="form-label">Nama Lengkap</label>
                  <input 
                    type="text" 
                    id="name-input" 
                    className="form-input" 
                    placeholder="Masukkan nama Anda" 
                    required 
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="whatsapp-input" className="form-label">Nomor WhatsApp</label>
                  <input 
                    type="tel" 
                    id="whatsapp-input" 
                    className="form-input" 
                    placeholder="08xx xxxx xxxx" 
                    required 
                    autoComplete="tel"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="program-select" className="form-label">Program yang Diminati</label>
                  <select 
                    id="program-select" 
                    className="form-input"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                  >
                    <option value="Kids Program (5-12 tahun)">Kids Program (5-12 tahun)</option>
                    <option value="Teens Program (13-17 tahun)">Teens Program (13-17 tahun)</option>
                    <option value="Fun Calistung (5-7 tahun)">Fun Calistung (5-7 tahun)</option>
                  </select>
                </div>
                
                <button type="submit" className="form-btn">
                  <span>Kirim via WhatsApp</span>
                </button>
              </form>
            </>
          )}

          {/* Tab: Daftar Online */}
          {activeTab === "daftar" && (
            <>
              <h3 style={{ marginTop: "1.5rem" }}>Pendaftaran Online</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-gray-500)", marginBottom: "1.25rem" }}>
                Isi formulir di bawah. Tim kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi pendaftaran.
              </p>

              {regSuccess ? (
                <div className="reg-success-card">
                  <div className="reg-success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h4>Pendaftaran Terkirim! 🎉</h4>
                  <p>Data pendaftaran Anda telah kami terima. Tim Ibra Global English akan segera menghubungi Anda melalui WhatsApp untuk konfirmasi dan jadwal belajar.</p>
                  <button
                    className="form-btn"
                    style={{ marginTop: "1rem" }}
                    onClick={() => { setRegSuccess(false); setActiveTab("whatsapp"); }}
                    type="button"
                  >
                    Kembali ke Beranda Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  {regError && (
                    <div className="auth-error-banner">
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="reg-student-name" className="form-label">
                      Nama Lengkap Siswa <span style={{ color: "var(--color-red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="reg-student-name"
                      className="form-input"
                      placeholder="Nama lengkap anak yang akan didaftarkan"
                      required
                      value={regForm.student_name}
                      onChange={(e) => setRegForm({ ...regForm, student_name: e.target.value })}
                      disabled={regSubmitting}
                    />
                  </div>

                  <div className="form-grid" style={{ marginBottom: "1rem" }}>
                    <div className="form-group">
                      <label htmlFor="reg-student-age" className="form-label">Usia Siswa</label>
                      <input
                        type="number"
                        id="reg-student-age"
                        className="form-input"
                        placeholder="Contoh: 8"
                        min="3"
                        max="20"
                        value={regForm.student_age}
                        onChange={(e) => setRegForm({ ...regForm, student_age: e.target.value })}
                        disabled={regSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="reg-program" className="form-label">
                        Program <span style={{ color: "var(--color-red)" }}>*</span>
                      </label>
                      <select
                        id="reg-program"
                        className="form-input"
                        required
                        value={regForm.program}
                        onChange={(e) => setRegForm({ ...regForm, program: e.target.value })}
                        disabled={regSubmitting}
                      >
                        <option value="Kids Program (5-12 tahun)">Kids Program (5-12 thn)</option>
                        <option value="Teens Program (13-17 tahun)">Teens Program (13-17 thn)</option>
                        <option value="Fun Calistung (5-7 tahun)">Fun Calistung (5-7 thn)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-parent-name" className="form-label">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      id="reg-parent-name"
                      className="form-input"
                      placeholder="Nama orang tua atau wali siswa"
                      value={regForm.parent_name}
                      onChange={(e) => setRegForm({ ...regForm, parent_name: e.target.value })}
                      disabled={regSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reg-whatsapp" className="form-label">
                      Nomor WhatsApp <span style={{ color: "var(--color-red)" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="reg-whatsapp"
                      className="form-input"
                      placeholder="08xx xxxx xxxx"
                      required
                      autoComplete="tel"
                      value={regForm.whatsapp}
                      onChange={(e) => setRegForm({ ...regForm, whatsapp: e.target.value })}
                      disabled={regSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-btn"
                    disabled={regSubmitting}
                    style={{ opacity: regSubmitting ? 0.7 : 1 }}
                  >
                    <span>{regSubmitting ? "Mengirim..." : "Kirim Pendaftaran Online"}</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* Option for offline registration */}
          <div className="contact-offline-notice" style={{ 
            marginTop: "1.5rem", 
            paddingTop: "1.25rem", 
            borderTop: "1px dashed var(--color-gray-200, #e5e7eb)", 
            textAlign: "center",
            fontSize: "0.875rem"
          }}>
            <span style={{ color: "var(--color-gray-500, #6b7280)" }}>
              Lebih suka mendaftar secara manual?{" "}
            </span>
            <a 
              href="/formulir-offline" 
              style={{ 
                color: "var(--color-primary, #216c7e)", 
                fontWeight: "700",
                textDecoration: "underline",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem"
              }}
            >
              📄 Cetak Formulir Offline
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
