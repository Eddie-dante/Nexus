// Supabase Configuration
const SUPABASE_URL = "https://iiiwpjpewleftgxhspik.supabase.co";
const SUPABASE_KEY = "sb_publishable_tvwgDpWLE5e1g9wfdidkJg_eLO1dAxK";

// Create Supabase Client
const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Export globally (optional, useful for other JS files)
window.supabaseClient = supabase;