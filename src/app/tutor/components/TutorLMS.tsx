"use client";

import React from "react";
import { TutorLMSMaterialsList } from "./TutorLMSMaterialsList";

export default function TutorLMS(props: any) {
  const { lmsUploading, lmsTitle, setLmsTitle, lmsDesc, setLmsDesc, lmsProgram, setLmsProgram, lmsType, setLmsType, lmsDueDate, setLmsDueDate, setLmsFile, handleSaveLmsMaterial, lmsMaterials, handleDeleteLmsMaterial, handleViewSubmissions } = props;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "2rem", alignItems: "start" }}>
      <div className="portal-card" style={{ padding: "2rem" }}>
        <h3 style={{ fontWeight: "800", fontSize: "1.1rem", marginBottom: "1rem" }}>Unggah Materi / Tugas Baru</h3>
        <form onSubmit={handleSaveLmsMaterial} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div><label className="form-label">Judul Materi / Tugas</label><input type="text" className="form-input" value={lmsTitle} onChange={(e) => setLmsTitle(e.target.value)} required /></div>
          <div><label className="form-label">Deskripsi / Petunjuk</label><textarea className="form-input" rows={3} value={lmsDesc} onChange={(e) => setLmsDesc(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label className="form-label">Program Target</label>
              <select className="form-input" value={lmsProgram} onChange={(e) => setLmsProgram(e.target.value)}>
                <option value="Kids Program">Kids Program</option><option value="Teens Program">Teens Program</option><option value="Fun Calistung">Fun Calistung</option>
              </select>
            </div>
            <div>
              <label className="form-label">Tipe Modul</label>
              <select className="form-input" value={lmsType} onChange={(e) => setLmsType(e.target.value)}>
                <option value="materi">Materi Pembelajaran</option><option value="tugas">Tugas Rumah (PR)</option>
              </select>
            </div>
          </div>
          {lmsType === "tugas" && <div><label className="form-label">Batas Waktu Pengumpulan</label><input type="date" className="form-input" value={lmsDueDate} onChange={(e) => setLmsDueDate(e.target.value)} /></div>}
          <div><label className="form-label">Lampiran Berkas (PDF/Doc/Image)</label><input type="file" className="form-input" onChange={(e) => setLmsFile(e.target.files?.[0] || null)} /></div>
          <button type="submit" disabled={lmsUploading} className="btn-portal-primary">{lmsUploading ? "Mengunggah..." : "Terbitkan Modul"}</button>
        </form>
      </div>

      <TutorLMSMaterialsList lmsMaterials={lmsMaterials} handleDeleteLmsMaterial={handleDeleteLmsMaterial} handleViewSubmissions={handleViewSubmissions} />
    </div>
  );
}
