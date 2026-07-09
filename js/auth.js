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

      // Check if username exists in Supabase
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single();
      if (existing) { showError('signupError', 'Username already taken'); return; }

      const id = crypto.randomUUID();
      const { error } = await supabase.from('profiles').insert({
        id,
        username,
        password,
        selected_auras: [],
        wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80'
      });

      if (error) { showError('signupError', error.message); return; }

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

      const { data } = await supabase.from('profiles').select('*').eq('username', username).eq('password', password).single();

      if (!data) { showError('loginError', 'Invalid username or password'); return; }

      localStorage.setItem('nexus_user', JSON.stringify({ id: data.id, username: data.username }));
      toast('Welcome back!');
      setTimeout(() => window.location.href = 'app.html', 500);
    });
  }

  if ((page === 'login.html' || page === 'signup.html') && localStorage.getItem('nexus_user')) {
    window.location.href = 'app.html';
  }
})();