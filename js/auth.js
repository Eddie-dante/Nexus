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

  // Wait for Supabase
  function waitForSupabase() {
    return new Promise(function(resolve) {
      if (typeof supabase !== 'undefined' && supabase.auth) {
        resolve(supabase);
        return;
      }

      var attempts = 0;
      var maxAttempts = 50;
      var checkInterval = setInterval(function() {
        attempts++;
        if (typeof supabase !== 'undefined' && supabase.auth) {
          clearInterval(checkInterval);
          resolve(supabase);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.error('❌ Supabase failed to load');
          resolve(null);
        }
      }, 100);
    });
  }

  console.log('⏳ Waiting for Supabase...');
  
  waitForSupabase().then(function(sb) {
    if (!sb) {
      console.error('❌ Failed to get Supabase client');
      return;
    }
    
    console.log('✅ Supabase ready for auth');

    // SIGNUP
    if (page === 'signup.html') {
      const btnSignup = document.getElementById('btnSignup');
      if (btnSignup) {
        btnSignup.addEventListener('click', async function(e) {
          e.preventDefault();
          
          const username = document.getElementById('signupUsername').value.trim();
          const password = document.getElementById('signupPassword').value;
          const confirm = document.getElementById('signupConfirm').value;

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
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

          if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
            showError('signupError', 'Password must contain uppercase, lowercase, number and special character');
            return;
          }

          try {
            console.log('📝 Creating user:', username);

            // Sign up with Supabase Auth
            const { data, error } = await sb.auth.signUp({
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
                showError('signupError', 'Password too weak.');
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

            // Check if profile already exists
            const { data: existingProfile } = await sb
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();

            // Only create profile if it doesn't exist
            if (!existingProfile) {
              const { error: profileError } = await sb
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
                console.error('Profile error:', profileError);
                showError('signupError', 'Failed to create profile: ' + profileError.message);
                return;
              }
            }

            // Save user to localStorage
            localStorage.setItem('nexus_user', JSON.stringify({ 
              id: data.user.id, 
              username: username 
            }));

            toast('Account created! ✨');
            setTimeout(() => {
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
      const btnLogin = document.getElementById('btnLogin');
      if (btnLogin) {
        btnLogin.addEventListener('click', async function(e) {
          e.preventDefault();
          
          const username = document.getElementById('loginUsername').value.trim();
          const password = document.getElementById('loginPassword').value;

          if (!username || !password) { 
            showError('loginError', 'All fields required'); 
            return; 
          }

          try {
            console.log('🔑 Logging in:', username);

            const { data, error } = await sb.auth.signInWithPassword({
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

            // Get profile
            const { data: profile } = await sb
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();

            localStorage.setItem('nexus_user', JSON.stringify({ 
              id: data.user.id, 
              username: profile?.username || username 
            }));

            toast('Welcome back! 👋');
            setTimeout(() => {
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
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.location.href = 'app.html';
        }
      });
    }
  });
})();