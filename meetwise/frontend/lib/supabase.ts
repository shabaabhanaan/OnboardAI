import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder values to prevent build errors
// This allows the build to finish, but runtime will fail if env vars are missing in Netlify
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ Supabase URL missing. Using placeholder for build.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
