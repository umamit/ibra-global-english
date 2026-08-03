import { getAdminSupabase } from "@/app/api/_middleware";

const supabase = getAdminSupabase();

export async function fetchVisitorStats() {
  const { data, error } = await supabase.from("landing_settings").select("*").in("key", ["unique_visitors_count", "visitor_offset"]);
  if (error) throw error;
  let uniqueCount = 0;
  let offset = 0;
  data?.forEach((item) => {
    if (item.key === "unique_visitors_count") uniqueCount = parseInt(item.value, 10) || 0;
    else if (item.key === "visitor_offset") offset = parseInt(item.value, 10) || 0;
  });
  return { uniqueCount, offset, total: uniqueCount + offset };
}

export async function incrementVisitorCount(isNew: boolean) {
  const stats = await fetchVisitorStats();
  let uniqueCount = stats.uniqueCount;
  if (isNew) {
    uniqueCount += 1;
    const { error: upsertError } = await supabase.from("landing_settings").upsert({ key: "unique_visitors_count", value: String(uniqueCount) });
    if (upsertError) throw upsertError;
  }
  return uniqueCount + stats.offset;
}
