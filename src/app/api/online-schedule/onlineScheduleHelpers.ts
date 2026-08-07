import { getAdminSupabase } from "@/app/api/_middleware";

const adminSupabase = getAdminSupabase();

export async function fetchOnlineSchedules(program: string | null, upcoming: boolean) {
  let query = adminSupabase
    .from("online_schedules")
    .select("*")
    .eq("is_active", true)
    .order("scheduled_at", { ascending: true });

  if (upcoming) {
    query = query.gte("scheduled_at", new Date().toISOString());
  }

  if (program && program !== "Semua Program") {
    query = query.eq("program", program);
  }

  return await query;
}

export async function createOnlineSchedule(payload: any) {
  return await adminSupabase
    .from("online_schedules")
    .insert({
      ...payload,
      is_active: true,
    })
    .select()
    .single();
}

export async function updateOnlineSchedule(id: string | number, updates: any) {
  return await adminSupabase.from("online_schedules").update(updates).eq("id", id);
}

export async function deleteOnlineSchedule(id: string | number) {
  return await adminSupabase.from("online_schedules").delete().eq("id", id);
}
