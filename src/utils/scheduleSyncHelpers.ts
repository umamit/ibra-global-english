// scheduleSyncHelpers.ts - Helper sinkronisasi Absensi dengan Kalender Agenda Akademik
export interface AcademicScheduleItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  program: string;
  start_time: string;
  end_time: string;
  instructor?: string | null;
  room?: string | null;
}

export function getIndonesianDayName(dateStr: string): string {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[dateObj.getDay()] || "-";
}

export function filterSchedulesByDate(schedules: AcademicScheduleItem[], dateStr: string): AcademicScheduleItem[] {
  if (!schedules || !dateStr) return [];
  return schedules.filter((item) => {
    if (!item.start_time) return false;
    const itemDate = item.start_time.substring(0, 10);
    return itemDate === dateStr;
  });
}

export function getProgramsWithActiveSchedule(dailySchedules: AcademicScheduleItem[]): Set<string> {
  const activePrograms = new Set<string>();
  dailySchedules.forEach((item) => {
    if (item.program) {
      activePrograms.add(item.program);
    }
  });
  return activePrograms;
}

export function getScheduleDetailForProgram(dailySchedules: AcademicScheduleItem[], programName: string): { room: string; timeRange: string } | null {
  if (!dailySchedules || !programName) return null;
  const match = dailySchedules.find((item) => item.program === programName || (item.program && programName.includes(item.program)));
  if (!match) return null;

  const room = match.room || "Ruang Sesi";
  const startTime = match.start_time ? match.start_time.substring(11, 16) : "";
  const endTime = match.end_time ? match.end_time.substring(11, 16) : "";
  const timeRange = startTime && endTime ? `${startTime} - ${endTime} WIT` : "Sesi Aktif";

  return { room, timeRange };
}

export function generateWaAbsentMessage(studentName: string, dateStr: string, program: string, parentPhone?: string): string {
  const cleanPhone = (parentPhone || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
  const formattedDate = dateStr;
  const text = encodeURIComponent(
    `Halo Ayah/Bunda Wali Murid dari *${studentName}*,\n\nKami menginformasikan bahwa pada hari ini (${formattedDate}) untuk sesi kelas *${program}* di Ibra Global English Bobong, *${studentName}* terdata *Alfa (Belum Hadir Tanpa Keterangan)*.\n\nJika ada kendala atau perizinan, silakan konfirmasi kembali ke Admin/Tutor kami. Terima kasih.`
  );
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}
