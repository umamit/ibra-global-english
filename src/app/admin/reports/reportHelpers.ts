import { Report } from "@/types";

export const exportReportsCSV = (reports: Report[], filterStudentId: string = "") => {
  const isCalistung = (program: string) => program?.toLowerCase().includes("calistung");
  const filtered = filterStudentId
    ? reports.filter(r => r.student_id === filterStudentId)
    : reports;

  if (filtered.length === 0) {
    alert("Tidak ada data rapor untuk siswa yang dipilih.");
    return;
  }

  const studentName = filterStudentId
    ? (filtered[0]?.students?.name || "siswa").replace(/\s+/g, "_")
    : "semua_siswa";

  const headers = ["No", "Nama Siswa", "Program", "Modul", "Skor 1", "Skor 2", "Skor 3", "Skor 4", "Skor 5", "Rata-rata", "Catatan Tutor", "Tanggal Terbit"];
  const rows = filtered.map((r, idx) => {
    const prog = r.students?.program || "";
    const isMath = prog.toLowerCase().includes("matematika");
    const isCal = !isMath && isCalistung(prog);
    const isEng = !isMath && !isCal;
    const listenVal = r.listening_score ?? r.speaking_score;
    const avg = isEng
      ? Math.round((r.speaking_score + r.grammar_score + listenVal + r.vocabulary_score + r.active_score) / 5)
      : Math.round((r.speaking_score + r.grammar_score + r.vocabulary_score + r.active_score) / 4);
    const cols = isMath
      ? [`Operasi Hitung: ${r.speaking_score}`, `Penalaran & Logika: ${r.grammar_score}`, `Ketelitian: ${r.vocabulary_score}`, `Keaktifan: ${r.active_score}`, "-"]
      : isCal
      ? [`Membaca: ${r.speaking_score}`, `Menulis: ${r.grammar_score}`, `Berhitung: ${r.vocabulary_score}`, `Keaktifan: ${r.active_score}`, "-"]
      : [`Speaking: ${r.speaking_score}`, `Grammar: ${r.grammar_score}`, `Listening: ${listenVal}`, `Vocabulary: ${r.vocabulary_score}`, `Keaktifan: ${r.active_score}`];
    return [
      idx + 1,
      r.students?.name || "-",
      prog || "-",
      r.module_name || "-",
      ...cols,
      avg,
      r.tutor_notes || "-",
      new Date(r.created_at).toLocaleDateString("id-ID")
    ];
  });

  const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rapor_${studentName}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
