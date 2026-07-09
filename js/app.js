const Nexus = {
  state: {
    user: null,
    profile: null,
    selectedAuras: [],
    completedTasks: [],
    streakData: {},
    wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    likedPosts: [],
    chatMessages: []
  },

  async init() {
    const saved = localStorage.getItem('nexus_user');
    if (saved) {
      Nexus.state.user = JSON.parse(saved);
      await Nexus.loadProfile();
      Nexus.showApp();
    } else {
      Nexus.showAuth();
    }

    document.getElementById('btnInitiate').addEventListener('click', () => {
      if (Nexus.state.user) Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
    });
    document.getElementById('btnConfirmAuras').addEventListener('click', () => Nexus.confirmSelection());
    document.getElementById('btnSaveDiary').addEventListener('click', () => Nexus.saveDiary());
    document.getElementById('btnSaveRoutine').addEventListener('click', () => Nexus.saveRoutine());
    document.getElementById('btnSendMessage').addEventListener('click', () => Nexus.sendMessage());
    document.getElementById('btnCreatePost').addEventListener('click', () => Nexus.createPost());
    console.log('⚡ Nexus · id³ ready');
  },

  async loadProfile() {
    if (!Nexus.state.user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', Nexus.state.user.id).single();
    if (data) {
      Nexus.state.profile = data;
      Nexus.state.selectedAuras = data.selected_auras || [];
      Nexus.state.wallpaper = data.wallpaper || Nexus.state.wallpaper;
      Nexus.setBg(Nexus.state.wallpaper);
    }
  },

  showAuth() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('bottomNav').style.display = 'none';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-landing').classList.add('active');
  },

  showApp() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'flex';
    Nexus.setBg(Nexus.state.wallpaper);
    Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
  },

  async signUp() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    if (!username || !password) { Nexus.authError('All fields required'); return; }
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (existing) { Nexus.authError('Username taken'); return; }
    const id = crypto.randomUUID();
    const { error } = await supabase.from('profiles').insert({ id, username, password });
    if (error) { Nexus.authError(error.message); return; }
    Nexus.state.user = { id, username };
    localStorage.setItem('nexus_user', JSON.stringify(Nexus.state.user));
    Nexus.toast('Welcome, ' + username + '!');
    Nexus.showApp();
  },

  async signIn() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    if (!username || !password) { Nexus.authError('All fields required'); return; }
    const { data } = await supabase.from('profiles').select('*').eq('username', username).eq('password', password).single();
    if (!data) { Nexus.authError('Invalid credentials'); return; }
    Nexus.state.user = { id: data.id, username: data.username };
    localStorage.setItem('nexus_user', JSON.stringify(Nexus.state.user));
    Nexus.toast('Welcome back, ' + username + '!');
    Nexus.showApp();
  },

  async signOut() {
    Nexus.cleanupChat();
    Nexus.state.user = null;
    Nexus.state.selectedAuras = [];
    localStorage.removeItem('nexus_user');
    Nexus.showAuth();
    Nexus.toast('Signed out');
  },

  authError(msg) {
    const el = document.getElementById('authError');
    el.textContent = msg; el.style.display = 'block';
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
    document.getElementById('bottomNav').style.display = (page === 'landing' || page === 'select') ? 'none' : 'flex';
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
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 2200);
  },

  setBg(url) {
    const s = document.createElement('style');
    s.textContent = `body::before{background-image:url('${url}')!important}`;
    document.querySelector('style[data-bg]')?.remove();
    s.setAttribute('data-bg', ''); document.head.appendChild(s);
  },

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

  async confirmSelection() {
    if (!Nexus.state.selectedAuras.length) { Nexus.toast('Select at least one'); return; }
    await supabase.from('profiles').update({ selected_auras: Nexus.state.selectedAuras }).eq('id', Nexus.state.user.id);
    Nexus.navigate('social'); Nexus.toast('Auras activated');
  },

  async loadTaskCompletions() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('task_completions').select('task_index').eq('user_id', Nexus.state.user.id).eq('completed_at', today);
    Nexus.state.completedTasks = (data || []).map(d => d.task_index);
  },

  async loadStreakData() {
    const { data } = await supabase.from('streak_days').select('streak_date').eq('user_id', Nexus.state.user.id);
    Nexus.state.streakData = {}; (data || []).forEach(d => { Nexus.state.streakData[d.streak_date] = true; });
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

  async renderDashboard() {
    await Nexus.loadTaskCompletions(); await Nexus.loadStreakData();
    const tasks = getTasks(), { pct, done, total } = Nexus.calcScore(), streak = Nexus.calcStreak();
    const primaryAura = AURAS[Nexus.state.selectedAuras[0]];
    const circ = 2 * Math.PI * 43, offset = circ - (pct / 100) * circ;

    document.getElementById('homeTitle').textContent = Nexus.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
    document.getElementById('homeBadge').textContent = '⚡ ' + Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('');
    document.getElementById('score').textContent = pct + '%';
    document.getElementById('taskProgress').textContent = done + '/' + total;
    document.getElementById('streakCount').textContent = streak;
    document.getElementById('tasksDone').textContent = Nexus.state.completedTasks.length;

    await Nexus.updateDashboardCounts();

    const ring = document.getElementById('scoreRing');
    ring.style.strokeDashoffset = offset;
    if (primaryAura) ring.style.stroke = primaryAura.accent;

    document.getElementById('tasks').innerHTML = tasks.map((t, i) => {
      const c = Nexus.state.completedTasks.includes(i);
      return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})"><div class="check-box">${c ? '✓' : ''}</div><span class="task-text">${t}</span></div>`;
    }).join('');
    Nexus.renderCalendar();
  },

  async resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('task_completions').delete().eq('user_id', Nexus.state.user.id).eq('completed_at', today);
    await supabase.from('streak_days').delete().eq('user_id', Nexus.state.user.id).eq('streak_date', today);
    Nexus.state.completedTasks = []; delete Nexus.state.streakData[today];
    Nexus.renderDashboard();
  },

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
    if (Nexus.state.completedTasks.filter(i => i < tasks.length).length === tasks.length && tasks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('streak_days').upsert({ user_id: Nexus.state.user.id, streak_date: today }, { onConflict: 'user_id,streak_date' });
      Nexus.state.streakData[today] = true;
    }
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Nexus.init());
else Nexus.init();