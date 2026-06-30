export const dynamic = 'force-dynamic';

import { buildCRUDApi } from "@/app/api/_table-crud";

const api = buildCRUDApi("announcements", {
  listQuery: (query: any, searchParams: any) => {
    const program = searchParams?.get("program");
    const all = searchParams?.get("all") === "true";

    let q = query.select("*").order("published_at", { ascending: false });
    if (!all) q = q.eq("is_active", true);
    if (program && program !== "Semua Program") {
      q = q.or(`program.eq.${program},program.eq.Semua Program`);
    }
    return q;
  },
  insertBody: (body: any) => ({
    title: body.title?.trim(),
    content: body.content?.trim(),
    program: body.program || "Semua Program",
    priority: body.priority || "normal",
    expires_at: body.expires_at || null,
    is_active: true,
  }),
  updateBody: (body: any) => {
    const updates: any = {};
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (body.title) updates.title = body.title.trim();
    if (body.content) updates.content = body.content.trim();
    if (body.program) updates.program = body.program;
    if (body.priority) updates.priority = body.priority;
    return updates;
  },
});

export const GET = api.GET;

export const POST = api.POST;
export const PATCH = api.PATCH;
export const DELETE = api.DELETE;