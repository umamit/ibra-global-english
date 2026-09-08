"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useSessionNotesData } from "./hooks/useSessionNotesData";
import SessionNoteForm from "./components/SessionNoteForm";
import SessionNotesTimeline from "./components/SessionNotesTimeline";

export default function AdminSessionNotesPage() {
  const {
    students,
    filteredStudents,
    notes,
    loading,
    selectedStudentId,
    setSelectedStudentId,
    selectedProgram,
    setSelectedProgram,
    searchQuery,
    setSearchQuery,
    fetchNotes,
  } = useSessionNotesData();

  const [showForm, setShowForm] = useState(false);

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan pertemuan ini?")) return;
    try {
      const res = await fetch(`/api/session-notes?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchNotes();
      } else {
        alert(json.error || "Gagal menghapus catatan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div style={{ paddingBottom: "3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--color-gray-900)", margin: 0 }}>
            Catatan Siswa Per Pertemuan
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
            Rekam jejak materi, penguasaan kosakata, sikap, dan evaluasi belajar individual setiap sesi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn-portal-primary"
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.9rem", borderRadius: "var(--radius-full)" }}
        >
          {showForm ? "Tutup Formulir" : "+ Tambah Catatan Sesi"}
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: "2rem" }}>
          <SessionNoteForm
            students={students}
            selectedStudentId={selectedStudentId}
            onSuccess={() => {
              setShowForm(false);
              fetchNotes();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: "1rem 1.25rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="form-input"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select
            className="form-input"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="all">Semua Program Kursus</option>
            <option value="Fun Calistung">Fun Calistung</option>
            <option value="Kids Program">Kids Program</option>
            <option value="Teens Program">Teens Program</option>
          </select>
        </div>

        <div>
          <select
            className="form-input"
            style={{ padding: "0.45rem 0.85rem", fontSize: "0.85rem" }}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">Semua Siswa Terdaftar</option>
            {filteredStudents.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.program})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <SessionNotesTimeline
        notes={notes}
        loading={loading}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
}
