"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDynamicIsland } from "../context/DynamicIslandContext";
import StudentTable from "./components/StudentTable";
import ParentTable from "./components/ParentTable";
import RegistrationTable from "./components/RegistrationTable";
import TabSwitcher from "./components/TabSwitcher";
import StudentFormModal from "./components/StudentFormModal";
import RejectModal from "./components/RejectModal";
import StudentImportModal from "./components/StudentImportModal";
import ScheduleStudentModal from "./components/ScheduleStudentModal";
import { useStudentData, StudentItem } from "./hooks/useStudentData";
import { handleExportStudentsCSV } from "./studentsHelpers";

function AdminStudentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const island = useDynamicIsland();

  const {
    students, parents, registrations, scheduleCounts, loading, regLoading,
    errorMsg, waSendingId, waFeedback, fetchData, fetchRegistrations,
    handleApprove, handleReject, handleDeleteStudent, handleUpdateStudentProgram, handleUpdateRole,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState<string>("students");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [scheduleTargetStudent, setScheduleTargetStudent] = useState<StudentItem | null>(null);

  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [program, setProgram] = useState<string>("A1 Foundation 1");
  const [status, setStatus] = useState<string>("aktif");
  const [parentId, setParentId] = useState<string>("");
  
  const initialStatusFilter = searchParams.get("status") || "semua";
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formErrorMsg, setFormErrorMsg] = useState<string>("");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>("");
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  const handleStatusFilterChange = (filter: string) => {
    setStatusFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "semua") params.delete("status");
    else params.set("status", filter);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setName(""); setAge(""); setProgram("A1 Foundation 1"); setStatus("aktif"); setParentId(""); setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setName(student.name); setAge(String(student.age)); setProgram(student.program || "A1 Foundation 1");
    setStatus(student.status || "aktif"); setParentId(student.parent_id || ""); setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) {
      setFormErrorMsg("Nama dan Usia wajib diisi.");
      return;
    }
    setSubmitting(true);
    setFormErrorMsg("");

    try {
      const payload: any = {
        name: name.trim(),
        age: parseInt(age, 10),
        program,
        status,
        parent_id: parentId || null,
      };

      const res = await fetch("/api/admin/students", {
        method: editingStudent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent ? { id: editingStudent.id, ...payload } : payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal menyimpan data siswa.");
      }

      island.success(editingStudent ? `Data siswa "${name}" berhasil diperbarui!` : `Siswa "${name}" berhasil ditambahkan!`);
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormErrorMsg(err.message);
      island.error(err.message || "Gagal menyimpan data siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParent = async (id: string, pName: string) => {
    if (!confirm(`Hapus wali/siswa "${pName}"?`)) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error("Gagal menghapus user.");
      island.success(`Akun "${pName}" berhasil dihapus.`);
      fetchData();
    } catch (err: any) {
      island.error(err.message);
    }
  };

  return (
    <div style={{ padding: "0 0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="portal-header-title" style={{ margin: 0 }}>Manajemen Siswa & Wali</h1>
          <p className="portal-header-subtitle" style={{ margin: "0.25rem 0 0" }}>Kelola database siswa, verifikasi pendaftaran baru, dan akun orang tua.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="btn-portal-outline" onClick={() => setImportModalOpen(true)} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>Import Excel</span>
          </button>
          <button className="btn-portal-outline" onClick={() => { handleExportStudentsCSV(students); island.success("Export Data Selesai", "File CSV data siswa berhasil diunduh."); }} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Export CSV</span>
          </button>
          <button className="btn-portal-primary" onClick={handleOpenAddModal} style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Siswa</span>
          </button>
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

      {activeTab === "students" && (
        <StudentTable
          students={students}
          scheduleCounts={scheduleCounts}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onEdit={handleOpenEditModal}
          onDelete={(id, sName) => {
            handleDeleteStudent(id, sName);
            island.success(`Data "${sName}" berhasil dihapus.`);
          }}
          onUpdateProgram={(id, newProgram) => {
            handleUpdateStudentProgram(id, newProgram);
            island.success(`Level program diperbarui ke ${newProgram}`);
          }}
          onScheduleStudent={(st) => { setScheduleTargetStudent(st); setScheduleModalOpen(true); }}
        />
      )}

      {activeTab === "parents" && (
        <ParentTable
          parents={parents}
          students={students}
          onDeleteParent={handleDeleteParent}
          onUpdateRole={(userId, newRole) => {
            handleUpdateRole(userId, newRole);
            island.success("Peran user berhasil diperbarui!");
          }}
        />
      )}

      {activeTab === "registrations" && (
        <RegistrationTable
          registrations={registrations}
          regLoading={regLoading}
          errorMsg={errorMsg}
          waSendingId={waSendingId}
          waFeedback={waFeedback}
          onApprove={(reg) => { handleApprove(reg); island.success(`Pendaftaran ${reg.student_name} disetujui!`); }}
          onOpenReject={(id) => { setRejectModalId(id); setRejectNotes(""); }}
        />
      )}

      <StudentFormModal
        open={modalOpen} editing={!!editingStudent}
        name={name} onNameChange={(e) => setName(e.target.value)}
        age={age} onAgeChange={(e) => setAge(e.target.value)}
        program={program} onProgramChange={(e) => setProgram(e.target.value)}
        status={status} onStatusChange={(e) => setStatus(e.target.value)}
        parentId={parentId} onParentIdChange={(e) => setParentId(e.target.value)}
        parents={parents} submitting={submitting} errorMsg={formErrorMsg}
        onClose={() => setModalOpen(false)} onSubmit={handleSaveStudent}
      />

      <ScheduleStudentModal
        isOpen={scheduleModalOpen} student={scheduleTargetStudent}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={(msg) => { island.success("Jadwal Diperbarui", msg); fetchData(); }}
      />

      <RejectModal
        rejectModalId={rejectModalId} rejectNotes={rejectNotes} setRejectNotes={setRejectNotes}
        onClose={() => setRejectModalId(null)}
        onConfirm={() => {
          if (rejectModalId) {
            handleReject(rejectModalId, rejectNotes);
            island.info("Pendaftaran telah ditolak.");
          }
        }}
      />

      <StudentImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} onSuccess={() => { island.success("Import siswa berhasil!"); fetchData(); }} />
    </div>
  );
}

export default function AdminStudents() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Memuat Manajemen Siswa...</div>}>
      <AdminStudentsContent />
    </Suspense>
  );
}
