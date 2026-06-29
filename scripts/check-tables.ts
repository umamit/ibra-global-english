/**
 * Script diagnostik: Cek apakah semua tabel Supabase sudah ada di database.
 * Jalankan: npx tsx scripts/check-tables.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

// Baca variabel dari .env.local
const envContent = fs.readFileSync(".env.local", "utf-8");
const getEnv = (key: string): string => {
  const match = envContent.match(new RegExp(`^${key}="?([^"\n]+)"?`, "m"));
  return match ? match[1].trim() : "";
};

const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || supabaseUrl.includes("xyz") || !serviceRoleKey || serviceRoleKey.includes("your-")) {
  console.error("❌ .env.local belum berisi kredensial Supabase yang valid!");
  console.error("   Pastikan NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY sudah diisi.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

// Seluruh tabel yang digunakan oleh admin dashboard
const TABLES_TO_CHECK = [
  { table: "profiles",                   menu: "Autentikasi / Ringkasan" },
  { table: "registrations",              menu: "Kelola Siswa (Pendaftaran)" },
  { table: "students",                   menu: "Kelola Siswa (Data Siswa)" },
  { table: "tuition_payments",           menu: "Kelola Keuangan / SPP" },
  { table: "attendance",                 menu: "Absensi Harian" },
  { table: "placement_test_submissions", menu: "Hasil Tes Penempatan" },
  { table: "placement_test_questions",   menu: "Hasil Tes Penempatan (Soal)" },
  { table: "placement_test_regenerate_logs", menu: "Hasil Tes Penempatan (Log)" },
  { table: "announcements",              menu: "Pengumuman" },
  { table: "online_schedules",           menu: "Jadwal Kelas Online" },
  { table: "tutors",                     menu: "Kelola Tutor & Staf" },
  { table: "curriculums",                menu: "Kelola Kurikulum" },
  { table: "gallery_items",             menu: "Galeri (Landing Page)" },
  { table: "landing_settings",           menu: "Kelola Landing Page" },
  { table: "ai_usage_logs",             menu: "Basis Pengetahuan AI (RAG)" },
];

async function checkTable(tableName: string): Promise<{ exists: boolean; rowCount?: number; error?: string }> {
  try {
    // Gunakan count(*) yang ringan untuk validasi keberadaan tabel
    const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true });
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: true, rowCount: count ?? 0 };
  } catch (err: any) {
    return { exists: false, error: err.message };
  }
}

async function main() {
  console.log("🔍 Memeriksa semua tabel database Supabase...\n");
  console.log(`📡 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log("─".repeat(70));

  const missing: string[] = [];
  const errors: { table: string; menu: string; error: string }[] = [];

  for (const { table, menu } of TABLES_TO_CHECK) {
    const result = await checkTable(table);
    if (result.exists) {
      console.log(`✅  ${table.padEnd(38)} (${result.rowCount} baris) → ${menu}`);
    } else {
      console.log(`❌  ${table.padEnd(38)} TIDAK ADA → ${menu}`);
      if (result.error?.includes("does not exist") || result.error?.includes("relation")) {
        missing.push(table);
      } else {
        errors.push({ table, menu, error: result.error || "Unknown error" });
      }
    }
  }

  console.log("─".repeat(70));
  
  if (missing.length === 0 && errors.length === 0) {
    console.log("\n🎉 Semua tabel sudah ada! Tidak ada masalah yang terdeteksi.");
  } else {
    if (missing.length > 0) {
      console.log(`\n⚠️  TABEL YANG BELUM DIBUAT (${missing.length} tabel):`);
      missing.forEach(t => console.log(`   - ${t}`));
    }
    if (errors.length > 0) {
      console.log(`\n🔴 TABEL DENGAN ERROR AKSES (${errors.length}):`);
      errors.forEach(e => console.log(`   - ${e.table}: ${e.error}`));
    }
  }
}

main().catch(console.error);
