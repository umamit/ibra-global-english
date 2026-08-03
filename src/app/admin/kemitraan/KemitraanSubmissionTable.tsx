// KemitraanSubmissionTable.tsx - Tabel Pengajuan Kemitraan Masuk
import { PartnershipSubmission } from "@/app/api/admin/kemitraan/route";
import { formatIndonesianDate } from "@/utils/formatters";

interface Props { submissions: PartnershipSubmission[]; loading: boolean; onRefresh: () => void; onWhatsApp: (phone: string, name: string, inst: string) => void; onUpdateStatus: (id: string, status: PartnershipSubmission["status"]) => void; onSelectSub: (sub: PartnershipSubmission) => void; }

const STATUS_STYLE: Record<string, { bg: string; color: string }> = { approved: { bg: "#d1e7dd", color: "#0f5132" }, contacted: { bg: "#cff4fc", color: "#055160" }, rejected: { bg: "#f8d7da", color: "#842029" }, pending: { bg: "#fff3cd", color: "#664d03" } };

export default function KemitraanSubmissionTable({ submissions, loading, onRefresh, onWhatsApp, onUpdateStatus, onSelectSub }: Props) {
  return (
    <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Daftar Pengajuan Kemitraan Sekolah &amp; Instansi</h3>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem", marginBottom: 0 }}>Daftar permohonan diskusi kemitraan rujukan dari sekolah dan dinas lokal.</p>
        </div>
        <button type="button" onClick={onRefresh} style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "0.8rem" }}>Refresh</button>
      </div>
      {loading ? <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Memuat daftar pengajuan kemitraan...</div>
        : submissions.length === 0 ? <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>Belum ada pengajuan kemitraan masuk.</div>
        : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #eee", textAlign: "left" }}>
                  {["Tanggal", "Sekolah / Instansi", "Perwakilan", "Kontak WA", "Catatan", "Status", "Aksi"].map(h => <th key={h} style={{ padding: "0.75rem", textAlign: h === "Aksi" ? "right" : undefined }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const st = STATUS_STYLE[sub.status] || STATUS_STYLE.pending;
                  return (
                    <tr key={sub.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "0.75rem", whiteSpace: "nowrap" }}>{formatIndonesianDate(sub.created_at)}</td>
                      <td style={{ padding: "0.75rem", fontWeight: 700, color: "#164d57" }}>{sub.institution_name}</td>
                      <td style={{ padding: "0.75rem" }}><div>{sub.rep_name}</div><div style={{ fontSize: "0.75rem", color: "#777" }}>{sub.rep_role || "Perwakilan"}</div></td>
                      <td style={{ padding: "0.75rem" }}><button type="button" onClick={() => onWhatsApp(sub.phone, sub.rep_name, sub.institution_name)} style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", background: "#25D366", color: "#fff", border: "none", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>{sub.phone}</button></td>
                      <td style={{ padding: "0.75rem", maxWidth: "200px" }}><span style={{ fontSize: "0.82rem", color: "#555" }}>{sub.notes || "-"}</span></td>
                      <td style={{ padding: "0.75rem" }}>
                        <select value={sub.status} onChange={(e) => onUpdateStatus(sub.id, e.target.value as PartnershipSubmission["status"])} style={{ padding: "0.3rem 0.5rem", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid #ccc", background: st.bg, color: st.color }}>
                          <option value="pending">🟡 Pending</option><option value="contacted">Hubungi</option><option value="approved">🟢 Disetujui</option><option value="rejected">Ditolak</option>
                        </select>
                      </td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}><button type="button" onClick={() => onSelectSub(sub)} style={{ padding: "0.35rem 0.65rem", borderRadius: "6px", background: "#eef6f8", color: "#216c7e", border: "1px solid rgba(33,108,126,0.2)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>Surat Pengantar</button></td>
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
