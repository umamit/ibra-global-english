import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Student } from "@/types";

interface FinanceWaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  payment: any | null;
  selectedMonth: string;
  getMonthName: (m: string) => string;
  formatRupiah: (n: number) => string;
  onSuccess: (message: string) => void;
}

export default function FinanceWaModal({
  isOpen,
  onClose,
  student,
  payment,
  selectedMonth,
  getMonthName,
  formatRupiah,
  onSuccess
}: FinanceWaModalProps) {
  const supabase = createClient();

  const [waPhone, setWaPhone] = useState<string>("");
  const [waMessage, setWaMessage] = useState<string>("");
  const [waLoading, setWaLoading] = useState<boolean>(false);
  const [waError, setWaError] = useState<string>("");
  const [waDuplicityWarning, setWaDuplicityWarning] = useState<boolean>(false);

  useEffect(() => {
    async function fetchRegistrationWa() {
      if (!isOpen || !student) return;
      setWaPhone("");
      setWaMessage("");
      setWaError("");
      setWaDuplicityWarning(false);
      setWaLoading(true);

      try {
        const { data: regData, error: errReg } = await supabase
          .from("registrations")
          .select("whatsapp, parent_name")
          .eq("student_name", student.name);

        if (!errReg && regData && regData.length > 0) {
          setWaPhone(regData[0].whatsapp || "");
          if (regData.length > 1) {
            setWaDuplicityWarning(true);
          }
        }
      } catch (err) {
        console.warn("Gagal mengambil nomor whatsapp registrasi:", err);
      } finally {
        setWaLoading(false);
      }
    }

    fetchRegistrationWa();
  }, [isOpen, student]);

  if (!isOpen || !student || !payment) return null;

  const handleGenerateWaBillingDraft = async () => {
    setWaLoading(true);
    setWaError("");
    try {
      const res = await fetch("/api/admin/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "spp-billing-draft",
          payload: {
            name: student.name,
            program: student.program,
            month: selectedMonth,
            amount: payment.amount,
            parent_name: student.profiles?.full_name || ""
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat draf pesan.");

      setWaMessage(data.reply || "");
    } catch (err: any) {
      console.error(err);
      setWaError(err.message || "Gagal membuat draf pesan billing.");
    } finally {
      setWaLoading(false);
    }
  };

  const handleSendWaBilling = () => {
    if (!waPhone.trim() || !waMessage.trim()) return;
    
    let cleanPhone = waPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const encodedMessage = encodeURIComponent(waMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(waUrl, "_blank");
    onSuccess("Membuka WhatsApp Web untuk mengirim pesan...");
  };

  return (
    <div className="portal-modal-overlay" onClick={() => { if (!waLoading) onClose(); }}>
      <div className="portal-modal" style={{ maxWidth: "600px", padding: "2rem" }} onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "900", color: "var(--color-gray-900)", margin: 0 }}>
            💬 Kirim Tagihan SPP via AI (WhatsApp)
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            disabled={waLoading}
            style={{ background: "transparent", border: "none", fontSize: "1.5rem", fontWeight: "800", color: "var(--color-gray-400)", cursor: waLoading ? "not-allowed" : "pointer" }}
          >
            &times;
          </button>
        </div>

        {waError && (
          <div className="auth-error-banner" style={{ marginBottom: "1rem", padding: "0.75rem 1rem", fontSize: "0.85rem" }}>
            <span>⚠️ {waError}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "0.9rem" }}>
          
          <div style={{ backgroundColor: "var(--color-gray-50)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--color-gray-200)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "600" }}>Nama Siswa</p>
              <p style={{ margin: 0, fontWeight: "800", color: "var(--color-gray-800)" }}>{student.name}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "600" }}>Program</p>
              <p style={{ margin: 0, fontWeight: "700" }}>{student.program}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "600" }}>Bulan Tagihan</p>
              <p style={{ margin: 0, fontWeight: "700" }}>{getMonthName(selectedMonth)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-gray-400)", fontWeight: "600" }}>Nominal SPP</p>
              <p style={{ margin: 0, fontWeight: "800", color: "var(--color-primary-dark)" }}>{formatRupiah(payment.amount || 0)}</p>
            </div>
          </div>

          {waDuplicityWarning && (
            <div style={{
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              color: "#d97706",
              fontSize: "0.85rem",
              fontWeight: "600",
              lineHeight: "1.4"
            }}>
              ⚠️ Peringatan: Ditemukan lebih dari 1 data pendaftaran dengan nama siswa &quot;{student.name}&quot;. Harap verifikasi nomor WhatsApp dan nama orang tua penerima di bawah ini dengan teliti.
            </div>
          )}

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: "800" }}>Nomor WhatsApp Penerima (Orang Tua)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Contoh: 081357001357 atau 6281357001357"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              disabled={waLoading}
              required
            />
            <span style={{ fontSize: "0.75rem", color: "var(--color-gray-400)" }}>
              *Sistem otomatis mencari nomor dari formulir pendaftaran. Jika tidak terisi, silakan ketik manual.
            </span>
          </div>

          {!waMessage ? (
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button 
                type="button" 
                className="btn-portal-primary" 
                onClick={handleGenerateWaBillingDraft}
                disabled={waLoading || !waPhone.trim()}
              >
                <span>{waLoading ? "🤖 Menghubungi Groq AI..." : "Draf Pesan dengan AI"}</span>
              </button>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "800" }}>Draf Pesan Tagihan (Silakan Edit Jika Perlu)</label>
              <textarea
                className="form-input"
                style={{ minHeight: "150px", fontFamily: "inherit", padding: "0.75rem", lineHeight: "1.5" }}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                disabled={waLoading}
                required
              />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
                <button 
                  type="button" 
                  className="btn-portal-outline" 
                  onClick={() => setWaMessage("")}
                  disabled={waLoading}
                  style={{ color: "var(--color-danger)" }}
                >
                  Hapus Draf / Ulangi
                </button>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button 
                    type="button" 
                    className="btn-portal-outline" 
                    onClick={onClose}
                    disabled={waLoading}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn-portal-primary" 
                    onClick={handleSendWaBilling}
                    disabled={waLoading || !waPhone.trim() || !waMessage.trim()}
                    style={{ background: "#25d366", borderColor: "#25d366" }}
                  >
                    <span>💬 Kirim ke WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
