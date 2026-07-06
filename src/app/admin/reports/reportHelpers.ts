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

  const headers = ["No", "Nama Siswa", "Program", "Modul", "Skor 1", "Skor 2", "Skor 3", "Skor 4", "Rata-rata", "Catatan Tutor", "Tanggal Terbit"];
  const rows = filtered.map((r, idx) => {
    const avg = Math.round((r.speaking_score + r.grammar_score + r.vocabulary_score + r.active_score) / 4);
    const prog = r.students?.program || "";
    const label = isCalistung(prog)
      ? ["Membaca", "Menulis", "Berhitung", "Keaktifan"]
      : ["Speaking", "Grammar", "Vocabulary", "Active"];
    return [
      idx + 1,
      r.students?.name || "-",
      prog || "-",
      r.module_name || "-",
      `${label[0]}: ${r.speaking_score}`,
      `${label[1]}: ${r.grammar_score}`,
      `${label[2]}: ${r.vocabulary_score}`,
      `${label[3]}: ${r.active_score}`,
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
