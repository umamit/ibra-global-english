"use client";

export default function FAQManager({
  faqsList, setFaqsList,
  handleSaveFaqs
}) {
  return (
    <div className="portal-card" style={{ padding: "2rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-gray-800)", marginBottom: "1.5rem" }}>Kelola Tanya Jawab (FAQ)</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {faqsList.map((faq, idx) => (
          <div key={idx} style={{ padding: "1.5rem", border: "1px solid var(--color-gray-200)", borderRadius: "var(--radius-lg)", position: "relative" }}>
            <button 
              onClick={() => {
                const next = [...faqsList];
                next.splice(idx, 1);
                handleSaveFaqs(next);
              }}
              className="btn-portal-danger" 
              style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
            >
              Hapus
            </button>
            
            <div className="form-group">
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Pertanyaan</label>
              <input 
                type="text" 
                className="form-input" 
                value={faq.question} 
                onChange={(e) => {
                  const next = [...faqsList];
                  next[idx] = { ...next[idx], question: e.target.value };
                  setFaqsList(next);
                }} 
              />
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--color-gray-700)" }}>Jawaban</label>
              <textarea 
                className="form-input" 
                value={faq.answer} 
                style={{ height: "100px", resize: "none" }}
                onChange={(e) => {
                  const next = [...faqsList];
                  next[idx] = { ...next[idx], answer: e.target.value };
                  setFaqsList(next);
                }} 
              />
            </div>
          </div>
        ))}
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button 
            onClick={() => {
              const next = [...faqsList, { question: "Pertanyaan Baru?", answer: "Jawaban baru." }];
              setFaqsList(next);
            }} 
            className="btn-portal-outline"
          >
            + Tambah FAQ Baru
          </button>
          <button 
            onClick={() => handleSaveFaqs(faqsList)}
            className="btn-portal-primary"
          >
            Simpan Semua FAQ
          </button>
        </div>
      </div>
    </div>
  );
}