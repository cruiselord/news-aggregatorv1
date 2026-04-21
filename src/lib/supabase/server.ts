import { createClient } from '@supabase/supabase-js';

// A simple helper for server-side code that needs a Supabase client with
// elevated privileges (service role key). This is used by background jobs,
// API routes, and any non-public operations.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not set');
  }
  return createClient(url, key);
}
