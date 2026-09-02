"use client";
import "./Contact.css";
import React, { useEffect, useRef } from "react";
import { useContactForm } from "@/hooks/useContactForm";
import { ContactInfoPanel, ContactFormPanel } from "./ContactPanels";

export default function Contact({ form, setForm, honeypot, setHoneypot, initialSettings }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [mapTab, setMapTab] = React.useState<"gmaps" | "situasi">("gmaps");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const contactProps = useContactForm({ form, setForm, honeypot, initialSettings });

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth <= 768) return;

    let ctx: any;
    import("gsap").then((gsapModule) => {
      const gsap = gsapModule.default;
      import("gsap/ScrollTrigger").then((stModule) => {
        const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        if (!sectionRef.current) return;

        ctx = gsap.context(() => {
          if (leftPanelRef.current) {
            gsap.fromTo(
              leftPanelRef.current,
              { y: 20 },
              {
                y: -25,
                ease: "none",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              }
            );
          }

          if (rightPanelRef.current) {
            gsap.fromTo(
              rightPanelRef.current,
              { y: -10 },
              {
                y: 20,
                ease: "none",
                scrollTrigger: {
                  trigger: sectionRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                },
              }
            );
          }
        }, sectionRef);
      });
    });

    return () => {
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      <div className="container contact-grid">
        <ContactInfoPanel
          address={contactProps.address}
          phone={contactProps.phone}
          rawPhone={contactProps.rawPhone}
          email={contactProps.email}
          leftPanelRef={leftPanelRef}
        />
        <ContactFormPanel
          {...contactProps}
          form={form}
          setForm={setForm}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
          rightPanelRef={rightPanelRef}
        />
      </div>

      <div className="container contact-map-container scroll-fade-up">
        <div className="contact-map-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-900)", letterSpacing: "-0.02em" }}>Lokasi & Rute Gedung</h3>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--color-gray-500)" }}>Pilih tampilan Google Maps digital atau Peta Situasi Rute Lokal Bobong.</p>
          </div>
          <div className="contact-tab-switcher" style={{ marginBottom: 0, minWidth: "280px" }}>
            <button type="button" className={`contact-tab-btn ${mapTab === "gmaps" ? "active" : ""}`} onClick={() => setMapTab("gmaps")}>Google Maps</button>
            <button type="button" className={`contact-tab-btn ${mapTab === "situasi" ? "active" : ""}`} onClick={() => setMapTab("situasi")}>Peta Situasi Rute</button>
          </div>
        </div>

        <div className="contact-map-card">
          {mapTab === "gmaps" ? (
            <iframe
              title="Google Maps Lokasi Ibra Global English Bobong"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.586616458514!2d124.37475487570889!3d-1.9389935367069792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d82af33f6c6e6b5%3A0x332ca8e07224c054!2sPT.%20IBRA%20GLOBAL%20ENGLISH%20--%20Kursus%20Bahasa%20Inggris%20dan%20CALISTUNG%20di%20Bobong!5e0!3m2!1sid!2sid!4v1717820000000!5m2!1sid!2sid"
              className="contact-map-iframe"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div
              className="peta-situasi-preview-box"
              onClick={() => setIsModalOpen(true)}
              style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: "10px", backgroundColor: "#ffffff", padding: "0.5rem", cursor: "zoom-in" }}
            >
              <div className="peta-zoom-badge">Klik untuk Perbesar Layar Penuh</div>
              <img
                src="/assets/peta-situasi-bobong.png?v=20260902_v3"
                alt="Peta Situasi dan Rute Jalan Ibra Global English Bobong"
                style={{ width: "100%", maxHeight: "560px", objectFit: "contain", borderRadius: "8px", display: "block" }}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="peta-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="peta-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="peta-modal-header">
              <div>
                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "var(--color-gray-900)" }}>Peta Situasi Resmi LKP Ibra Global English Bobong</h4>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--color-gray-500)" }}>Penunjuk arah rute gedung dari Mess Tambang menuju Gedung Kost Fitrah Lantai 1</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <a href="/assets/peta-situasi-bobong.png?v=20260902_v3" target="_blank" rel="noopener noreferrer" className="peta-modal-link-btn">Buka Gambar Asli</a>
                <button type="button" onClick={() => setIsModalOpen(false)} className="peta-modal-close-btn">Tutup</button>
              </div>
            </div>
            <div className="peta-modal-body" style={{ padding: "1rem", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
              <img
                src="/assets/peta-situasi-bobong.png?v=20260902_v3"
                alt="Peta Situasi Resmi LKP Ibra Global English Bobong"
                className="peta-modal-full-img"
                style={{ width: "100%", height: "auto", maxHeight: "80vh", objectFit: "contain", display: "block" }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
