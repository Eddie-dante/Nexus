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

  // Wait for Supabase to be ready with auth
  function waitForSupabase() {
    return new Promise((resolve) => {
      // Check if supabase exists and has auth
      if (typeof supabase !== 'undefined' && supabase.auth) {
        console.log('✅ Supabase already ready');
        resolve();
        return;
      }

      // If supabase exists but auth is loading, wait
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkInterval = setInterval(() => {
        attempts++;
        if (typeof supabase !== 'undefined' && supabase.auth) {
          console.log('✅ Supabase ready after ' + attempts + ' attempts');
          clearInterval(checkInterval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('❌ Supabase failed to load after ' + maxAttempts + ' attempts');
          clearInterval(checkInterval);
          // Try to reload supabase script
          if (typeof supabase === 'undefined') {
            console.log('🔄 Reloading Supabase script...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = function() {
              console.log('✅ Supabase script reloaded');
              // Recreate client
              const SUPABASE_URL = 'https://iiiwpjpewleftgxhspik.supabase.co';
              const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';
              if (typeof window.supabase !== 'undefined') {
                window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                resolve();
              }
            };
            document.head.appendChild(script);
          }
          resolve();
        }
      }, 100);
    });
  }

  async function checkSession() {
    try {
      if (typeof supabase === 'undefined' || !supabase.auth) {
        console.warn('Supabase not ready yet');
        return false;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
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
  waitForSupabase().then(() => {
    console.log('✅ Supabase ready for auth');

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
            // Check if username exists in profiles
            const { data: existing } = await supabase
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
            const { data, error } = await supabase.auth.signUp({
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
            const { error: profileError } = await supabase
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
            console.log('🔑 Logging in:', username.toLowerCase() + '@nexus.local');

            const { data, error } = await supabase.auth.signInWithPassword({
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

            const { data: profile } = await supabase
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