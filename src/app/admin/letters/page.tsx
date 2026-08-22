"use client";

export const dynamic = "force-dynamic";

import React from "react";
import "./letters.css";
import { useLetterData } from "./hooks/useLetterData";
import LetterForm from "./components/LetterForm";
import LetterPreview from "./components/LetterPreview";

export default function AdminLettersPage() {
  const {
    loading, submitting, aiLoading,
    id, title, setTitle, letterNumber, setLetterNumber, recipient, setRecipient,
    subject, setSubject, content, setContent, senderName, setSenderName,
    senderRole, setSenderRole, lampiran, setLampiran, attachment, setAttachment,
    letterDate, setLetterDate, category, aiPrompt, setAiPrompt,
    searchQuery, setSearchQuery, isEditing, filteredLetters,
    handleCategoryChange, handleResetForm, handleSaveLetter,
    handleEditLetter, handleDeleteLetter, handleInsertTableTemplate,
    handleGenerateLetterWithAI,
  } = useLetterData();

  return (
    <div className="letters-container">

      {/* Header */}
      <div className="no-print" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid var(--color-gray-200)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--color-primary-dark)" }}>Kelola Surat Resmi &amp; AI</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Buat draf surat menggunakan Groq AI dan cetak dengan Kop Surat Resmi Ibra Global English.
          </p>
        </div>
      </div>

      <div className="letters-grid">
        {/* Left: Form + AI + Archive */}
        <LetterForm
          id={id} title={title} setTitle={setTitle}
          letterNumber={letterNumber} setLetterNumber={setLetterNumber}
          recipient={recipient} setRecipient={setRecipient}
          subject={subject} setSubject={setSubject}
          content={content} setContent={setContent}
          senderName={senderName} setSenderName={setSenderName}
          senderRole={senderRole} setSenderRole={setSenderRole}
          lampiran={lampiran} setLampiran={setLampiran}
          attachment={attachment} setAttachment={setAttachment}
          letterDate={letterDate} setLetterDate={setLetterDate}
          category={category}
          aiPrompt={aiPrompt} setAiPrompt={setAiPrompt}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          isEditing={isEditing}
          submitting={submitting}
          aiLoading={aiLoading}
          loading={loading}
          filteredLetters={filteredLetters}
          onCategoryChange={handleCategoryChange}
          onReset={handleResetForm}
          onSave={handleSaveLetter}
          onEditLetter={handleEditLetter}
          onDeleteLetter={handleDeleteLetter}
          onInsertTableTemplate={handleInsertTableTemplate}
          onGenerateAI={handleGenerateLetterWithAI}
        />

        {/* Right: Print Preview */}
        <LetterPreview
          letterNumber={letterNumber}
          lampiran={lampiran}
          subject={subject}
          recipient={recipient}
          content={content}
          letterDate={letterDate}
          senderName={senderName}
          senderRole={senderRole}
          attachment={attachment}
          onPrint={() => window.print()}
        />
      </div>
    </div>
  );
}
