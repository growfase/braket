import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client (anon key). `null` when env vars aren't set, so the app keeps
 * working in mock mode — every caller must handle the null case.
 */
export const supabase: SupabaseClient | null =
  url && anon ? createClient(url, anon, { auth: { persistSession: false } }) : null;

export const isSupabaseEnabled = Boolean(supabase);
