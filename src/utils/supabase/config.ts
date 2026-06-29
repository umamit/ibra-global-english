export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes("placeholder-project") || url.includes("placeholder")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL tidak dikonfigurasi. Set di .env.local");
  }
  if (!anonKey || anonKey.includes("placeholder-anon-key") || anonKey.includes("placeholder-key") || anonKey.includes("placeholder")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY tidak dikonfigurasi. Set di .env.local");
  }

  return { url, anonKey };
}
