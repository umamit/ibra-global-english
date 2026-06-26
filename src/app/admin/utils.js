export const getMonthName = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
};

export const terbilang = (n) => {
  const bilangan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  const num = parseInt(n);
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

export const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getCurrentMonth = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}`;
};

export const handleApiError = (error, defaultMessage = "Terjadi kesalahan.") => {
  console.error(defaultMessage, error);
  alert(`${defaultMessage}\n\nDetail: ${error.message || error}`);
};

export const showToast = (setToast, message, type = "success") => {
  setToast({ show: true, message, type });
  setTimeout(() => setToast({ show: false, message: "", type }), 3000);
};