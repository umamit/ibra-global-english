const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Helper untuk mewarnai output terminal
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m"
};

console.log(`${colors.bright}${colors.cyan}=====================================================================`);
console.log(`🚀 IBRA GLOBAL ENGLISH - DATABASE SEEDING UTILITY`);
console.log(`=====================================================================${colors.reset}\n`);

// 1. Membaca berkas .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error(`${colors.red}❌ Error: File .env.local tidak ditemukan!`);
  console.log(`Silakan salin berkas .env.local dari direktori scratch atau buat berkas tersebut di folder utama ini.${colors.reset}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const supabaseUrl = (envContent.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/) || [])[1]?.trim()?.replace(/["']/g, '');
const supabaseAnonKey = (envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/) || [])[1]?.trim()?.replace(/["']/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(`${colors.red}❌ Error: Variabel lingkungan Supabase di .env.local tidak lengkap!`);
  console.log(`Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah terisi dengan benar.${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.green}✓ Berhasil membaca konfigurasi Supabase dari .env.local`);
console.log(`🔗 URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...\n${colors.reset}`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  try {
    // 1. Dapatkan daftar profil orang tua yang terdaftar di database
    console.log(`${colors.blue}🔍 Mencari profil orang tua di database...${colors.reset}`);
    const { data: parents, error: errParents } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'parent');

    if (errParents) throw errParents;

    let parentId = null;
    if (parents && parents.length > 0) {
      parentId = parents[0].id;
      console.log(`${colors.green}✓ Menemukan akun orang tua aktif: "${parents[0].full_name}" (ID: ${parentId})${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Catatan: Tidak ditemukan akun orang tua terdaftar.`);
      console.log(`Siswa akan ditambahkan tanpa relasi akun orang tua (parent_id: null).`);
      console.log(`Anda dapat meregistrasikan akun orang tua via halaman login terlebih dahulu untuk menghubungkannya.${colors.reset}\n`);
    }

    // 2. Tambahkan Data Siswa Mock
    console.log(`${colors.blue}📝 Menambahkan data siswa contoh...${colors.reset}`);
    const mockStudents = [
      { name: "Ahmad Rizky", age: 8, program: "Kids Program", parent_id: parentId },
      { name: "Siti Rahma", age: 10, program: "Kids Program", parent_id: parentId },
      { name: "Fathur Rahman", age: 14, program: "Teens Program", parent_id: parentId },
      { name: "Bunga Lestari", age: 6, program: "Fun Calistung", parent_id: parentId }
    ];

    const { data: students, error: errStudents } = await supabase
      .from('students')
      .insert(mockStudents)
      .select();

    if (errStudents) {
      if (errStudents.message.includes("violates foreign key constraint")) {
        console.log(`${colors.red}❌ Error: Relasi UUID orang tua tidak valid. Menambahkan siswa tanpa orang tua...${colors.reset}`);
        const cleanStudents = mockStudents.map(s => ({ ...s, parent_id: null }));
        const { data: retryS, error: retryErr } = await supabase.from('students').insert(cleanStudents).select();
        if (retryErr) throw retryErr;
        return retryS;
      }
      throw errStudents;
    }

    console.log(`${colors.green}✓ Berhasil menambahkan ${students.length} siswa baru!${colors.reset}`);
    students.forEach(s => console.log(`   - ${s.name} (${s.program}, ${s.age} thn)`));

    // 3. Tambahkan Data Absensi Mock
    console.log(`\n${colors.blue}📝 Menambahkan riwayat absensi kelas...${colors.reset}`);
    const today = new Date();
    const mockAttendance = [];

    // Buat absensi untuk 3 hari terakhir
    for (let i = 0; i < 3; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      const dateStr = currentDate.toISOString().split('T')[0];

      students.forEach((student, index) => {
        // Tentukan status acak (hadir dominan, sesekali izin/sakit)
        let status = 'hadir';
        let notes = '';
        const rand = Math.random();
        
        if (rand > 0.9) {
          status = 'sakit';
          notes = 'Demam flu';
        } else if (rand > 0.8) {
          status = 'izin';
          notes = 'Acara keluarga';
        }

        mockAttendance.push({
          student_id: student.id,
          date: dateStr,
          status: status,
          notes: notes || null
        });
      });
    }

    const { data: attendance, error: errAttendance } = await supabase
      .from('attendance')
      .insert(mockAttendance)
      .select();

    if (errAttendance) {
      if (errAttendance.code === '23505') {
        console.log(`${colors.yellow}⚠ Catatan: Absensi untuk tanggal-tanggal ini sudah ada di database.${colors.reset}`);
      } else {
        throw errAttendance;
      }
    } else {
      console.log(`${colors.green}✓ Berhasil memasukkan ${attendance.length} catatan absensi harian!${colors.reset}`);
    }

    // 4. Tambahkan Data Rapor Modul Mock
    console.log(`\n${colors.blue}📝 Menambahkan nilai rapor belajar digital...${colors.reset}`);
    const mockReports = [];

    students.forEach((student) => {
      // Buat laporan untuk Modul 1
      mockReports.push({
        student_id: student.id,
        module_name: "Module 1 - Greetings & Introduction",
        speaking_score: Math.floor(Math.random() * (100 - 75 + 1)) + 75,
        grammar_score: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
        vocabulary_score: Math.floor(Math.random() * (100 - 80 + 1)) + 80,
        active_score: Math.floor(Math.random() * (100 - 85 + 1)) + 85,
        tutor_notes: `Sangat aktif dan percaya diri saat sesi latihan berpasangan. Lafal ${student.name} sudah cukup jelas.`
      });

      // Siswa kids/teens dapat modul tambahan Modul 2
      if (student.program !== "Fun Calistung") {
        mockReports.push({
          student_id: student.id,
          module_name: "Module 2 - Daily Routine & Activities",
          speaking_score: Math.floor(Math.random() * (100 - 70 + 1)) + 70,
          grammar_score: Math.floor(Math.random() * (100 - 65 + 1)) + 65,
          vocabulary_score: Math.floor(Math.random() * (100 - 75 + 1)) + 75,
          active_score: Math.floor(Math.random() * (100 - 80 + 1)) + 80,
          tutor_notes: `Menunjukkan ketertarikan yang tinggi pada topik kosa kata baru. Perlu lebih banyak latihan menyusun kalimat lengkap.`
        });
      }
    });

    const { data: reports, error: errReports } = await supabase
      .from('reports')
      .insert(mockReports)
      .select();

    if (errReports) throw errReports;

    console.log(`${colors.green}✓ Berhasil memasukkan ${reports.length} laporan evaluasi rapor modul!${colors.reset}`);

    console.log(`\n${colors.bright}${colors.green}=====================================================================`);
    console.log(`🎉 PROSES SEEDING DATABASE SELESAI DENGAN SUKSES!`);
    console.log(`=====================================================================${colors.reset}\n`);
    console.log(`Silakan jalankan server lokal Anda (npm run dev) untuk melihat data baru ini di dashboard!`);

  } catch (error) {
    console.error(`\n${colors.red}❌ Terjadi kesalahan saat melakukan seeding:`, error.message || error);
    console.log(error);
    console.log(`${colors.reset}`);
  }
}

seed();
