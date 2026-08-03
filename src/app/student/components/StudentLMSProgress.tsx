// StudentLMSProgress.tsx - Ring chart progress tugas LMS
interface LMSProgressProps { tasks: any[]; mySubmissions: any[]; }

export default function StudentLMSProgress({ tasks, mySubmissions }: LMSProgressProps) {
  const done = tasks.filter(t => mySubmissions.some(s => s.material_id === t.id)).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  if (total === 0) return null;
  const ringColor = pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : "#e5e7eb";
  const r = 40; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "var(--color-gray-50)", borderRadius: "14px", border: "1px solid var(--color-gray-150)" }}>
      <div className="lms-progress-ring-wrap">
        <svg className="lms-progress-ring" width="100" height="100" viewBox="0 0 100 100">
          <circle className="track" cx="50" cy="50" r={r} strokeWidth="10" />
          <circle className="fill" cx="50" cy="50" r={r} strokeWidth="10" stroke={ringColor} strokeDasharray={circ} strokeDashoffset={offset} />
        </svg>
        <div className="lms-progress-ring-text" style={{ color: ringColor, fontSize: "1.25rem" }}>{pct}%<span>selesai</span></div>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: "800", fontSize: "0.95rem", color: "var(--color-gray-800)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.35rem" }}><i className="fi fi-rr-clip"></i><span>Progress Tugas LMS</span></p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /><span style={{ color: "var(--color-gray-600)" }}>Selesai:</span><strong style={{ color: "#22c55e" }}>{done} tugas</strong></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-gray-300)", display: "inline-block" }} /><span style={{ color: "var(--color-gray-600)" }}>Belum dikumpul:</span><strong style={{ color: "var(--color-gray-700)" }}>{total - done} tugas</strong></div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}><span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--color-primary)", display: "inline-block" }} /><span style={{ color: "var(--color-gray-600)" }}>Total tugas:</span><strong style={{ color: "var(--color-primary-dark)" }}>{total} tugas</strong></div>
        </div>
      </div>
    </div>
  );
}
