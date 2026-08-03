"use client";

import React, { useState, useEffect } from "react";
import { RUBRIC_DATA_ENGLISH, RUBRIC_DATA_CALISTUNG, calculateScoreFromRubric, generateDraftNotesFromRubric } from "../rubricData";
import { RubricAspectList } from "./RubricAspectList";

interface AssessmentRubricModalProps {
  isOpen: boolean; onClose: () => void; programName: string; studentName: string; moduleName: string;
  onApplyRubricScores: (scores: { speaking: number; grammar: number; vocabulary: number; active: number }, draftNotes: string) => void;
}

export default function AssessmentRubricModal({ isOpen, onClose, programName, studentName, moduleName, onApplyRubricScores }: AssessmentRubricModalProps) {
  const isCalistung = (programName || "").toLowerCase().includes("calistung");
  const rubrics = isCalistung ? RUBRIC_DATA_CALISTUNG : RUBRIC_DATA_ENGLISH;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && selectedIds.length === 0) {
      const defaultSelected: string[] = [];
      rubrics.forEach(r => r.criteria.slice(0, 3).forEach(c => defaultSelected.push(c.id)));
      setSelectedIds(defaultSelected);
    }
  }, [isOpen, isCalistung, rubrics, selectedIds.length]);

  if (!isOpen) return null;

  const toggleCriterion = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const calculatedScores = calculateScoreFromRubric(selectedIds, rubrics);
  const draftNotes = generateDraftNotesFromRubric(selectedIds, isCalistung);

  const handleApply = () => { onApplyRubricScores(calculatedScores, draftNotes); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "1rem" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "16px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3>Rubrik Penilaian Terstruktur - {studentName}</h3>
          <button onClick={onClose} className="btn-portal-outline">Tutup</button>
        </div>
        <RubricAspectList rubrics={rubrics} selectedIds={selectedIds} toggleCriterion={toggleCriterion} />
        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={handleApply} className="btn-portal-primary">Terapkan Skor & Catatan</button>
        </div>
      </div>
    </div>
  );
}
