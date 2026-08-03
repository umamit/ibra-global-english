// AdminFeedbackList.tsx - Daftar item umpan balik ortu
interface FeedbackItem {
  id: string; parent_id: string; parent_name: string; tutor_id: string; tutor_name: string; rating: number; comments: string | null; created_at: string;
}

const renderStars = (rating: number) => (
  <div style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star <= rating ? "var(--color-accent)" : "none"} stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

export default function AdminFeedbackList({ feedbacks, loading }: { feedbacks: FeedbackItem[]; loading: boolean }) {
  if (loading) return <div className="portal-card" style={{ padding: "4rem", textAlign: "center", borderRadius: "14px" }}><p style={{ color: "var(--color-gray-500)" }}>Memuat daftar umpan balik...</p></div>;
  if (feedbacks.length === 0) return <div className="portal-card" style={{ padding: "4rem", textAlign: "center", borderRadius: "14px", color: "var(--color-gray-400)", fontWeight: "600" }}>Belum ada ulasan umpan balik dari orang tua.</div>;

  return (
    <>
      {feedbacks.map((fb) => (
        <div key={fb.id} className="portal-card" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.015)", backgroundColor: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--color-gray-900)" }}>{fb.parent_name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-gray-400)", marginTop: "0.1rem" }}>Menilai tutor: <strong>{fb.tutor_name}</strong></p>
            </div>
            <div style={{ textAlign: "right" }}>
              {renderStars(fb.rating)}
              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-gray-400)", marginTop: "0.25rem" }}>{new Date(fb.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>
          <div style={{ padding: "0.85rem 1rem", backgroundColor: "var(--color-bg-teal-50)", borderRadius: "10px", fontSize: "0.9rem", color: "var(--color-gray-800)", fontStyle: fb.comments ? "normal" : "italic", lineHeight: "1.5", borderLeft: "3px solid var(--color-primary)" }}>
            {fb.comments ? `“ ${fb.comments} ”` : "Tidak menulis komentar tertulis."}
          </div>
        </div>
      ))}
    </>
  );
}
