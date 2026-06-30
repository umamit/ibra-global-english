import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { prisma } from "../../../../../lib/prisma";
import { upsertRagDocument } from "@/utils/rag";

// GET: List all RAG documents
export async function GET(request: Request) {
  try {
    const docs = await prisma.ragDocument.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ data: docs });
  } catch (error: any) {
    console.error("Gagal mengambil dokumen RAG:", error);
    const isTableMissing = 
      error.message?.includes("relation \"rag_documents\" does not exist") || 
      error.code === "P2021";
    
    return NextResponse.json({ 
      error: error.message,
      isTableMissing 
    }, { status: 500 });
  }
}

// POST: Create a new RAG document
export const POST = withAdminAuth(async (request: any) => {
  try {
    const body = await request.json();
    const { title, content, source, metadata } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan isi dokumen wajib diisi." },
        { status: 400 }
      );
    }

    const doc = await upsertRagDocument({
      title,
      content,
      source: source || "manual",
      metadata: metadata || {},
    });

    return NextResponse.json({ data: doc });
  } catch (error: any) {
    console.error("Gagal menambah dokumen RAG:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// PATCH: Update a RAG document
export const PATCH = withAdminAuth(async (request: Request) => {
  try {
    const body = await request.json();
    const { id, title, content, source, metadata } = body as { id: string; title: string; content: string; source?: string; metadata?: any };

    if (!id) {
      return NextResponse.json(
        { error: "ID dokumen diperlukan." },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan isi dokumen wajib diisi." },
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

    return NextResponse.json({ data: doc });
  } catch (error: any) {
    console.error("Gagal mengupdate dokumen RAG:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE: Delete a RAG document
export const DELETE = withAdminAuth(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID dokumen diperlukan." },
        { status: 400 }
      );
    }

    await prisma.ragDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Gagal menghapus dokumen RAG:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
