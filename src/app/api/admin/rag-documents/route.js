import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";
import { upsertRagDocument, listRagDocuments, deleteRagDocument, generateEmbedding } from "@/utils/rag";

const adminSupabase = getAdminSupabase();

// GET - List all RAG documents
export const GET = withAdminAuth(async () => {
  try {
    const docs = await listRagDocuments();
    return NextResponse.json({ documents: docs });
  } catch (err) {
    console.error("Error listing RAG documents:", err);
    return NextResponse.json({ error: "Gagal memuat dokumen RAG." }, { status: 500 });
  }
});

// POST - Create or update RAG document
export const POST = withAdminAuth(async (request) => {
  try {
    const body = await request.json();
    const { id, title, content, source, metadata } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan konten dokumen wajib diisi." },
        { status: 400 }
      );
    }

    const doc = await upsertRagDocument({
      id,
      title,
      content,
      source: source || "manual",
      metadata: metadata || {},
    });

    return NextResponse.json({ document: doc });
  } catch (err) {
    console.error("Error upserting RAG document:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan dokumen RAG.", details: err.message },
      { status: 500 }
    );
  }
});

// DELETE - Delete RAG document
export const DELETE = withAdminAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID dokumen diperlukan." }, { status: 400 });
    }

    await deleteRagDocument(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting RAG document:", err);
    return NextResponse.json({ error: "Gagal menghapus dokumen RAG." }, { status: 500 });
  }
});