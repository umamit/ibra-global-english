"use client";

import React from "react";
import { Profile, StudentItem } from "../hooks/useStudentData";

interface ParentTableProps {
  parents: Profile[];
  students: StudentItem[];
  onDeleteParent: (userId: string, userName: string) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
  onResetPassword?: (userId: string, userName: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  parent: "ORANG TUA",
  student: "SISWA",
  tutor: "TUTOR",
  admin: "ADMIN",
  pending_parent: "MENUNGGU (ORANG TUA)",
  pending_student: "MENUNGGU (SISWA)",
  pending_tutor: "MENUNGGU (TUTOR)",
};

export default function ParentTable({
  parents,
  students,
  onDeleteParent,
  onUpdateRole,
  onResetPassword,
}: ParentTableProps) {
  return (
    <div className="table-wrapper">
      <table className="portal-table parent-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Lengkap</th>
            <th>Alamat Email</th>
            <th>Status & Peran</th>
            <th>Siswa Terhubung</th>
            <th>Ubah Peran</th>
            <th style={{ textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {parents.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-gray-500)" }}>
                Belum ada akun pengguna terdaftar.
              </td>
            </tr>
          ) : (
            parents.map((parent, idx) => {
              const connectedChildren = students.filter((s) => s.parent_id === parent.id);
              const rawRole = parent.role || "parent";
              const isPending = rawRole.startsWith("pending_");
              const targetApprovedRole = isPending ? rawRole.replace("pending_", "") : rawRole;

              return (
                <tr key={parent.id} style={isPending ? { backgroundColor: "rgba(245, 158, 11, 0.05)" } : undefined}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{parent.full_name}</td>
                  <td>{parent.email || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>Tidak tersedia</span>}</td>
                  <td>
                    <span
                      className="user-badge"
                      style={{
                        backgroundColor: isPending
                          ? "rgba(245, 158, 11, 0.16)"
                          : rawRole === "admin"
                          ? "rgba(239, 68, 68, 0.1)"
                          : rawRole === "tutor"
                          ? "rgba(166, 136, 73, 0.1)"
                          : rawRole === "student"
                          ? "var(--color-primary-light)"
                          : "var(--color-green-light)",
                        color: isPending
                          ? "#b45309"
                          : rawRole === "admin"
                          ? "var(--color-red)"
                          : rawRole === "tutor"
                          ? "var(--color-accent)"
                          : rawRole === "student"
                          ? "var(--color-primary-dark)"
                          : "var(--color-green)",
                        padding: "0.25rem 0.65rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {ROLE_LABELS[rawRole] || rawRole}
                    </span>
                  </td>
                  <td>
                    {connectedChildren.length > 0 ? (
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {connectedChildren.map((child) => (
                          <span key={child.id} className="user-badge" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)", padding: "0.15rem 0.5rem", fontSize: "0.8rem", fontWeight: "700" }}>
                            {child.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: "var(--color-gray-400)", fontStyle: "italic", fontSize: "0.85rem" }}>-</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={rawRole}
                      onChange={(e) => onUpdateRole(parent.id, e.target.value)}
                      className="form-input"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", width: "auto", borderRadius: "6px", border: "1px solid var(--color-gray-200)", cursor: "pointer", backgroundColor: "white", fontWeight: "600" }}
                    >
                      <option value="parent">Orang Tua (Aktif)</option>
                      <option value="student">Siswa (Aktif)</option>
                      <option value="tutor">Pengajar / Tutor (Aktif)</option>
                      <option value="admin">Administrator</option>
                      <option value="pending_parent">Menunggu: Orang Tua</option>
                      <option value="pending_student">Menunggu: Siswa</option>
                      <option value="pending_tutor">Menunggu: Tutor</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {isPending && (
                        <button
                          type="button"
                          className="btn-portal-primary"
                          style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => onUpdateRole(parent.id, targetApprovedRole)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          <span>Setujui</span>
                        </button>
                      )}
                      {onResetPassword && (
                        <button
                          type="button"
                          className="btn-portal-outline"
                          style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => onResetPassword(parent.id, parent.full_name)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          <span>Ubah Sandi</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-portal-danger"
                        style={{ fontSize: "0.85rem", padding: "0.5rem 1rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                        onClick={() => onDeleteParent(parent.id, parent.full_name)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
