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
    setTimeout(() => el.style.display = 'none', 5000);
  }

  if (page === 'signup.html') {
    const btnSignup = document.getElementById('btnSignup');
    if (btnSignup) {
      btnSignup.addEventListener('click', async function(e) {
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

        try {
          const result = await API.signup(username, password);
          if (result.success) {
            Storage.setUser(result.user);
            toast('Account created! ✨');
            setTimeout(() => window.location.href = 'app.html', 500);
          }
        } catch (error) {
          showError('signupError', error.message);
        }
      });
    }
  }

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
          const result = await API.login(username, password);
          if (result.success) {
            Storage.setUser(result.user);
            toast('Welcome back! 👋');
            setTimeout(() => window.location.href = 'app.html', 500);
          }
        } catch (error) {
          showError('loginError', error.message);
        }
      });
    }
  }

  if ((page === 'login.html' || page === 'signup.html') && Storage.getUser()) {
    window.location.href = 'app.html';
  }
})();