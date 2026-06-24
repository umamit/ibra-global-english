const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Baca dan parse .env.local secara manual
const envPath = path.join(__dirname, "..", ".env.local");
let supabaseUrl = "";
let serviceRoleKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") serviceRoleKey = val;
    }
  });
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Gagal membaca kredensial Supabase dari .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("=== Memulai Sinkronisasi Pendaftaran Tersangkut ===");

  // 1. Ambil pendaftaran berstatus approved
  const { data: regs, error: errRegs } = await supabase
    .from("registrations")
    .select("*")
    .eq("status", "approved");

  if (errRegs) {
    console.error("Gagal mengambil data pendaftaran:", errRegs);
    process.exit(1);
  }

  console.log(`Ditemukan ${regs.length} pendaftaran berstatus 'approved'.`);

  let fixedCount = 0;

  for (const reg of regs) {
    // Normalisasi program
    let cleanProgram = reg.program.trim();
    if (cleanProgram.startsWith("Kids Program")) {
      cleanProgram = "Kids Program";
    } else if (cleanProgram.startsWith("Teens Program")) {
      cleanProgram = "Teens Program";
    } else if (cleanProgram.startsWith("Fun Calistung")) {
      cleanProgram = "Fun Calistung";
    }

    // Cek apakah siswa dengan nama & program ini sudah ada di tabel students
    const { data: student, error: errStudent } = await supabase
      .from("students")
      .select("id")
      .eq("name", reg.student_name.trim())
      .eq("program", cleanProgram)
      .maybeSingle();

    if (errStudent) {
      console.error(`Gagal mengecek siswa ${reg.student_name}:`, errStudent);
      continue;
    }

    if (!student) {
      console.log(`Menemukan pendaftaran tersangkut: "${reg.student_name}" (Program: ${reg.program})`);
      
      const validAge = reg.student_age && reg.student_age > 0 ? reg.student_age : 5;

      // Sisipkan ke tabel students
      const { data: newStudent, error: errInsert } = await supabase
        .from("students")
        .insert({
          name: reg.student_name.trim(),
          age: validAge,
          program: cleanProgram,
          parent_id: null,
        })
        .select()
        .single();

      if (errInsert) {
        console.error(`❌ Gagal menambahkan "${reg.student_name}" ke tabel students:`, errInsert.message);
      } else {
        console.log(`✅ Berhasil menambahkan "${reg.student_name}" ke tabel students.`);
        fixedCount++;
      }
    }
  }

  console.log(`\n=== Sinkronisasi Selesai: ${fixedCount} pendaftaran berhasil dipulihkan. ===`);
}

main().catch(console.error);
