// js/auth.js - COMPLETE CLEAN
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
    setTimeout(() => el.style.display = 'none', 5000);
  }

  // Get Supabase client from multiple sources
  function getSupabase() {
    // Try supabaseClient first
    if (typeof supabaseClient !== 'undefined' && supabaseClient && supabaseClient.auth) {
      return supabaseClient;
    }
    // Try window.supabase
    if (typeof window.supabase !== 'undefined' && window.supabase && window.supabase.auth) {
      return window.supabase;
    }
    // Try supabase
    if (typeof supabase !== 'undefined' && supabase && supabase.auth) {
      return supabase;
    }
    return null;
  }

  // Wait for Supabase
  function waitForSupabase() {
    return new Promise(function(resolve) {
      // Check immediately
      var sb = getSupabase();
      if (sb && sb.auth) {
        console.log('✅ Supabase already ready');
        resolve(sb);
        return;
      }

      var attempts = 0;
      var maxAttempts = 30;
      var checkInterval = setInterval(function() {
        attempts++;
        var sb = getSupabase();
        if (sb && sb.auth) {
          console.log('✅ Supabase ready after ' + attempts + ' attempts');
          clearInterval(checkInterval);
          resolve(sb);
        } else if (attempts >= maxAttempts) {
          console.error('❌ Supabase failed to load after ' + attempts + ' attempts');
          clearInterval(checkInterval);
          
          // Try to manually create
          try {
            console.log('🔄 Attempting manual creation...');
            var url = 'https://iiiwpjpewleftgxhspik.supabase.co';
            var key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpaXdwanBld2xlZnRneGhzcGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDQ1NTgsImV4cCI6MjA5ODkyMDU1OH0.yFQM2kt62O7I-zMl5fJwym3OHQc4U-TbMof9oIv5G3s';
            
            if (window.supabase && window.supabase.createClient) {
              var newClient = window.supabase.createClient(url, key);
              window.supabaseClient = newClient;
              window.supabase = newClient;
              if (typeof supabase === 'undefined') {
                var supabase = newClient;
              }
              console.log('✅ Manually created Supabase client');
              resolve(newClient);
            } else {
              resolve(null);
            }
          } catch (err) {
            console.error('Manual creation failed:', err);
            resolve(null);
          }
        }
      }, 100);
    });
  }

  async function checkSession() {
    try {
      var sb = getSupabase();
      if (!sb || !sb.auth) return false;
      
      var result = await sb.auth.getSession();
      var session = result.data.session;
      
      if (session) {
        try {
          var profileResult = await sb
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          var profile = profileResult.data;
          
          localStorage.setItem('nexus_user', JSON.stringify({
            id: session.user.id,
            username: profile?.username || session.user.email?.split('@')[0] || 'user'
          }));
        } catch (e) {
          // Profile might not exist yet
          localStorage.setItem('nexus_user', JSON.stringify({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'user'
          }));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  console.log('⏳ Waiting for Supabase...');
  
  waitForSupabase().then(function(sb) {
    if (!sb) {
      console.error('❌ Failed to get Supabase client. Please refresh.');
      var errorEl = document.getElementById('signupError');
      if (errorEl) {
        errorEl.textContent = 'Database connection error. Please refresh the page.';
        errorEl.style.display = 'block';
      }
      return;
    }
    
    console.log('✅ Supabase ready for auth');

    // SIGNUP
    if (page === 'signup.html') {
      var btnSignup = document.getElementById('btnSignup');
      if (btnSignup) {
        btnSignup.addEventListener('click', async function(e) {
          e.preventDefault();
          
          var username = document.getElementById('signupUsername').value.trim();
          var password = document.getElementById('signupPassword').value;
          var confirm = document.getElementById('signupConfirm').value;

          // Validation
          if (!username || !password) { 
            showError('signupError', 'All fields required'); 
            return; 
          }
          if (password !== confirm) { 
            showError('signupError', 'Passwords do not match'); 
            return; 
          }
          if (password.length < 8) { 
            showError('signupError', 'Password must be at least 8 characters'); 
            return; 
          }

          // Password strength check
          var hasUpperCase = /[A-Z]/.test(password);
          var hasLowerCase = /[a-z]/.test(password);
          var hasNumber = /[0-9]/.test(password);
          var hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

          if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
            showError('signupError', 'Password must contain uppercase, lowercase, number and special character');
            return;
          }

          try {
            var currentSb = getSupabase();
            if (!currentSb) {
              showError('signupError', 'Database connection error. Please refresh.');
              return;
            }

            console.log('📝 Creating user:', username);

            // Sign up with Supabase Auth
            var authResult = await currentSb.auth.signUp({
              email: username.toLowerCase() + '@nexus.local',
              password: password,
              options: {
                data: { username: username }
              }
            });

            if (authResult.error) {
              console.error('Auth error:', authResult.error);
              if (authResult.error.message.includes('already registered')) {
                showError('signupError', 'Username already taken');
              } else if (authResult.error.message.includes('weak password')) {
                showError('signupError', 'Password too weak.');
              } else {
                showError('signupError', authResult.error.message);
              }
              return;
            }

            if (!authResult.data || !authResult.data.user) {
              showError('signupError', 'Failed to create account');
              return;
            }

            console.log('✅ User created:', authResult.data.user.id);

            // Create profile in profiles table
            try {
              var profileResult = await currentSb
                .from('profiles')
                .insert({
                  id: authResult.data.user.id,
                  username: username,
                  email: username.toLowerCase() + '@nexus.local',
                  selected_auras: [],
                  wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
                  bio: 'Building my energy. One aura at a time. ⚡'
                });

              if (profileResult.error) {
                console.error('Profile error:', profileResult.error);
                // Don't fail the signup if profile creation fails
              }
            } catch (profileErr) {
              console.error('Profile creation error:', profileErr);
            }

            // Save user to localStorage
            localStorage.setItem('nexus_user', JSON.stringify({ 
              id: authResult.data.user.id, 
              username: username 
            }));

            toast('Account created! ✨');
            setTimeout(function() {
              window.location.href = 'app.html';
            }, 500);

          } catch (error) {
            console.error('Signup error:', error);
            showError('signupError', 'Something went wrong: ' + error.message);
          }
        });
      }
    }

    // LOGIN
    if (page === 'login.html') {
      var btnLogin = document.getElementById('btnLogin');
      if (btnLogin) {
        btnLogin.addEventListener('click', async function(e) {
          e.preventDefault();
          
          var username = document.getElementById('loginUsername').value.trim();
          var password = document.getElementById('loginPassword').value;

          if (!username || !password) { 
            showError('loginError', 'All fields required'); 
            return; 
          }

          try {
            var currentSb = getSupabase();
            if (!currentSb) {
              showError('loginError', 'Database connection error. Please refresh.');
              return;
            }

            console.log('🔑 Logging in:', username);

            var authResult = await currentSb.auth.signInWithPassword({
              email: username.toLowerCase() + '@nexus.local',
              password: password
            });

            if (authResult.error) {
              console.error('Login error:', authResult.error);
              showError('loginError', 'Invalid username or password');
              return;
            }

            if (!authResult.data || !authResult.data.user) {
              showError('loginError', 'Login failed');
              return;
            }

            // Get profile
            try {
              var profileResult = await currentSb
                .from('profiles')
                .select('*')
                .eq('id', authResult.data.user.id)
                .single();

              var profile = profileResult.data;
              localStorage.setItem('nexus_user', JSON.stringify({ 
                id: authResult.data.user.id, 
                username: profile?.username || username 
              }));
            } catch (e) {
              localStorage.setItem('nexus_user', JSON.stringify({ 
                id: authResult.data.user.id, 
                username: username 
              }));
            }

            toast('Welcome back! 👋');
            setTimeout(function() {
              window.location.href = 'app.html';
            }, 500);

          } catch (error) {
            console.error('Login error:', error);
            showError('loginError', 'Something went wrong: ' + error.message);
          }
        });
      }
    }

    // Check existing session
    if ((page === 'login.html' || page === 'signup.html') && localStorage.getItem('nexus_user')) {
      checkSession().then(function(hasSession) {
        if (hasSession) {
          window.location.href = 'app.html';
        }
      });
    }
  });
})();