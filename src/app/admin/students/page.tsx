"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
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

export default function AdminStudents() {
  const {
    students,
    parents,
    registrations,
    loading,
    regLoading,
    errorMsg,
    waSendingId,
    waFeedback,
    fetchData,
    fetchRegistrations,
    handleApprove,
    handleReject,
    handleDeleteStudent,
    handleUpdateStudentProgram,
  } = useStudentData();

  const [activeTab, setActiveTab] = useState<string>("students");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [scheduleTargetStudent, setScheduleTargetStudent] = useState<StudentItem | null>(null);
  const [scheduleToast, setScheduleToast] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [program, setProgram] = useState<string>("A1 Foundation 1");
  const [status, setStatus] = useState<string>("aktif");
  const [parentId, setParentId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formErrorMsg, setFormErrorMsg] = useState<string>("");

  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>("");

  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setName("");
    setAge("");
    setProgram("A1 Foundation 1");
    setStatus("aktif");
    setParentId("");
    setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (student: StudentItem) => {
    setEditingStudent(student);
    setName(student.name);
    setAge(String(student.age));
    setProgram(student.program || "A1 Foundation 1");
    setStatus(student.status || "aktif");
    setParentId(student.parent_id || "");
    setFormErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenScheduleModal = (student: StudentItem) => {
    setScheduleTargetStudent(student);
    setScheduleModalOpen(true);
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

      let res;
      if (editingStudent) {
        res = await fetch("/api/admin/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingStudent.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal menyimpan data siswa.");
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormErrorMsg(err.message || "Gagal menyimpan data siswa.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParent = async (id: string, name: string) => {
    if (!confirm(`Hapus wali/siswa "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });
      if (!res.ok) throw new Error("Gagal menghapus user.");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "student" ? "parent" : "student";
    if (!confirm(`Ubah role user dari "${currentRole}" menjadi "${newRole}"?`)) return;
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, role: newRole }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui role.");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Akademik Siswa &amp; CEFR Level</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Database utama siswa dan pemetaan level kurikulum IGE CEFR LKP Ibra Global English Bobong
          </p>
        </div>
        <div className="topbar-user" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {activeTab === "students" && (
            <>
              <button className="btn-portal-outline" onClick={() => handleExportStudentsCSV(students)} style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}>
                <span>Ekspor CSV</span>
              </button>
              <button className="btn-portal-outline" onClick={() => setImportModalOpen(true)} style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}>
                <span>Impor Massal</span>
              </button>
              <button className="btn-portal-primary" onClick={handleOpenAddModal} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                <span>+ Tambah Siswa</span>
              </button>
            </>
          )}
        </div>
      </div>

      {scheduleToast && (
        <div className="auth-success-banner" style={{ marginBottom: "1.25rem" }}>
          <span>{scheduleToast}</span>
        </div>
      )}

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
          <p>Memuat database siswa &amp; level CEFR...</p>
        </div>
      ) : activeTab === "students" ? (
        <StudentTable
          students={students}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteStudent}
          onUpdateProgram={handleUpdateStudentProgram}
          onScheduleStudent={handleOpenScheduleModal}
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

      <StudentFormModal
        open={modalOpen}
        editing={!!editingStudent}
        name={name} onNameChange={(e) => setName(e.target.value)}
        age={age} onAgeChange={(e) => setAge(e.target.value)}
        program={program} onProgramChange={(e) => setProgram(e.target.value)}
        status={status} onStatusChange={(e) => setStatus(e.target.value)}
        parentId={parentId} onParentIdChange={(e) => setParentId(e.target.value)}
        parents={parents}
        submitting={submitting}
        errorMsg={formErrorMsg}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveStudent}
      />

      <ScheduleStudentModal
        isOpen={scheduleModalOpen}
        student={scheduleTargetStudent}
        onClose={() => setScheduleModalOpen(false)}
        onSuccess={(msg) => {
          setScheduleToast(msg);
          setTimeout(() => setScheduleToast(""), 6000);
        }}
      />

      <RejectModal
        rejectModalId={rejectModalId}
        rejectNotes={rejectNotes}
        setRejectNotes={setRejectNotes}
        onClose={() => setRejectModalId(null)}
        onConfirm={() => rejectModalId && handleReject(rejectModalId, rejectNotes)}
      />

      <StudentImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
