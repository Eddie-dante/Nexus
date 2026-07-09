// js/supabase.js - COMPLETE FIXED
const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';

// Clear any existing supabase variable
if (typeof window.supabase !== 'undefined') {
    delete window.supabase;
}

// Create the client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make sure it's on the window object
window.supabase = supabase;

console.log('✅ Supabase client created');
console.log('✅ Supabase auth available:', typeof supabase.auth !== 'undefined');
console.log('✅ Supabase from available:', typeof supabase.from === 'function');

// Enhanced error handling wrapper
const db = {
  async query(table, operation, params = {}) {
    try {
      let result;
      switch(operation) {
        case 'select':
          result = await supabase
            .from(table)
            .select(params.columns || '*')
            .eq(params.field || 'id', params.value)
            .single();
          break;
        case 'selectAll':
          result = await supabase
            .from(table)
            .select(params.columns || '*')
            .order(params.orderBy || 'created_at', { ascending: false })
            .limit(params.limit || 50);
          break;
        case 'insert':
          result = await supabase
            .from(table)
            .insert(params.data)
            .select();
          break;
        case 'update':
          result = await supabase
            .from(table)
            .update(params.data)
            .eq(params.field || 'id', params.value)
            .select();
          break;
        case 'delete':
          result = await supabase
            .from(table)
            .delete()
            .eq(params.field || 'id', params.value);
          break;
      }
      if (result?.error) throw result.error;
      return result?.data || null;
    } catch (error) {
      console.error(`❌ DB Error [${table}.${operation}]:`, error);
      throw error;
    }
  }
};