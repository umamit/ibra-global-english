"use client";

export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

export function buildWhatsappLink(num: string | number): string {
  const d = String(num||"").replace(/[^0-9]/g,"");
  return d ? `https://wa.me/${d}` : "#";
}

export function handleExportStudentsCSV(students: any[]) {
  if (!students || students.length === 0) {
    alert("Tidak ada data siswa untuk diekspor.");
    return;
  }

  const headers = ["No", "Nama Siswa", "Usia", "Program / Level CEFR", "Status"];
  const rows = students.map((s, idx) => [
    idx + 1,
    `"${(s.name || "").replace(/"/g, '""')}"`,
    s.age || "",
    `"${(s.program || "").replace(/"/g, '""')}"`,
    `"${(s.status || "aktif").replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `data_siswa_ibra_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
