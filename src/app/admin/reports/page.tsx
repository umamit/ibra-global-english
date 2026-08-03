"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useReportData } from "./hooks/useReportData";
import { exportReportsCSV } from "./reportHelpers";
import ReportStatusBanner from "./components/ReportStatusBanner";
import PrintReportView from "./components/PrintReportView";
import AssessmentRubricModal from "./components/AssessmentRubricModal";
import AiReportModal from "./components/AiReportModal";
import ReportInputForm from "./components/ReportInputForm";
import ReportTable from "./components/ReportTable";

export default function ReportCardManagement() {
  const {
    students, reports, printReport, setPrintReport, contactAddress,
    loading, submitting, statusMsg,
    studentId, setStudentId, exportFilterId, setExportFilterId,
    selectedStudentProgram, setSelectedStudentProgram,
    moduleName, setModuleName, speakingScore, setSpeakingScore,
    grammarScore, setGrammarScore, vocabularyScore, setVocabularyScore,
    activeScore, setActiveScore, tutorNotes, setTutorNotes,
    aiLoading, aiProgressLoading, isAiModalOpen, setIsAiModalOpen,
    aiFocus, setAiFocus, aiAchievements, setAiAchievements,
    aiChallenges, setAiChallenges, isRubricModalOpen, setIsRubricModalOpen,
    handleApplyRubricScores, handleGenerateAiNotes, handleOpenAiModal,
    handleGenerateAiProgressReport, handleCreateReport, handleDeleteReport, triggerPrint,
  } = useReportData();

  if (printReport) {
    return <PrintReportView printReport={printReport} contactAddress={contactAddress} onClose={() => setPrintReport(null)} />;
  }

  return (
    <div>
      {/* Topbar */}
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Input Nilai Rapor</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            E-Rapor Digital: Evaluasi pencapaian modul belajar siswa
          </p>
        </div>
        {reports.length > 0 && (
          <div className="topbar-user" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <select className="form-input" style={{ padding: "0.45rem 0.75rem", fontSize: "0.825rem", width: "auto", minWidth: "160px" }} value={exportFilterId} onChange={(e) => setExportFilterId(e.target.value)}>
              <option value="">Semua Siswa</option>
              {students.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
            <button className="btn-portal-outline" onClick={() => exportReportsCSV(reports, exportFilterId)} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", fontSize: "0.825rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      <ReportStatusBanner statusMsg={statusMsg} />

      <ReportInputForm
        students={students}
        studentId={studentId} setStudentId={setStudentId}
        setSelectedStudentProgram={setSelectedStudentProgram}
        selectedStudentProgram={selectedStudentProgram}
        moduleName={moduleName} setModuleName={setModuleName}
        speakingScore={speakingScore} setSpeakingScore={setSpeakingScore}
        grammarScore={grammarScore} setGrammarScore={setGrammarScore}
        vocabularyScore={vocabularyScore} setVocabularyScore={setVocabularyScore}
        activeScore={activeScore} setActiveScore={setActiveScore}
        tutorNotes={tutorNotes} setTutorNotes={setTutorNotes}
        submitting={submitting} aiLoading={aiLoading} aiProgressLoading={aiProgressLoading}
        onOpenRubric={() => setIsRubricModalOpen(true)}
        onGenerateAiNotes={handleGenerateAiNotes}
        onOpenAiModal={handleOpenAiModal}
        onSubmit={handleCreateReport}
      />

      <ReportTable reports={reports} loading={loading} onPrint={triggerPrint} onDelete={handleDeleteReport} />

      <AssessmentRubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
        programName={selectedStudentProgram}
        studentName={students.find((s) => s.id === studentId)?.name || ""}
        moduleName={moduleName}
        onApplyRubricScores={handleApplyRubricScores}
      />

      <AiReportModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSubmit={handleGenerateAiProgressReport}
        aiFocus={aiFocus} setAiFocus={setAiFocus}
        aiAchievements={aiAchievements} setAiAchievements={setAiAchievements}
        aiChallenges={aiChallenges} setAiChallenges={setAiChallenges}
        aiProgressLoading={aiProgressLoading}
      />
    </div>
  );
}
