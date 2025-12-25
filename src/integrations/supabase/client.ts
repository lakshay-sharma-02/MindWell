import { createClient } from '@supabase/supabase-js';

// Access Environment Variables securely
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("Missing Supabase Environment Variables!");
}

export const supabase = createClient(
    SUPABASE_URL || "",
    SUPABASE_PUBLISHABLE_KEY || ""
);
