// js/auth.js - COMPLETE FIXED
(function() {
  const page = window.location.pathname.split('/').pop();

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    const container = document.getElementById('toastContainer');
    if (container) { 
      container.appendChild(t); 
      setTimeout(() => t.remove(), 2200); 
    }
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }

  // Get Supabase client - try multiple sources
  function getSupabase() {
    // Try global supabase first
    if (typeof supabase !== 'undefined' && supabase && typeof supabase.from === 'function') {
      return supabase;
    }
    // Try window.supabase
    if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
      return window.supabase;
    }
    // Try window.supabaseClient (fallback)
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      return window.supabaseClient;
    }
    return null;
  }

  // Wait for Supabase to be ready with auth
  function waitForSupabase() {
    return new Promise((resolve) => {
      // First check if supabase exists and has auth
      const sb = getSupabase();
      if (sb && sb.auth && typeof sb.from === 'function') {
        console.log('✅ Supabase already ready');
        // Make sure it's globally available
        if (typeof supabase === 'undefined' || !supabase.from) {
          window.supabase = sb;
        }
        resolve(sb);
        return;
      }

      // If not, wait and retry
      let attempts = 0;
      const maxAttempts = 150; // 15 seconds max
      const checkInterval = setInterval(() => {
        attempts++;
        
        const sb = getSupabase();
        // Check if supabase exists and has all required methods
        if (sb && sb.auth && typeof sb.from === 'function') {
          console.log('✅ Supabase ready after ' + attempts + ' attempts');
          clearInterval(checkInterval);
          // Make sure it's globally available
          if (typeof supabase === 'undefined' || !supabase.from) {
            window.supabase = sb;
          }
          resolve(sb);
        } else if (attempts >= maxAttempts) {
          console.error('❌ Supabase failed to load after ' + maxAttempts + ' attempts');
          clearInterval(checkInterval);
          
          // Try to manually create the client
          console.log('🔄 Attempting to manually create Supabase client...');
          try {
            const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';
            
            // Check if supabase-js is loaded
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
              const newClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
              window.supabaseClient = newClient;
              window.supabase = newClient;
              // Also set global
              if (typeof supabase === 'undefined') {
                var supabase = newClient;
              }
              console.log('✅ Manually created Supabase client');
              resolve(newClient);
            } else {
              console.error('❌ Cannot create Supabase client - library not loaded');
              // Try reloading the script
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
              script.onload = function() {
                console.log('✅ Supabase script reloaded');
                try {
                  const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
                  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';
                  const newClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                  window.supabaseClient = newClient;
                  window.supabase = newClient;
                  if (typeof supabase === 'undefined') {
                    var supabase = newClient;
                  }
                  console.log('✅ Created Supabase client after reload');
                  resolve(newClient);
                } catch (err) {
                  console.error('Failed to create client after reload:', err);
                  resolve(null);
                }
              };
              script.onerror = function() {
                console.error('❌ Failed to reload Supabase script');
                resolve(null);
              };
              document.head.appendChild(script);
            }
          } catch (err) {
            console.error('Failed to manually create client:', err);
            resolve(null);
          }
        }
      }, 100);
    });
  }

  async function checkSession() {
    try {
      const sb = getSupabase();
      if (!sb || !sb.auth || typeof sb.from !== 'function') {
        console.warn('Supabase not ready yet');
        return false;
      }
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        const { data: profile } = await sb
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        localStorage.setItem('nexus_user', JSON.stringify({
          id: session.user.id,
          username: profile?.username || session.user.email?.split('@')[0] || 'user'
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  // Wait for Supabase before initializing
  console.log('⏳ Waiting for Supabase...');
  
  waitForSupabase().then((sb) => {
    if (!sb) {
      console.error('❌ Failed to get Supabase client. Please refresh the page.');
      return;
    }
    
    console.log('✅ Supabase ready for auth');
    console.log('✅ supabase.from available:', typeof sb.from === 'function');

    // Make sure we have a global reference
    if (typeof supabase === 'undefined' || !supabase.from) {
      window.supabase = sb;
      if (typeof supabase === 'undefined') {
        var supabase = sb;
      }
    }

    if (page === 'signup.html') {
      const btnSignup = document.getElementById('btnSignup');
      if (btnSignup) {
        btnSignup.addEventListener('click', async () => {
          const username = document.getElementById('signupUsername').value.trim();
          const password = document.getElementById('signupPassword').value;
          const confirm = document.getElementById('signupConfirm').value;

          if (!username || !password) { 
            showError('signupError', 'All fields required'); 
            return; 
          }
          if (password !== confirm) { 
            showError('signupError', 'Passwords do not match'); 
            return; 
          }
          if (password.length < 6) { 
            showError('signupError', 'Password must be at least 6 characters'); 
            return; 
          }

          try {
            const currentSb = getSupabase();
            if (!currentSb) {
              showError('signupError', 'Database connection error. Please refresh.');
              return;
            }

            // Check if username exists in profiles
            const { data: existing } = await currentSb
              .from('profiles')
              .select('id')
              .eq('username', username)
              .single();

            if (existing) {
              showError('signupError', 'Username already taken');
              return;
            }

            console.log('📝 Creating user with email:', username.toLowerCase() + '@nexus.local');

            // Create user with Supabase Auth
            const { data, error } = await currentSb.auth.signUp({
              email: username.toLowerCase() + '@nexus.local',
              password: password,
              options: {
                data: { username: username }
              }
            });

            if (error) {
              console.error('Auth error:', error);
              if (error.message.includes('already registered')) {
                showError('signupError', 'Username already taken');
              } else {
                showError('signupError', error.message);
              }
              return;
            }

            if (!data || !data.user) {
              showError('signupError', 'Failed to create account');
              return;
            }

            console.log('✅ User created:', data.user.id);

            // Create profile
            const { error: profileError } = await currentSb
              .from('profiles')
              .insert({
                id: data.user.id,
                username: username,
                email: username.toLowerCase() + '@nexus.local',
                selected_auras: [],
                wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
                bio: 'Building my energy. One aura at a time. ⚡'
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
              showError('signupError', 'Failed to create profile: ' + profileError.message);
              return;
            }

            localStorage.setItem('nexus_user', JSON.stringify({ 
              id: data.user.id, 
              username: username 
            }));

            toast('Account created! ✨');
            setTimeout(() => window.location.href = 'app.html', 500);
          } catch (error) {
            console.error('Signup error:', error);
            showError('signupError', 'Something went wrong: ' + error.message);
          }
        });
      } else {
        console.error('❌ btnSignup not found');
      }
    }

    if (page === 'login.html') {
      const btnLogin = document.getElementById('btnLogin');
      if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
          const username = document.getElementById('loginUsername').value.trim();
          const password = document.getElementById('loginPassword').value;

          if (!username || !password) { 
            showError('loginError', 'All fields required'); 
            return; 
          }

          try {
            const currentSb = getSupabase();
            if (!currentSb) {
              showError('loginError', 'Database connection error. Please refresh.');
              return;
            }

            console.log('🔑 Logging in:', username.toLowerCase() + '@nexus.local');

            const { data, error } = await currentSb.auth.signInWithPassword({
              email: username.toLowerCase() + '@nexus.local',
              password: password
            });

            if (error) {
              console.error('Login error:', error);
              showError('loginError', 'Invalid username or password');
              return;
            }

            if (!data || !data.user) {
              showError('loginError', 'Login failed');
              return;
            }

            const { data: profile } = await currentSb
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            localStorage.setItem('nexus_user', JSON.stringify({ 
              id: data.user.id, 
              username: profile?.username || username 
            }));

            toast('Welcome back! 👋');
            setTimeout(() => window.location.href = 'app.html', 500);
          } catch (error) {
            console.error('Login error:', error);
            showError('loginError', 'Something went wrong: ' + error.message);
          }
        });
      } else {
        console.error('❌ btnLogin not found');
      }
    }

    // Check existing session
    if ((page === 'login.html' || page === 'signup.html') && localStorage.getItem('nexus_user')) {
      checkSession().then(hasSession => {
        if (hasSession) {
          window.location.href = 'app.html';
        }
      });
    }
  });
})();