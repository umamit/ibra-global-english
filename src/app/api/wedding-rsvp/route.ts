import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

// Initialize a global pool singleton for Serverless environment (respecting Supabase Free Tier quotas)
let pool: Pool;
if (!(globalThis as any).rsvp_pg_pool) {
  (globalThis as any).rsvp_pg_pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2, // Rule 5: Keep connection count minimal to protect free-tier databases
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}
pool = (globalThis as any).rsvp_pg_pool;

// GET: Fetch wishes for a specific wedding
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weddingId = searchParams.get("weddingId") || "mike-lila";

    // Select latest 50 records to conserve bandwidth (Rule 5 compliance)
    const query = {
      text: `
        SELECT name, wish, attendance, created_at 
        FROM wedding_rsvps 
        WHERE wedding_id = $1 AND wish IS NOT NULL AND wish != '' 
        ORDER BY created_at DESC 
        LIMIT 50
      `,
      values: [weddingId],
    };

    const res = await pool.query(query);
    const data = res.rows;

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error("Gagal memuat doa restu:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memuat doa restu." },
      { status: 500 }
    );
  }
}

// POST: Submit a new RSVP/wish
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weddingId, name, attendance, guests, wish } = body;

    if (!name || !attendance) {
      return NextResponse.json(
        { error: "Nama dan konfirmasi kehadiran wajib diisi." },
        { status: 400 }
      );
    }

    const guestCount = parseInt(guests) || 1;

    const query = {
      text: `
        INSERT INTO wedding_rsvps (wedding_id, name, attendance, guests, wish, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [
        weddingId || "mike-lila",
        name.trim(),
        attendance,
        guestCount,
        wish ? wish.trim() : null,
        new Date().toISOString()
      ]
    };

    await pool.query(query);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("Gagal mengirim RSVP:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengirim konfirmasi kehadiran." },
      { status: 500 }
    );
  }
}
