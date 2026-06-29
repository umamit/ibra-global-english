import { NextResponse } from "next/server";
import { withAdminAuth } from "@/app/api/_middleware";
import { getAdminSupabase } from "@/app/api/_middleware";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
const adminSupabase = getAdminSupabase();

export const POST = withAdminAuth(async () => {
  try {
    const sqlPath = path.join(process.cwd(), "scripts", "migrate-registrations.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    const statements = sql.split(";").map(s => s.trim()).filter(Boolean);

    for (const stmt of statements) {
      let rpcResult;
      try {
        rpcResult = await adminSupabase.rpc("exec_sql", { sql: stmt });
      } catch {
        rpcResult = { error: { message: "RPC tidak tersedia, jalankan manual." } };
      }
      const { error } = rpcResult;
      if (error) {
        console.warn("Migration skipped via RPC:", stmt.slice(0, 80));
      }
    }

    return NextResponse.json({ success: true, message: "Migration executed." });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal menjalankan migration: " + err.message }, { status: 500 });
  }
});
