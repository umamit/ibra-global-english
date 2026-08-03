export function parseStudentCsv(content: string) {
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return { error: "Berkas tidak memiliki data." };

  const validPrograms = ["Kids Program", "Teens Program", "Fun Calistung"];
  const validStatuses = ["aktif", "cuti", "alumnus", "non_aktif"];
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
    const name = cols[0] || "";
    const ageNum = parseInt(cols[1]) || 0;
    let program = cols[2] || "Kids Program";
    let status = (cols[3] || "aktif").toLowerCase();
    const parentName = cols[4] || "";
    const whatsapp = cols[5] || "";

    const matchedProg = validPrograms.find((p) => p.toLowerCase() === program.toLowerCase());
    if (matchedProg) program = matchedProg;

    let isValid = true;
    let errorReason = "";
    if (!name) { isValid = false; errorReason = "Nama kosong"; }
    else if (!validPrograms.includes(program)) { isValid = false; errorReason = "Program tak valid"; }

    rows.push({ name, age: ageNum, program, status, parentName, whatsapp, isValid, errorReason });
  }

  return { rows };
}
