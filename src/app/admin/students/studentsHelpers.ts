"use client";

export function formatStudentQrCodeId(studentId: string): string {
  const clean = String(studentId || "").replace(/-/g, "").toUpperCase();
  return clean ? `IGE-${clean.slice(0, 6)}` : "IGE-000000";
}

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

  const headers = ["No", "Kode ID Siswa", "Nama Siswa", "Usia", "Program / Level CEFR", "Status", "Nama Orang Tua / Wali", "Nomor WhatsApp", "Email Orang Tua"];
  const rows = students.map((s, idx) => [
    idx + 1,
    `"${formatStudentQrCodeId(s.id)}"`,
    `"${(s.name || "").replace(/"/g, '""')}"`,
    s.age || "",
    `"${(s.program || "").replace(/"/g, '""')}"`,
    `"${(s.status || "aktif").replace(/"/g, '""')}"`,
    `"${(s.parent_name || s.profiles?.full_name || "").replace(/"/g, '""')}"`,
    `"${(s.whatsapp || "").replace(/"/g, '""')}"`,
    `"${(s.parent_email || s.profiles?.email || "").replace(/"/g, '""')}"`,
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
