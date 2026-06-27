const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' }); // Use .env.local for local db url if defined, or fallback to .env
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env or .env.local
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  // try reading from .env
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
    const match = envContent.match(/DATABASE_URL=['"]?([^'"\n]+)['"]?/);
    if (match) dbUrl = match[1];
  } catch (e) {}
}

async function main() {
  console.log("Connecting to Database using URL:", dbUrl);
  if (!dbUrl) {
    console.error("No DATABASE_URL found.");
    return;
  }
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();
  console.log("Connected successfully.");

  // Check tables
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  console.log("\nTables in public schema:");
  console.log(tablesRes.rows.map(r => r.table_name));

  // Check policies on placement_test_submissions
  const policiesRes = await client.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'placement_test_submissions';
  `);
  console.log("\nPolicies on placement_test_submissions:");
  console.log(JSON.stringify(policiesRes.rows, null, 2));

  // Check if RLS is enabled on placement_test_submissions
  const rlsRes = await client.query(`
    SELECT relname, relrowsecurity, relforcerowsecurity 
    FROM pg_class 
    WHERE relname = 'placement_test_submissions';
  `);
  console.log("\nRLS status on placement_test_submissions:");
  console.log(rlsRes.rows);

  await client.end();
}

main().catch(console.error);
