import React from "react";

export function CertificateArchiveTable({ certificates, loading, fmtDate, handleDelete }: any) {
  return (
    <div className="cert-card">
      <h2 className="cert-card-title">Arsip Sertifikat ({certificates.length})</h2>
      {loading ? <p>Memuat...</p> : (
        <table className="cert-table">
          <thead>
            <tr>
              <th>Nama Siswa</th><th>Program</th><th>Nomor Sertifikat</th><th>Tanggal</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert: any) => (
              <tr key={cert.id}>
                <td>{cert.students?.name || "—"}</td>
                <td>{cert.students?.program || cert.module_name}</td>
                <td>{cert.cert_number}</td>
                <td>{fmtDate(cert.issue_date)}</td>
                <td>
                  <a href={`/api/generate-certificate?id=${cert.id}`} target="_blank" rel="noopener noreferrer" className="cert-btn-download">PDF</a>
                  <button className="cert-btn-delete" onClick={() => handleDelete(cert.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
