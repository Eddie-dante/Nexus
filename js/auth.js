// js/auth.js - COMPLETE
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

  // Get Supabase client
  function getSupabase() {
    // Try supabaseClient first (our variable)
    if (typeof supabaseClient !== 'undefined' && supabaseClient && typeof supabaseClient.from === 'function') {
      return supabaseClient;
    }
    // Try global supabase
    if (typeof supabase !== 'undefined' && supabase && typeof supabase.from === 'function') {
      return supabase;
    }
    // Try window.supabase
    if (typeof window.supabase !== 'undefined' && window.supabase && typeof window.supabase.from === 'function') {
      return window.supabase;
    }
    // Try window.supabaseClient
    if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient && typeof window.supabaseClient.from === 'function') {
      return window.supabaseClient;
    }
    return null;
  }

  // Wait for Supabase
  function waitForSupabase() {
    return new Promise((resolve) => {
      const sb = getSupabase();
      if (sb && sb.auth && typeof sb.from === 'function') {
        console.log('✅ Supabase already ready');
        resolve(sb);
        return;
      }

      let attempts = 0;
      const maxAttempts = 50;
      const checkInterval = setInterval(() => {
        attempts++;
        const sb = getSupabase();
        if (sb && sb.auth && typeof sb.from === 'function') {
          console.log('✅ Supabase ready after ' + attempts + ' attempts');
          clearInterval(checkInterval);
          resolve(sb);
        } else if (attempts >= maxAttempts) {
          console.error('❌ Supabase failed to load');
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }

  async function checkSession() {
    try {
      const sb = getSupabase();
      if (!sb || !sb.auth) return false;
      
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

  console.log('⏳ Waiting for Supabase...');
  
  waitForSupabase().then((sb) => {
    if (!sb) {
      console.error('❌ Failed to get Supabase client');
      return;
    }
    
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
          if (password.length < 8) { 
            showError('signupError', 'Password must be at least 8 characters'); 
            return; 
          }

          // Check password strength
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

          if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
            showError('signupError', 'Password must contain uppercase, lowercase, number and special character');
            return;
          }

          try {
            const currentSb = getSupabase();
            if (!currentSb) {
              showError('signupError', 'Database connection error');
              return;
            }

            console.log('📝 Creating user:', username);

            // First, check if username exists
            const { data: existing } = await currentSb
              .from('profiles')
              .select('username')
              .eq('username', username)
              .maybeSingle();

            if (existing) {
              showError('signupError', 'Username already taken');
              return;
            }

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
              } else if (error.message.includes('weak password')) {
                showError('signupError', 'Password too weak. Use uppercase, lowercase, number and special character.');
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
              // Try to delete the auth user if profile creation fails
              try {
                await currentSb.auth.admin.deleteUser(data.user.id);
              } catch (e) {
                console.error('Failed to cleanup auth user:', e);
              }
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
              showError('loginError', 'Database connection error');
              return;
            }

            console.log('🔑 Logging in:', username);

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