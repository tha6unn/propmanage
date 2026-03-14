"""Fix RLS infinite recursion between properties and property_access using psycopg2."""
import psycopg2

# Supabase direct connection
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
# We need the database password. Let's try using the connection pooler.

# Alternative: use the service role to bypass RLS entirely
# The Supabase PostgREST connection string for direct DB access:
DB_HOST = "aws-0-ap-south-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.pgxjtogwnbvbrgxalpir"
# Note: We don't have the DB password, so let's use a different approach

# Actually, the simplest fix: Supabase Management API can run SQL
# via POST https://api.supabase.com/v1/projects/{ref}/database/query
# But we need the Management API access token

# Let's try the Session Pooler with the Supabase password from env
# The database password is NOT the same as the service role key

# BEST APPROACH: Since we have the service_role key, all queries
# from the server will bypass RLS anyway. The issue only happens
# with the anon key (client-side). But our Next.js server components
# use the server-side Supabase client which returns an authenticated
# client session - which triggers RLS.

# The real fix: update schema.sql and have the user run it in the
# Supabase SQL Editor, or we modify the query approach.

print("=" * 60)
print("FIX REQUIRED: RLS Infinite Recursion")
print("=" * 60)
print()
print("The following SQL needs to be run in the Supabase Dashboard")
print("SQL Editor (https://supabase.com/dashboard/project/pgxjtogwnbvbrgxalpir/sql/new)")
print()
print("--- SQL START ---")
print("""
DROP POLICY IF EXISTS "property_access_owner" ON property_access;

CREATE POLICY "property_access_owner" ON property_access
  FOR ALL USING (granted_by = auth.uid());
""")
print("--- SQL END ---")
print()
print("This fixes the circular reference between the properties")
print("and property_access RLS policies.")
