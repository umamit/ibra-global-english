import React from 'react';

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
  onEdit: (sched: AcademicSchedule, e: React.MouseEvent) => void;
}

export default function ScheduleList({ schedules, viewYear, viewMonth, onEdit }: ScheduleListProps) {
  const filtered = schedules.filter(s => {
    const sDate = new Date(s.start_time);
    return sDate.getFullYear() === viewYear && sDate.getMonth() === viewMonth;
  });

  const getMonthNameIndonesian = (monthIdx: number): string => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[monthIdx];
  };

  return (
    <div style={{ 
      marginTop: "2rem", 
      backgroundColor: "white", 
      borderRadius: "var(--radius-lg)", 
      boxShadow: "var(--shadow-md)", 
      padding: "1.5rem",
      border: "1px solid var(--color-gray-200)"
    }}>
      <h2 style={{ 
        fontSize: "1.2rem", 
        fontWeight: "900", 
        color: "var(--color-gray-900)", 
        marginBottom: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>📋 Daftar Agenda ({getMonthNameIndonesian(viewMonth)} {viewYear})</span>
        <span style={{ 
          fontSize: "0.85rem", 
          fontWeight: "600", 
          backgroundColor: "var(--color-gray-100)", 
          color: "var(--color-gray-600)", 
          padding: "0.25rem 0.6rem", 
          borderRadius: "12px" 
        }}>
          {filtered.length} Agenda
        </span>
      </h2>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2.5rem 0", color: "var(--color-gray-400)" }}>
          <p style={{ fontSize: "0.95rem" }}>Tidak ada agenda belajar mengajar untuk bulan ini.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", textAlign: "left" }}>
            <thead>
              <tr style={{ 
                borderBottom: "2px solid var(--color-gray-200)", 
                color: "var(--color-gray-600)", 
                fontWeight: "800",
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 10
              }}>
                <th style={{ padding: "0.75rem 0.5rem" }}>Hari & Tanggal</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Jam (Local)</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Nama Kelas / Agenda</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Program</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Tutor</th>
                <th style={{ padding: "0.75rem 0.5rem" }}>Tipe</th>
                <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const startDateObj = new Date(s.start_time);
                const endDateObj = new Date(s.end_time);
                
                // Format Hari & Tanggal (Senin, 6 Jul)
                const dateStr = startDateObj.toLocaleDateString('id-ID', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                });
                
                // Format Jam (10:00 - 11:15)
                const timeStr = `${startDateObj.toTimeString().slice(0, 5)} - ${endDateObj.toTimeString().slice(0, 5)}`;
                
                // Tipe badge color
                let typeBg = "var(--color-primary-light)";
                let typeColor = "var(--color-primary-dark)";
                if (s.type === "holiday") {
                  typeBg = "#fee2e2";
                  typeColor = "#ef4444";
                } else if (s.type === "event") {
                  typeBg = "var(--color-accent-light)";
                  typeColor = "var(--color-accent)";
                }

                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--color-gray-100)" }} className="table-row-hover">
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: "800", color: "var(--color-gray-800)" }}>{dateStr}</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-600)" }}>{timeStr}</td>
                    <td style={{ padding: "0.75rem 0.5rem", fontWeight: "900", color: "var(--color-gray-900)" }}>{s.title}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "800", 
                        backgroundColor: "var(--color-primary-light)", 
                        color: "var(--color-primary-dark)", 
                        padding: "0.2rem 0.5rem", 
                        borderRadius: "4px" 
                      }}>
                        {s.program}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "var(--color-gray-700)" }}>{s.instructor || "-"}</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "800", 
                        backgroundColor: typeBg, 
                        color: typeColor, 
                        padding: "0.2rem 0.5rem", 
                        borderRadius: "4px",
                        textTransform: "capitalize"
                      }}>
                        {s.type === 'class' ? 'Kelas' : s.type === 'event' ? 'Kegiatan' : 'Libur'}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={(e) => onEdit(s, e)}
                        className="btn-portal-outline"
                        style={{ 
                          padding: "0.25rem 0.6rem", 
                          fontSize: "0.75rem", 
                          fontWeight: "700",
                          borderRadius: "6px" 
                        }}
                      >
                        ⚙️ Ubah / Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
