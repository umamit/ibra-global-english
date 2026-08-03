import { NextResponse, NextRequest } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { fetchAllOfficialLetters, createOfficialLetter, updateOfficialLetter, deleteOfficialLetter } from "./lettersHelpers";

export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async () => {
  const { data, error } = await fetchAllOfficialLetters();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  const res = await createOfficialLetter(await request.json());
  if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ success: true, data: res.data });
});

export const PATCH = withAdminAuth(async (request: NextRequest) => {
  const res = await updateOfficialLetter(await request.json());
  if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ success: true, data: res.data });
});

export const DELETE = withAdminAuth(async (request: NextRequest) => {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID surat tidak disediakan." }, { status: 400 });

  const res = await deleteOfficialLetter(id);
  if (!res.success) return NextResponse.json({ error: res.error }, { status: res.status });
  return NextResponse.json({ success: true, message: res.message });
});
