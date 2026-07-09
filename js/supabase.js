// js/supabase.js - COMPLETE FIXED
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Clear any existing to avoid conflicts
if (typeof window._supabase !== 'undefined') {
    delete window._supabase;
}
if (typeof window.supabase !== 'undefined') {
    delete window.supabase;
}
if (typeof window.supabaseClient !== 'undefined') {
    delete window.supabaseClient;
}

// Create the client
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Store in multiple places for compatibility
window._supabase = _supabase;
window.supabase = _supabase;
window.supabaseClient = _supabase;

// Also create a global variable
if (typeof supabase === 'undefined') {
    var supabase = _supabase;
}

console.log('✅ Supabase client created and ready');
console.log('✅ supabase.from available:', typeof supabase.from === 'function');
console.log('✅ supabase.auth available:', typeof supabase.auth !== 'undefined');