import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

export interface LandingSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_desc?: string;
  hero_image?: string;
  landing_faq?: string | unknown[];
  [key: string]: unknown;
}

// Buat client Supabase publik khusus (tidak membaca cookies/headers agar aman digunakan di generateMetadata)
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getLandingSettings = cache(async (): Promise<LandingSettings> => {
  try {
    const { data, error } = await supabase
      .from("landing_settings")
      .select("key, value");

    if (error) {
      console.error("Error mengambil landing_settings di metadata:", error);
      return {};
    }

    const settings: LandingSettings = {};
    if (data) {
      data.forEach((item: { key: string; value: unknown }) => {
        settings[item.key] = item.value;
      });
    }
    return settings;
  } catch (err) {
    console.error("Gagal memuat landing_settings di metadata:", err);
    return {};
  }
});
