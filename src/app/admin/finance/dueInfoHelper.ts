import { Student } from "@/types";

export interface SPPDueInfo {
  dueDay: number;
  isPostPaid: boolean;
  modelLabel: string;
  dueStatus: "lunas" | "menunggu_konfirmasi" | "due_today" | "due_soon" | "overdue" | "normal";
  badgeLabel: string;
  badgeClass: string;
  daysRemaining?: number;
}

export const getStudentSPPDueInfo = (
  student: Student,
  paymentStatus: string,
  selectedMonth: string
): SPPDueInfo => {
  const nameLower = (student.name || "").toLowerCase().trim();

  const isPostPaidTgl5 = ["athira", "firman", "syafa", "yunda", "akhtar", "syauqi"].some(p => {
    const regex = new RegExp(`\\b${p}\\b`, "i");
    return regex.test(nameLower);
  });
  const isNasyaPostPaid19 = (/\bnasya\b/i).test(nameLower);
  const isPostPaid = isPostPaidTgl5 || isNasyaPostPaid19;

  let dueDay = 10;
  if (typeof student.due_day === "number" && student.due_day >= 1 && student.due_day <= 31) {
    dueDay = student.due_day;
  } else if (student.created_at) {
    dueDay = new Date(student.created_at).getDate();
  }

  const modelLabel = `Siklus SPP Tgl ${dueDay} Bulanan`;

  if (paymentStatus === "lunas") {
    return {
      dueDay,
      isPostPaid,
      modelLabel,
      dueStatus: "lunas",
      badgeLabel: "Sudah Lunas",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300"
    };
  }

  if (paymentStatus === "menunggu_konfirmasi") {
    return {
      dueDay,
      isPostPaid,
      modelLabel,
      dueStatus: "menunggu_konfirmasi",
      badgeLabel: "Menunggu Verifikasi",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300"
    };
  }

  let selYear = new Date().getFullYear();
  let selMonth = new Date().getMonth() + 1;
  if (selectedMonth && selectedMonth.includes("-")) {
    const parts = selectedMonth.split("-");
    selYear = parseInt(parts[0], 10);
    selMonth = parseInt(parts[1], 10);
  }

  let targetYear = selYear;
  let targetMonth = selMonth;

  if (isPostPaid) {
    targetMonth = selMonth + 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear = selYear + 1;
    }
  }

  const maxDaysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
  const effectiveDueDay = Math.min(dueDay, maxDaysInTargetMonth);

  const dueDate = new Date(targetYear, targetMonth - 1, effectiveDueDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNamesId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const targetMonthStr = monthNamesId[targetMonth - 1];

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      dueDay,
      isPostPaid,
      modelLabel,
      dueStatus: "due_today",
      badgeLabel: `HARI H (${dueDay} ${targetMonthStr})`,
      badgeClass: "bg-amber-500 text-white font-bold animate-pulse"
    };
  }

  if (diffDays > 0 && diffDays <= 3) {
    return {
      dueDay,
      isPostPaid,
      modelLabel,
      dueStatus: "due_soon",
      badgeLabel: `H-${diffDays} (${dueDay} ${targetMonthStr})`,
      badgeClass: "bg-amber-100 text-amber-900 border-amber-400 font-semibold",
      daysRemaining: diffDays
    };
  }

  if (diffDays < 0) {
    return {
      dueDay,
      isPostPaid,
      modelLabel,
      dueStatus: "overdue",
      badgeLabel: `Lewat ${dueDay} ${targetMonthStr}`,
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300 font-semibold"
    };
  }

  return {
    dueDay,
    isPostPaid,
    modelLabel,
    dueStatus: "normal",
    badgeLabel: `Jatuh Tempo ${dueDay} ${targetMonthStr}`,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
  };
};
