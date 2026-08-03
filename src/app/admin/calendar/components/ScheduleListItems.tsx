import React from "react";
import { AcademicSchedule } from "../ScheduleList";

export function getEventStyles(type: string) {
  switch (type) {
    case "holiday":
      return { borderLeft: "4px solid #ef4444", bg: "rgba(239, 68, 68, 0.05)", color: "#ef4444", label: "Libur" };
    case "event":
      return { borderLeft: "4px solid #A68849", bg: "rgba(166, 136, 73, 0.05)", color: "#A68849", label: "Kegiatan" };
    case "class":
    default:
      return { borderLeft: "4px solid #216c7e", bg: "rgba(33, 108, 126, 0.05)", color: "#216c7e", label: "Kelas" };
  }
}

export function PendingScheduleItem({ s, onEdit }: { s: AcademicSchedule; onEdit: (sched: AcademicSchedule, e: React.MouseEvent) => void }) {
  const startObj = new Date(s.start_time);
  const dateStr = startObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = `${startObj.toTimeString().slice(0, 5)} WIB`;
  const isRescheduled = s.status === "rescheduled";

  return (
    <div style={{
      borderLeft: isRescheduled ? "4px solid #3b82f6" : "4px solid #f59e0b",
      backgroundColor: isRescheduled ? "rgba(59, 130, 246, 0.05)" : "rgba(245, 158, 11, 0.05)",
      borderRadius: "0 10px 10px 0", padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "6px", position: "relative"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--color-gray-600)" }}>{dateStr} ({timeStr})</span>
        <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", backgroundColor: isRescheduled ? "rgba(59, 130, 246, 0.15)" : "rgba(245, 158, 11, 0.15)", color: isRescheduled ? "#2563eb" : "#d97706" }}>
          {isRescheduled ? "Rescheduled" : "Pending"}
        </span>
      </div>
      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{s.title}</h4>
      {s.program !== "All" && <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)" }}>Program: <span style={{ color: "var(--color-primary-dark)" }}>{s.program}</span></div>}
      {s.pending_reason && <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "#b45309", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "0.4rem 0.6rem", borderRadius: "6px" }}>Alasan Penundaan: {s.pending_reason}</div>}
      {s.rescheduled_to && <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1d4ed8", backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "0.4rem 0.6rem", borderRadius: "6px" }}>Jadwal Pengganti: {new Date(s.rescheduled_to).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
        <button type="button" onClick={(e) => onEdit(s, e)} style={{ background: "transparent", border: "none", fontSize: "0.78rem", fontWeight: "800", color: "var(--color-primary)", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" }} className="btn-text-hover">
          Ubah / Atur Pengganti
        </button>
      </div>
    </div>
  );
}

export function DayScheduleItem({ s, onEdit }: { s: AcademicSchedule; onEdit: (sched: AcademicSchedule, e: React.MouseEvent) => void }) {
  const styles = getEventStyles(s.type);
  const startObj = new Date(s.start_time);
  const endObj = new Date(s.end_time);
  const timeStr = `${startObj.toTimeString().slice(0, 5)} - ${endObj.toTimeString().slice(0, 5)} WIB`;

  return (
    <div style={{ borderLeft: styles.borderLeft, backgroundColor: styles.bg, borderRadius: "0 10px 10px 0", padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "6px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--color-gray-600)" }}>{timeStr}</span>
        <span style={{ fontSize: "0.68rem", fontWeight: "800", padding: "2px 8px", borderRadius: "12px", backgroundColor: "rgba(255, 255, 255, 0.8)", color: styles.color, textTransform: "uppercase" }}>{styles.label}</span>
      </div>
      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{s.title}</h4>
      {s.description && <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--color-gray-600)", lineHeight: "1.4" }}>{s.description}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", fontSize: "0.75rem" }}>
        <span style={{ fontWeight: "700", color: "var(--color-gray-500)" }}>Program: <span style={{ color: "var(--color-primary-dark)" }}>{s.program}</span></span>
        <button type="button" onClick={(e) => onEdit(s, e)} style={{ background: "transparent", border: "none", fontSize: "0.78rem", fontWeight: "800", color: "var(--color-primary)", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" }} className="btn-text-hover">Ubah / Status</button>
      </div>
    </div>
  );
}
