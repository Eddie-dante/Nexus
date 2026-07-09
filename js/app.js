const Nexus = {
  state: {
    user: null,
    profile: null,
    selectedAuras: [],
    completedTasks: [],
    streakData: {},
    wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    likedPosts: [],
    bio: 'Building my energy. One aura at a time. ⚡',
    chatChannel: null
  },

  async init() {
    const saved = localStorage.getItem('nexus_user');
    if (!saved) { window.location.href = 'index.html'; return; }

    Nexus.state.user = JSON.parse(saved);
    await Nexus.loadProfile();
    Nexus.setBg(Nexus.state.wallpaper);

    // Button listeners
    document.getElementById('btnConfirmAuras')?.addEventListener('click', () => Nexus.confirmSelection());
    document.getElementById('btnSaveDiary')?.addEventListener('click', () => Nexus.saveDiary());
    document.getElementById('btnSaveRoutine')?.addEventListener('click', () => Nexus.saveRoutine());
    document.getElementById('btnSendMessage')?.addEventListener('click', () => Nexus.sendMessage());
    document.getElementById('btnCreatePost')?.addEventListener('click', () => Nexus.createPost());
    document.getElementById('btnResetDay')?.addEventListener('click', () => Nexus.resetDay());
    document.getElementById('btnAuras')?.addEventListener('click', () => Nexus.navigate('select'));
    document.getElementById('btnRandomWallpaper')?.addEventListener('click', () => Nexus.randomWallpaper());
    document.getElementById('btnChangeUsername')?.addEventListener('click', () => Nexus.changeUsername());
    document.getElementById('btnEditProfile')?.addEventListener('click', () => Nexus.editProfile());
    document.getElementById('btnLogout')?.addEventListener('click', () => Nexus.logout());
    document.getElementById('btnProfileDashboard')?.addEventListener('click', () => Nexus.navigate('dashboard'));
    document.getElementById('btnProfileAuras')?.addEventListener('click', () => Nexus.navigate('select'));
    document.getElementById('btnWalls')?.addEventListener('click', () => Nexus.navigate('wallpapers'));
    document.getElementById('btnNewPost')?.addEventListener('click', () => {
      const input = document.getElementById('postInput');
      if (input) input.focus();
    });

    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => Nexus.navigate(btn.dataset.page));
    });

    // Enter key for chat
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') Nexus.sendMessage();
    });

    Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
    console.log('⚡ Nexus · id³ ready');
  },

  async loadProfile() {
    if (!Nexus.state.user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', Nexus.state.user.id).single();
    if (data) {
      Nexus.state.profile = data;
      Nexus.state.selectedAuras = data.selected_auras || [];
      Nexus.state.wallpaper = data.wallpaper || Nexus.state.wallpaper;
      Nexus.state.bio = data.bio || 'Building my energy. One aura at a time. ⚡';
      await Nexus.loadTaskCompletions();
      await Nexus.loadStreakData();
    }
  },

  async loadTaskCompletions() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('task_completions').select('task_index').eq('user_id', Nexus.state.user.id).eq('completed_at', today);
    Nexus.state.completedTasks = (data || []).map(d => d.task_index);
  },

  async loadStreakData() {
    const { data } = await supabase.from('streak_days').select('streak_date').eq('user_id', Nexus.state.user.id);
    Nexus.state.streakData = {};
    (data || []).forEach(d => { Nexus.state.streakData[d.streak_date] = true; });
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
    if (page === 'social') Nexus.renderSocial();
    if (page === 'profile') Nexus.renderProfile();
    if (page === 'wallpapers') Nexus.renderWallpapers();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    const container = document.getElementById('toastContainer');
    if (container) { container.appendChild(t); setTimeout(() => t.remove(), 2200); }
  },

  setBg(url) {
    Nexus.state.wallpaper = url;
    const s = document.createElement('style');
    s.textContent = `body::before{background-image:url('${url}')!important}`;
    document.querySelector('style[data-bg]')?.remove();
    s.setAttribute('data-bg', ''); document.head.appendChild(s);
  },

  async logout() {
    if (!confirm('Logout?')) return;
    if (Nexus.state.chatChannel) supabase.removeChannel(Nexus.state.chatChannel);
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
    const counter = document.getElementById('counter');
    if (counter) counter.textContent = Nexus.state.selectedAuras.length;
  },

  async confirmSelection() {
    if (!Nexus.state.selectedAuras.length) { Nexus.toast('Select at least one'); return; }
    await supabase.from('profiles').update({ selected_auras: Nexus.state.selectedAuras }).eq('id', Nexus.state.user.id);
    Nexus.navigate('social');
    Nexus.toast('Auras activated');
  },

  // Dashboard
  async toggleTask(index) {
    const today = new Date().toISOString().split('T')[0];
    const idx = Nexus.state.completedTasks.indexOf(index);
    if (idx > -1) {
      Nexus.state.completedTasks.splice(idx, 1);
      await supabase.from('task_completions').delete().eq('user_id', Nexus.state.user.id).eq('task_index', index).eq('completed_at', today);
    } else {
      Nexus.state.completedTasks.push(index);
      await supabase.from('task_completions').insert({ user_id: Nexus.state.user.id, task_index: index });
    }
    await Nexus.checkStreak();
    Nexus.renderDashboard();
  },

  async checkStreak() {
    const tasks = getTasks();
    const total = tasks.length;
    const done = Nexus.state.completedTasks.filter(i => i < total).length;
    const today = new Date().toISOString().split('T')[0];
    if (done === total && total > 0) {
      await supabase.from('streak_days').upsert({ user_id: Nexus.state.user.id, streak_date: today }, { onConflict: 'user_id,streak_date' });
      Nexus.state.streakData[today] = true;
    }
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

  async resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('task_completions').delete().eq('user_id', Nexus.state.user.id).eq('completed_at', today);
    await supabase.from('streak_days').delete().eq('user_id', Nexus.state.user.id).eq('streak_date', today);
    Nexus.state.completedTasks = [];
    delete Nexus.state.streakData[today];
    Nexus.renderDashboard();
  },

  async renderDashboard() {
    if (!Nexus.state.selectedAuras.length) { Nexus.navigate('select'); return; }
    await Nexus.loadTaskCompletions();
    await Nexus.loadStreakData();

    const tasks = getTasks(), { pct, done, total } = Nexus.calcScore(), streak = Nexus.calcStreak();
    const primaryAura = AURAS[Nexus.state.selectedAuras[0]];
    const circ = 2 * Math.PI * 43, offset = circ - (pct / 100) * circ;

    const homeTitle = document.getElementById('homeTitle');
    const homeBadge = document.getElementById('homeBadge');
    const scoreEl = document.getElementById('score');
    const taskProgress = document.getElementById('taskProgress');
    const streakCount = document.getElementById('streakCount');
    const tasksDone = document.getElementById('tasksDone');

    if (homeTitle) homeTitle.textContent = Nexus.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
    if (homeBadge) homeBadge.textContent = '⚡ ' + Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('');
    if (scoreEl) scoreEl.textContent = pct + '%';
    if (taskProgress) taskProgress.textContent = done + '/' + total;
    if (streakCount) streakCount.textContent = streak;
    if (tasksDone) tasksDone.textContent = Nexus.state.completedTasks.length;

    const [{ count: dCount }, { count: mCount }] = await Promise.all([
      supabase.from('diary_entries').select('*', { count: 'exact', head: true }).eq('user_id', Nexus.state.user.id),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', Nexus.state.user.id)
    ]);

    const diaryCount = document.getElementById('diaryCount');
    const msgCount = document.getElementById('msgCount');
    if (diaryCount) diaryCount.textContent = dCount || 0;
    if (msgCount) msgCount.textContent = mCount || 0;

    const ring = document.getElementById('scoreRing');
    if (ring) {
      ring.style.strokeDashoffset = offset;
      if (primaryAura) ring.style.stroke = primaryAura.accent;
    }

    const tasksContainer = document.getElementById('tasks');
    if (tasksContainer) {
      tasksContainer.innerHTML = tasks.map((t, i) => {
        const c = Nexus.state.completedTasks.includes(i);
        return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})"><div class="check-box">${c ? '✓' : ''}</div><span class="task-text">${t}</span></div>`;
      }).join('');
    }

    Nexus.renderCalendar();
  },

  renderCalendar() {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), dim = new Date(y, m + 1, 0).getDate(), fd = new Date(y, m, 1).getDay();
    const monthLabel = document.getElementById('monthLabel');
    if (monthLabel) monthLabel.textContent = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });

    const cal = document.getElementById('calendar');
    if (!cal) return;
    cal.innerHTML = '';
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
  async editProfile() {
    const newBio = prompt('Edit your bio:', Nexus.state.bio || '');
    if (newBio !== null) {
      Nexus.state.bio = newBio.trim() || 'Building my energy. One aura at a time. ⚡';
      await supabase.from('profiles').update({ bio: Nexus.state.bio }).eq('id', Nexus.state.user.id);
      Nexus.renderProfile();
      Nexus.toast('Bio updated');
    }
  },

  async changeUsername() {
    const newName = prompt('Enter new username:', Nexus.state.user.username);
    if (newName && newName.trim()) {
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', newName.trim()).single();
      if (existing) { Nexus.toast('Username taken'); return; }
      await supabase.from('profiles').update({ username: newName.trim() }).eq('id', Nexus.state.user.id);
      Nexus.state.user.username = newName.trim();
      localStorage.setItem('nexus_user', JSON.stringify(Nexus.state.user));
      const myUsername = document.getElementById('myUsername');
      if (myUsername) myUsername.textContent = Nexus.state.user.username;
      Nexus.toast('Username updated');
    }
  },

  async renderProfile() {
    const avatarEmoji = Nexus.state.selectedAuras.length ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';

    const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileBio = document.getElementById('profileBio');

    if (profileAvatarEmoji) profileAvatarEmoji.textContent = avatarEmoji;
    if (profileName) profileName.textContent = Nexus.state.user?.username || '—';
    if (profileUsername) profileUsername.textContent = '@' + (Nexus.state.user?.username || '—');
    if (profileBio) profileBio.textContent = Nexus.state.bio || 'Building my energy. One aura at a time. ⚡';

    const { data: posts } = await supabase.from('posts').select('*').eq('user_id', Nexus.state.user.id).order('created_at', { ascending: false });
    const userPosts = posts || [];

    const profilePosts = document.getElementById('profilePosts');
    if (profilePosts) profilePosts.textContent = userPosts.length;

    const profileFollowers = document.getElementById('profileFollowers');
    const profileFollowing = document.getElementById('profileFollowing');
    if (profileFollowers) profileFollowers.textContent = Math.floor(Math.random() * 100) + 10;
    if (profileFollowing) profileFollowing.textContent = Math.floor(Math.random() * 50) + 5;

    const grid = document.getElementById('profilePostsGrid');
    if (!grid) return;
    if (!userPosts.length) {
      grid.innerHTML = '<p style="color:#94a3b8;text-align:center;grid-column:1/-1;padding:16px 0;">No posts yet.</p>';
      return;
    }
    grid.innerHTML = userPosts.map(p => `
      <div style="aspect-ratio:1;background-image:url('${p.image || UNSPLASH[0]}');background-size:cover;background-position:center;border-radius:4px;cursor:pointer;" onclick="Nexus.toast('${p.text.substring(0, 30).replace(/'/g, "\\'")}...')"></div>
    `).join('');
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Nexus.init());
else Nexus.init();