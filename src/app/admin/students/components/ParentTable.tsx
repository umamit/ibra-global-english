"use client";

import React from "react";
import { Profile, StudentItem } from "../hooks/useStudentData";

interface ParentTableProps {
  parents: Profile[];
  students: StudentItem[];
  onDeleteParent: (userId: string, userName: string) => void;
  onUpdateRole: (userId: string, newRole: string) => void;
}

export default function ParentTable({ parents, students, onDeleteParent, onUpdateRole }: ParentTableProps) {
  return (
    <div className="table-wrapper">
      <table className="portal-table parent-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Lengkap</th>
            <th>Alamat Email</th>
            <th>Peran Aktif</th>
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
              return (
                <tr key={parent.id}>
                  <td style={{ fontWeight: "700" }}>{idx + 1}</td>
                  <td style={{ fontWeight: "600", color: "var(--color-gray-900)" }}>{parent.full_name}</td>
                  <td>{parent.email || <span style={{ color: "var(--color-gray-400)", fontStyle: "italic" }}>Tidak tersedia</span>}</td>
                  <td>
                    <span
                      className="user-badge"
                      style={{
                        backgroundColor:
                          parent.role === "admin" ? "rgba(239, 68, 68, 0.1)"
                          : parent.role === "tutor" ? "rgba(166, 136, 73, 0.1)"
                          : parent.role === "student" ? "var(--color-primary-light)"
                          : "var(--color-green-light)",
                        color:
                          parent.role === "admin" ? "var(--color-red)"
                          : parent.role === "tutor" ? "var(--color-accent)"
                          : parent.role === "student" ? "var(--color-primary-dark)"
                          : "var(--color-green)",
                        padding: "0.25rem 0.65rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {parent.role || "parent"}
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
                      value={parent.role || "parent"}
                      onChange={(e) => onUpdateRole(parent.id, e.target.value)}
                      className="form-input"
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem", width: "auto", borderRadius: "6px", border: "1px solid var(--color-gray-200)", cursor: "pointer", backgroundColor: "white", fontWeight: "600" }}
                    >
                      <option value="parent">Orang Tua (Parent)</option>
                      <option value="tutor">Pengajar (Tutor)</option>
                      <option value="student">Siswa (Student)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-portal-danger"
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", height: "auto" }}
                      onClick={() => onDeleteParent(parent.id, parent.full_name)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.25rem" }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      <span>Hapus</span>
                    </button>
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
