import React, { useState } from 'react';

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

export default function ScheduleList({ 
  schedules, 
  viewYear, 
  viewMonth, 
  selectedDate, 
  onEdit,
  onAddEvent
}: ScheduleListProps) {
  const [activeTab, setActiveTab] = useState<'day' | 'month'>('day');

  const getLocalDateString = (dateObj: Date): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 1. Filter schedules for selected date
  const daySchedules = schedules.filter(s => {
    const sDateStr = getLocalDateString(new Date(s.start_time));
    return sDateStr === selectedDate;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // 2. Filter schedules for current calendar view month
  const monthSchedules = schedules.filter(s => {
    const sDate = new Date(s.start_time);
    return sDate.getFullYear() === viewYear && sDate.getMonth() === viewMonth;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const getMonthNameIndonesian = (monthIdx: number): string => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[monthIdx];
  };

  // Format header dates
  const selectedDateObj = new Date(selectedDate);
  const formattedSelectedDate = selectedDateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const getEventStyles = (type: string) => {
    switch (type) {
      case 'holiday':
        return {
          borderLeft: '4px solid #ef4444',
          bg: 'rgba(239, 68, 68, 0.05)',
          color: '#ef4444',
          label: 'Libur'
        };
      case 'event':
        return {
          borderLeft: '4px solid #A68849',
          bg: 'rgba(166, 136, 73, 0.05)',
          color: '#A68849',
          label: 'Kegiatan'
        };
      case 'class':
      default:
        return {
          borderLeft: '4px solid #216c7e',
          bg: 'rgba(33, 108, 126, 0.05)',
          color: '#216c7e',
          label: 'Kelas'
        };
    }
  };

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "16px",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: "500px",
      overflow: "hidden"
    }}>
      {/* Sidebar Header & Tab Switcher */}
      <div style={{
        padding: "1.25rem",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        backgroundColor: "#fcfcfd"
      }}>
        <div style={{
          display: "flex",
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          borderRadius: "9px",
          padding: "2px",
          marginBottom: "1rem"
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('day')}
            style={{
              flex: 1,
              padding: "0.5rem 0.25rem",
              borderRadius: "7px",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === 'day' ? "white" : "transparent",
              color: activeTab === 'day' ? "var(--color-primary-dark)" : "var(--color-gray-500)",
              boxShadow: activeTab === 'day' ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('month')}
            style={{
              flex: 1,
              padding: "0.5rem 0.25rem",
              borderRadius: "7px",
              border: "none",
              fontSize: "0.8rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === 'month' ? "white" : "transparent",
              color: activeTab === 'month' ? "var(--color-primary-dark)" : "var(--color-gray-500)",
              boxShadow: activeTab === 'month' ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            Bulan Ini
          </button>
        </div>

        {activeTab === 'day' ? (
          <div>
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: "800", color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Agenda Terpilih
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "1.05rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
              {formattedSelectedDate}
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: "800", color: "var(--color-gray-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rangkuman Bulan
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "1.05rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
              {getMonthNameIndonesian(viewMonth)} {viewYear}
            </p>
          </div>
        )}
      </div>

      {/* Agenda content list */}
      <div style={{
        flexGrow: 1,
        padding: "1.25rem",
        overflowY: "auto",
        backgroundColor: "#ffffff",
        maxHeight: "650px"
      }}>
        {activeTab === 'day' ? (
          daySchedules.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</span>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600", margin: "0 0 1rem 0" }}>
                Tidak ada agenda terdaftar untuk tanggal ini.
              </p>
              <button
                type="button"
                className="btn-portal-outline"
                style={{
                  fontSize: "0.8rem",
                  padding: "0.4rem 1rem",
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)"
                }}
                onClick={() => onAddEvent(selectedDate)}
              >
                + Tambah Agenda
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {daySchedules.map((s) => {
                const styles = getEventStyles(s.type);
                const startObj = new Date(s.start_time);
                const endObj = new Date(s.end_time);
                const timeStr = `${startObj.toTimeString().slice(0, 5)} - ${endObj.toTimeString().slice(0, 5)}`;

                return (
                  <div
                    key={s.id}
                    style={{
                      borderLeft: styles.borderLeft,
                      backgroundColor: styles.bg,
                      borderRadius: "0 10px 10px 0",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      position: "relative",
                      transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                    }}
                    className="timeline-item-hover"
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "800", color: styles.color }}>
                        ⏰ {timeStr}
                      </span>
                      <span style={{
                        fontSize: "0.68rem",
                        fontWeight: "800",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        border: `1px solid ${styles.color}`,
                        color: styles.color,
                        padding: "1px 5px",
                        borderRadius: "4px",
                        textTransform: "uppercase"
                      }}>
                        {styles.label}
                      </span>
                    </div>

                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "900", color: "var(--color-gray-900)", lineHeight: "1.3" }}>
                      {s.title}
                    </h4>

                    {s.program !== "All" && (
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
                        📚 Program: <span style={{ color: "var(--color-primary-dark)" }}>{s.program}</span>
                      </div>
                    )}

                    {s.instructor && (
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
                        👤 Tutor: <span style={{ color: "var(--color-gray-700)" }}>{s.instructor}</span>
                      </div>
                    )}

                    {s.description && (
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#59616e", lineHeight: "1.4" }}>
                        📝 {s.description}
                      </p>
                    )}

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                      <button
                        type="button"
                        onClick={(e) => onEdit(s, e)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "0.78rem",
                          fontWeight: "800",
                          color: "var(--color-primary)",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          transition: "background-color 0.15s"
                        }}
                        className="btn-text-hover"
                      >
                        ⚙️ Ubah / Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          monthSchedules.length === 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem 1rem",
              textAlign: "center"
            }}>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray-400)", fontWeight: "600", margin: 0 }}>
                Tidak ada agenda untuk bulan ini.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {monthSchedules.map((s) => {
                const styles = getEventStyles(s.type);
                const startObj = new Date(s.start_time);
                const dateStr = startObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short'
                });
                const timeStr = startObj.toTimeString().slice(0, 5);

                return (
                  <div
                    key={s.id}
                    onClick={(e) => onEdit(s, e)}
                    style={{
                      borderLeft: styles.borderLeft,
                      backgroundColor: "rgba(0, 0, 0, 0.01)",
                      borderRadius: "0 8px 8px 0",
                      padding: "0.65rem 0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    className="month-list-item"
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
                        {s.title}
                      </h4>
                      <span style={{ fontSize: "0.72rem", color: "var(--color-gray-500)", fontWeight: "700" }}>
                        {dateStr} pukul {timeStr} • {s.program}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: styles.color, fontWeight: "800", textTransform: "uppercase" }}>
                      {styles.label}
                    </span>
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
