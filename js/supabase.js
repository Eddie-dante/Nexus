// js/supabase.js - COMPLETE
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Create the client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make it available globally
if (!window.supabase) {
    window.supabase = supabaseClient;
}

if (typeof supabase === 'undefined') {
    var supabase = supabaseClient;
}

console.log('✅ Supabase client ready');
console.log('✅ Auth available:', !!supabase.auth);