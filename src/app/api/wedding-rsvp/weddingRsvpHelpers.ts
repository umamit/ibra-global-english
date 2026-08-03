import { Pool } from "pg";

let pool: Pool;
if (!(globalThis as any).rsvp_pg_pool) {
  (globalThis as any).rsvp_pg_pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}
pool = (globalThis as any).rsvp_pg_pool;

export async function fetchWeddingWishes(weddingId: string) {
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
  return res.rows;
}

export async function submitWeddingRsvp(body: any) {
  const { weddingId, name, attendance, guests, wish } = body;
  if (!name || !attendance) {
    return { success: false, error: "Nama dan konfirmasi kehadiran wajib diisi.", status: 400 };
  }

  const query = {
    text: `
      INSERT INTO wedding_rsvps (wedding_id, name, attendance, guests, wish, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    values: [weddingId || "mike-lila", name.trim(), attendance, parseInt(guests) || 1, wish ? wish.trim() : null, new Date().toISOString()]
  };

  await pool.query(query);
  return { success: true, status: 201 };
}
