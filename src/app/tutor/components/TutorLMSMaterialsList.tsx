import React from "react";

export function TutorLMSMaterialsList({ lmsMaterials, handleDeleteLmsMaterial, handleViewSubmissions }: any) {
  return (
    <div className="portal-card" style={{ padding: "1.75rem" }}>
      <h3 style={{ fontWeight: "800", fontSize: "1rem", marginBottom: "1.25rem" }}>Materi & Tugas Terunggah ({lmsMaterials.length})</h3>
      {lmsMaterials.length === 0 ? (
        <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem", textAlign: "center" }}>Belum ada materi atau tugas diunggah.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {lmsMaterials.map((mat: any) => (
            <div key={mat.id} style={{ border: "1px solid var(--color-gray-200)", borderRadius: "10px", padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.68rem", fontWeight: "800" }}>{mat.type === "tugas" ? "Tugas Rumah" : "Materi"}</span>
                  <h4 style={{ fontWeight: "800", fontSize: "0.95rem" }}>{mat.title}</h4>
                </div>
                <button onClick={() => handleDeleteLmsMaterial(mat.id)} className="btn-portal-danger">Hapus</button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.85rem" }}>
                {mat.file_url && <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="btn-portal-outline">Unduh Berkas</a>}
                {mat.type === "tugas" && <button onClick={() => handleViewSubmissions(mat)} className="btn-portal-primary">Cek Pengumpulan</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
