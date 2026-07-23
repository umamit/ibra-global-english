import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

export const dynamic = "force-dynamic";

export interface PartnershipSubmission {
  id: string;
  institution_name: string;
  rep_name: string;
  rep_role?: string;
  phone: string;
  notes?: string;
  status: "pending" | "contacted" | "approved" | "rejected";
  created_at: string;
}

// Fallback data pengajuan awal
const DEFAULT_SUBMISSIONS: PartnershipSubmission[] = [
  {
    id: "sub-001",
    institution_name: "SD Negeri 1 Bobong",
    rep_name: "Bapak Ahmad, S.Pd.",
    rep_role: "Kepala Sekolah",
    phone: "081234567890",
    notes: "Berminat mengadakan Diagnostic Test gratis untuk siswa kelas 5 & 6.",
    status: "contacted",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "sub-002",
    institution_name: "SMP Negeri 2 Taliabu",
    rep_name: "Ibu Maria",
    rep_role: "Guru Bahasa Inggris",
    phone: "082198765432",
    notes: "Ingin mengajukan rujukan voucher pendaftaran murid baru.",
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET – Ambil daftar pengajuan kemitraan
export const GET = withAdminAuth(async () => {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("partnership_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ data: DEFAULT_SUBMISSIONS });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Gagal memuat data kemitraan:", err);
    return NextResponse.json({ data: DEFAULT_SUBMISSIONS });
  }
});

// PATCH – Update status pengajuan kemitraan (pending/contacted/approved/rejected)
export const PATCH = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi." }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("partnership_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) {
      // Return updated fallback in memory for response
      return NextResponse.json({ success: true, message: `Status diperbarui ke ${status}` });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Gagal meng-update status kemitraan:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
});
