const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Load .env.local or .env
const envPaths = [
  path.join(__dirname, "..", ".env.local"),
  path.join(__dirname, "..", ".env")
];

let supabaseUrl = "";
let serviceRoleKey = "";

for (const envPath of envPaths) {
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
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Gagal membaca kredensial Supabase dari berkas lingkungan (.env / .env.local).");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("=== Memulai Sinkronisasi Backfill app_metadata.role ===");

  // 1. Ambil semua profil pengguna dari tabel profiles
  const { data: profiles, error: errProfiles } = await supabase
    .from("profiles")
    .select("id, role, email");

  if (errProfiles) {
    console.error("Gagal mengambil data profil dari database:", errProfiles);
    process.exit(1);
  }

  console.log(`Ditemukan ${profiles.length} profil pengguna di database.`);

  let successCount = 0;
  let failCount = 0;

  // 2. Iterasi untuk setiap profil dan update app_metadata di auth.users
  for (const profile of profiles) {
    const { id, role, email } = profile;
    
    if (!role) {
      console.log(`[Skip] Pengguna ${email || id} tidak memiliki role.`);
      continue;
    }

    console.log(`Memproses ${email || id} dengan role: "${role}"...`);

    // Ambil detail auth user saat ini untuk melihat app_metadata yang sudah ada
    const { data: { user }, error: errGetUser } = await supabase.auth.admin.getUserById(id);

    if (errGetUser || !user) {
      console.error(`❌ Gagal mengambil data auth untuk ${email || id}:`, errGetUser?.message || "User tidak ditemukan");
      failCount++;
      continue;
    }

    const currentAppRole = user.app_metadata?.role;
    if (currentAppRole === role) {
      console.log(`✅ ${email || id} sudah memiliki app_metadata.role yang sesuai ("${role}").`);
      successCount++;
      continue;
    }

    // Update app_metadata.role dan sinkronkan user_metadata.role
    const { error: errUpdate } = await supabase.auth.admin.updateUserById(id, {
      app_metadata: { role },
      user_metadata: { role } // Sinkronkan juga di user_metadata untuk kompatibilitas
    });

    if (errUpdate) {
      console.error(`❌ Gagal memperbarui metadata untuk ${email || id}:`, errUpdate.message);
      failCount++;
    } else {
      console.log(`✨ Berhasil memperbarui metadata untuk ${email || id} -> role: "${role}"`);
      successCount++;
    }
  }

  console.log(`\n=== Sinkronisasi Selesai ===`);
  console.log(`Berhasil diproses: ${successCount}`);
  console.log(`Gagal diproses   : ${failCount}`);
}

main().catch(console.error);
