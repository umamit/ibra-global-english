import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// Buat client Supabase publik khusus (tidak membaca cookies/headers agar aman digunakan di generateMetadata)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getLandingSettings = cache(async () => {
  try {
    const { data, error } = await supabase
      .from("landing_settings")
      .select("key, value");

    if (error) {
      console.error("Error mengambil landing_settings di metadata:", error);
      return {};
    }

    const settings = {};
    if (data) {
      data.forEach((item) => {
        settings[item.key] = item.value;
      });
    }
    return settings;
  } catch (err) {
    console.error("Gagal memuat landing_settings di metadata:", err);
    return {};
  }
});
