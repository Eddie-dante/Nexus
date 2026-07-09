// js/auth.js - LOCAL STORAGE AUTH
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

  // SIGNUP
  if (page === 'signup.html') {
    const btnSignup = document.getElementById('btnSignup');
    if (btnSignup) {
      btnSignup.addEventListener('click', function(e) {
        e.preventDefault();
        
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
        if (password.length < 4) { 
          showError('signupError', 'Password must be at least 4 characters'); 
          return; 
        }

        // Check if username exists
        const existing = Storage.findUser(username);
        if (existing) {
          showError('signupError', 'Username already taken');
          return;
        }

        // Create user
        const user = {
          id: 'user_' + Date.now(),
          username: username,
          password: password,
          created: new Date().toISOString()
        };

        // Save user
        const users = Storage.getAllUsers();
        users.push(user);
        Storage.set('nexus_users', users);

        // Log user in
        Storage.setUser({
          id: user.id,
          username: user.username
        });

        toast('Account created! ✨');
        setTimeout(function() {
          window.location.href = 'app.html';
        }, 500);
      });
    }
  }

  // LOGIN
  if (page === 'login.html') {
    const btnLogin = document.getElementById('btnLogin');
    if (btnLogin) {
      btnLogin.addEventListener('click', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) { 
          showError('loginError', 'All fields required'); 
          return; 
        }

        // Find user
        const user = Storage.findUser(username, password);
        if (!user) {
          showError('loginError', 'Invalid username or password');
          return;
        }

        // Log user in
        Storage.setUser({
          id: user.id,
          username: user.username
        });

        toast('Welcome back! 👋');
        setTimeout(function() {
          window.location.href = 'app.html';
        }, 500);
      });
    }
  }

  // Check if already logged in
  if ((page === 'login.html' || page === 'signup.html') && Storage.getUser()) {
    window.location.href = 'app.html';
  }
})();