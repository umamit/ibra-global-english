"use client";

import { useState, useEffect } from "react";
import { createClient } from "../utils/supabase/client";

export default function Contact({ form, setForm, honeypot, setHoneypot }) {
  const supabase = createClient();
  const [address, setAddress] = useState("Jl. TPU Bobong Komp. Fangahu, Lantai 1 Kost Fitrah");
  const [phone, setPhone] = useState("+62 813-5700-1357");
  const [rawPhone, setRawPhone] = useState("6281357001357");
  const [email, setEmail] = useState("admin@ibraglobalenglish.uk");

  useEffect(() => {
    async function fetchContactSettings() {
      try {
        const { data, error } = await supabase
          .from('landing_settings')
          .select('key, value');
        if (error) throw error;
        if (data && data.length > 0) {
          const settings = {};
          data.forEach(item => {
            settings[item.key] = item.value;
          });
          if (settings.contact_address) setAddress(settings.contact_address);
          if (settings.contact_phone) {
            setPhone(settings.contact_phone);
            const cleaned = settings.contact_phone.replace(/[^0-9]/g, "");
            setRawPhone(cleaned);
          }
          if (settings.contact_email) setEmail(settings.contact_email);
        }
      } catch (e) {
        console.warn("Gagal memuat pengaturan kontak dari database. Menggunakan data default (statis).", e);
      }
    }
    fetchContactSettings();
  }, []);

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
          <h3>Daftar Sekarang</h3>
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
              <span>Kirim Pendaftaran</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
