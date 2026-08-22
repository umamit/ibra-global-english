"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Users, Calendar, CreditCard, CheckSquare, FileText, Settings, Layout,
  Award, Search, PlusCircle, Home, MessageSquare, QrCode, Calculator,
  Sliders, Video, GraduationCap, BookOpen, MessageCircle, Handshake,
  Brain, UserCheck, ShieldCheck, Megaphone, User,
} from "lucide-react";
import styles from "./AdminCommandPalette.module.css";

interface StudentResult {
  id: string;
  name: string;
  program: string;
  status: string;
  parent_phone?: string;
}

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AdminCommandPalette({ open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);
  const router = useRouter();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalOpen(val);
    if (!val) { setQuery(""); setStudents([]); }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen]);

  const searchStudentsApi = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) { setStudents([]); return; }
    setSearchingStudents(true);
    try {
      const res = await fetch(`/api/admin/students/quick-search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setStudents(json.data || []);
    } catch {
      setStudents([]);
    } finally {
      setSearchingStudents(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchStudentsApi(query), 250);
    return () => clearTimeout(timer);
  }, [query, searchStudentsApi]);

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Command label="Menu Navigasi & Pencarian Cepat Admin">
          <div className={styles.inputWrapper}>
            <Search size={18} className={styles.inputIcon} />
            <Command.Input
              className={styles.input}
              placeholder="Cari siswa, menu, atau aksi cepat..."
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
          </div>

          <Command.List className={styles.list}>
            <Command.Empty className={styles.empty}>
              {searchingStudents ? "Mencari data..." : "Tidak ada hasil yang cocok."}
            </Command.Empty>

            {/* Hasil Pencarian Siswa */}
            {students.length > 0 && (
              <Command.Group heading="Data Siswa Ditemukan" className={styles.groupHeading}>
                {students.map((st) => (
                  <Command.Item
                    key={st.id}
                    className={styles.item}
                    onSelect={() => navigateTo(`/admin/students?search=${encodeURIComponent(st.name)}`)}
                  >
                    <div className={styles.itemLeft}>
                      <span className={styles.itemIcon}><User size={16} /></span>
                      <span style={{ fontWeight: 700 }}>{st.name}</span>
                      {st.parent_phone && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-gray-400)" }}>
                          ({st.parent_phone})
                        </span>
                      )}
                    </div>
                    <span className={styles.studentBadge}>{st.program}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Aksi Cepat */}
            <Command.Group heading="Aksi Cepat" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/attendance?scan=true")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><QrCode size={16} /></span>
                  <span>Buka Pemindai QR Presensi</span>
                </div>
                <span className={styles.itemShortcut}>Presensi</span>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/letters")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><FileText size={16} /></span>
                  <span>Buat Surat Resmi AI</span>
                </div>
                <span className={styles.itemShortcut}>Surat</span>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/students")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><PlusCircle size={16} /></span>
                  <span>Tambah / Kelola Siswa Baru</span>
                </div>
                <span className={styles.itemShortcut}>Siswa</span>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/tax")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Calculator size={16} /></span>
                  <span>Kalkulator Pajak UMKM 0.5%</span>
                </div>
                <span className={styles.itemShortcut}>Pajak</span>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/promo")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Sliders size={16} /></span>
                  <span>Atur Durasi & Flyer Promo Popup</span>
                </div>
                <span className={styles.itemShortcut}>Promo</span>
              </Command.Item>
            </Command.Group>

            {/* Akademik & Kelas */}
            <Command.Group heading="Akademik & Kelas" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/calendar")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Calendar size={16} /></span><span>Jadwal & Kalender Akademik</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/online-schedule")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Video size={16} /></span><span>Jadwal Kelas Online (Zoom/Meet)</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/attendance")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><CheckSquare size={16} /></span><span>Absensi & Presensi Harian</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/reports")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><FileText size={16} /></span><span>Input Rapor & Nilai Siswa</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/certificates")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Award size={16} /></span><span>Penerbitan Sertifikat Digital</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/placement-test")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><GraduationCap size={16} /></span><span>Hasil Tes Penempatan (Placement)</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/curriculum")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><BookOpen size={16} /></span><span>Silabus & Kurikulum Belajar</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/feedback")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><MessageCircle size={16} /></span><span>Umpan Balik & Evaluasi Tutor</span></div>
              </Command.Item>
            </Command.Group>

            {/* Keuangan & Pajak */}
            <Command.Group heading="Keuangan & Pajak" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/finance")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><CreditCard size={16} /></span><span>Kelola Pembayaran SPP & Tagihan</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/tax")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Calculator size={16} /></span><span>SPT Pajak PT Perseorangan & Aset</span></div>
              </Command.Item>
            </Command.Group>

            {/* Komunikasi & Konten */}
            <Command.Group heading="Komunikasi, AI & Konten" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/whatsapp")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><MessageSquare size={16} /></span><span>WhatsApp Gateway & Broadcast</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/announcements")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Megaphone size={16} /></span><span>Pengumuman Lembaga</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/letters")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><FileText size={16} /></span><span>Arsip Surat Resmi & Generator AI</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/kemitraan")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Handshake size={16} /></span><span>Kemitraan & Proposal Lembaga</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/promo")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Sliders size={16} /></span><span>Manajemen Popup Promosi & Flyer</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/rag")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Brain size={16} /></span><span>Basis Pengetahuan AI (RAG Docs)</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/landing-page")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Layout size={16} /></span><span>Pengaturan CMS Landing Page</span></div>
              </Command.Item>
            </Command.Group>

            {/* Manajemen Pengguna & Sistem */}
            <Command.Group heading="Manajemen Pengguna & Sistem" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Home size={16} /></span><span>Ringkasan Dashboard Utama</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/students")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Users size={16} /></span><span>Data Siswa & Orang Tua</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/tutors")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><UserCheck size={16} /></span><span>Data Tutor & Staf Pengajar</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/audit-logs")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><ShieldCheck size={16} /></span><span>Log Audit & Aktivitas Sistem</span></div>
              </Command.Item>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/settings")}>
                <div className={styles.itemLeft}><span className={styles.itemIcon}><Settings size={16} /></span><span>Pengaturan Akun & Profil</span></div>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className={styles.footer}>
            <span>Navigasi: <strong>↑</strong> <strong>↓</strong> untuk memilih, <strong>Enter</strong> untuk buka</span>
            <span>Tutup: <strong>ESC</strong></span>
          </div>
        </Command>
      </div>
    </div>
  );
}
