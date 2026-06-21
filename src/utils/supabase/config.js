export function getSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url.includes("placeholder-project") || url.includes("placeholder")) {
    url = "https://uszukipvrvjrgrikxfwh.supabase.co";
  }
  if (!anonKey || anonKey.includes("placeholder-anon-key") || anonKey.includes("placeholder-key") || anonKey.includes("placeholder")) {
    anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzenVraXB2cnZqcmdyaWt4ZndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NTQ2MTQsImV4cCI6MjA5NjQzMDYxNH0.M6rlLPNiOFowcZODVj-mmNnv8X6ZkkY-m77Lg4vdXHA";
  }

  return { url, anonKey };
}
