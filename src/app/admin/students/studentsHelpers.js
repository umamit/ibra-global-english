"use client";

export function formatIndonesianDate(dateStr) {
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

export function buildWhatsappLink(num) {
  const d = String(num||"").replace(/[^0-9]/g,"");
  return d ? `https://wa.me/${d}` : "#";
}
