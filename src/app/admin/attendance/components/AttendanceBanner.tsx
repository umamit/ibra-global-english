"use client";

import React from "react";
import { Student, AttendanceEntry } from "../hooks/useAttendanceData";

interface AttendanceBannerProps {
  selectedDate: string;
  students: Student[];
  attendanceMap: Record<string, AttendanceEntry>;
}

export default function AttendanceBanner({ selectedDate, students, attendanceMap }: AttendanceBannerProps) {
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === todayStr;
  if (!isToday) return null;

  const filledCount = Object.values(attendanceMap).filter((e) => e.isExisting).length;
  const isComplete = filledCount > 0 && filledCount >= students.length;

  if (isComplete) {
    return (
      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#166534", flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#166534" }}>Absensi Hari Ini Lengkap!</h4>
            <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#15803d" }}>
              Seluruh data kehadiran {students.length} siswa untuk tanggal {selectedDate} sudah diisi oleh Tutor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const waText = encodeURIComponent(`Halo Tutor Ibra Global English,\n\nMengingatkan untuk mengisi absensi kelas harian tanggal ${selectedDate} pada Portal Admin / Tutor. Terima kasih! `);
  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400e", flexShrink: 0 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, color: "#92400e" }}>Pengingat Absensi Harian Tutor</h4>
          <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#b45309" }}>
            {filledCount > 0 ? `Baru ${filledCount} dari ${students.length} siswa terisi absensinya hari ini.` : `Absensi untuk kelas hari ini (${selectedDate}) belum diisi oleh Tutor.`}
          </p>
        </div>
      </div>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-portal"
        style={{ backgroundColor: "#25d366", color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.45rem 0.9rem", fontSize: "0.82rem", borderRadius: "8px", fontWeight: 700 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        <span>Ingatkan Tutor via WA</span>
      </a>
    </div>
  );
}
