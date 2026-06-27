#!/bin/bash
# Vercel post-deploy migration hook
# Set env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (di Vercel)

SQL_CONTENT=$(cat scripts/migrate-registrations.sql)

curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$(echo $SQL_CONTENT | sed 's/\\/\\\\/g; s/\"/\\\"/g' | tr '\n' ' ')\"}" || true
