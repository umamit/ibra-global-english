"use client";

import React, { useState } from "react";
import PrintReportView from "@/app/admin/reports/components/PrintReportView";
import { Student } from "@/types";
import { StudentOverviewHeader } from "./StudentOverviewHeader";
import { ReportCardItem } from "./ReportCardItem";

interface Announcement { id: string; title: string; content: any; priority: string; is_sanity?: boolean; image_url?: string; published_at: string; program: string; }
interface OnlineSchedule { id: string; title: string; scheduled_at: string; meeting_platform: string; duration_minutes: number; meeting_link: string; }
interface AttendanceLog { id: string; date: string; status: string; notes?: string | null; }
interface AttendanceStats { hadir: number; sakit: number; izin: number; alfa: number; }
interface Report { id: string; student_id: string; module_name: string; speaking_score: number; grammar_score: number; vocabulary_score: number; active_score: number; tutor_notes?: string | null; created_at: string; }
interface Certificate { id: string; report_id: string; student_id: string; module_name: string; }

interface ProgressViewProps {
  selectedChild: Student | null;
  announcements: Announcement[];
  onlineSchedules: OnlineSchedule[];
  attendance: AttendanceLog[];
  attendanceStats: AttendanceStats;
  reports: Report[];
  certificates: Certificate[];
  detailsLoading: boolean;
  getIndonesianDay: (dateStr: string) => string;
  getIndonesianDate: (dateStr: string) => string;
  triggerPrint: (report: Report) => void;
}

export default function ProgressView({
  selectedChild, announcements, onlineSchedules, attendance, attendanceStats, reports, certificates, detailsLoading
}: ProgressViewProps) {
  const [printReport, setPrintReport] = useState<Report | null>(null);

  if (printReport) {
    return <PrintReportView printReport={{ ...printReport, students: selectedChild }} contactAddress="Jl. TPu Bobong, Belakang Mess Tambang, Gedung Kost Fitrah Lantai 1, RT 001, RW 001, Bobong, Taliabu Barat, Kabupaten Pulau Taliabu, Maluku Utara 97794" onClose={() => setPrintReport(null)} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <StudentOverviewHeader selectedChild={selectedChild} attendanceStats={attendanceStats} attendance={attendance} />

      <div>
        <h4 style={{ fontSize: "1.15rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1.25rem" }}>Riwayat Rapor Evaluasi Belajar</h4>

        {detailsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="portal-card"><div className="skeleton-pulse skeleton-title" style={{ width: "200px", marginBottom: "0.5rem" }} /></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="portal-card text-center" style={{ padding: "3rem" }}><p style={{ color: "var(--color-gray-500)" }}>Belum ada rapor digital yang diterbitkan untuk saat ini.</p></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {reports.map((report) => (
              <ReportCardItem key={report.id} report={report} selectedChild={selectedChild} certificates={certificates} onSetPrintReport={setPrintReport} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
