const Nexus = {
  state: {
    session: null,
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

  async init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    Nexus.state.session = session;

    if (session) {
      await Nexus.loadProfile();
      Nexus.showApp();
    } else {
      Nexus.showAuth();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      Nexus.state.session = session;
      if (session) {
        await Nexus.loadProfile();
        Nexus.showApp();
      } else {
        Nexus.state.profile = null;
        Nexus.showAuth();
      }
    });

    document.getElementById('btnInitiate').addEventListener('click', () => {
      if (Nexus.state.session) {
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

  async loadProfile() {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', Nexus.state.session.user.id)
      .single();

    if (profile) {
      Nexus.state.profile = profile;
      Nexus.state.selectedAuras = profile.selected_auras || [];
      Nexus.state.wallpaper = profile.wallpaper || Nexus.state.wallpaper;
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
    document.getElementById('myUsername').textContent = Nexus.state.profile?.username || '—';
    document.getElementById('bottomNav').style.display = 'flex';
    Nexus.setBg(Nexus.state.wallpaper);

    if (Nexus.state.selectedAuras.length) {
      Nexus.navigate('social');
    } else {
      Nexus.navigate('select');
    }
  },

    async signUp() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const username = document.getElementById('authUsername').value.trim();

    if (!email || !password || !username) {
      Nexus.authError('All fields are required');
      return;
    }

    if (password.length < 6) {
      Nexus.authError('Password must be at least 6 characters');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username
        }
      }
    });

    console.log("Signup response:", { data, error });

    if (error) {
      Nexus.authError(error.message);
      return;
    }

    if (data.user) {
      Nexus.toast('Account created successfully');

      document.getElementById('authEmail').value = '';
      document.getElementById('authPassword').value = '';
      document.getElementById('authUsername').value = '';

      if (data.session) {
        Nexus.state.session = data.session;
        await Nexus.loadProfile();
        Nexus.showApp();
      } else {
        Nexus.toast('Account created. Please check email if confirmation is enabled.');
      }
    }
  },


  async signIn() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;

    if (!email || !password) {
      Nexus.authError('Email and password required');
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    console.log("Login response:", { data, error });

    if (error) {
      Nexus.authError(error.message);
      return;
    }

    Nexus.toast('Welcome back!');
  },

  async signOut() {
    await supabaseClient.auth.signOut();
    Nexus.state.selectedAuras = [];
    Nexus.state.profile = null;
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

  async confirmSelection() {
    if (Nexus.state.selectedAuras.length === 0) {
      Nexus.toast('Select at least one aura');
      return;
    }
    await supabaseClient
      .from('profiles')
      .update({ selected_auras: Nexus.state.selectedAuras })
      .eq('id', Nexus.state.session.user.id);

    Nexus.navigate('social');
    Nexus.toast('Auras activated');
  },

  async toggleTask(index) {
    const idx = Nexus.state.completedTasks.indexOf(index);
    if (idx > -1) {
      Nexus.state.completedTasks.splice(idx, 1);
      await supabaseClient
        .from('task_completions')
        .delete()
        .eq('user_id', Nexus.state.session.user.id)
        .eq('task_index', index)
        .eq('completed_at', new Date().toISOString().split('T')[0]);
    } else {
      Nexus.state.completedTasks.push(index);
      await supabaseClient
        .from('task_completions')
        .insert({ user_id: Nexus.state.session.user.id, task_index: index });
    }
    Nexus.renderDashboard();
  },

  async loadTaskCompletions() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabaseClient
      .from('task_completions')
      .select('task_index')
      .eq('user_id', Nexus.state.session.user.id)
      .eq('completed_at', today);
    Nexus.state.completedTasks = (data || []).map(d => d.task_index);
  },

  async loadStreakData() {
    const { data } = await supabaseClient
      .from('streak_days')
      .select('streak_date')
      .eq('user_id', Nexus.state.session.user.id);
    Nexus.state.streakData = {};
    (data || []).forEach(d => {
      Nexus.state.streakData[d.streak_date] = true;
    });
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

  async resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    const today = new Date().toISOString().split('T')[0];
    await supabaseClient
      .from('task_completions')
      .delete()
      .eq('user_id', Nexus.state.session.user.id)
      .eq('completed_at', today);
    await supabaseClient
      .from('streak_days')
      .delete()
      .eq('user_id', Nexus.state.session.user.id)
      .eq('streak_date', today);
    Nexus.state.completedTasks = [];
    delete Nexus.state.streakData[today];
    Nexus.renderDashboard();
  },

  async renderDashboard() {
    await Nexus.loadTaskCompletions();
    await Nexus.loadStreakData();

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
  }
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
  Nexus.init();
}