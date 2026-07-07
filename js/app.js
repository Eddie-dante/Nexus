const Nexus = {
  state: {
    user: null,           // { id, username }
    profile: null,
    selectedAuras: [],
    completedTasks: [],
    streakData: {},
    wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    diary: [],
    routines: [],
    socialPosts: [],
    likedPosts: [],
    chatMessages: []
  },

  init() {
    // Load user from localStorage
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      Nexus.state.user = JSON.parse(savedUser);
      Nexus.loadProfileFromLocal();
      Nexus.showApp();
    } else {
      Nexus.showAuth();
    }

    // Button listeners
    document.getElementById('btnInitiate').addEventListener('click', () => {
      if (Nexus.state.user) {
        Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
      }
    });

    document.getElementById('btnConfirmAuras').addEventListener('click', () => Nexus.confirmSelection());
    document.getElementById('btnSaveDiary').addEventListener('click', () => Nexus.saveDiary());
    document.getElementById('btnSaveRoutine').addEventListener('click', () => Nexus.saveRoutine());
    document.getElementById('btnSendMessage').addEventListener('click', () => Nexus.sendMessage());
    document.getElementById('btnCreatePost').addEventListener('click', () => Nexus.createPost());

    console.log('⚡ Nexus · id³ ready');
  },

  loadProfileFromLocal() {
    const saved = localStorage.getItem('nexus_profile');
    if (saved) {
      const p = JSON.parse(saved);
      Nexus.state.selectedAuras = p.selectedAuras || [];
      Nexus.state.wallpaper = p.wallpaper || Nexus.state.wallpaper;
      Nexus.setBg(Nexus.state.wallpaper);
    }
  },

  saveProfileToLocal() {
    localStorage.setItem('nexus_profile', JSON.stringify({
      selectedAuras: Nexus.state.selectedAuras,
      wallpaper: Nexus.state.wallpaper
    }));
  },

  showAuth() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('bottomNav').style.display = 'none';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-landing').classList.add('active');
  },

  showApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('myUsername').textContent = Nexus.state.user?.username || '—';
    document.getElementById('bottomNav').style.display = 'flex';
    Nexus.setBg(Nexus.state.wallpaper);

    if (Nexus.state.selectedAuras.length) {
      Nexus.navigate('social');
    } else {
      Nexus.navigate('select');
    }
  },

  signUp() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const username = document.getElementById('authUsername').value.trim();

    if (!username || !password) {
      Nexus.authError('Username and password required');
      return;
    }

    // Check if username already exists locally
    const existing = localStorage.getItem('nexus_user');
    if (existing) {
      const u = JSON.parse(existing);
      if (u.username === username) {
        Nexus.authError('Username already exists on this device');
        return;
      }
    }

    // Create user
    const user = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      username: username,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('nexus_user', JSON.stringify(user));
    localStorage.setItem('nexus_password', password); // simple local auth

    Nexus.state.user = user;
    Nexus.toast('Account created! Welcome, ' + username + '!');
    Nexus.showApp();
  },

  signIn() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const username = document.getElementById('authUsername').value.trim();

    if (!password) {
      Nexus.authError('Password required');
      return;
    }

    const savedUser = localStorage.getItem('nexus_user');
    const savedPassword = localStorage.getItem('nexus_password');

    if (!savedUser) {
      Nexus.authError('No account found on this device. Create one first.');
      return;
    }

    if (savedPassword !== password) {
      Nexus.authError('Incorrect password');
      return;
    }

    Nexus.state.user = JSON.parse(savedUser);
    Nexus.loadProfileFromLocal();
    Nexus.showApp();
    Nexus.toast('Welcome back, ' + Nexus.state.user.username + '!');
  },

  signOut() {
    Nexus.state.user = null;
    Nexus.state.selectedAuras = [];
    Nexus.showAuth();
    Nexus.toast('Signed out');
  },

  authError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
  },

  navigate(page) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.page === page) b.classList.add('active');
    });

    document.getElementById('bottomNav').style.display =
      (page === 'landing' || page === 'select') ? 'none' : 'flex';

    if (page === 'select') Nexus.renderAuraGrid();
    if (page === 'dashboard') Nexus.renderDashboard();
    if (page === 'diary') Nexus.renderDiary();
    if (page === 'routine') Nexus.renderRoutines();
    if (page === 'chat') Nexus.renderChat();
    if (page === 'social') Nexus.renderSocial();
    if (page === 'wallpapers') Nexus.renderWallpapers();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 2200);
  },

  setBg(url) {
    const s = document.createElement('style');
    s.textContent = `body::before{background-image:url('${url}')!important}`;
    const old = document.querySelector('style[data-bg]');
    if (old) old.remove();
    s.setAttribute('data-bg', '');
    document.head.appendChild(s);
  },

  toggleAura(key) {
    const idx = Nexus.state.selectedAuras.indexOf(key);
    if (idx > -1) {
      Nexus.state.selectedAuras.splice(idx, 1);
    } else if (Nexus.state.selectedAuras.length < 3) {
      Nexus.state.selectedAuras.push(key);
    }
    Nexus.renderAuraGrid();
  },

  renderAuraGrid() {
    const grid = document.getElementById('auraGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(AURAS).map(([key, aura]) => {
      const sel = Nexus.state.selectedAuras.includes(key);
      return `<div class="aura-btn${sel ? ' selected' : ''}" onclick="Nexus.toggleAura('${key}')">
        <span class="emoji">${aura.emoji}</span>
        <div class="info"><h3>${aura.name}</h3><p>${aura.desc}</p></div>
        <span class="check-mark">✓</span>
      </div>`;
    }).join('');
    document.getElementById('counter').textContent = Nexus.state.selectedAuras.length;
  },

  confirmSelection() {
    if (Nexus.state.selectedAuras.length === 0) {
      Nexus.toast('Select at least one aura');
      return;
    }
    Nexus.saveProfileToLocal();
    Nexus.navigate('social');
    Nexus.toast('Auras activated');
  },

  toggleTask(index) {
    const today = new Date().toISOString().split('T')[0];
    const key = 'nexus_tasks_' + today;

    const idx = Nexus.state.completedTasks.indexOf(index);
    if (idx > -1) {
      Nexus.state.completedTasks.splice(idx, 1);
    } else {
      Nexus.state.completedTasks.push(index);
    }

    localStorage.setItem(key, JSON.stringify(Nexus.state.completedTasks));
    Nexus.renderDashboard();
  },

  loadTaskCompletions() {
    const today = new Date().toISOString().split('T')[0];
    const key = 'nexus_tasks_' + today;
    const saved = localStorage.getItem(key);
    Nexus.state.completedTasks = saved ? JSON.parse(saved) : [];
  },

  loadStreakData() {
    const saved = localStorage.getItem('nexus_streaks');
    Nexus.state.streakData = saved ? JSON.parse(saved) : {};
  },

  saveStreakData() {
    localStorage.setItem('nexus_streaks', JSON.stringify(Nexus.state.streakData));
  },

  calcScore() {
    const tasks = getTasks();
    const total = tasks.length;
    const done = Nexus.state.completedTasks.filter(i => i < total).length;
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  },

  calcStreak() {
    let s = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (Nexus.state.streakData[key]) s++;
      else break;
    }
    return s;
  },

  resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    const today = new Date().toISOString().split('T')[0];
    const taskKey = 'nexus_tasks_' + today;
    localStorage.removeItem(taskKey);
    delete Nexus.state.streakData[today];
    Nexus.saveStreakData();
    Nexus.state.completedTasks = [];
    Nexus.renderDashboard();
  },

  renderDashboard() {
    Nexus.loadTaskCompletions();
    Nexus.loadStreakData();

    const tasks = getTasks();
    const { pct, done, total } = Nexus.calcScore();
    const streak = Nexus.calcStreak();
    const primaryAura = AURAS[Nexus.state.selectedAuras[0]];
    const circ = 2 * Math.PI * 43;
    const offset = circ - (pct / 100) * circ;

    document.getElementById('homeTitle').textContent = Nexus.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
    document.getElementById('homeBadge').textContent = '⚡ ' + Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('');
    document.getElementById('score').textContent = pct + '%';
    document.getElementById('taskProgress').textContent = done + '/' + total;
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('tasksDone').textContent = Nexus.state.completedTasks.length;

    // Update diary and message counts
    const diaryData = JSON.parse(localStorage.getItem('nexus_diary') || '[]');
    const chatData = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
    document.getElementById('diaryCount').textContent = diaryData.length;
    document.getElementById('msgCount').textContent = chatData.filter(m => m.username === Nexus.state.user?.username).length;

    const ring = document.getElementById('scoreRing');
    ring.style.strokeDashoffset = offset;
    if (primaryAura) ring.style.stroke = primaryAura.accent;

    document.getElementById('tasks').innerHTML = tasks.map((t, i) => {
      const c = Nexus.state.completedTasks.includes(i);
      return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})">
        <div class="check-box">${c ? '✓' : ''}</div>
        <span class="task-text">${t}</span>
      </div>`;
    }).join('');

    Nexus.renderCalendar();
  },

  renderCalendar() {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const fd = new Date(y, m, 1).getDay();

    document.getElementById('monthLabel').textContent = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });
    const cal = document.getElementById('calendar');
    cal.innerHTML = '';

    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
      const div = document.createElement('div');
      div.className = 'cal-day weekday';
      div.textContent = d;
      cal.appendChild(div);
    });

    for (let i = 0; i < fd; i++) {
      const div = document.createElement('div');
      div.className = 'cal-day';
      div.style.background = 'transparent';
      cal.appendChild(div);
    }

    for (let d = 1; d <= dim; d++) {
      const ds = new Date(y, m, d).toISOString().split('T')[0];
      const div = document.createElement('div');
      div.className = 'cal-day';
      div.textContent = d;

      if (Nexus.state.streakData[ds]) {
        div.classList.add('active');
        const primaryAura = AURAS[Nexus.state.selectedAuras[0]];
        if (primaryAura) div.style.background = primaryAura.accent;
      }
      if (d === now.getDate() && m === now.getMonth() && y === now.getFullYear()) {
        div.classList.add('today');
      }
      cal.appendChild(div);
    }
  },

  // Diary
  saveDiary() {
    const content = document.getElementById('diaryInput').value.trim();
    const mood = document.getElementById('diaryMood').value.trim() || '—';
    if (!content) { Nexus.toast('Write something'); return; }

    const diary = JSON.parse(localStorage.getItem('nexus_diary') || '[]');
    diary.unshift({ id: Date.now().toString(), content, mood, createdAt: new Date().toISOString() });
    localStorage.setItem('nexus_diary', JSON.stringify(diary));

    document.getElementById('diaryInput').value = '';
    document.getElementById('diaryMood').value = '';
    Nexus.renderDiary();
    Nexus.toast('Saved');
  },

  deleteDiary(id) {
    let diary = JSON.parse(localStorage.getItem('nexus_diary') || '[]');
    diary = diary.filter(e => e.id !== id);
    localStorage.setItem('nexus_diary', JSON.stringify(diary));
    Nexus.renderDiary();
  },

  renderDiary() {
    const container = document.getElementById('diaryEntries');
    if (!container) return;

    const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
    let diary = JSON.parse(localStorage.getItem('nexus_diary') || '[]');

    if (search) diary = diary.filter(e => e.content.toLowerCase().includes(search));

    if (diary.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + (search ? 'No matches.' : 'No entries yet.') + '</p>';
      return;
    }

    container.innerHTML = diary.map(entry => `
      <div class="entry-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <small style="color:#94a3b8;">${new Date(entry.createdAt).toLocaleDateString()}</small>
          <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${entry.mood}</span>
        </div>
        <p style="font-size:12px;white-space:pre-wrap;">${entry.content}</p>
        <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${entry.id}')" style="margin-top:5px;">🗑️</button>
      </div>
    `).join('');
  },

  // Routines
  saveRoutine() {
    const title = document.getElementById('routineTitle').value.trim();
    const content = document.getElementById('routineInput').value.trim();
    if (!title || !content) { Nexus.toast('Add title & description'); return; }

    const routines = JSON.parse(localStorage.getItem('nexus_routines') || '[]');
    routines.unshift({ id: Date.now().toString(), title, content, createdAt: new Date().toISOString() });
    localStorage.setItem('nexus_routines', JSON.stringify(routines));

    document.getElementById('routineTitle').value = '';
    document.getElementById('routineInput').value = '';
    Nexus.renderRoutines();
    Nexus.toast('Saved');
  },

  deleteRoutine(id) {
    let routines = JSON.parse(localStorage.getItem('nexus_routines') || '[]');
    routines = routines.filter(r => r.id !== id);
    localStorage.setItem('nexus_routines', JSON.stringify(routines));
    Nexus.renderRoutines();
  },

  renderRoutines() {
    const container = document.getElementById('routineEntries');
    if (!container) return;

    const routines = JSON.parse(localStorage.getItem('nexus_routines') || '[]');

    if (routines.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">No routines yet.</p>';
      return;
    }

    container.innerHTML = routines.map(r => `
      <div class="entry-card">
        <strong>${r.title}</strong>
        <small style="color:#94a3b8;display:block;">${new Date(r.createdAt).toLocaleDateString()}</small>
        <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">${r.content}</p>
        <button class="btn-sm btn-danger" onclick="Nexus.deleteRoutine('${r.id}')" style="margin-top:5px;">🗑️</button>
      </div>
    `).join('');
  },

  // Chat (localStorage-based)
  sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !Nexus.state.user) return;

    const chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
    chat.push({
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
      username: Nexus.state.user.username,
      userId: Nexus.state.user.id,
      text,
      createdAt: new Date().toISOString()
    });

    if (chat.length > 200) chat.splice(0, chat.length - 200);
    localStorage.setItem('nexus_chat', JSON.stringify(chat));

    input.value = '';
    Nexus.renderChatMessages();
  },

  deleteMessage(id) {
    let chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
    chat = chat.filter(m => m.id !== id);
    localStorage.setItem('nexus_chat', JSON.stringify(chat));
    Nexus.renderChatMessages();
  },

  renderChat() {
    document.getElementById('myUsername').textContent = Nexus.state.user?.username || '—';
    Nexus.renderChatMessages();

    // Poll for new messages every second
    if (Nexus._chatInterval) clearInterval(Nexus._chatInterval);
    Nexus._chatInterval = setInterval(() => Nexus.renderChatMessages(), 1000);
  },

  renderChatMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');

    if (chat.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No messages yet.</p>';
      return;
    }

    container.innerHTML = chat.map(m => {
      const me = m.userId === Nexus.state.user?.id;
      const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin:3px 0;">
        <div style="max-width:82%;">
          <div class="chat-bubble ${me ? 'chat-sent' : 'chat-received'}">
            <div style="font-size:10px;font-weight:600;opacity:0.7;">${m.username} · ${time}</div>
            <p style="margin:2px 0 0;">${m.text}</p>
          </div>
          ${me ? `<button class="btn-sm btn-danger" onclick="Nexus.deleteMessage('${m.id}')" style="font-size:9px;padding:2px 5px;margin-top:1px;">🗑️</button>` : ''}
        </div>
      </div>`;
    }).join('');

    container.scrollTop = container.scrollHeight;
  },

  // Social
  createPost() {
    const text = document.getElementById('postInput').value.trim();
    if (!text || !Nexus.state.user) { Nexus.toast('Write something'); return; }

    const avatar = Nexus.state.selectedAuras.length > 0
      ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('')
      : '😊';

    const posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    posts.unshift({
      id: Date.now().toString(),
      userId: Nexus.state.user.id,
      author: Nexus.state.user.username,
      avatar,
      text,
      likes: 0,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('nexus_posts', JSON.stringify(posts));

    document.getElementById('postInput').value = '';
    Nexus.renderSocial();
    Nexus.toast('Posted');
  },

  likePost(postId) {
    const likedPosts = JSON.parse(localStorage.getItem('nexus_likedPosts') || '[]');
    const posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (likedPosts.includes(postId)) {
      const idx = likedPosts.indexOf(postId);
      likedPosts.splice(idx, 1);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      likedPosts.push(postId);
      post.likes++;
    }

    localStorage.setItem('nexus_likedPosts', JSON.stringify(likedPosts));
    localStorage.setItem('nexus_posts', JSON.stringify(posts));
    Nexus.renderSocial();
  },

  deletePost(postId) {
    let posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('nexus_posts', JSON.stringify(posts));

    let likedPosts = JSON.parse(localStorage.getItem('nexus_likedPosts') || '[]');
    likedPosts = likedPosts.filter(id => id !== postId);
    localStorage.setItem('nexus_likedPosts', JSON.stringify(likedPosts));

    Nexus.renderSocial();
  },

  renderSocial() {
    const container = document.getElementById('socialFeed');
    if (!container) return;

    const posts = JSON.parse(localStorage.getItem('nexus_posts') || '[]');
    const likedPosts = JSON.parse(localStorage.getItem('nexus_likedPosts') || '[]');

    if (posts.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No posts yet. Be the first!</p>';
      return;
    }

    container.innerHTML = posts.map(p => {
      const liked = likedPosts.includes(p.id);
      const isOwner = p.userId === Nexus.state.user?.id;
      return `<div class="post-card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <div class="post-avatar">${p.avatar}</div>
          <div>
            <strong>${p.author}</strong><br>
            <small style="color:#94a3b8;">${new Date(p.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
        <p style="font-size:12px;">${p.text}</p>
        <div class="post-actions">
          <span class="post-action${liked ? ' liked' : ''}" onclick="Nexus.likePost('${p.id}')">${liked ? '❤️' : '🤍'} ${p.likes}</span>
          ${isOwner ? `<span class="post-action" onclick="Nexus.deletePost('${p.id}')" style="color:#ef4444;">🗑️</span>` : ''}
        </div>
      </div>`;
    }).join('');
  },

  // Wallpapers
  setWallpaper(url) {
    Nexus.state.wallpaper = url;
    Nexus.setBg(url);
    Nexus.saveProfileToLocal();
    Nexus.renderWallpapers();
    Nexus.toast('Applied');
  },

  randomWallpaper() {
    Nexus.setWallpaper(UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]);
  },

  renderWallpapers() {
    document.getElementById('wpCount').textContent = UNSPLASH.length + '+ wallpapers';
    document.getElementById('wpGrid').innerHTML = UNSPLASH.map(url => {
      const selected = Nexus.state.wallpaper === url;
      return `<div class="wp-thumb${selected ? ' selected' : ''}" style="background-image:url('${url}')" onclick="Nexus.setWallpaper('${url}')"></div>`;
    }).join('');
  }
};

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
  Nexus.init();
}