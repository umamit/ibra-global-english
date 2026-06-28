import { buildCRUDApi } from "@/app/api/_table-crud";

const { GET, POST, PATCH, DELETE } = buildCRUDApi("curriculums", {
  listQuery: (q, searchParams) => {
    const program = searchParams.get("program");
    const showAll = searchParams.get("all") === "true";
    let query = q.select("*").order("created_at", { ascending: false });
    
    if (program) {
      query = query.eq("program", program);
    }
    if (!showAll) {
      query = query.eq("is_active", true);
    }
    return query;
  },
  insertBody: (body) => ({
    program: body.program,
    level_name: body.level_name,
    duration: body.duration || "",
    topics: Array.isArray(body.topics) ? body.topics : [],
    syllabus_pdf_url: body.syllabus_pdf_url || "",
    is_active: body.is_active !== false,
  }),
  updateBody: (body) => ({
    program: body.program,
    level_name: body.level_name,
    duration: body.duration,
    topics: Array.isArray(body.topics) ? body.topics : [],
    syllabus_pdf_url: body.syllabus_pdf_url,
    is_active: body.is_active,
  }),
});

export { GET, POST, PATCH, DELETE };
