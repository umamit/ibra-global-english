"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import TabSwitcher from "./components/TabSwitcher";
import RejectModal from "./components/RejectModal";
import StudentFormModal from "./components/StudentFormModal";
import StudentImportModal from "./components/StudentImportModal";
import StudentTable from "./components/StudentTable";
import ParentTable from "./components/ParentTable";
import RegistrationTable from "./components/RegistrationTable";
import { useStudentData } from "./hooks/useStudentData";
import { createClient } from "@/utils/supabase/client";

export default function StudentManagement() {
  const {
    students, parents, registrations,
    loading, regLoading, errorMsg,
    waSendingId, waFeedback,
    fetchData, fetchRegistrations,
    handleApprove, handleReject,
    handleDeleteStudent, handleDeleteParent,
    handleUpdateRole, handleExportStudentsCSV,
  } = useStudentData();

  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<string>("students");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>("");

  // Student form state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [program, setProgram] = useState<string>("Kids Program");
  const [studentStatus, setStudentStatus] = useState<string>("aktif");
  const [parentId, setParentId] = useState<string>("");
  const [formErrorMsg, setFormErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (modalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  const handleOpenAddModal = () => {
    setEditingStudentId(null);
    setName(""); setAge(""); setProgram("Kids Program");
    setStudentStatus("aktif"); setParentId(""); setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (student: any) => {
    setEditingStudentId(student.id);
    setName(student.name); setAge(student.age.toString());
    setProgram(student.program); setStudentStatus(student.status || "aktif");
    setParentId(student.parent_id || ""); setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMsg(""); setSubmitting(true);
    if (!name.trim() || !age) { setFormErrorMsg("Nama siswa dan usia harus diisi."); setSubmitting(false); return; }

    try {
      const payload: Record<string, any> = {
        name: name.trim(), age: parseInt(age), program, status: studentStatus, parent_id: parentId || null,
      };

      const upsertFn = editingStudentId
        ? () => supabase.from("students").update(payload).eq("id", editingStudentId)
        : () => supabase.from("students").insert(payload);

      let { error } = await upsertFn();
      if (error && error.code === "42703") {
        delete payload.status;
        const { error: errRetry } = await upsertFn();
        if (errRetry) throw errRetry;
      } else if (error) {
        throw error;
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormErrorMsg(err.message || "Gagal menyimpan data siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Database utama bimbingan belajar Ibra Global English Bobong
          </p>
        </div>
        <div className="topbar-user" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {activeTab === "students" && (
            <>
              <button className="btn-portal-outline" onClick={() => handleExportStudentsCSV(students)} style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>Ekspor CSV</span>
              </button>
              <button className="btn-portal-outline" onClick={() => setImportModalOpen(true)} style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Impor Massal</span>
              </button>
              <button className="btn-portal-primary" onClick={handleOpenAddModal} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>Tambah Siswa</span>
              </button>
            </>
          )}
        </div>
      </div>

      <TabSwitcher
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        students={students}
        parents={parents}
        registrations={registrations}
        fetchRegistrations={fetchRegistrations}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gray-500)" }}>
          <svg style={{ animation: "spin 1s linear infinite", width: "32px", height: "32px", marginBottom: "1rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p>Memuat database...</p>
        </div>
      ) : activeTab === "students" ? (
        <StudentTable
          students={students}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteStudent}
        />
      ) : activeTab === "parents" ? (
        <ParentTable
          parents={parents}
          students={students}
          onDeleteParent={handleDeleteParent}
          onUpdateRole={handleUpdateRole}
        />
      ) : null}

      {activeTab === "registrations" && (
        <RegistrationTable
          registrations={registrations}
          regLoading={regLoading}
          errorMsg={errorMsg}
          waSendingId={waSendingId}
          waFeedback={waFeedback}
          onApprove={handleApprove}
          onOpenReject={(id) => { setRejectModalId(id); setRejectNotes(""); }}
        />
      )}

      <RejectModal
        rejectModalId={rejectModalId}
        rejectNotes={rejectNotes}
        setRejectNotes={setRejectNotes}
        onClose={() => setRejectModalId(null)}
        onConfirm={() => {
          if (rejectModalId) handleReject(rejectModalId, rejectNotes);
          setRejectModalId(null);
          setRejectNotes("");
        }}
      />

      <StudentFormModal
        open={modalOpen}
        editing={!!editingStudentId}
        name={name}
        age={age}
        program={program}
        status={studentStatus}
        parentId={parentId}
        parents={parents as any}
        errorMsg={formErrorMsg}
        submitting={submitting}
        onNameChange={(e) => setName(e.target.value)}
        onAgeChange={(e) => setAge(e.target.value)}
        onProgramChange={(e) => setProgram(e.target.value)}
        onStatusChange={(e) => setStudentStatus(e.target.value)}
        onParentIdChange={(e) => setParentId(e.target.value)}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveStudent}
      />

      <StudentImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
