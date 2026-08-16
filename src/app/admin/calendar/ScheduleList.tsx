import React, { useState } from 'react';
import { getEventStyles, PendingScheduleItem, DayScheduleItem } from './components/ScheduleListItems';

export interface AcademicSchedule {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  instructor?: string | null;
  recurrence_id?: string | null;
  status?: "active" | "pending" | "rescheduled" | string;
  pending_reason?: string | null;
  rescheduled_to?: string | null;
  created_at?: string;
}

interface ScheduleListProps {
  schedules: AcademicSchedule[];
  viewYear: number;
  viewMonth: number;
  selectedDate: string;
  onEdit: (sched: AcademicSchedule, e: React.MouseEvent) => void;
  onAddEvent: (dateStr: string) => void;
}

export default function ScheduleList({ schedules, viewYear, viewMonth, selectedDate, onEdit, onAddEvent }: ScheduleListProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'month' | 'pending'>('day');

  const getLocalDateString = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const daySchedules = schedules.filter(s => getLocalDateString(new Date(s.start_time)) === selectedDate).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const pendingSchedules = schedules.filter(s => s.status === 'pending' || s.status === 'rescheduled').sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const monthSchedules = schedules.filter(s => { const d = new Date(s.start_time); return d.getFullYear() === viewYear && d.getMonth() === viewMonth; }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ backgroundColor: "var(--color-bg-card)", borderRadius: "16px", padding: "1.25rem", border: "1px solid var(--color-border)", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
            {activeTab === 'day' ? formattedSelectedDate : activeTab === 'pending' ? "Jadwal Pending & Pengganti" : "Agenda Bulan Ini"}
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--color-gray-500)", fontWeight: "600" }}>
            {activeTab === 'day' ? `${daySchedules.length} Agenda Terjadwal` : activeTab === 'pending' ? `${pendingSchedules.length} Kelas Membutuhkan Perhatian` : `${monthSchedules.length} Agenda Total`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px", backgroundColor: "rgba(0,0,0,0.04)", padding: "3px", borderRadius: "8px" }}>
          <button type="button" onClick={() => setActiveTab('day')} style={{ padding: "4px 10px", fontSize: "0.75rem", fontWeight: "800", border: "none", borderRadius: "6px", backgroundColor: activeTab === 'day' ? "#fff" : "transparent", color: activeTab === 'day' ? "var(--color-primary)" : "var(--color-gray-600)", cursor: "pointer" }}>Harian</button>
          <button type="button" onClick={() => setActiveTab('pending')} style={{ padding: "4px 10px", fontSize: "0.75rem", fontWeight: "800", border: "none", borderRadius: "6px", backgroundColor: activeTab === 'pending' ? "#fff" : "transparent", color: activeTab === 'pending' ? "#d97706" : "var(--color-gray-600)", cursor: "pointer", position: "relative" }}>
            Pending {pendingSchedules.length > 0 && <span style={{ width: "6px", height: "6px", backgroundColor: "#ef4444", borderRadius: "50%", display: "inline-block", marginLeft: "4px" }} />}
          </button>
          <button type="button" onClick={() => setActiveTab('month')} style={{ padding: "4px 10px", fontSize: "0.75rem", fontWeight: "800", border: "none", borderRadius: "6px", backgroundColor: activeTab === 'month' ? "#fff" : "transparent", color: activeTab === 'month' ? "var(--color-primary)" : "var(--color-gray-600)", cursor: "pointer" }}>Bulanan</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
        {activeTab === 'day' ? (
          daySchedules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600", margin: 0 }}>Tidak ada agenda untuk tanggal ini.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {daySchedules.map((s) => <DayScheduleItem key={s.id} s={s} onEdit={onEdit} />)}
            </div>
          )
        ) : activeTab === 'pending' ? (
          pendingSchedules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}><p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600", margin: 0 }}>Tidak ada kelas yang ditunda atau pending. Semua berjalan lancar!</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingSchedules.map((s) => <PendingScheduleItem key={s.id} s={s} onEdit={onEdit} />)}
            </div>
          )
        ) : (
          monthSchedules.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}><p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600", margin: 0 }}>Tidak ada agenda untuk bulan ini.</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {monthSchedules.map((s) => {
                const styles = getEventStyles(s.type);
                const startObj = new Date(s.start_time);
                return (
                  <div key={s.id} onClick={(e) => onEdit(s, e)} style={{ borderLeft: styles.borderLeft, backgroundColor: "rgba(0, 0, 0, 0.01)", borderRadius: "0 8px 8px 0", padding: "0.65rem 0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", cursor: "pointer" }} className="month-list-item">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--color-gray-900)" }}>{s.title}</h4>
                      <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: "700" }}>{startObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} pukul {startObj.toTimeString().slice(0, 5)} • {s.program}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: styles.color, fontWeight: "800", textTransform: "uppercase" }}>{styles.label}</span>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
