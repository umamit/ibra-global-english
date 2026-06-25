export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

const BUCKET = "gallery-photos";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "true";
  const category = searchParams.get("category");

  let query = adminSupabase
    .from("gallery_items")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (!all) query = query.eq("is_active", true);
  if (category && category !== "Semua") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export const POST = withAdminAuth(async (request) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description") || "";
  const category = formData.get("category") || "Kegiatan";
  const file = formData.get("file");

  if (!title?.trim() || !file) {
    return NextResponse.json({ error: "Judul dan foto wajib diisi." }, { status: 400 });
  }

  // Upload ke Supabase Storage
  const ext = file.name.split(".").pop();
  const filePath = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await adminSupabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = adminSupabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { data, error } = await adminSupabase
    .from("gallery_items")
    .insert({ title: title.trim(), description, category, image_url: publicUrl, storage_path: filePath, is_active: true })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export const PATCH = withAdminAuth(async (request) => {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  const { error } = await adminSupabase.from("gallery_items").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export const DELETE = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

  // Ambil storage_path dulu lalu hapus file
  const { data: item } = await adminSupabase.from("gallery_items").select("storage_path").eq("id", id).single();
  if (item?.storage_path) {
    await adminSupabase.storage.from(BUCKET).remove([item.storage_path]);
  }

  const { error } = await adminSupabase.from("gallery_items").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
