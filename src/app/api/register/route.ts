import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { registrationSchema, registrationUpdateSchema } from "@/lib/schemas";
import { createOrReusePendingRegistration, processRegistrationStatusUpdate } from "./registerHelpers";

export const dynamic = "force-dynamic";
const supabaseAdmin = getAdminSupabase();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
    }

    const { id, error } = await createOrReusePendingRegistration(validation.data);
    if (error || !id) return NextResponse.json({ error: "Gagal menyimpan pendaftaran." }, { status: 500 });
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export const GET = withAdminAuth(async () => {
  try {
    const { data, error } = await supabaseAdmin.from("registrations").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: "Gagal memuat data pendaftaran.", details: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan server saat memuat pendaftaran." }, { status: 500 });
  }
});

export const PATCH = withAdminAuth(async (req) => {
  try {
    const body = await req.json();
    const patchValidation = registrationUpdateSchema.safeParse(body);
    if (!patchValidation.success) {
      const errorMessages = patchValidation.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json({ error: `Data tidak valid: ${errorMessages}` }, { status: 400 });
    }

    const { id, status, notes } = patchValidation.data;
    const res = await processRegistrationStatusUpdate(id, status, notes);
    if (!res.success) return NextResponse.json({ success: false, error: res.error, details: res.details }, { status: res.status });

    return NextResponse.json({ success: true, message: res.message }, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Terjadi kesalahan server." }, { status: 500 });
  }
});
