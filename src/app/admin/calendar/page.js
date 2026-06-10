"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { createAdminClient as createClient } from "@/utils/supabase/client";

export default function AdminCalendar() {
  const supabase = createClient();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Current calendar view year & month
  const [currentDate, setCurrentDate] = useState(new Date());
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth(); // 0-indexed

  // Form / Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedChildSchedule] = useState(null); // null for new, schedule object for editing

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("class"); // 'class', 'event', 'holiday'
  const [program, setProgram] = useState("All"); // 'Kids Program', 'Teens Program', 'Fun Calistung', 'All'
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState("09:00"); // HH:MM
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [endTime, setEndTime] = useState("10:30"); // HH:MM
  const [instructor, setInstructor] = useState("");

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState("weekly"); // 'weekly', 'daily'
  const [recurrenceCount, setRecurrenceCount] = useState(4);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch schedules from Supabase
      const { data, error } = await supabase
        .from("academic_schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (err) {
      console.error("Gagal memuat jadwal akademik:", err);
      setStatusMsg({ type: "error", text: "Gagal memuat jadwal: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendar calculations (Sunday-first grid)
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (y, m) => new Date(y, m, 1).getDay();

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayIndex(viewYear, viewMonth);

  const prevMonthTotalDays = getDaysInMonth(viewYear, viewMonth - 1);

  const calendarDays = [];

  // 1. Fill trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const tempMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const tempYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    calendarDays.push({
      day: prevDay,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`
    });
  }

  // 2. Fill current month days
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
      dateString: `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    });
  }

  // 3. Fill leading days from next month to make full weeks (42 grid cells usually)
  const remainingCells = 42 - calendarDays.length;
  for (let n = 1; n <= remainingCells; n++) {
    const tempMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const tempYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    calendarDays.push({
      day: n,
      month: tempMonth,
      year: tempYear,
      isCurrentMonth: false,
      dateString: `${tempYear}-${String(tempMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`
    });
  }

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
    } else {
      setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  const getMonthNameIndonesian = (monthIdx) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return months[monthIdx];
  };

  const handleOpenAddModal = (dateStr) => {
    setSelectedChildSchedule(null);
    setTitle("");
    setDescription("");
    setType("class");
    setProgram("All");
    setStartDate(dateStr || new Date().toISOString().split("T")[0]);
    setStartTime("09:00");
    setEndDate(dateStr || new Date().toISOString().split("T")[0]);
    setEndTime("10:30");
    setInstructor("");
    setIsRecurring(false);
    setRecurrenceType("weekly");
    setRecurrenceCount(4);
    setModalOpen(true);
  };

  const handleOpenEditModal = (sched, e) => {
    e.stopPropagation(); // Prevent opening Add modal for that day
    setSelectedChildSchedule(sched);
    setTitle(sched.title);
    setDescription(sched.description || "");
    setType(sched.type);
    setProgram(sched.program || "All");
    
    const startObj = new Date(sched.start_time);
    const endObj = new Date(sched.end_time);

    setStartDate(startObj.toISOString().split("T")[0]);
    setStartTime(startObj.toTimeString().slice(0, 5));
    setEndDate(endObj.toISOString().split("T")[0]);
    setEndTime(endObj.toTimeString().slice(0, 5));
    setInstructor(sched.instructor || "");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      alert("Harap lengkapi semua isian wajib.");
      return;
    }

    const startISO = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${endDate}T${endTime}:00`).toISOString();

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      type,
      program,
      start_time: startISO,
      end_time: endISO,
      instructor: instructor.trim() || null
    };

    try {
      if (selectedSchedule) {
        // Edit Mode
        const { error } = await supabase
          .from("academic_schedules")
          .update(payload)
          .eq("id", selectedSchedule.id);

        if (error) throw error;
        setStatusMsg({ type: "success", text: "Jadwal belajar berhasil diperbarui!" });
      } else {
        // Insert Mode
        if (isRecurring) {
          const payloads = [];
          const baseStart = new Date(`${startDate}T${startTime}:00`);
          const baseEnd = new Date(`${endDate}T${endTime}:00`);

          for (let i = 0; i < recurrenceCount; i++) {
            const currentStart = new Date(baseStart);
            const currentEnd = new Date(baseEnd);

            if (recurrenceType === "weekly") {
              currentStart.setDate(baseStart.getDate() + (i * 7));
              currentEnd.setDate(baseEnd.getDate() + (i * 7));
            } else if (recurrenceType === "daily") {
              currentStart.setDate(baseStart.getDate() + i);
              currentEnd.setDate(baseEnd.getDate() + i);
            }

            payloads.push({
              title: title.trim(),
              description: description.trim() || null,
              type,
              program,
              start_time: currentStart.toISOString(),
              end_time: currentEnd.toISOString(),
              instructor: instructor.trim() || null
            });
          }

          const { error } = await supabase
            .from("academic_schedules")
            .insert(payloads);

          if (error) throw error;
          setStatusMsg({ type: "success", text: `${recurrenceCount} jadwal baru berhasil dibuat secara berkala!` });
        } else {
          const { error } = await supabase
            .from("academic_schedules")
            .insert(payload);

          if (error) throw error;
          setStatusMsg({ type: "success", text: "Jadwal baru berhasil dibuat!" });
        }
      }

      setModalOpen(false);
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan jadwal:", err);
      alert("Gagal menyimpan jadwal: " + err.message);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    if (confirm(`Apakah Anda yakin ingin menghapus agenda "${selectedSchedule.title}"?`)) {
      try {
        const { error } = await supabase
          .from("academic_schedules")
          .delete()
          .eq("id", selectedSchedule.id);

        if (error) throw error;

        setStatusMsg({ type: "success", text: "Jadwal berhasil dihapus." });
        setModalOpen(false);
        setTimeout(() => setStatusMsg({ type: "", text: "" }), 3000);
        fetchData();
      } catch (err) {
        console.error("Gagal menghapus jadwal:", err);
        alert("Gagal menghapus jadwal: " + err.message);
      }
    }
  };

  // Helper to filter events occurring on a specific date string (YYYY-MM-DD)
  const getSchedulesForDay = (dateStr) => {
    return schedules.filter((s) => {
      const sDateStr = new Date(s.start_time).toISOString().split("T")[0];
      return sDateStr === dateStr;
    });
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <div className="topbar-title">
          <h1>Kelola Jadwal & Kalender Akademik</h1>
          <p style={{ color: "var(--color-gray-500)", fontSize: "0.95rem" }}>
            Buat jadwal kelas rutin, liburan sekolah, serta kegiatan bimbingan belajar Ibra English Bobong
          </p>
        </div>
        <button className="btn-portal-primary" onClick={() => handleOpenAddModal()}>
          <span>+ Tambah Agenda</span>
        </button>
      </div>

      {statusMsg.text && (
        <div
          className={statusMsg.type === "success" ? "auth-success-banner" : "auth-error-banner"}
          style={{ marginBottom: "2rem" }}
        >
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Monthly Navigation Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", backgroundColor: "white", padding: "1rem 1.5rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)" }}>
          {getMonthNameIndonesian(viewMonth)} {viewYear}
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem" }} onClick={() => navigateMonth("prev")}>
            ◀ Bulan Lalu
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem" }} onClick={() => setCurrentDate(new Date())}>
            Hari Ini
          </button>
          <button className="btn-portal-outline" style={{ padding: "0.45rem 1rem" }} onClick={() => navigateMonth("next")}>
            Bulan Depan ▶
          </button>
        </div>
      </div>

      {/* Main Calendar Month Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-500)" }}>
          <p>Memuat kalender akademik...</p>
        </div>
      ) : (
        <div style={{ backgroundColor: "white", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "1.5rem", overflowX: "auto" }}>
          <div style={{ minWidth: "700px" }}>
            
            {/* Weekdays Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: "var(--color-gray-200)", borderBottom: "2px solid var(--color-gray-200)", paddingBottom: "0.5rem", marginBottom: "1px" }}>
              {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((day, idx) => (
                <div key={day} style={{ textAlign: "center", fontWeight: "800", color: idx === 0 || idx === 6 ? "var(--color-accent)" : "var(--color-gray-600)", fontSize: "0.9rem", padding: "0.25rem" }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Cells Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", backgroundColor: "var(--color-gray-100)", borderRadius: "0 0 12px 12px" }}>
              {calendarDays.map((cell, idx) => {
                const daySchedules = getSchedulesForDay(cell.dateString);
                const isToday = cell.dateString === new Date().toISOString().split("T")[0];

                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenAddModal(cell.dateString)}
                    style={{
                      minHeight: "120px",
                      backgroundColor: cell.isCurrentMonth ? "white" : "var(--color-gray-50)",
                      padding: "0.5rem",
                      border: isToday ? "2px solid var(--color-primary)" : "1px solid var(--color-gray-200)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 0.15s ease",
                      position: "relative"
                    }}
                    className="calendar-cell-hover"
                  >
                    {/* Day Number */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{
                        fontSize: "0.9rem",
                        fontWeight: "800",
                        color: isToday 
                          ? "white" 
                          : cell.isCurrentMonth 
                            ? "var(--color-gray-800)" 
                            : "var(--color-gray-400)",
                        backgroundColor: isToday ? "var(--color-primary)" : "transparent",
                        width: isToday ? "26px" : "auto",
                        height: isToday ? "26px" : "auto",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {cell.day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: "0.65rem", color: "var(--color-primary)", fontWeight: "800" }}>Kini</span>
                      )}
                    </div>

                    {/* Schedules inside day cell */}
                    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "4px", overflow: "hidden" }}>
                      {daySchedules.map((s) => {
                        let badgeBg = "var(--color-primary-light)";
                        let badgeColor = "var(--color-primary-dark)";

                        if (s.type === "holiday") {
                          badgeBg = "#fee2e2";
                          badgeColor = "#ef4444";
                        } else if (s.type === "event") {
                          badgeBg = "var(--color-accent-light)";
                          badgeColor = "var(--color-accent)";
                        }

                        const cleanTimeStr = new Date(s.start_time).toTimeString().slice(0, 5);

                        return (
                          <div
                            key={s.id}
                            onClick={(e) => handleOpenEditModal(s, e)}
                            style={{
                              backgroundColor: badgeBg,
                              color: badgeColor,
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: "700",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              boxShadow: "var(--shadow-sm)"
                            }}
                            title={`${s.title} (${cleanTimeStr})`}
                          >
                            <span style={{ opacity: 0.85, marginRight: "4px" }}>{cleanTimeStr}</span>
                            <span>{s.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* MODAL FORM: ADD / EDIT SCHEDULE */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="portal-card" style={{
            maxWidth: "600px",
            width: "100%",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-xl)",
            animation: "slideIn 0.2s ease"
          }}>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "var(--color-gray-900)", marginBottom: "1.5rem" }}>
              {selectedSchedule ? "Perbarui Agenda Kelas / Kegiatan" : "Tambah Agenda Kalender Baru"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Judul Agenda (Wajib)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Kids Program - Kelas A Rutin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Deskripsi Agenda</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: "60px", fontFamily: "inherit" }}
                  placeholder="Keterangan singkat tentang kegiatan belajar-mengajar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-grid" style={{ marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tipe Agenda</label>
                  <select
                    className="form-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="class">📚 Kelas Rutin (Class)</option>
                    <option value="event">🌟 Kegiatan Khusus (Special Event)</option>
                    <option value="holiday">🔴 Hari Libur (Holiday)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Program Belajar Sasaran</label>
                  <select
                    className="form-input"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="All">Semua Program (All)</option>
                    <option value="Kids Program">Kids Program (5-12 tahun)</option>
                    <option value="Teens Program">Teens Program (13-17 tahun)</option>
                    <option value="Fun Calistung">Fun Calistung (5-7 tahun)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Mulai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Selesai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jam Selesai</label>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label">Tutor Pendamping / Instructor</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Coach Husni"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                />
              </div>

              {/* Pilihan Ulangi Agenda (Hanya untuk tambah agenda baru) */}
              {!selectedSchedule && (
                <div style={{ 
                  marginBottom: "2rem", 
                  padding: "1rem", 
                  backgroundColor: "var(--color-gray-50)", 
                  borderRadius: "var(--radius-md)", 
                  border: "1px solid var(--color-gray-200)" 
                }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: "700", fontSize: "0.9rem", color: "var(--color-gray-800)" }}>
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      style={{ accentColor: "var(--color-primary)", width: "16px", height: "16px" }}
                    />
                    <span>Ulangi agenda ini (Recurrence)</span>
                  </label>

                  {isRecurring && (
                    <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Frekuensi Ulang</label>
                        <select
                          className="form-input"
                          style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                          value={recurrenceType}
                          onChange={(e) => setRecurrenceType(e.target.value)}
                        >
                          <option value="weekly">📅 Setiap Minggu (Hari yang sama)</option>
                          <option value="daily">📆 Setiap Hari</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: "0.8rem" }}>Jumlah Perulangan</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ padding: "0.5rem", fontSize: "0.85rem" }}
                          min="2"
                          max="12"
                          value={recurrenceCount}
                          onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)}
                          required={isRecurring}
                        />
                        <span style={{ fontSize: "0.7rem", color: "var(--color-gray-400)" }}>Maksimal 12 kali perulangan</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  {selectedSchedule && (
                    <button type="button" className="btn-portal-danger" onClick={handleDeleteSchedule}>
                      Hapus Agenda
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" className="btn-portal-outline" onClick={() => setModalOpen(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn-portal-primary">
                    <span>{selectedSchedule ? "Simpan Perubahan" : "Terbitkan Jadwal"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
