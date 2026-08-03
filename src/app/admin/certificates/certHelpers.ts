import { Certificate } from "@/types";

const romanMonths = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

export function getProgramCode(program: string): string {
  const p = program.toLowerCase();
  if (p.includes("kids")) return "KIDS";
  if (p.includes("teens")) return "TEENS";
  if (p.includes("calistung")) return "CALISTUNG";
  return "IGE";
}

export function buildCertNumber(program: string, existing: Certificate[]): string {
  const code = getProgramCode(program);
  const suffix = code === "IGE" ? "IGE-CERT" : `IGE-CERT/${code}`;
  const now = new Date();
  const month = romanMonths[now.getMonth()];
  const year = now.getFullYear();
  const count = existing.filter(c => getProgramCode(c.module_name) === code).length + 1;
  return `${String(count).padStart(3,"0")}/${suffix}/${month}/${year}`;
}
