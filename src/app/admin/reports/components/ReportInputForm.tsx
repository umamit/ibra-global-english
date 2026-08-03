"use client";

import React from "react";
import { Student } from "@/types";

interface ReportInputFormProps {
  students: Student[];
  studentId: string;
  setStudentId: (v: string) => void;
  setSelectedStudentProgram: (v: string) => void;
  selectedStudentProgram: string;
  moduleName: string;
  setModuleName: (v: string) => void;
  speakingScore: string; setSpeakingScore: (v: string) => void;
  grammarScore: string; setGrammarScore: (v: string) => void;
  vocabularyScore: string; setVocabularyScore: (v: string) => void;
  activeScore: string; setActiveScore: (v: string) => void;
  tutorNotes: string; setTutorNotes: (v: string) => void;
  submitting: boolean;
  aiLoading: boolean;
  aiProgressLoading: boolean;
  onOpenRubric: () => void;
  onGenerateAiNotes: () => void;
  onOpenAiModal: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ReportInputForm(props: ReportInputFormProps) {
  const {
    students, studentId, setStudentId, setSelectedStudentProgram, selectedStudentProgram,
    moduleName, setModuleName, speakingScore, setSpeakingScore, grammarScore, setGrammarScore,
    vocabularyScore, setVocabularyScore, activeScore, setActiveScore, tutorNotes, setTutorNotes,
    submitting, aiLoading, aiProgressLoading, onOpenRubric, onGenerateAiNotes, onOpenAiModal, onSubmit,
  } = props;

  const isFormCalistung = selectedStudentProgram?.toLowerCase()?.includes("calistung");
  const scoreLabels = isFormCalistung
    ? ["Membaca", "Menulis", "Berhitung", "Keaktifan"]
    : ["Speaking", "Grammar", "Vocabulary", "Active"];

  return (
    <div className="portal-card" style={{ marginBottom: "3rem", padding: "2rem" }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
        Penerbitan Rapor Modul Baru
      </h3>
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Pilih Siswa</label>
            <select
              className="form-input"
              value={studentId}
              onChange={(e) => {
                const id = e.target.value;
                setStudentId(id);
                const student = students.find((s) => s.id === id);
                setSelectedStudentProgram(student ? student.program : "");
              }}
              disabled={submitting}
              required
            >
              <option value="">-- Pilih Siswa --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.program})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nama Modul Evaluasi</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Module 1 - Introduce Yourself"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--color-gray-800)" }}>Aspek Penilaian (Skor 0 - 100)</span>
          <button type="button" onClick={onOpenRubric} className="btn-portal-outline"
            style={{ height: "auto", padding: "0.35rem 0.8rem", fontSize: "0.8rem", fontWeight: "700", borderColor: "var(--color-primary)", color: "var(--color-primary)", backgroundColor: "rgba(33, 108, 126, 0.05)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            Pilih Indikator &amp; Rubrik Penilaian
          </button>
        </div>

        <div className="four-column-grid" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
          {[
            { label: `${scoreLabels[0]} (0-100)`, value: speakingScore, onChange: setSpeakingScore },
            { label: `${scoreLabels[1]} (0-100)`, value: grammarScore, onChange: setGrammarScore },
            { label: `${scoreLabels[2]} (0-100)`, value: vocabularyScore, onChange: setVocabularyScore },
            { label: `${scoreLabels[3]} (0-100)`, value: activeScore, onChange: setActiveScore },
          ].map(({ label, value, onChange }) => (
            <div className="form-group" key={label}>
              <label className="form-label">{label}</label>
              <input type="number" min="0" max="100" className="form-input" placeholder="Skor" value={value} onChange={(e) => onChange(e.target.value)} disabled={submitting} required />
            </div>
          ))}
        </div>

        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Catatan Deskriptif &amp; Masukan Orang Tua</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" onClick={onGenerateAiNotes} disabled={aiLoading || aiProgressLoading || !studentId} className="btn-portal-outline"
                style={{ height: "auto", padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--color-primary)", color: "var(--color-primary)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                {aiLoading ? <span>Sedang menyusun...</span> : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg><span>Tulis Catatan Otomatis (AI)</span></>
                )}
              </button>
              <button type="button" onClick={onOpenAiModal} disabled={aiLoading || aiProgressLoading || !studentId} className="btn-portal-outline"
                style={{ height: "auto", padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--color-accent, #e28743)", color: "var(--color-accent, #e28743)", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                {aiProgressLoading ? <span>Sedang menyusun Laporan...</span> : (
                  <><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg><span>Draf Laporan Bulanan (AI)</span></>
                )}
              </button>
            </div>
          </div>
          <textarea className="form-input" style={{ minHeight: "80px" }} placeholder="Berikan catatan kemajuan belajar siswa yang deskriptif..." value={tutorNotes} onChange={(e) => setTutorNotes(e.target.value)} disabled={submitting} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-portal-primary" disabled={submitting}>
            {submitting ? "Menerbitkan..." : "Terbitkan Rapor"}
          </button>
        </div>
      </form>
    </div>
  );
}
