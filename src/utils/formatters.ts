/**
 * Helper terpadu untuk formatting di seluruh platform Ibra Global English.
 */

/**
 * Format angka menjadi format Rupiah Indonesia (misal: Rp 150.000)
 */
export function formatIDR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "Rp 0";
  }
  const numericVal = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numericVal);
}

/**
 * Format string tanggal / Date menjadi format tanggal Indonesia (misal: 23 Juli 2026)
 */
export function formatIndonesianDate(
  dateInput: string | Date | null | undefined,
  includeTime = false
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "-";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", timeZoneName: "short" }
      : {}),
  };

  return new Intl.DateTimeFormat("id-ID", options).format(date);
}

/**
 * Bersihkan format nomor telepon ke angka murni untuk WhatsApp (misal: "0813-5700-1357" -> "6281357001357")
 */
export function cleanPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }
  return cleaned;
}
