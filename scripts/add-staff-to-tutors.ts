import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== MEMERIKSA SINKRONISASI TUTOR & STAF DARI PROFILES KE TUTORS ===");

  const { data: profs } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["tutor", "admin", "teacher"]);

  console.log("Data profiles role tutor/admin/teacher:", profs);

  // Check current tutors
  const { data: existingTutors } = await supabase.from("tutors").select("*");
  console.log("Existing tutors:", existingTutors);
}

run();
