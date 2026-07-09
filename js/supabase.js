// js/supabase.js - COMPLETE
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Check if supabase is already defined
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Use a different variable name to avoid conflicts
const supabaseClient = window.supabaseClient;

// Also make it available globally but check first
if (typeof supabase === 'undefined') {
    var supabase = supabaseClient;
} else {
    // If it exists, just use it
    console.log('✅ Supabase already exists');
}

console.log('✅ Supabase client ready');
console.log('✅ supabase.from available:', typeof supabase.from === 'function');