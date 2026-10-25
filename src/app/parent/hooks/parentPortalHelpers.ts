export function getIndonesianDay(dateStr: string): string {
  if (!dateStr) return "";
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[new Date(dateStr).getDay()];
}

export function getIndonesianDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function getMonthName(ym: string): string {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function getChildProgramPrice(program: string | null | undefined, customPrices?: Record<string, string | undefined>): number {
  if (!program) return 300000;
  const lower = program.toLowerCase();
  if (lower.includes("calistung")) return parseInt(customPrices?.payment_spp_calistung || "350000", 10) || 350000;
  if (lower.includes("matematika")) return parseInt(customPrices?.payment_spp_math || customPrices?.payment_spp_kids || "300000", 10) || 300000;
  if (lower.includes("teens")) return parseInt(customPrices?.payment_spp_teens || "300000", 10) || 300000;
  return parseInt(customPrices?.payment_spp_kids || "300000", 10) || 300000;
}

export function getTerbilang(val: number | string): string {
  const num = typeof val === "string" ? parseInt(val, 10) : val;
  if (isNaN(num) || num <= 0) return "";
  const bilangan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  if (num < 12) return bilangan[num];
  if (num < 20) return getTerbilang(num - 10) + " Belas";
  if (num < 100) return (num / 10 >> 0) === 1 ? getTerbilang(num % 10) : getTerbilang(num / 10 >> 0) + " Puluh " + getTerbilang(num % 10);
  if (num < 200) return "Seratus " + getTerbilang(num - 100);
  if (num < 1000) return (num / 100 >> 0) === 1 ? getTerbilang(num % 100) : getTerbilang(num / 100 >> 0) + " Ratus " + getTerbilang(num % 100);
  if (num < 2000) return "Seribu " + getTerbilang(num - 1000);
  if (num < 1000000) return (num / 1000 >> 0) === 1 ? getTerbilang(num % 1000) : getTerbilang(num / 1000 >> 0) + " Ribu " + getTerbilang(num % 1000);
  if (num < 1000000000) return (num / 1000000 >> 0) === 1 ? getTerbilang(num % 1000000) : getTerbilang(num / 1000000 >> 0) + " Juta " + getTerbilang(num % 1000000);
  return "";
}
