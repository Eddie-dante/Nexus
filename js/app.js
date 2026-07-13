// js/app.js - Complete page by page app
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
        // Check if user is logged in
        const savedUser = Storage.getUser();
        if (savedUser) {
            this.state.user = savedUser;
            this.loadAllData();
            this.setBg(this.state.wallpaper);
            this.navigate('social');
        } else {
            this.navigate('landing');
        }

        // Set up event listeners
        this.setupListeners();
        
        // Update online status periodically
        setInterval(() => {
            if (this.state.user) {
                Storage.updateOnline(this.state.user.username);
                const online = Storage.getOnline();
                const onlineCount = document.getElementById('onlineCount');
                if (onlineCount) {
                    onlineCount.textContent = Object.keys(online).length;
                }
            }
        }, 5000);

        console.log('⚡ Nexus ready');
    },

    setupListeners() {
        // Aura buttons
        document.getElementById('btnConfirmAuras')?.addEventListener('click', () => this.confirmSelection());
        
        // Diary buttons
        document.getElementById('btnSaveDiary')?.addEventListener('click', () => this.saveDiary());
        
        // Routine buttons
        document.getElementById('btnSaveRoutine')?.addEventListener('click', () => this.saveRoutine());
        
        // Chat buttons
        document.getElementById('btnSendMessage')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Post buttons
        document.getElementById('btnCreatePost')?.addEventListener('click', () => this.createPost());
        document.getElementById('postInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.createPost();
            }
        });
        
        // Dashboard buttons
        document.getElementById('btnResetDay')?.addEventListener('click', () => this.resetDay());
        document.getElementById('btnAuras')?.addEventListener('click', () => this.navigate('select'));
        
        // Wallpaper buttons
        document.getElementById('btnRandomWallpaper')?.addEventListener('click', () => this.randomWallpaper());
        
        // Profile buttons
        document.getElementById('btnChangeUsername')?.addEventListener('click', () => this.changeUsername());
        document.getElementById('btnEditProfile')?.addEventListener('click', () => this.editProfile());
        document.getElementById('btnLogout')?.addEventListener('click', () => this.logout());
        document.getElementById('btnProfileDashboard')?.addEventListener('click', () => this.navigate('dashboard'));
        document.getElementById('btnProfileAuras')?.addEventListener('click', () => this.navigate('select'));
        
        // Nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigate(btn.dataset.page));
        });
        
        // Wallpaper FAB
        document.querySelector('.wp-fab')?.addEventListener('click', () => this.navigate('wallpapers'));
        
        // New post button
        document.getElementById('btnNewPost')?.addEventListener('click', () => {
            document.getElementById('postInput')?.focus();
        });
    },

    // ==================== LOAD DATA ====================
    loadAllData() {
        const userId = this.state.user.id;
        this.state.diary = Storage.getDiary(userId);
        this.state.routines = Storage.getRoutines(userId);
        this.state.posts = Storage.getPosts();
        this.state.chatMessages = Storage.getChat();
        this.state.completedTasks = Storage.getTasks(userId) || [];
        this.state.streakData = Storage.getStreaks(userId) || {};

        const profile = Storage.getProfile(userId);
        this.state.selectedAuras = profile.selectedAuras || [];
        this.state.wallpaper = profile.wallpaper || UNSPLASH[0];
        this.state.bio = profile.bio || 'Building my energy. One aura at a time. ⚡';
    },

    // ==================== NAVIGATION ====================
    navigate(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
        
        // Show target page
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.page === page) b.classList.add('active');
        });

        // Show/hide bottom nav
        const nav = document.getElementById('bottomNav');
        const hideNav = ['landing', 'login', 'signup', 'select'];
        if (nav) nav.style.display = hideNav.includes(page) ? 'none' : 'flex';

        // Render page content
        if (page === 'select') this.renderAuraGrid();
        if (page === 'dashboard') this.renderDashboard();
        if (page === 'diary') this.renderDiary();
        if (page === 'routine') this.renderRoutines();
        if (page === 'chat') this.renderChat();
        if (page === 'social') { this.renderSocial(); this.renderStories(); }
        if (page === 'profile') this.renderProfile();
        if (page === 'wallpapers') this.renderWallpapers();

        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (!url) return;
        this.state.wallpaper = url;
        
        // Remove existing bg style
        document.querySelector('style[data-bg]')?.remove();
        
        // Create new bg style
        const s = document.createElement('style');
        s.setAttribute('data-bg', '');
        s.textContent = `body::before{background-image:url('${url}')!important}`;
        document.head.appendChild(s);
        
        // Save to profile
        if (this.state.user) {
            const profile = Storage.getProfile(this.state.user.id);
            profile.wallpaper = url;
            Storage.setProfile(this.state.user.id, profile);
        }
    },

    // ==================== GET TASKS ====================
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
        const streaks = this.state.streakData;
        for (let i = 0; i < 365; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toDateString();
            if (streaks[key]) s++;
            else break;
        }
        return s;
    },

    // ==================== AURAS ====================
    toggleAura(key) {
        const idx = this.state.selectedAuras.indexOf(key);
        if (idx > -1) {
            this.state.selectedAuras.splice(idx, 1);
        } else if (this.state.selectedAuras.length < 3) {
            this.state.selectedAuras.push(key);
        }
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
            this.toast('Select at least one aura');
            return;
        }
        
        const profile = Storage.getProfile(this.state.user.id);
        profile.selectedAuras = this.state.selectedAuras;
        Storage.setProfile(this.state.user.id, profile);
        
        this.toast('Auras activated ✨');
        this.navigate('social');
    },

    // ==================== DASHBOARD ====================
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
        
        if (done === total && total > 0) {
            this.state.streakData[today] = true;
        } else {
            delete this.state.streakData[today];
        }
        Storage.setStreaks(this.state.user.id, this.state.streakData);
        this.renderDashboard();
    },

    resetDay() {
        if (!confirm("Reset today's tasks?")) return;
        this.state.completedTasks = [];
        Storage.setTasks(this.state.user.id, []);
        const today = new Date().toDateString();
        delete this.state.streakData[today];
        Storage.setStreaks(this.state.user.id, this.state.streakData);
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

        const streaks = this.state.streakData;
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
            
            if (d === now.getDate() && m === now.getMonth() && y === now.getFullYear()) {
                div.classList.add('today');
            }
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
        if (!text || !this.state.user) {
            this.toast('Please log in');
            return;
        }

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
        
        // Update online status
        Storage.updateOnline(this.state.user.username);
    },

    renderChat() {
        document.getElementById('myUsername').textContent = this.state.user?.username || '—';
        this.renderChatMessages();
        
        // Update online count
        const online = Storage.getOnline();
        const onlineCount = document.getElementById('onlineCount');
        if (onlineCount) {
            onlineCount.textContent = Object.keys(online).length;
        }
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

    // ==================== STORIES ====================
    renderStories() {
        const row = document.getElementById('storyRow');
        if (!row) return;
        
        const users = [...new Set(this.state.posts.map(p => p.author))];
        if (users.length === 0) {
            row.innerHTML = '<div style="display:flex;gap:10px;padding:4px 0;color:#94a3b8;font-size:12px;">No stories yet</div>';
            return;
        }
        
        row.innerHTML = users.slice(0, 10).map(u => {
            const post = this.state.posts.find(p => p.author === u);
            const emoji = post ? post.avatar : '😊';
            return `<div class="ig-story"><div class="ig-story-avatar"><div class="inner">${emoji}</div></div><span class="ig-story-name">${u}</span></div>`;
        }).join('');
    },

    // ==================== SOCIAL FEED ====================
    createPost() {
        const input = document.getElementById('postInput');
        const text = input.value.trim();
        if (!text) {
            this.toast('Write something');
            return;
        }

        const avatar = this.state.selectedAuras.length ? 
            this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
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
        this.renderStories();
        this.toast('Posted! ✨');
    },

    likePost(postId) {
        const post = this.state.posts.find(p => p.id === postId);
        if (!post) return;

        const idx = post.likes.indexOf(this.state.user.id);
        if (idx > -1) {
            post.likes.splice(idx, 1);
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
        this.renderStories();
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
            avatarEl.textContent = this.state.selectedAuras.length ? 
                this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
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
            const profile = Storage.getProfile(this.state.user.id);
            profile.bio = this.state.bio;
            Storage.setProfile(this.state.user.id, profile);
            this.renderProfile();
            this.toast('Bio updated');
        }
    },

    renderProfile() {
        const avatarEmoji = this.state.selectedAuras.length ? 
            this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';

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
        this.setBg(url);
        this.renderWallpapers();
        this.toast('Applied');
    },

    randomWallpaper() {
        this.setWallpaper(UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]);
    },

    renderWallpapers() {
        const wpCount = document.getElementById('wpCount');
        if (wpCount) wpCount.textContent = UNSPLASH.length + '+ wallpapers';
        
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
        window.location.reload();
    }
};

// ==================== INITIALIZE ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
    Nexus.init();
}