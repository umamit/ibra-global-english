import { NextResponse } from "next/server";
import { getAdminSupabase, withAdminAuth } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

/**
 * Creates a CRUD API route handler for a given table
 * Usage: export { GET, POST, PATCH, DELETE } from "@/app/api/_table-crud";
 * But since each route has its own default export/GET, we use a builder pattern.
 */

export function buildCRUDApi(tableName, options = {}) {
  const {
    listQuery = (q) => q.select("*").order("created_at", { ascending: false }),
    insertBody = (body) => body,
    updateBody = (body) => {
      const { id, ...rest } = body;
      return rest;
    },
  } = options;

  return {
    // GET: List records
    async GET(request) {
      const { searchParams } = new URL(request.url);
      let query = adminSupabase.from(tableName);

      // Apply custom list query
      query = listQuery(query, searchParams);

      const { data, error } = await query;
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    },

    // POST: Create record (admin)
    POST: withAdminAuth(async (request) => {
      const body = await request.json();
      const dataToInsert = insertBody(body);

      if (!dataToInsert || Object.keys(dataToInsert).length === 0) {
        return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
      }

      const { data, error } = await adminSupabase
        .from(tableName)
        .insert(dataToInsert)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }),

    // PATCH: Update record
    PATCH: withAdminAuth(async (request) => {
      const body = await request.json();
      const { id } = body;
      if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

      const updates = updateBody(body);

      const { error } = await adminSupabase
        .from(tableName)
        .update(updates)
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }),

    // DELETE: Delete record
    DELETE: withAdminAuth(async (request) => {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "ID diperlukan." }, { status: 400 });

      const { error } = await adminSupabase.from(tableName).delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }),
  };
}