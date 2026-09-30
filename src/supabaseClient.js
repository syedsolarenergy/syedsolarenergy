// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// The URL and anon key are public by design — they ship inside the JS
// bundle and are safe to expose. Actual protection comes from Row Level
// Security in the database, not from hiding these values.
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  || 'https://jbohohgvpjybwqczffhd.supabase.co';

const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2hvaGd2cGp5YndxY3pmZmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODMwNzcsImV4cCI6MjA2ODM1OTA3N30.G_JxsFj_XphR3x0slTSqzKDb_VH9oM-qNmdUGO93Ezc';

export const SESSION_TOKEN_KEY = 'sessionToken';

export function getSessionToken() {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY) || null;
  } catch {
    // Private browsing / storage disabled.
    return null;
  }
}

// Every request carries the current session token. The database reads it
// to decide what this caller may see, so staff-only tables stay closed to
// the public even though both share the same anon key.
//
// Reading the token per request (rather than when the client is created)
// means login and logout take effect immediately, with no page reload.
const authFetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const token = getSessionToken();
  if (token) headers.set('x-session-token', token);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { fetch: authFetch },
});

/**
 * Calls a database function and returns its JSON result.
 * Throws on transport failure; returns { ok: false } shapes untouched.
 */
export async function rpc(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw error;
  return data;
}

export default supabase;
