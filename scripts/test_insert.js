const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase with the Anon key (like the client-side does)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Testing insert with ANON key...");
  
  const payload = {
    full_name: "Test Anon User",
    email: "testanon@example.com",
    whatsapp_number: "081234567890",
    score: 10,
    level: "Intermediate",
    status: "pending",
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("placement_test_submissions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Insert failed with error:", error);
  } else {
    console.log("Insert succeeded! Inserted row:", data);
  }
}

main();
