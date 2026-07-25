"use client";

import React, { useState, useEffect } from "react";
import {
  RUBRIC_DATA_ENGLISH,
  RUBRIC_DATA_CALISTUNG,
  calculateScoreFromRubric,
  generateDraftNotesFromRubric
} from "../rubricData";

interface AssessmentRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  studentName: string;
  moduleName: string;
  onApplyRubricScores: (
    scores: { speaking: number; grammar: number; vocabulary: number; active: number },
    draftNotes: string
  ) => void;
}

export default function AssessmentRubricModal({
  isOpen,
  onClose,
  programName,
  studentName,
  moduleName,
  onApplyRubricScores
}: AssessmentRubricModalProps) {
  const isCalistung = (programName || "").toLowerCase().includes("calistung");
  const rubrics = isCalistung ? RUBRIC_DATA_CALISTUNG : RUBRIC_DATA_ENGLISH;

  // Track checked criteria IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Default select first 3 criteria of each aspect when opened clean
  useEffect(() => {
    if (isOpen && selectedIds.length === 0) {
      const defaultSelected: string[] = [];
      rubrics.forEach(r => {
        // default select first 3 criteria (75 points per aspect)
        r.criteria.slice(0, 3).forEach(c => defaultSelected.push(c.id));
      });
      setSelectedIds(defaultSelected);
    }
  }, [isOpen, isCalistung, rubrics, selectedIds.length]);

  if (!isOpen) return null;

  const toggleCriterion = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds: string[] = [];
    rubrics.forEach(r => r.criteria.forEach(c => allIds.push(c.id)));
    setSelectedIds(allIds);
  };

  const clearAll = () => {
    setSelectedIds([]);
  };

  const calculatedScores = calculateScoreFromRubric(selectedIds, rubrics);
  const draftNotes = generateDraftNotesFromRubric(selectedIds, isCalistung);
  const avgScore = Math.round(
    (calculatedScores.speaking +
      calculatedScores.grammar +
      calculatedScores.vocabulary +
      calculatedScores.active) /
      4
  );

  const handleApply = () => {
    onApplyRubricScores(calculatedScores, draftNotes);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem"
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "840px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            backgroundColor: "var(--color-primary, #216c7e)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800" }}>
              💡 Rubrik & Indikator Penilaian Rapor
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", opacity: 0.9 }}>
              Siswa: <strong>{studentName || "Pilih Siswa"}</strong> | Program: <strong>{programName || "Bahasa Inggris"}</strong> {moduleName ? `| Modul: ${moduleName}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Action Controls Top */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "var(--color-gray-50, #f8fafc)",
            borderBottom: "1px solid var(--color-gray-200, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem"
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray-600)" }}>
            Centang kriteria yang dicapai siswa di bawah ini untuk kalkulasi nilai otomatis:
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={selectAll}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid var(--color-primary)",
                background: "white",
                color: "var(--color-primary)",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ✓ Centang Semua (Skor 100)
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={{
                fontSize: "0.75rem",
                padding: "0.25rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid #ef4444",
                background: "white",
                color: "#ef4444",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              ✕ Riset Pilihan
            </button>
          </div>
        </div>

        {/* Body Content Scrollable */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "1.25rem"
            }}
          >
            {rubrics.map(rubric => {
              const score = (calculatedScores as Record<string, number>)[rubric.aspectKey] || 0;
              const aspectTitle = isCalistung ? rubric.titleCalistung : rubric.titleEnglish;

              return (
                <div
                  key={rubric.aspectKey}
                  style={{
                    border: "1px solid var(--color-gray-200, #e2e8f0)",
                    borderRadius: "10px",
                    padding: "1rem",
                    backgroundColor: "white"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "2px solid var(--color-primary-dark, #164d57)",
                      paddingBottom: "0.5rem",
                      marginBottom: "0.75rem"
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--color-gray-800)" }}>
                      {aspectTitle}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "900",
                        color: score >= 85 ? "#10b981" : score >= 75 ? "#3b82f6" : "#f59e0b",
                        backgroundColor: "var(--color-gray-100, #f1f5f9)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px"
                      }}
                    >
                      Skor: {score} / 100
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {rubric.criteria.map(c => {
                      const isChecked = selectedIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.6rem",
                            fontSize: "0.8rem",
                            color: isChecked ? "var(--color-gray-900)" : "var(--color-gray-500)",
                            backgroundColor: isChecked ? "rgba(33, 108, 126, 0.05)" : "transparent",
                            padding: "0.4rem 0.5rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCriterion(c.id)}
                            style={{ marginTop: "2px", accentColor: "var(--color-primary)" }}
                          />
                          <span style={{ lineHeight: "1.4" }}>{c.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Draft Note Preview */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "var(--color-gray-50, #f8fafc)",
              borderLeft: "4px solid var(--color-accent, #a68849)"
            }}
          >
            <h5 style={{ margin: "0 0 0.35rem", fontSize: "0.85rem", fontWeight: "700", color: "var(--color-gray-700)" }}>
              📝 Draf Catatan Deskriptif Evaluasi (Otomatis Terbentuk):
            </h5>
            <p style={{ margin: 0, fontSize: "0.825rem", fontStyle: "italic", color: "var(--color-gray-600)", lineHeight: "1.5" }}>
              &ldquo;{draftNotes}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer Summary & Apply Button */}
        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "white",
            borderTop: "1px solid var(--color-gray-200, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--color-gray-600)" }}>
              Hasil Skor Rata-rata Modul:{" "}
              <strong style={{ fontSize: "1.1rem", color: "var(--color-primary-dark)" }}>
                {avgScore} / 100
              </strong>
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-portal-outline"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="btn-portal-primary"
              style={{
                padding: "0.5rem 1.25rem",
                fontSize: "0.85rem",
                fontWeight: "700"
              }}
            >
              ✓ Gunakan Nilai & Indikator Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
