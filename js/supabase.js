// js/supabase.js - COMPLETE CLEAN
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Use a different variable name to avoid conflicts
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Only set window.supabase if it doesn't exist
if (!window.supabase) {
    window.supabase = supabaseClient;
}

// Only declare global supabase if it doesn't exist
if (typeof supabase === 'undefined') {
    var supabase = supabaseClient;
}

console.log('✅ Supabase client ready');
console.log('✅ Auth available:', !!supabase.auth);