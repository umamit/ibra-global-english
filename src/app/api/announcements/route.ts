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

export const GET = async (request: Request) => {
  const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const isSanityConfigured = sanityProjectId && sanityProjectId !== "placeholder" && sanityProjectId !== "project_id_anda";

  if (isSanityConfigured) {
    try {
      const { client } = await import("@/lib/sanity/client");
      const url = new URL(request.url);
      const role = url.searchParams.get("role") || "all";

      // Kueri GROQ untuk mengambil pengumuman yang relevan
      const groqQuery = `*[_type == "announcement" && (targetRole == "all" || targetRole == $role)] | order(date desc)`;
      const announcements = await client.fetch(groqQuery, { role });

      const formattedAnnouncements = announcements.map((ann: any) => ({
        id: ann._id,
        title: ann.title,
        content: ann.content, // Menyimpan Portable Text
        published_at: ann.date || ann._createdAt,
        image_url: ann.image || null,
        priority: "normal",
        is_sanity: true,
      }));

      return Response.json({ data: formattedAnnouncements });
    } catch (err: any) {
      console.error("Gagal mengambil pengumuman dari Sanity CMS, fallback ke Supabase:", err);
    }
  }

  // Fallback ke kueri Supabase
  return api.GET(request);
};

export const POST = api.POST;
export const PATCH = api.PATCH;
export const DELETE = api.DELETE;