// Nexus Supabase Configuration

const SUPABASE_URL = "https://iiiwpjpewleftgxhspik.supabase.co";
const SUPABASE_KEY = "sb_publishable_tvwgDpWLE5e1g9wfdidkJg_eLO1dAxK";

// Create global Supabase client
window.supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("✅ Nexus Supabase Connected");