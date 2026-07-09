// js/supabase.js - SIMPLIFIED
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Create the client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make sure it's on the window object
window.supabase = supabase;

console.log('✅ Supabase client created');
console.log('✅ Supabase auth available:', typeof supabase.auth !== 'undefined');
console.log('✅ Supabase from available:', typeof supabase.from === 'function');