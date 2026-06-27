"use client";

export default function CalendarView({ parentSchedules, detailsLoading, selectedChild }) {
  if (detailsLoading) {
    return (
      <div className="portal-card">
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Jadwal & Agenda Belajar Siswa
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="portal-card" style={{ borderLeft: "5px solid var(--color-gray-200)", padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div className="skeleton-pulse skeleton-text" style={{ width: "60px" }} />
                  <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
                </div>
                <div className="skeleton-pulse skeleton-title" style={{ width: "220px", marginBottom: "0.5rem" }} />
                <div className="skeleton-pulse skeleton-text" style={{ width: "320px" }} />
              </div>
              <div style={{ textAlign: "right", minWidth: "200px" }}>
                <div className="skeleton-pulse skeleton-text" style={{ width: "140px", marginBottom: "0.5rem" }} />
                <div className="skeleton-pulse skeleton-text" style={{ width: "100px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (parentSchedules.length === 0) {
    return (
      <div className="portal-card text-center" style={{ padding: "3rem" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
          Jadwal & Agenda Belajar Siswa
        </h3>
        <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginBottom: "2rem" }}>
          Berikut adalah agenda belajar, kelas rutin, kegiatan bimbingan belajar, serta hari libur sekolah yang dikhususkan untuk program pendaftaran anak Anda (**{selectedChild?.program}**).
        </p>
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gray-400)" }}>
          <p style={{ fontWeight: "600" }}>Belum ada agenda kelas aktif yang dijadwalkan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-card">
      <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--color-gray-900)", marginBottom: "0.5rem" }}>
        Jadwal & Agenda Belajar Siswa
      </h3>
      <p style={{ color: "var(--color-gray-500)", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Berikut adalah agenda belajar, kelas rutin, kegiatan bimbingan belajar, serta hari libur sekolah yang dikhususkan untuk program pendaftaran anak Anda (**{selectedChild?.program}**).
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {parentSchedules.map((sched) => {
          let typeColor = "var(--color-primary)";
          let typeLabel = "Kelas Rutin";
          let typeStyle = { borderLeft: "5px solid var(--color-primary)" };

          if (sched.type === "holiday") {
            typeColor = "#ef4444";
            typeLabel = "Hari Libur";
            typeStyle = { borderLeft: "5px solid #ef4444", backgroundColor: "#fef2f2" };
          } else if (sched.type === "event") {
            typeColor = "var(--color-accent)";
            typeLabel = "Kegiatan Khusus";
            typeStyle = { borderLeft: "5px solid var(--color-accent)", backgroundColor: "rgba(166, 136, 73, 0.04)" };
          }

          const startObj = new Date(sched.start_time);
          const endObj = new Date(sched.end_time);

          const formattedDate = startObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
          const timeRange = `${startObj.toTimeString().slice(0, 5)} - ${endObj.toTimeString().slice(0, 5)}`;

          return (
            <div key={sched.id} className="portal-card" style={{ ...typeStyle, padding: "1.5rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "white", backgroundColor: typeColor, padding: "0.2rem 0.6rem", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {typeLabel}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-gray-500)" }}>
                    Sasaran: {sched.program}
                  </span>
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{sched.title}</h4>
                {sched.description && (
                  <p style={{ fontSize: "0.85rem", color: "var(--color-gray-600)", marginTop: "4px", lineHeight: "1.5" }}>{sched.description}</p>
                )}
              </div>

              <div style={{ textAlign: "right", minWidth: "200px" }} className="text-left-mobile">
                <p style={{ fontSize: "0.875rem", fontWeight: "800", color: "var(--color-gray-800)" }}>📅 {formattedDate}</p>
                <p style={{ fontSize: "0.9rem", fontWeight: "900", color: "var(--color-primary-dark)", marginTop: "4px" }}>⏱ {timeRange}</p>
                {sched.instructor && (
                  <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", marginTop: "6px" }}>Tutor: <strong>{sched.instructor}</strong></p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}