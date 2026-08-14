import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error('[Supabase] Khoi tao that bai:', e);
  }
} else {
  console.warn('[Supabase] Thieu VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY - tinh nang Bao ho qua Internet tam thoi tat, app van chay binh thuong.');
}

export const supabase = client;