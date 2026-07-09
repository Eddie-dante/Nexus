(function() {
  const page = window.location.pathname.split('/').pop();

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    const container = document.getElementById('toastContainer');
    if (container) { container.appendChild(t); setTimeout(() => t.remove(), 2200); }
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  }

  if (page === 'signup.html') {
    document.getElementById('btnSignup').addEventListener('click', async () => {
      const username = document.getElementById('signupUsername').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;

      if (!username || !password) { showError('signupError', 'All fields required'); return; }
      if (password !== confirm) { showError('signupError', 'Passwords do not match'); return; }
      if (password.length < 4) { showError('signupError', 'Password must be at least 4 characters'); return; }

      // Check locally first
      const localUsers = JSON.parse(localStorage.getItem('nexus_local_users') || '{}');
      if (localUsers[username]) { showError('signupError', 'Username taken on this device'); return; }

      // Try Supabase
      const id = crypto.randomUUID();
      const { error } = await supabase.from('profiles').insert({ id, username, password });

      // Also save locally as backup
      localUsers[username] = { id, password };
      localStorage.setItem('nexus_local_users', JSON.stringify(localUsers));

      if (error && error.code !== '23505') {
        // If Supabase fails but not duplicate, still allow local
        console.warn('Supabase signup issue, using local:', error.message);
      }

      localStorage.setItem('nexus_user', JSON.stringify({ id, username }));
      toast('Account created!');
      setTimeout(() => window.location.href = 'app.html', 500);
    });
  }

  if (page === 'login.html') {
    document.getElementById('btnLogin').addEventListener('click', async () => {
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!username || !password) { showError('loginError', 'All fields required'); return; }

      // Try Supabase first
      const { data } = await supabase.from('profiles').select('*').eq('username', username).eq('password', password).single();

      if (data) {
        localStorage.setItem('nexus_user', JSON.stringify({ id: data.id, username: data.username }));
        toast('Welcome back!');
        setTimeout(() => window.location.href = 'app.html', 500);
        return;
      }

      // Fallback to local
      const localUsers = JSON.parse(localStorage.getItem('nexus_local_users') || '{}');
      if (localUsers[username] && localUsers[username].password === password) {
        localStorage.setItem('nexus_user', JSON.stringify({ id: localUsers[username].id, username }));
        toast('Welcome back!');
        setTimeout(() => window.location.href = 'app.html', 500);
        return;
      }

      showError('loginError', 'Invalid username or password');
    });
  }

  // Redirect if already logged in
  if ((page === 'login.html' || page === 'signup.html') && localStorage.getItem('nexus_user')) {
    window.location.href = 'app.html';
  }
})();