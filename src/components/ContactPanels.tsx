"use client";

import React from "react";
import Button from "@/components/Button";
import { OnlineRegistrationForm } from "./OnlineRegistrationForm";

export function ContactInfoPanel({ address, phone, rawPhone, email, leftPanelRef }: any) {
  return (
    <div className="contact-info-panel" ref={leftPanelRef}>
      <h2>Hubungi Kami di Bobong</h2>
      <p>Siap meningkatkan kemampuan bahasa Inggris Anda di Pulau Taliabu? Hubungi kami sekarang!</p>
      <div className="contact-links">
        <div className="contact-item">
          <div className="contact-icon-box" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className="contact-details"><h4>Alamat</h4><p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer" className="contact-address-link">{address}</a></p></div>
        </div>
        <div className="contact-item">
          <div className="contact-icon-box" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className="contact-details"><h4>Telepon / WhatsApp</h4><p><a href={`tel:${rawPhone}`} className="contact-phone-link">{phone}</a></p></div>
        </div>
        <div className="contact-item">
          <div className="contact-icon-box" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div className="contact-details"><h4>Email</h4><p><a href={`mailto:${email}`} className="contact-email-link">{email}</a></p></div>
        </div>
      </div>
    </div>
  );
}

export function ContactFormPanel(props: any) {
  const { rightPanelRef, activeTab, setActiveTab, regSuccess, setRegSuccess, handleRegSubmit, regError, regForm, setRegForm, regSubmitting } = props;

  const [localWaForm, setLocalWaForm] = React.useState({ name: "", message: "" });
  const waForm = props.waForm || localWaForm;
  const setWaForm = props.setWaForm || setLocalWaForm;

  const handleWaSubmit = props.handleWaSubmit || ((e: React.FormEvent) => {
    e.preventDefault();
    if (!waForm.name || !waForm.message) return;
    const text = encodeURIComponent(`Halo Ibra Global English, pesan dari *${waForm.name}*:\n\n${waForm.message}`);
    const rawP = props.rawPhone || "6281357001357";
    window.open(`https://wa.me/${rawP}?text=${text}`, "_blank");
  });

  return (
    <div className="contact-form-panel" ref={rightPanelRef}>
      <div className="contact-tab-switcher">
        <button type="button" className={`contact-tab-btn ${activeTab === "whatsapp" ? "active" : ""}`} onClick={() => setActiveTab("whatsapp")}>Pesan WhatsApp</button>
        <button type="button" className={`contact-tab-btn ${activeTab === "daftar" ? "active" : ""}`} onClick={() => setActiveTab("daftar")}>Pendaftaran Online</button>
      </div>

      {activeTab === "whatsapp" && (
        <form onSubmit={handleWaSubmit} className="space-y-4">
          <div className="form-group"><label className="form-label">Nama Anda</label><input type="text" className="form-input" required value={waForm.name || ""} onChange={(e) => setWaForm({ ...waForm, name: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Pesan</label><textarea className="form-input" rows={3} required value={waForm.message || ""} onChange={(e) => setWaForm({ ...waForm, message: e.target.value })} /></div>
          <Button type="submit" variant="form-btn"><span>Kirim via WhatsApp</span></Button>
        </form>
      )}

      {activeTab === "daftar" && (
        <OnlineRegistrationForm regSuccess={regSuccess} setRegSuccess={setRegSuccess} setActiveTab={setActiveTab} handleRegSubmit={handleRegSubmit} regError={regError} regForm={regForm} setRegForm={setRegForm} regSubmitting={regSubmitting} />
      )}
    </div>
  );
}
