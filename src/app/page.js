"use client";

import { useState, useEffect } from "react";

// Import modular components
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import Benefits from "@/components/Benefits";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SocialFloat from "@/components/SocialFloat";
import LightboxModal from "@/components/LightboxModal";

export default function Home() {
  // Theme state
  const [theme, setTheme] = useState("light");

  // Lightbox state for Gallery
  const [lightbox, setLightbox] = useState({ isOpen: false, src: "", caption: "" });

  // Controlled Registration Form state (synchronized with WebMCP Agent Tools)
  const [form, setForm] = useState({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
  const [honeypot, setHoneypot] = useState("");

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Initialize AOS (Animate on Scroll) library dynamically
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({
        duration: 800,
        easing: "ease-out-quad",
        once: true,
        offset: 50,
      });
    });
  }, []);

  // Register WebMCP Agent Tools
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.modelContext && window.navigator.modelContext.registerTool) {
      try {
        window.navigator.modelContext.registerTool({
          name: "get_program_details",
          description: "Get details about kids, teens and Calistung programs at Ibra Global English.",
          inputSchema: {
            type: "object",
            properties: {
              program: {
                type: "string",
                description: "Name of the program (Kids Program, Teens Program, Fun Calistung)"
              }
            }
          },
          execute: async (args) => {
            const program = args.program ? args.program.toLowerCase() : "";
            if (program.includes("kids")) {
              return "Kids Program (5-12 tahun): Pembelajaran interaktif dengan menyanyi, bermain, dan mewarnai untuk membangun kecintaan berbahasa Inggris sejak dini.";
            } else if (program.includes("teen")) {
              return "Teens Program (13-17 tahun): Fokus pada speaking, diskusi kelompok, presentasi, dan tata bahasa (grammar) untuk membantu sekolah dan masa depan.";
            } else if (program.includes("calistung")) {
              return "Fun Calistung (5-7 tahun): Bimbingan membaca, menulis, dan berhitung yang dikemas secara seru dan ramah anak.";
            }
            return "Pilihan program: Kids Program (5-12 tahun), Teens Program (13-17 tahun), Fun Calistung (5-7 tahun).";
          }
        });

        window.navigator.modelContext.registerTool({
          name: "register_course",
          description: "Register a new student for a course at Ibra Global English.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Full name of the student" },
              whatsapp: { type: "string", description: "WhatsApp contact number" },
              program: { type: "string", description: "Selected course program (Kids Program (5-12 tahun), Teens Program (13-17 tahun), Fun Calistung (5-7 tahun))" }
            },
            required: ["name", "whatsapp"]
          },
          execute: async (args) => {
            setForm({
              name: args.name,
              whatsapp: args.whatsapp,
              program: args.program || "Kids Program (5-12 tahun)"
            });

            // Submit WhatsApp redirect after tiny delay
            setTimeout(() => {
              const targetPhone = "6281357001357";
              const message = `Halo Ibra Global English, saya ingin mendaftar kursus.\n\n*Nama Lengkap:* ${args.name}\n*Nomor WhatsApp:* ${args.whatsapp}\n*Program yang Diminati:* ${args.program || "Kids Program (5-12 tahun)"}`;
              const encodedMessage = encodeURIComponent(message);
              window.location.href = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
            }, 300);

            return `Pendaftaran untuk ${args.name} berhasil diisi dan diarahkan ke WhatsApp.`;
          }
        });
      } catch (err) {
        console.error("Failed to register WebMCP tools:", err);
      }
    }
  }, []);

  const openLightbox = (src, caption) => {
    setLightbox({ isOpen: true, src, caption });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, src: "", caption: "" });
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Programs />
        <Benefits />
        <Gallery onOpenLightbox={openLightbox} />
        <Testimonials />
        <FAQ />
        <CTA />
        <Contact 
          form={form} 
          setForm={setForm} 
          honeypot={honeypot} 
          setHoneypot={setHoneypot} 
        />
      </main>
      <Footer />
      <SocialFloat />
      <LightboxModal 
        isOpen={lightbox.isOpen} 
        src={lightbox.src} 
        caption={lightbox.caption} 
        onClose={closeLightbox} 
      />
    </>
  );
}
