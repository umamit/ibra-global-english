"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedStudentRow {
  name: string;
  age: number;
  program: string;
  status: string;
  parentName?: string;
  whatsapp?: string;
  isValid: boolean;
  errorReason?: string;
}

export default function StudentImportModal({ isOpen, onClose, onSuccess }: StudentImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen) return null;

  // Download template CSV
  const handleDownloadTemplate = () => {
    const headers = "nama_siswa,usia,program,status,nama_orang_tua,whatsapp\n";
    const sample1 = "Muhammad Rizky,8,Kids Program,aktif,Budi Santoso,081234567890\n";
    const sample2 = "Aisyah Putri,6,Fun Calistung,aktif,Siti Rahma,089876543210\n";
    const sample3 = "Fathan Ahmad,13,Teens Program,aktif,Ahmad Subagyo,085234567891\n";

    const blob = new Blob([headers + sample1 + sample2 + sample3], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Impor_Siswa_Ibra_Global.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload & parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv") && !selectedFile.name.endsWith(".txt")) {
      setErrorMsg("Berkas harus berformat .csv!");
      return;
    }

    setFile(selectedFile);
    setErrorMsg("");
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          setErrorMsg("Berkas kosong.");
          setLoading(false);
          return;
        }

        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          setErrorMsg("Berkas tidak memiliki baris data siswa.");
          setLoading(false);
          return;
        }

        // Parse CSV lines
        const rows: ParsedStudentRow[] = [];
        const validPrograms = ["Kids Program", "Teens Program", "Fun Calistung"];
        const validStatuses = ["aktif", "cuti", "alumnus", "non_aktif"];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Basic CSV split considering quotes
          const cols = line.split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
          const name = cols[0] || "";
          const ageNum = parseInt(cols[1]) || 0;
          let program = cols[2] || "Kids Program";
          let status = (cols[3] || "aktif").toLowerCase();
          const parentName = cols[4] || "";
          const whatsapp = cols[5] || "";

          // Auto fix program casing
          const matchedProgram = validPrograms.find(
            (p) => p.toLowerCase() === program.toLowerCase()
          );
          if (matchedProgram) program = matchedProgram;

          let isValid = true;
          let errorReason = "";

          if (!name) {
            isValid = false;
            errorReason = "Nama siswa wajib diisi.";
          } else if (ageNum <= 0) {
            isValid = false;
            errorReason = "Usia harus angka > 0.";
          } else if (!validPrograms.includes(program)) {
            isValid = false;
            errorReason = `Program '${program}' tidak valid (Gunakan: Kids Program, Teens Program, Fun Calistung).`;
          } else if (!validStatuses.includes(status)) {
            status = "aktif";
          }

          rows.push({
            name,
            age: ageNum,
            program,
            status,
            parentName,
            whatsapp,
            isValid,
            errorReason,
          });
        }

        setParsedRows(rows);
      } catch (err: any) {
        setErrorMsg("Gagal membaca berkas CSV: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(selectedFile);
  };

  // Perform bulk insert
  const handleBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg("Tidak ada baris data siswa yang valid untuk diimpor.");
      return;
    }

    setImporting(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const payload = validRows.map((r) => ({
        name: r.name,
        age: r.age,
        program: r.program,
        status: r.status,
      }));

      // Try bulk insert
      let { error } = await supabase.from("students").insert(payload);

      if (error && error.code === "42703") {
        // Fallback without status column if DB doesn't have status column yet
        const payloadNoStatus = payload.map(({ status, ...rest }) => rest);
        const { error: errRetry } = await supabase.from("students").insert(payloadNoStatus);
        if (errRetry) throw errRetry;
      } else if (error) {
        throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengimpor data siswa secara massal.");
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      backgroundColor: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="portal-card" style={{
        width: "100%",
        maxWidth: "720px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-surface)",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid var(--color-gray-100)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--color-gray-900)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Impor Siswa Massal via CSV</span>
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-gray-400)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {errorMsg && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "var(--color-red)",
              fontSize: "0.85rem",
              fontWeight: "600",
              marginBottom: "1.25rem"
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Action Header: Download Template & File Input */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            borderRadius: "12px",
            backgroundColor: "var(--color-bg-teal-50)",
            marginBottom: "1.5rem",
            border: "1px solid rgba(33, 108, 126, 0.1)"
          }}>
            <div>
              <p style={{ fontWeight: "700", color: "var(--color-primary-dark)", fontSize: "0.9rem", margin: "0 0 0.2rem" }}>
                1. Unduh Format Berkas Template
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--color-gray-600)", margin: 0 }}>
                Gunakan format CSV standar agar data siswa terbaca dengan sempurna.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="btn-portal-outline"
              style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", height: "auto", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
              <span>Unduh Template CSV</span>
            </button>
          </div>

          {/* File Picker */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label className="form-label" style={{ fontWeight: "700", marginBottom: "0.5rem", display: "block" }}>
              2. Pilih Berkas CSV Daftar Siswa
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="form-input"
              style={{ padding: "0.5rem" }}
            />
          </div>

          {/* Preview Table */}
          {loading ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "var(--color-gray-500)", fontSize: "0.9rem" }}>
              ⏳ Membaca dan menganalisis data berkas CSV...
            </p>
          ) : parsedRows.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--color-gray-800)", margin: 0 }}>
                  Pratinjau Data Impor ({parsedRows.length} Baris)
                </h4>
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.78rem" }}>
                  <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#047857", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700" }}>
                    ✓ {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#b91c1c", padding: "0.15rem 0.5rem", borderRadius: "6px", fontWeight: "700" }}>
                      ✕ {invalidCount} Tidak Valid
                    </span>
                  )}
                </div>
              </div>

              <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--color-gray-200)", borderRadius: "8px" }}>
                <table className="portal-table" style={{ fontSize: "0.8rem", width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Nama Siswa</th>
                      <th>Usia</th>
                      <th>Program Kursus</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{ backgroundColor: row.isValid ? "transparent" : "rgba(239, 68, 68, 0.05)" }}>
                        <td>
                          {row.isValid ? (
                            <span style={{ color: "var(--color-green)", fontWeight: "700" }}>✓ Valid</span>
                          ) : (
                            <span style={{ color: "var(--color-red)", fontWeight: "700" }} title={row.errorReason}>
                              ✕ {row.errorReason}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: "700" }}>{row.name || "-"}</td>
                        <td>{row.age || "-"} thn</td>
                        <td>{row.program}</td>
                        <td style={{ textTransform: "capitalize" }}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid var(--color-gray-100)",
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          backgroundColor: "var(--color-gray-50)"
        }}>
          <button onClick={onClose} className="btn-portal-outline" style={{ padding: "0.5rem 1.25rem" }}>
            Batal
          </button>
          <button
            onClick={handleBulkImport}
            disabled={importing || validCount === 0}
            className="btn-portal-primary"
            style={{ padding: "0.5rem 1.25rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          >
            {importing ? "⏳ Mengimpor..." : `Simpan ${validCount} Siswa ke Database`}
          </button>
        </div>
      </div>
    </div>
  );
}
