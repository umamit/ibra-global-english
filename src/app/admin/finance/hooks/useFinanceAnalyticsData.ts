import React from "react";
import { getMonthName } from "../../utils";

export interface Student {
  id: string | number;
  program: string;
}

export interface Payment {
  student_id: string | number;
  month: string;
  status: string;
  amount: string | number;
}

export interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  monthName: string;
  expected: number;
  collected: number;
}

export interface ChartDataPoint {
  month: string;
  monthName: string;
  monthShortName: string;
  expected: number;
  collected: number;
}

export interface ProgramEntry {
  name: string;
  color: string;
  bg: string;
  collected: number;
  expected: number;
}

export function useFinanceAnalyticsData(
  students: Student[],
  allPayments: Payment[],
  sppPrices: Record<string, number>,
  selectedMonth: string
) {
  const getMonthShortName = (ym: string): string => {
    if (!ym) return "";
    const name = getMonthName(ym);
    const [month, year] = name.split(" ");
    return `${month.slice(0, 3)} ${year.slice(2)}`;
  };

  const past6Months: string[] = (() => {
    if (!selectedMonth) return [];
    const [y, m] = selectedMonth.split("-").map(Number);
    const list: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      list.push(`${yyyy}-${mm}`);
    }
    return list;
  })();

  const chartData: ChartDataPoint[] = past6Months.map((month) => {
    const expected = students.reduce((sum, s) => {
      const p = allPayments.find((pay) => pay.student_id === s.id && pay.month === month);
      if (p) return sum + (parseInt(String(p.amount)) || sppPrices[s.program] || 300000);
      return sum + (sppPrices[s.program] || 300000);
    }, 0);

    const collected = allPayments
      .filter((p) => p.month === month && p.status === "lunas")
      .reduce((sum, p) => sum + (parseInt(String(p.amount)) || 0), 0);

    return {
      month,
      monthName: getMonthName(month),
      monthShortName: getMonthShortName(month),
      expected,
      collected,
    };
  });

  const activeExpected = students.reduce((sum, s) => {
    const p = allPayments.find((pay) => pay.student_id === s.id && pay.month === selectedMonth);
    if (p) return sum + (parseInt(String(p.amount)) || sppPrices[s.program] || 300000);
    return sum + (sppPrices[s.program] || 300000);
  }, 0);

  const activeCollected = allPayments
    .filter((p) => p.month === selectedMonth && p.status === "lunas")
    .reduce((sum, p) => sum + (parseInt(String(p.amount)) || 0), 0);

  const activePendingCount = allPayments.filter((p) => p.month === selectedMonth && p.status === "menunggu_konfirmasi").length;
  const activePaidCount = allPayments.filter((p) => p.month === selectedMonth && p.status === "lunas").length;
  const activeUnpaidCount = students.length - activePaidCount - activePendingCount;

  const collectionRate = activeExpected > 0 ? Math.round((activeCollected / activeExpected) * 100) : 0;
  const outstanding = activeExpected - activeCollected;
  const averageSPP = activePaidCount > 0 ? Math.round(activeCollected / activePaidCount) : 0;

  const programBreakdown: ProgramEntry[] = [
    { name: "Kids Program", color: "#216c7e", bg: "rgba(33, 108, 126, 0.1)", collected: 0, expected: 0 },
    { name: "Teens Program", color: "#A68849", bg: "rgba(166, 136, 73, 0.1)", collected: 0, expected: 0 },
    { name: "Fun Calistung", color: "#0f172a", bg: "rgba(15, 23, 42, 0.1)", collected: 0, expected: 0 },
  ].map((prog) => {
    const progStudents = students.filter((s) => s.program === prog.name);
    const collected = allPayments
      .filter((p) => p.month === selectedMonth && p.status === "lunas" && progStudents.some((s) => s.id === p.student_id))
      .reduce((sum, p) => sum + (parseInt(String(p.amount)) || 0), 0);
    const expected = progStudents.reduce((sum, s) => {
      const p = allPayments.find((pay) => pay.student_id === s.id && pay.month === selectedMonth);
      if (p) return sum + (parseInt(String(p.amount)) || sppPrices[s.program] || 300000);
      return sum + (sppPrices[s.program] || 300000);
    }, 0);
    return { ...prog, collected, expected };
  });

  const topProgram = (() => {
    if (programBreakdown.every((p) => p.collected === 0)) return "-";
    const sorted = [...programBreakdown].sort((a, b) => b.collected - a.collected);
    return sorted[0].name;
  })();

  const maxVal = Math.max(...chartData.map((d) => Math.max(d.expected, d.collected, 1000000)));

  return {
    getMonthShortName, chartData, activeExpected, activeCollected, activePendingCount,
    activePaidCount, activeUnpaidCount, collectionRate, outstanding, averageSPP,
    programBreakdown, topProgram, maxVal,
  };
}
