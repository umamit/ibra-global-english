"use client";

export default function VideoGallery({
  videosList, setVideosList,
  savingVideos, setSavingVideos,
  handleSaveVideos
}) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <div style={{ borderBottom: "1px solid var(--color-gray-250)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-primary-dark)" }}>Kelola Galeri Video Kegiatan</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginTop: "0.25rem" }}>
          Tambahkan tautan video dokumentasi kegiatan Ibra Global English. Tautan YouTube biasa atau YouTube Shorts otomatis dikonversi ke format embed yang bisa diputar di web.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {videosList.map((vid, idx) => (
          <div 
            key={idx} 
            style={{ 
              padding: "1.5rem", 
              backgroundColor: "var(--color-gray-50)", 
              borderRadius: "var(--radius-xl)", 
              border: "1px solid var(--color-gray-200)",
              position: "relative"
            }}
          >
            <button
              type="button"
              onClick={() => {
                const updated = videosList.filter((_, i) => i !== idx);
                setVideosList(updated);
              }}
              className="btn-portal-danger"
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
            >
              Hapus Video
            </button>

            <h4 style={{ fontWeight: "700", color: "var(--color-gray-700)", marginBottom: "1rem" }}>Video #{idx + 1}</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Judul Video</label>
                <input
                  type="text"
                  value={vid.title}
                  onChange={(e) => {
                    const updated = [...videosList];
                    updated[idx].title = e.target.value;
                    setVideosList(updated);
                  }}
                  className="portal-input"
                  placeholder="Contoh: Belajar Ceria Bersama Siswa Kids Program"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>Deskripsi Singkat</label>
                <textarea
                  value={vid.desc}
                  onChange={(e) => {
                    const updated = [...videosList];
                    updated[idx].desc = e.target.value;
                    setVideosList(updated);
                  }}
                  className="portal-input"
                  rows="2"
                  placeholder="Keterangan singkat tentang apa yang dilakukan siswa di video ini"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--color-gray-600)", marginBottom: "0.35rem" }}>URL Tautan Video (YouTube/CapCut)</label>
                <input
                  type="text"
                  value={vid.url}
                  onChange={(e) => {
                    const updated = [...videosList];
                    updated[idx].url = e.target.value;
                    setVideosList(updated);
                  }}
                  className="portal-input"
                  placeholder="Contoh: https://www.youtube.com/watch?v=XXXX atau https://youtu.be/XXXX"
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => setVideosList([...videosList, { title: "", desc: "", url: "" }])}
            className="btn-portal-outline"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            + Tambah Video Baru
          </button>
          <button
            type="button"
            onClick={() => handleSaveVideos(videosList)}
            disabled={savingVideos}
            className="btn-portal-primary"
          >
            {savingVideos ? "Menyimpan..." : "Simpan Semua Video"}
          </button>
        </div>
      </div>
    </div>
  );
}