const Nexus = {
  state: {
    user: null,
    selectedAuras: [],
    completedTasks: [],
    streakData: {},
    wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    diary: [],
    routines: [],
    socialPosts: [],
    likedPosts: [],
    chatMessages: [],
    bio: 'Building my energy. One aura at a time. ⚡',
    onlineInterval: null
  },

  init() {
    const saved = localStorage.getItem('nexus_user');
    if (!saved) { window.location.href = 'index.html'; return; }

    Nexus.state.user = JSON.parse(saved);
    Nexus.loadLocalData();
    Nexus.setBg(Nexus.state.wallpaper);
    document.getElementById('myUsername').textContent = Nexus.state.user.username;

    // Button listeners
    document.getElementById('btnConfirmAuras').addEventListener('click', () => Nexus.confirmSelection());
    document.getElementById('btnSaveDiary').addEventListener('click', () => Nexus.saveDiary());
    document.getElementById('btnSaveRoutine').addEventListener('click', () => Nexus.saveRoutine());
    document.getElementById('btnSendMessage').addEventListener('click', () => Nexus.sendMessage());
    document.getElementById('btnCreatePost').addEventListener('click', () => Nexus.createPost());
    document.getElementById('btnResetDay').addEventListener('click', () => Nexus.resetDay());
    document.getElementById('btnAuras').addEventListener('click', () => Nexus.navigate('select'));
    document.getElementById('btnRandomWallpaper').addEventListener('click', () => Nexus.randomWallpaper());
    document.getElementById('btnChangeUsername').addEventListener('click', () => Nexus.changeUsername());
    document.getElementById('btnEditProfile').addEventListener('click', () => Nexus.editProfile());
    document.getElementById('btnLogout').addEventListener('click', () => Nexus.logout());
    document.getElementById('btnProfileDashboard').addEventListener('click', () => Nexus.navigate('dashboard'));
    document.getElementById('btnProfileAuras').addEventListener('click', () => Nexus.navigate('select'));
    document.getElementById('btnWalls').addEventListener('click', () => Nexus.navigate('wallpapers'));
    document.getElementById('btnNewPost').addEventListener('click', () => document.getElementById('postInput').focus());

    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => Nexus.navigate(btn.dataset.page));
    });

    Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
    console.log('⚡ Nexus · id³ ready');
  },

  loadLocalData() {
    const key = 'nexus_data_' + Nexus.state.user.username;
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    Nexus.state.selectedAuras = saved.selectedAuras || [];
    Nexus.state.wallpaper = saved.wallpaper || Nexus.state.wallpaper;
    Nexus.state.diary = saved.diary || [];
    Nexus.state.routines = saved.routines || [];
    Nexus.state.socialPosts = saved.socialPosts || [];
    Nexus.state.likedPosts = saved.likedPosts || [];
    Nexus.state.streakData = saved.streakData || {};
    Nexus.state.completedTasks = saved.completedTasks || [];
    Nexus.state.bio = saved.bio || 'Building my energy. One aura at a time. ⚡';
  },

  saveLocalData() {
    const key = 'nexus_data_' + Nexus.state.user.username;
    localStorage.setItem(key, JSON.stringify({
      selectedAuras: Nexus.state.selectedAuras,
      wallpaper: Nexus.state.wallpaper,
      diary: Nexus.state.diary,
      routines: Nexus.state.routines,
      socialPosts: Nexus.state.socialPosts,
      likedPosts: Nexus.state.likedPosts,
      streakData: Nexus.state.streakData,
      completedTasks: Nexus.state.completedTasks,
      bio: Nexus.state.bio
    }));
  },

  navigate(page) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.page === page) b.classList.add('active');
    });

    document.getElementById('bottomNav').style.display = (page === 'select') ? 'none' : 'flex';

    if (page === 'select') Nexus.renderAuraGrid();
    if (page === 'dashboard') Nexus.renderDashboard();
    if (page === 'diary') Nexus.renderDiary();
    if (page === 'routine') Nexus.renderRoutines();
    if (page === 'chat') Nexus.renderChat();
    if (page === 'social') { Nexus.renderSocial(); Nexus.renderStories(); }
    if (page === 'profile') Nexus.renderProfile();
    if (page === 'wallpapers') Nexus.renderWallpapers();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 2200);
  },

  setBg(url) {
    Nexus.state.wallpaper = url;
    Nexus.saveLocalData();
    const s = document.createElement('style');
    s.textContent = `body::before{background-image:url('${url}')!important}`;
    document.querySelector('style[data-bg]')?.remove();
    s.setAttribute('data-bg', ''); document.head.appendChild(s);
  },

  logout() {
    if (!confirm('Logout?')) return;
    if (Nexus.state.onlineInterval) clearInterval(Nexus.state.onlineInterval);
    localStorage.removeItem('nexus_user');
    window.location.href = 'index.html';
  },

  // Auras
  toggleAura(key) {
    const idx = Nexus.state.selectedAuras.indexOf(key);
    if (idx > -1) Nexus.state.selectedAuras.splice(idx, 1);
    else if (Nexus.state.selectedAuras.length < 3) Nexus.state.selectedAuras.push(key);
    Nexus.renderAuraGrid();
  },

  renderAuraGrid() {
    const grid = document.getElementById('auraGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(AURAS).map(([key, aura]) => {
      const sel = Nexus.state.selectedAuras.includes(key);
      return `<div class="aura-btn${sel ? ' selected' : ''}" onclick="Nexus.toggleAura('${key}')">
        <span class="emoji">${aura.emoji}</span><div class="info"><h3>${aura.name}</h3><p>${aura.desc}</p></div><span class="check-mark">✓</span></div>`;
    }).join('');
    document.getElementById('counter').textContent = Nexus.state.selectedAuras.length;
  },

  confirmSelection() {
    if (!Nexus.state.selectedAuras.length) { Nexus.toast('Select at least one'); return; }
    Nexus.saveLocalData();
    Nexus.navigate('social');
    Nexus.toast('Auras activated');
  },

  // Dashboard
  async toggleTask(index) {
    const today = new Date().toISOString().split('T')[0];
    const idx = Nexus.state.completedTasks.indexOf(index);
    if (idx > -1) Nexus.state.completedTasks.splice(idx, 1);
    else Nexus.state.completedTasks.push(index);

    // Check streak
    const tasks = getTasks();
    const total = tasks.length;
    const done = Nexus.state.completedTasks.filter(i => i < total).length;
    if (done === total && total > 0) Nexus.state.streakData[today] = true;
    else delete Nexus.state.streakData[today];

    Nexus.saveLocalData();
    Nexus.renderDashboard();
  },

  calcScore() {
    const tasks = getTasks(), total = tasks.length, done = Nexus.state.completedTasks.filter(i => i < total).length;
    return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  },

  calcStreak() {
    let s = 0; const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      if (Nexus.state.streakData[d.toISOString().split('T')[0]]) s++; else break;
    }
    return s;
  },

  resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    const today = new Date().toISOString().split('T')[0];
    Nexus.state.completedTasks = [];
    delete Nexus.state.streakData[today];
    Nexus.saveLocalData();
    Nexus.renderDashboard();
  },

  renderDashboard() {
    if (!Nexus.state.selectedAuras.length) { Nexus.navigate('select'); return; }
    const tasks = getTasks(), { pct, done, total } = Nexus.calcScore(), streak = Nexus.calcStreak();
    const primaryAura = AURAS[Nexus.state.selectedAuras[0]];
    const circ = 2 * Math.PI * 43, offset = circ - (pct / 100) * circ;

    document.getElementById('homeTitle').textContent = Nexus.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
    document.getElementById('homeBadge').textContent = '⚡ ' + Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('');
    document.getElementById('score').textContent = pct + '%';
    document.getElementById('taskProgress').textContent = done + '/' + total;
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('tasksDone').textContent = Nexus.state.completedTasks.length;
    document.getElementById('diaryCount').textContent = Nexus.state.diary.length;
    document.getElementById('msgCount').textContent = JSON.parse(localStorage.getItem('nexus_chat') || '[]').filter(m => m.username === Nexus.state.user?.username).length;

    const ring = document.getElementById('scoreRing');
    ring.style.strokeDashoffset = offset;
    if (primaryAura) ring.style.stroke = primaryAura.accent;

    document.getElementById('tasks').innerHTML = tasks.map((t, i) => {
      const c = Nexus.state.completedTasks.includes(i);
      return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})"><div class="check-box">${c ? '✓' : ''}</div><span class="task-text">${t}</span></div>`;
    }).join('');

    Nexus.renderCalendar();
  },

  renderCalendar() {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), dim = new Date(y, m + 1, 0).getDate(), fd = new Date(y, m, 1).getDay();
    document.getElementById('monthLabel').textContent = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });
    const cal = document.getElementById('calendar'); cal.innerHTML = '';
    ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => { const div = document.createElement('div'); div.className = 'cal-day weekday'; div.textContent = d; cal.appendChild(div); });
    for (let i = 0; i < fd; i++) { const div = document.createElement('div'); div.className = 'cal-day'; div.style.background = 'transparent'; cal.appendChild(div); }
    for (let d = 1; d <= dim; d++) {
      const ds = new Date(y, m, d).toISOString().split('T')[0], div = document.createElement('div'); div.className = 'cal-day'; div.textContent = d;
      if (Nexus.state.streakData[ds]) { div.classList.add('active'); const pa = AURAS[Nexus.state.selectedAuras[0]]; if (pa) div.style.background = pa.accent; }
      if (d === now.getDate() && m === now.getMonth() && y === now.getFullYear()) div.classList.add('today');
      cal.appendChild(div);
    }
  },

  // Profile
  editProfile() {
    const newBio = prompt('Edit your bio:', Nexus.state.bio || '');
    if (newBio !== null) {
      Nexus.state.bio = newBio.trim() || 'Building my energy. One aura at a time. ⚡';
      Nexus.saveLocalData();
      Nexus.renderProfile();
      Nexus.toast('Bio updated');
    }
  },

  changeUsername() {
    const newName = prompt('Enter new username:', Nexus.state.user.username);
    if (newName && newName.trim()) {
      Nexus.state.user.username = newName.trim();
      localStorage.setItem('nexus_user', JSON.stringify(Nexus.state.user));
      document.getElementById('myUsername').textContent = Nexus.state.user.username;
      Nexus.saveLocalData();
      Nexus.toast('Username updated');
    }
  },

  renderProfile() {
    const avatarEmoji = Nexus.state.selectedAuras.length ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
    document.getElementById('profileAvatarEmoji').textContent = avatarEmoji;
    document.getElementById('profileName').textContent = Nexus.state.user?.username || '—';
    document.getElementById('profileUsername').textContent = '@' + (Nexus.state.user?.username || '—');
    document.getElementById('profilePosts').textContent = Nexus.state.socialPosts.filter(p => p.author === Nexus.state.user?.username).length;
    document.getElementById('profileFollowers').textContent = Math.floor(Math.random() * 100) + 10;
    document.getElementById('profileFollowing').textContent = Math.floor(Math.random() * 50) + 5;
    document.getElementById('profileBio').textContent = Nexus.state.bio || 'Building my energy. One aura at a time. ⚡';

    const grid = document.getElementById('profilePostsGrid');
    const userPosts = Nexus.state.socialPosts.filter(p => p.author === Nexus.state.user?.username);
    if (!userPosts.length) {
      grid.innerHTML = '<p style="color:#94a3b8;text-align:center;grid-column:1/-1;padding:16px 0;">No posts yet.</p>';
      return;
    }
    grid.innerHTML = userPosts.map(p => `
      <div style="aspect-ratio:1;background-image:url('${p.image || UNSPLASH[0]}');background-size:cover;background-position:center;border-radius:4px;cursor:pointer;" onclick="Nexus.toast('${p.text.substring(0,30).replace(/'/g, "\\'")}...')"></div>
    `).join('');
  }
};

// Init
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Nexus.init());
else Nexus.init();