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
          <div className="contact-details"><h4>Alamat</h4><p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">{address}</a></p></div>
        </div>
        <div className="contact-item">
          <div className="contact-details"><h4>Telepon / WhatsApp</h4><p><a href={`tel:${rawPhone}`}>{phone}</a></p></div>
        </div>
        <div className="contact-item">
          <div className="contact-details"><h4>Email</h4><p><a href={`mailto:${email}`}>{email}</a></p></div>
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
      <div className="contact-tabs" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button type="button" className={`btn-portal-outline ${activeTab === "whatsapp" ? "active" : ""}`} onClick={() => setActiveTab("whatsapp")}>Pesan WhatsApp</button>
        <button type="button" className={`btn-portal-outline ${activeTab === "daftar" ? "active" : ""}`} onClick={() => setActiveTab("daftar")}>Pendaftaran Online</button>
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
