"use client";
import "./Contact.css";
import React, { useEffect, useRef } from "react";
import { useContactForm } from "@/hooks/useContactForm";
import { ContactInfoPanel, ContactFormPanel } from "./ContactPanels";

export default function Contact({ form, setForm, honeypot, setHoneypot, initialSettings }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

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
        <div className="contact-map-card">
          <iframe
            title="Google Maps Lokasi Ibra Global English Bobong"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.586616458514!2d124.37475487570889!3d-1.9389935367069792!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d82af33f6c6e6b5%3A0x332ca8e07224c054!2sPT.%20IBRA%20GLOBAL%20ENGLISH%20--%20Kursus%20Bahasa%20Inggris%20dan%20CALISTUNG%20di%20Bobong!5e0!3m2!1sid!2sid!4v1717820000000!5m2!1sid!2sid"
            className="contact-map-iframe"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
