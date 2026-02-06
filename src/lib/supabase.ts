import { createClient } from '@supabase/supabase-js';

// process.env se keys uthayega (Jo tumne GitHub Secrets mein daal di hain)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
