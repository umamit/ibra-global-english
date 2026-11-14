"use client";

interface CanDoItem {
  aspect: string;
  statement: string;
  score: number;
}

function getCanDoStatus(score: number): { label: string; bg: string; color: string } {
  if (score >= 85) return { label: "Mastered (Menguasai)", bg: "#ecfdf5", color: "#065f46" };
  if (score >= 70) return { label: "Developing (Berkembang)", bg: "#eef6f8", color: "#164d57" };
  return { label: "Needs Practice (Perlu Latihan)", bg: "#fffbeb", color: "#92400e" };
}

export default function CanDoChecklistSection({
  isMath,
  isCalistung,
  scores,
}: {
  isMath: boolean;
  isCalistung: boolean;
  scores: { speaking: number; grammar: number; listening: number; vocabulary: number; active: number };
}) {
  const items: CanDoItem[] = isMath
    ? [
        { aspect: "Operasi Hitung", statement: "Mampu menyelesaikan penjumlahan, pengurangan, perkalian, dan pembagian dengan tepat.", score: scores.speaking },
        { aspect: "Penalaran & Logika", statement: "Mampu memahami informasi dan menyelesaikan soal cerita matematika sehari-hari.", score: scores.grammar },
        { aspect: "Ketelitian", statement: "Mampu menghitung satuan waktu, panjang, serta pecahan dasar dengan teliti.", score: scores.vocabulary },
        { aspect: "Keaktifan", statement: "Mampu mengikuti instruksi kelas dan mengerjakan latihan soal secara mandiri.", score: scores.active },
      ]
    : isCalistung
    ? [
        { aspect: "Membaca", statement: "Mampu mengenali huruf vokal & konsonan serta membaca suku kata dan kata sederhana.", score: scores.speaking },
        { aspect: "Menulis", statement: "Mampu memegang pensil dengan benar serta menulis huruf, angka, dan kata dengan rapi.", score: scores.grammar },
        { aspect: "Berhitung", statement: "Mampu membilang angka secara urut dan melakukan penjumlahan serta pengurangan dasar.", score: scores.vocabulary },
        { aspect: "Keaktifan", statement: "Mampu berpartisipasi aktif dan menyelesaikan tugas belajar dengan antusias.", score: scores.active },
      ]
    : [
        { aspect: "Speaking", statement: "Can introduce self, ask and answer simple questions, and speak with clear pronunciation.", score: scores.speaking },
        { aspect: "Grammar", statement: "Can construct simple positive, negative, and interrogative sentences accurately.", score: scores.grammar },
        { aspect: "Listening", statement: "Can understand classroom instructions and key information from short audio or stories.", score: scores.listening },
        { aspect: "Vocabulary", statement: "Can recall and use new module vocabulary appropriately in daily conversation.", score: scores.vocabulary },
        { aspect: "Keaktifan", statement: "Can participate actively in group discussions, games, and class activities.", score: scores.active },
      ];

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: "800", borderBottom: "1.5px solid var(--color-gray-300)", paddingBottom: "0.45rem", marginBottom: "0.85rem", color: "var(--color-gray-800)" }}>
        B. PENCAPAIAN KOMPETENSI (CAN-DO STATEMENTS)
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ backgroundColor: "var(--color-gray-50)", textAlign: "left" }}>
            <th style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--color-gray-200)", width: "22%" }}>Aspek</th>
            <th style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--color-gray-200)", width: "52%" }}>Kompetensi Can-Do</th>
            <th style={{ padding: "0.55rem 0.75rem", border: "1px solid var(--color-gray-200)", width: "26%", textAlign: "center" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const st = getCanDoStatus(item.score);
            return (
              <tr key={item.aspect}>
                <td style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--color-gray-200)", fontWeight: 700, color: "var(--color-primary-dark)" }}>
                  {item.aspect}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--color-gray-200)", color: "var(--color-gray-700)" }}>
                  {item.statement}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", border: "1px solid var(--color-gray-200)", textAlign: "center" }}>
                  <span style={{ display: "inline-block", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 700, backgroundColor: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
