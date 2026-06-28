import { buildCRUDApi } from "@/app/api/_table-crud";

const { GET, POST, PATCH, DELETE } = buildCRUDApi("tutors", {
  listQuery: (q, searchParams) => {
    const showAll = searchParams.get("all") === "true";
    let query = q.select("*").order("display_order", { ascending: true });
    if (!showAll) {
      query = query.eq("is_active", true);
    }
    return query;
  },
  insertBody: (body) => ({
    name: body.name,
    role: body.role,
    bio: body.bio || "",
    image_url: body.image_url || "",
    display_order: Number(body.display_order) || 0,
    is_active: body.is_active !== false,
  }),
  updateBody: (body) => ({
    name: body.name,
    role: body.role,
    bio: body.bio,
    image_url: body.image_url,
    display_order: Number(body.display_order),
    is_active: body.is_active,
  }),
});

export { GET, POST, PATCH, DELETE };
