// js/app.js - Complete app logic
// ==================== AURAS ====================
const AURAS = {
    focus: { name: 'Focus', emoji: '🎯', accent: '#ff6b6b', desc: 'Concentration', tasks: ['Deep work 25 min', 'No phone 1 hour', 'Single-task', 'Clear desk', 'Pomodoro'] },
    creativity: { name: 'Creativity', emoji: '🎨', accent: '#f06595', desc: 'Imagination', tasks: ['Free-write 10 min', 'Sketch/doodle', 'Brainstorm', 'New music', 'Rearrange'] },
    discipline: { name: 'Discipline', emoji: '🧘', accent: '#748ffc', desc: 'Self-control', tasks: ['Wake up on time', 'Morning routine', 'Say no', 'Priority task', 'Reflection'] },
    vitality: { name: 'Vitality', emoji: '⚡', accent: '#ffd43b', desc: 'Energy', tasks: ['Exercise 30 min', '8 glasses water', 'Whole foods', 'Cold shower', 'Stretch'] },
    empathy: { name: 'Empathy', emoji: '🤝', accent: '#ff8787', desc: 'Connection', tasks: ['Listen fully', 'Ask feelings', 'Validate', 'Active listening', 'Compliment'] },
    resilience: { name: 'Resilience', emoji: '🛡️', accent: '#20c997', desc: 'Bounce back', tasks: ['Reframe', 'Gratitude', 'Do hard thing', 'Journal', 'Mental break'] },
    clarity: { name: 'Clarity', emoji: '🔮', accent: '#b197fc', desc: 'Clear mind', tasks: ['Meditate', 'Top priorities', 'Declutter', 'Digital detox', 'Review goals'] },
    charisma: { name: 'Charisma', emoji: '✨', accent: '#f783ac', desc: 'Presence', tasks: ['Smile', 'Tell story', 'Eye contact', 'Open posture', 'Make laugh'] },
    courage: { name: 'Courage', emoji: '🦁', accent: '#ff922b', desc: 'Face fears', tasks: ['Do scary thing', 'Speak up', 'Try new', 'Admit mistake', 'Stand up'] },
    patience: { name: 'Patience', emoji: '⏳', accent: '#a9e34b', desc: 'Steady', tasks: ['Wait', 'Let others', 'Deep breath', 'Accept delays', 'Count to 10'] },
    gratitude: { name: 'Gratitude', emoji: '🙏', accent: '#e599f7', desc: 'Appreciate', tasks: ['3 gratitudes', 'Thank someone', 'Notice joys', 'Nature', 'Reflect'] },
    ambition: { name: 'Ambition', emoji: '🚀', accent: '#f03e3e', desc: 'Drive', tasks: ['Bold goal', 'Take action', 'Network', 'Learn skill', 'Visualize'] },
    mindfulness: { name: 'Mindfulness', emoji: '🧘‍♀️', accent: '#63e6be', desc: 'Present', tasks: ['Body scan', 'Eat mindfully', '5 senses', 'Mindful walk', 'Observe'] },
    leadership: { name: 'Leadership', emoji: '👑', accent: '#f59e0b', desc: 'Inspire', tasks: ['Delegate', 'Give direction', 'Recognize', 'Decide', 'Lead'] },
    adventure: { name: 'Adventure', emoji: '🏔️', accent: '#3b82f6', desc: 'Explore', tasks: ['New place', 'New food', 'Say yes', 'Break routine', 'Plan'] }
};

// ==================== WALLPAPERS ====================
const UNSPLASH = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1920&q=80',
    'https://images.unsplash.com/photo-1470071459606-3b5ec3a7fe05?w=1920&q=80',
    'https://images.unsplash.com/photo-1440589473619-3cde28941638?w=1920&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1920&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1511818966892-d7b671e67291?w=1920&q=80',
    'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=1920&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
    'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1920&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&q=80',
    'https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=1920&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=80',
    'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1920&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&q=80',
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    'https://images.unsplash.com/photo-1504333638930-c8787321eee0?w=1920&q=80',
    'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
    'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1920&q=80',
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20036?w=1920&q=80',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1920&q=80',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=1920&q=80',
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?w=1920&q=80',
    'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?w=1920&q=80',
    'https://images.unsplash.com/photo-1506891536236-3e07892564b7?w=1920&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80',
    'https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=1920&q=80',
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1920&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1920&q=80',
    'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=1920&q=80',
    'https://images.unsplash.com/photo-1515630278258-407f66498911?w=1920&q=80',
    'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=1920&q=80'
];

// ==================== STATE ====================
let Nexus = {
    state: {
        user: null,
        selectedAuras: [],
        completedTasks: [],
        streakData: {},
        wallpaper: UNSPLASH[0],
        diary: [],
        routines: [],
        posts: [],
        likedPosts: [],
        bio: 'Building my energy. One aura at a time. ⚡',
        chatMessages: []
    },

    // ==================== INIT ====================
    init() {
        const savedUser = Storage.getUser();
        if (!savedUser) {
            window.location.href = 'index.html';
            return;
        }

        this.state.user = savedUser;
        this.loadAllData();
        this.setBg(this.state.wallpaper);

        // Button listeners
        document.getElementById('btnConfirmAuras')?.addEventListener('click', () => this.confirmSelection());
        document.getElementById('btnSaveDiary')?.addEventListener('click', () => this.saveDiary());
        document.getElementById('btnSaveRoutine')?.addEventListener('click', () => this.saveRoutine());
        document.getElementById('btnSendMessage')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('btnCreatePost')?.addEventListener('click', () => this.createPost());
        document.getElementById('btnResetDay')?.addEventListener('click', () => this.resetDay());
        document.getElementById('btnAuras')?.addEventListener('click', () => this.navigate('select'));
        document.getElementById('btnRandomWallpaper')?.addEventListener('click', () => this.randomWallpaper());
        document.getElementById('btnChangeUsername')?.addEventListener('click', () => this.changeUsername());
        document.getElementById('btnEditProfile')?.addEventListener('click', () => this.editProfile());
        document.getElementById('btnLogout')?.addEventListener('click', () => this.logout());

        // Nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigate(btn.dataset.page));
        });

        // Enter key for chat
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Enter key for post
        document.getElementById('postInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.createPost();
            }
        });

        // Load auras from profile
        const profile = Storage.getProfile(this.state.user.id);
        this.state.selectedAuras = profile.selectedAuras || [];
        this.state.wallpaper = profile.wallpaper || this.state.wallpaper;
        this.state.bio = profile.bio || 'Building my energy. One aura at a time. ⚡';

        // Update online status
        this.updateOnlineStatus();

        this.navigate(this.state.selectedAuras.length ? 'social' : 'select');
        console.log('⚡ Nexus ready');
    },

    // ==================== LOAD DATA ====================
    loadAllData() {
        const userId = this.state.user.id;
        this.state.diary = Storage.getDiary(userId);
        this.state.routines = Storage.getRoutines(userId);
        this.state.posts = Storage.getPosts();
        this.state.chatMessages = Storage.getChat();
        this.state.completedTasks = Storage.getTasks(userId) || [];

        const profile = Storage.getProfile(userId);
        this.state.selectedAuras = profile.selectedAuras || [];
        this.state.wallpaper = profile.wallpaper || this.state.wallpaper;
        this.state.bio = profile.bio || 'Building my energy. One aura at a time. ⚡';
    },

    // ==================== ONLINE STATUS ====================
    updateOnlineStatus() {
        if (this.state.user) {
            Storage.updateOnline(this.state.user.username);
        }
        const online = Storage.getOnline();
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = Object.keys(online).length;
        }
    },

    // ==================== TOAST ====================
    toast(msg, duration = 2200) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(t);
            setTimeout(() => t.remove(), duration);
        }
    },

    // ==================== BACKGROUND ====================
    setBg(url) {
        this.state.wallpaper = url;
        const s = document.createElement('style');
        s.textContent = `body::before{background-image:url('${url}')!important}`;
        document.querySelector('style[data-bg]')?.remove();
        s.setAttribute('data-bg', '');
        document.head.appendChild(s);
        Storage.setProfile(this.state.user.id, { ...Storage.getProfile(this.state.user.id), wallpaper: url });
    },

    // ==================== NAVIGATION ====================
    navigate(page) {
        document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.page === page) b.classList.add('active');
        });

        const nav = document.getElementById('bottomNav');
        if (nav) nav.style.display = (page === 'select') ? 'none' : 'flex';

        if (page === 'select') this.renderAuraGrid();
        if (page === 'dashboard') this.renderDashboard();
        if (page === 'diary') this.renderDiary();
        if (page === 'routine') this.renderRoutines();
        if (page === 'chat') this.renderChat();
        if (page === 'social') this.renderSocial();
        if (page === 'profile') this.renderProfile();
        if (page === 'wallpapers') this.renderWallpapers();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ==================== AURAS ====================
    toggleAura(key) {
        const idx = this.state.selectedAuras.indexOf(key);
        if (idx > -1) this.state.selectedAuras.splice(idx, 1);
        else if (this.state.selectedAuras.length < 3) this.state.selectedAuras.push(key);
        this.renderAuraGrid();
    },

    renderAuraGrid() {
        const grid = document.getElementById('auraGrid');
        if (!grid) return;
        grid.innerHTML = Object.entries(AURAS).map(([key, aura]) => {
            const sel = this.state.selectedAuras.includes(key);
            return `<div class="aura-btn${sel ? ' selected' : ''}" onclick="Nexus.toggleAura('${key}')">
                <span class="emoji">${aura.emoji}</span>
                <div class="info"><h3>${aura.name}</h3><p>${aura.desc}</p></div>
                <span class="check-mark">✓</span>
            </div>`;
        }).join('');
        const counter = document.getElementById('counter');
        if (counter) counter.textContent = this.state.selectedAuras.length;
    },

    confirmSelection() {
        if (!this.state.selectedAuras.length) {
            this.toast('Select at least one');
            return;
        }
        Storage.setProfile(this.state.user.id, { ...Storage.getProfile(this.state.user.id), selectedAuras: this.state.selectedAuras });
        this.navigate('social');
        this.toast('Auras activated');
    },

    // ==================== DASHBOARD ====================
    getTasks() {
        let tasks = [];
        this.state.selectedAuras.forEach(key => {
            if (AURAS[key]) tasks = tasks.concat(AURAS[key].tasks);
        });
        return [...new Set(tasks)].slice(0, 8);
    },

    calcScore() {
        const tasks = this.getTasks();
        const total = tasks.length;
        const done = this.state.completedTasks.filter(i => i < total).length;
        return { pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
    },

    calcStreak() {
        let s = 0;
        const now = new Date();
        const streaks = Storage.getStreaks(this.state.user.id);
        for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toDateString();
            if (streaks[key]) s++;
            else break;
        }
        return s;
    },

    renderDashboard() {
        if (!this.state.selectedAuras.length) {
            this.navigate('select');
            return;
        }

        const tasks = this.getTasks();
        const { pct, done, total } = this.calcScore();
        const streak = this.calcStreak();
        const primaryAura = AURAS[this.state.selectedAuras[0]];
        const circ = 2 * Math.PI * 43;
        const offset = circ - (pct / 100) * circ;

        document.getElementById('homeTitle').textContent = this.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
        document.getElementById('homeBadge').textContent = '⚡ ' + this.state.selectedAuras.map(k => AURAS[k].emoji).join('');
        document.getElementById('score').textContent = pct + '%';
        document.getElementById('taskProgress').textContent = done + '/' + total;
        document.getElementById('streakCount').textContent = streak;
        document.getElementById('tasksDone').textContent = this.state.completedTasks.length;
        document.getElementById('diaryCount').textContent = this.state.diary.length;
        document.getElementById('msgCount').textContent = this.state.chatMessages.length;

        const ring = document.getElementById('scoreRing');
        if (ring) {
            ring.style.strokeDashoffset = offset;
            if (primaryAura) ring.style.stroke = primaryAura.accent;
        }

        const tasksContainer = document.getElementById('tasks');
        if (tasksContainer) {
            tasksContainer.innerHTML = tasks.map((t, i) => {
                const c = this.state.completedTasks.includes(i);
                return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})">
                    <div class="check-box">${c ? '✓' : ''}</div>
                    <span class="task-text">${t}</span>
                </div>`;
            }).join('');
        }

        this.renderCalendar();
    },

    toggleTask(index) {
        const idx = this.state.completedTasks.indexOf(index);
        if (idx > -1) {
            this.state.completedTasks.splice(idx, 1);
        } else {
            this.state.completedTasks.push(index);
        }
        Storage.setTasks(this.state.user.id, this.state.completedTasks);

        // Check if all tasks done
        const tasks = this.getTasks();
        const total = tasks.length;
        const done = this.state.completedTasks.filter(i => i < total).length;
        const today = new Date().toDateString();
        const streaks = Storage.getStreaks(this.state.user.id);
        if (done === total && total > 0) {
            streaks[today] = true;
        } else {
            delete streaks[today];
        }
        Storage.setStreaks(this.state.user.id, streaks);
        this.renderDashboard();
    },

    resetDay() {
        if (!confirm("Reset today's tasks?")) return;
        this.state.completedTasks = [];
        Storage.setTasks(this.state.user.id, []);
        const today = new Date().toDateString();
        const streaks = Storage.getStreaks(this.state.user.id);
        delete streaks[today];
        Storage.setStreaks(this.state.user.id, streaks);
        this.renderDashboard();
    },

    renderCalendar() {
        const now = new Date(),
            y = now.getFullYear(),
            m = now.getMonth(),
            dim = new Date(y, m + 1, 0).getDate(),
            fd = new Date(y, m, 1).getDay();
        const monthLabel = document.getElementById('monthLabel');
        if (monthLabel) monthLabel.textContent = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });

        const cal = document.getElementById('calendar');
        if (!cal) return;
        cal.innerHTML = '';
        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
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

        const streaks = Storage.getStreaks(this.state.user.id);
        for (let d = 1; d <= dim; d++) {
            const ds = new Date(y, m, d).toDateString();
            const div = document.createElement('div');
            div.className = 'cal-day';
            div.textContent = d;
            if (streaks[ds]) {
                div.classList.add('active');
                const pa = AURAS[this.state.selectedAuras[0]];
                if (pa) div.style.background = pa.accent;
            }
            if (d === now.getDate() && m === now.getMonth() && y === now.getFullYear()) div.classList.add('today');
            cal.appendChild(div);
        }
    },

    // ==================== DIARY ====================
    saveDiary() {
        const content = document.getElementById('diaryInput').value.trim();
        const mood = document.getElementById('diaryMood').value.trim() || '—';
        if (!content) {
            this.toast('Write something');
            return;
        }

        const entry = {
            id: 'diary_' + Date.now(),
            content: content,
            mood: mood,
            createdAt: new Date().toISOString()
        };

        this.state.diary.unshift(entry);
        Storage.setDiary(this.state.user.id, this.state.diary);
        document.getElementById('diaryInput').value = '';
        document.getElementById('diaryMood').value = '';
        this.renderDiary();
        this.toast('💾 Saved!');
    },

    deleteDiary(id) {
        this.state.diary = this.state.diary.filter(e => e.id !== id);
        Storage.setDiary(this.state.user.id, this.state.diary);
        this.renderDiary();
    },

    renderDiary() {
        const container = document.getElementById('diaryEntries');
        if (!container) return;

        const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
        let entries = this.state.diary;
        if (search) {
            entries = entries.filter(e => e.content.toLowerCase().includes(search) || e.mood.toLowerCase().includes(search));
        }

        if (!entries.length) {
            container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + (search ? '🔍 No matches.' : '📝 No entries yet. Start writing!') + '</p>';
            return;
        }

        container.innerHTML = entries.map(e => `
            <div class="entry-card">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                    <small style="color:#94a3b8;">${new Date(e.createdAt).toLocaleDateString()}</small>
                    <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${e.mood}</span>
                </div>
                <p style="font-size:12px;white-space:pre-wrap;">${e.content}</p>
                <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${e.id}')" style="margin-top:5px;">🗑️</button>
            </div>
        `).join('');
    },

    // ==================== ROUTINES ====================
    saveRoutine() {
        const title = document.getElementById('routineTitle').value.trim();
        const content = document.getElementById('routineInput').value.trim();
        if (!title || !content) {
            this.toast('Add title & description');
            return;
        }

        const routine = {
            id: 'routine_' + Date.now(),
            title: title,
            content: content,
            createdAt: new Date().toISOString()
        };

        this.state.routines.unshift(routine);
        Storage.setRoutines(this.state.user.id, this.state.routines);
        document.getElementById('routineTitle').value = '';
        document.getElementById('routineInput').value = '';
        this.renderRoutines();
        this.toast('💾 Saved!');
    },

    deleteRoutine(id) {
        this.state.routines = this.state.routines.filter(r => r.id !== id);
        Storage.setRoutines(this.state.user.id, this.state.routines);
        this.renderRoutines();
    },

    renderRoutines() {
        const container = document.getElementById('routineEntries');
        if (!container) return;

        if (!this.state.routines.length) {
            container.innerHTML = '<p style="color:#94a3b8;text-align:center;">📋 No routines yet. Create one!</p>';
            return;
        }

        container.innerHTML = this.state.routines.map(r => `
            <div class="entry-card">
                <strong>${r.title}</strong>
                <small style="color:#94a3b8;display:block;">${new Date(r.createdAt).toLocaleDateString()}</small>
                <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">${r.content}</p>
                <button class="btn-sm btn-danger" onclick="Nexus.deleteRoutine('${r.id}')" style="margin-top:5px;">🗑️</button>
            </div>
        `).join('');
    },

    // ==================== CHAT ====================
    sendMessage() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text || !this.state.user) return;

        const message = {
            id: 'msg_' + Date.now(),
            username: this.state.user.username,
            userId: this.state.user.id,
            content: text,
            createdAt: new Date().toISOString()
        };

        this.state.chatMessages.push(message);
        Storage.setChat(this.state.chatMessages);
        input.value = '';
        this.renderChatMessages();
        this.updateOnlineStatus();
    },

    renderChat() {
        document.getElementById('myUsername').textContent = this.state.user?.username || '—';
        this.renderChatMessages();
        this.updateOnlineStatus();
        setInterval(() => this.updateOnlineStatus(), 5000);
    },

    renderChatMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const messages = this.state.chatMessages;
        if (!messages.length) {
            container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">💬 No messages yet. Start the conversation!</p>';
            return;
        }

        container.innerHTML = messages.map(m => {
            const me = m.userId === this.state.user?.id;
            const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin:3px 0;">
                <div style="max-width:82%;">
                    <div class="chat-bubble ${me ? 'chat-sent' : 'chat-received'}">
                        <div style="font-size:10px;font-weight:600;opacity:0.7;">${m.username} · ${time}</div>
                        <p style="margin:2px 0 0;">${m.content}</p>
                    </div>
                    ${me ? `<button class="btn-sm btn-danger" onclick="Nexus.deleteMessage('${m.id}')" style="font-size:9px;padding:2px 5px;margin-top:1px;">🗑️</button>` : ''}
                </div>
            </div>`;
        }).join('');
        container.scrollTop = container.scrollHeight;
    },

    deleteMessage(id) {
        this.state.chatMessages = this.state.chatMessages.filter(m => m.id !== id);
        Storage.setChat(this.state.chatMessages);
        this.renderChatMessages();
    },

    changeUsername() {
        const newName = prompt('Enter new username:', this.state.user?.username);
        if (newName && newName.trim()) {
            const users = Storage.getUsers();
            if (users.find(u => u.username === newName.trim() && u.id !== this.state.user.id)) {
                this.toast('Username taken');
                return;
            }
            const user = users.find(u => u.id === this.state.user.id);
            if (user) {
                user.username = newName.trim();
                Storage.setUsers(users);
                this.state.user.username = newName.trim();
                Storage.setUser(this.state.user);
                document.getElementById('myUsername').textContent = this.state.user.username;
                this.toast('Username updated');
            }
        }
    },

    // ==================== SOCIAL FEED ====================
    createPost() {
        const input = document.getElementById('postInput');
        const text = input.value.trim();
        if (!text) {
            this.toast('Write something');
            return;
        }

        const avatar = this.state.selectedAuras.length ? this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
        const randImg = UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)];

        const post = {
            id: 'post_' + Date.now(),
            userId: this.state.user.id,
            author: this.state.user.username,
            avatar: avatar,
            text: text,
            image: randImg,
            likes: [],
            createdAt: new Date().toISOString()
        };

        this.state.posts.unshift(post);
        Storage.setPosts(this.state.posts);
        input.value = '';
        this.renderSocial();
        this.toast('Posted! ✨');
    },

    likePost(postId) {
        const post = this.state.posts.find(p => p.id === postId);
        if (!post) return;

        const liked = post.likes.includes(this.state.user.id);
        if (liked) {
            post.likes = post.likes.filter(id => id !== this.state.user.id);
        } else {
            post.likes.push(this.state.user.id);
        }
        Storage.setPosts(this.state.posts);
        this.renderSocial();
    },

    deletePost(postId) {
        if (!confirm('Delete this post?')) return;
        this.state.posts = this.state.posts.filter(p => p.id !== postId);
        Storage.setPosts(this.state.posts);
        this.renderSocial();
    },

    timeSince(date) {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);
        if (diff < 60) return diff + 's';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return new Date(date).toLocaleDateString();
    },

    renderSocial() {
        const container = document.getElementById('socialFeed');
        if (!container) return;

        const avatarEl = document.getElementById('postAvatarEmoji');
        if (avatarEl) {
            avatarEl.textContent = this.state.selectedAuras.length ? this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
        }

        const posts = this.state.posts;
        if (!posts.length) {
            container.innerHTML = `<div style="text-align:center;padding:40px 0;color:#94a3b8;">
                <div style="font-size:48px;margin-bottom:12px;">📸</div>
                <p>No posts yet. Share your journey!</p>
            </div>`;
            return;
        }

        container.innerHTML = posts.map(p => {
            const liked = p.likes.includes(this.state.user.id);
            const timeAgo = this.timeSince(new Date(p.createdAt));
            const imageUrl = p.image || UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)];
            return `
                <div class="ig-post">
                    <div class="ig-post-header">
                        <div class="ig-post-avatar">${p.avatar}</div>
                        <span class="ig-post-user">${p.author}</span>
                        <span class="ig-post-time">${timeAgo}</span>
                        ${p.userId === this.state.user?.id ? `<button class="btn-sm btn-danger" onclick="Nexus.deletePost('${p.id}')" style="font-size:11px;padding:2px 8px;">🗑️</button>` : ''}
                    </div>
                    <div class="ig-post-image" style="background-image:url('${imageUrl}');background-size:cover;background-position:center;">
                    </div>
                    <div class="ig-post-actions">
                        <button class="ig-post-action ${liked ? 'liked' : ''}" onclick="Nexus.likePost('${p.id}')">${liked ? '❤️' : '🤍'}</button>
                        <button class="ig-post-action" onclick="Nexus.toast('Comment feature coming soon')">💬</button>
                        <button class="ig-post-action" onclick="Nexus.toast('Share feature coming soon')">📤</button>
                    </div>
                    <div class="ig-post-likes">${p.likes.length} ${p.likes.length === 1 ? 'like' : 'likes'}</div>
                    <div class="ig-post-caption"><strong>${p.author}</strong> ${p.text}</div>
                    <div class="ig-post-comment" onclick="Nexus.toast('Comment feature coming soon')">View all comments</div>
                </div>
            `;
        }).join('');
    },

    // ==================== PROFILE ====================
    editProfile() {
        const newBio = prompt('Edit your bio:', this.state.bio || '');
        if (newBio !== null) {
            this.state.bio = newBio.trim() || 'Building my energy. One aura at a time. ⚡';
            Storage.setProfile(this.state.user.id, { ...Storage.getProfile(this.state.user.id), bio: this.state.bio });
            this.renderProfile();
            this.toast('Bio updated');
        }
    },

    renderProfile() {
        const avatarEmoji = this.state.selectedAuras.length ? this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';

        document.getElementById('profileAvatarEmoji').textContent = avatarEmoji;
        document.getElementById('profileName').textContent = this.state.user?.username || '—';
        document.getElementById('profileUsername').textContent = '@' + (this.state.user?.username || '—');
        document.getElementById('profileBio').textContent = this.state.bio || 'Building my energy. One aura at a time. ⚡';

        const userPosts = this.state.posts.filter(p => p.userId === this.state.user.id);
        document.getElementById('profilePosts').textContent = userPosts.length;
        document.getElementById('profileFollowers').textContent = Math.floor(Math.random() * 100) + 10;
        document.getElementById('profileFollowing').textContent = Math.floor(Math.random() * 50) + 5;

        const grid = document.getElementById('profilePostsGrid');
        if (!grid) return;
        if (!userPosts.length) {
            grid.innerHTML = '<p style="color:#94a3b8;text-align:center;grid-column:1/-1;padding:16px 0;">No posts yet.</p>';
            return;
        }
        grid.innerHTML = userPosts.map(p => `
            <div style="aspect-ratio:1;background-image:url('${p.image || UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]}');background-size:cover;background-position:center;border-radius:4px;cursor:pointer;" onclick="Nexus.toast('${p.text.substring(0,30)}...')"></div>
        `).join('');
    },

    // ==================== WALLPAPERS ====================
    setWallpaper(url) {
        this.state.wallpaper = url;
        this.setBg(url);
        this.renderWallpapers();
        this.toast('Applied');
    },

    randomWallpaper() {
        this.setWallpaper(UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]);
    },

    renderWallpapers() {
        document.getElementById('wpCount').textContent = UNSPLASH.length + '+ wallpapers';
        const grid = document.getElementById('wpGrid');
        if (!grid) return;
        grid.innerHTML = UNSPLASH.map(url => {
            const selected = this.state.wallpaper === url;
            return `<div class="wp-thumb${selected ? ' selected' : ''}" style="background-image:url('${url}')" onclick="Nexus.setWallpaper('${url}')"></div>`;
        }).join('');
    },

    // ==================== LOGOUT ====================
    logout() {
        if (!confirm('Logout?')) return;
        Storage.remove('nexus_user');
        window.location.href = 'index.html';
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
    Nexus.init();
}