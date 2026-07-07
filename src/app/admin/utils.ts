export const getMonthName = (ym: string): string => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

export const terbilang = (n: string | number): string => {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  const num = parseInt(String(n));
  if (num < 12) {
    return bilangan[num];
  } else if (num < 20) {
    return terbilang(num - 10) + " Belas";
  } else if (num < 100) {
    return terbilang(Math.floor(num / 10)) + " Puluh " + terbilang(num % 10);
  } else if (num < 200) {
    return "Seratus " + terbilang(num - 100);
  } else if (num < 1000) {
    return terbilang(Math.floor(num / 100)) + " Ratus " + terbilang(num % 100);
  } else if (num < 2000) {
    return "Seribu " + terbilang(num - 1000);
  } else if (num < 1000000) {
    return terbilang(Math.floor(num / 1000)) + " Ribu " + terbilang(num % 1000);
  } else if (num < 1000000000) {
    return terbilang(Math.floor(num / 1000000)) + " Juta " + terbilang(num % 1000000);
  }
  return "";
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCurrentMonth = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
};

export const getWitDateString = (): string => {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const witDate = new Date(utc + (3600000 * 9));
  const yyyy = witDate.getFullYear();
  const mm = String(witDate.getMonth() + 1).padStart(2, "0");
  const dd = String(witDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const handleApiError = (error: unknown, defaultMessage = "Terjadi kesalahan.") => {
  console.error(defaultMessage, error);
  const msg = error instanceof Error ? error.message : String(error);
  alert(`${defaultMessage}\n\nDetail: ${msg}`);
};

export const showToast = (setToast: (toast: { show: boolean; message: string; type: string }) => void, message: string, type = "success") => {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: "", type }), 3000);
};