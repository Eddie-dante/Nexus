// js/auth.js - COMPLETE REWRITE
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

  async function checkSession() {
    try {
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

  if (page === 'signup.html') {
    document.getElementById('btnSignup').addEventListener('click', async () => {
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
        // ✅ Use Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: `${username.toLowerCase()}@nexus.local`,
          password: password,
          options: {
            data: { username: username }
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            showError('signupError', 'Username already taken');
          } else {
            showError('signupError', error.message);
          }
          return;
        }

        // ✅ Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username,
            email: `${username.toLowerCase()}@nexus.local`,
            selected_auras: [],
            wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
            bio: 'Building my energy. One aura at a time. ⚡'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Cleanup
          await supabase.auth.admin.deleteUser(data.user.id);
          showError('signupError', 'Failed to create profile');
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
        showError('signupError', 'Something went wrong. Please try again.');
      }
    });
  }

  if (page === 'login.html') {
    document.getElementById('btnLogin').addEventListener('click', async () => {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!username || !password) { 
        showError('loginError', 'All fields required'); 
        return; 
      }

      try {
        // ✅ Use Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username.toLowerCase()}@nexus.local`,
          password: password
        });

        if (error) {
          showError('loginError', 'Invalid username or password');
          return;
        }

        // ✅ Get user profile
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
        showError('loginError', 'Something went wrong. Please try again.');
      }
    });
  }

  // ✅ Check existing session
  if ((page === 'login.html' || page === 'signup.html') && localStorage.getItem('nexus_user')) {
    checkSession().then(hasSession => {
      if (hasSession) {
        window.location.href = 'app.html';
      }
    });
  }
})();