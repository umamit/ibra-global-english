"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Users,
  Calendar,
  CreditCard,
  CheckSquare,
  FileText,
  Settings,
  Layout,
  Award,
  Search,
  PlusCircle,
  Home,
  MessageSquare,
} from "lucide-react";
import styles from "./AdminCommandPalette.module.css";

interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AdminCommandPalette({ open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalOpen(val);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen]);

  const navigateTo = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Command label="Menu Navigasi Cepat Admin">
          <div className={styles.inputWrapper}>
            <Search size={18} className={styles.inputIcon} />
            <Command.Input
              className={styles.input}
              placeholder="Ketik menu atau aksi cepat..."
              autoFocus
            />
          </div>

          <Command.List className={styles.list}>
            <Command.Empty className={styles.empty}>Tidak ada menu yang cocok.</Command.Empty>

            <Command.Group heading="Aksi Cepat" className={styles.groupHeading}>
              <Command.Item
                className={styles.item}
                onSelect={() => navigateTo("/admin/students")}
              >
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><PlusCircle size={16} /></span>
                  <span>Tambah / Kelola Siswa</span>
                </div>
                <span className={styles.itemShortcut}>Siswa</span>
              </Command.Item>

              <Command.Item
                className={styles.item}
                onSelect={() => navigateTo("/admin/calendar")}
              >
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Calendar size={16} /></span>
                  <span>Atur Jadwal & Kalender</span>
                </div>
                <span className={styles.itemShortcut}>Jadwal</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Menu Utama" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Home size={16} /></span>
                  <span>Ringkasan Dashboard</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/students")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Users size={16} /></span>
                  <span>Data Siswa & Orang Tua</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/tuition")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><CreditCard size={16} /></span>
                  <span>Pembayaran SPP Siswa</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/attendance")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><CheckSquare size={16} /></span>
                  <span>Absensi & Presensi Siswa</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/reports")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><FileText size={16} /></span>
                  <span>Laporan Nilai / Rapor</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/certificates")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Award size={16} /></span>
                  <span>Sertifikat Digital Siswa</span>
                </div>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Pengaturan & Konten" className={styles.groupHeading}>
              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/landing-page")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Layout size={16} /></span>
                  <span>Landing Page CMS</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/whatsapp")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><MessageSquare size={16} /></span>
                  <span>Pengaturan WhatsApp Gateway</span>
                </div>
              </Command.Item>

              <Command.Item className={styles.item} onSelect={() => navigateTo("/admin/settings")}>
                <div className={styles.itemLeft}>
                  <span className={styles.itemIcon}><Settings size={16} /></span>
                  <span>Pengaturan Akun & Profil</span>
                </div>
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
