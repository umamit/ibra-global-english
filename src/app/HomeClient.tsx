"use client";

import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
// CSS di-import per-komponen masing-masing

// Import modular components
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Programs from "@/components/Programs";
import Benefits from "@/components/Benefits";
import Curriculum from "@/components/Curriculum";
import Footer from "@/components/Footer";
import MarqueeBanner from "@/components/MarqueeBanner";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// Dynamically load below-the-fold and interactive elements
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: true });
const FAQ = dynamic(() => import("@/components/FAQ"), { ssr: true });
const CTA = dynamic(() => import("@/components/CTA"), { ssr: true });
const Contact = dynamic(() => import("@/components/Contact"), { ssr: true });
const SocialFloat = dynamic(() => import("@/components/SocialFloat"), { ssr: false });
const AIChatWidget = dynamic(() => import("@/components/AIChatWidget"), { ssr: false });

import { LandingSettings } from "@/utils/getLandingSettings";

interface HomeClientProps {
  initialSettings: LandingSettings;
}

interface RegistrationForm {
  name: string;
  whatsapp: string;
  program: string;
}

export default function HomeClient({ initialSettings }: HomeClientProps) {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Call scroll reveal animation hook
  useScrollReveal();

  // Controlled Registration Form state (synchronized with WebMCP Agent Tools)
  const [form, setForm] = useState<RegistrationForm>({ name: "", whatsapp: "", program: "Kids Program (5-12 tahun)" });
  const [honeypot, setHoneypot] = useState("");

  // Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTimeout(() => {
      setTheme(initialTheme === "dark" ? "dark" : "light");
    }, 0);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  // Handle theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Register WebMCP Agent Tools
  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator && (window.navigator as any).modelContext) {
      const mc = (window.navigator as any).modelContext;
      
      const getProgramDetailsTool = {
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
        execute: async (args: Record<string, string>): Promise<string> => {
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
      };

      const registerCourseTool = {
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
        execute: async (args: Record<string, string>): Promise<string> => {
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
      };

      try {
        // Panggil provideContext sesuai spesifikasi pengujian/scanner yang diminta user
        if (mc.provideContext) {
          mc.provideContext({
            tools: [getProgramDetailsTool, registerCourseTool]
          });
        }
        
        // Panggil juga registerTool individual sebagai fallback standar terkini
        if (mc.registerTool) {
          mc.registerTool(getProgramDetailsTool);
          mc.registerTool(registerCourseTool);
        }
      } catch (err) {
        console.error("Failed to register WebMCP tools:", err);
      }
    }
  }, []);

  // Mencegah klik kanan, salin (copy), dan seret (drag) gambar di landing page jika copy protection aktif
  useEffect(() => {
    if (initialSettings?.allow_public_copy === "true") {
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Izinkan klik kanan pada elemen input/textarea agar form pendaftaran tetap berfungsi normal
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      // Izinkan copy teks pada elemen input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [initialSettings]);

  return (
    <div className={initialSettings?.allow_public_copy === "true" ? "" : "nocopy-container"}>
      <MarqueeBanner initialSettings={initialSettings} />
      <Header theme={theme} toggleTheme={toggleTheme} hasMarquee={true} initialSettings={initialSettings} />
      <main>
        <Hero initialSettings={initialSettings} />
        <Programs initialSettings={initialSettings} />
        <Curriculum initialSettings={initialSettings} />
        <Benefits initialSettings={initialSettings} />
        <Testimonials />
        <FAQ initialSettings={initialSettings} />
        <CTA initialSettings={initialSettings} />
        <Contact
          form={form}
          setForm={setForm}
          honeypot={honeypot}
          setHoneypot={setHoneypot}
          initialSettings={initialSettings}
        />
      </main>
      <Footer initialSettings={initialSettings} />
      <SocialFloat />
      <AIChatWidget />
    </div>
  );
}
