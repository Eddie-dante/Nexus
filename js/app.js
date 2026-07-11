// js/app.js - COMPLETE
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

const Nexus = {
  state: {
    user: null,
    selectedAuras: [],
    completedTasks: [],
    streakData: {},
    wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    likedPosts: [],
    bio: 'Building my energy. One aura at a time. ⚡',
    diary: [],
    routines: [],
    onlineUsers: {},
    posts: [],
    chatMessages: [],
    allUsers: [],
    friends: [],
    currentChatUser: null
  },

  async init() {
    const savedUser = Storage.getUser();
    if (!savedUser) { 
      window.location.href = 'index.html'; 
      return; 
    }

    this.state.user = savedUser;
    
    // Seed demo users if no users exist
    Storage.seedDemoUsers();
    
    // Load all data
    this.loadAllData();
    this.loadUsers();
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
    document.getElementById('btnProfileDashboard')?.addEventListener('click', () => this.navigate('dashboard'));
    document.getElementById('btnProfileAuras')?.addEventListener('click', () => this.navigate('select'));
    document.getElementById('btnNewPost')?.addEventListener('click', () => {
      const input = document.getElementById('postInput');
      if (input) input.focus();
    });

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
    
    // Initialize online status
    this.updateOnlineStatus();

    this.navigate(this.state.selectedAuras.length ? 'social' : 'select');
    console.log('⚡ Nexus · id³ ready');
  },

  loadUsers() {
    // Get all users from storage
    this.state.allUsers = Storage.getAllUsers();
    // Get friends (users who have chatted with the current user)
    const friends = Storage.get(`nexus_friends_${this.state.user.id}`, []);
    this.state.friends = friends;
  },

  loadAllData() {
    const userId = this.state.user.id;
    this.state.diary = Storage.getDiaryEntries(userId);
    this.state.routines = Storage.getRoutines(userId);
    this.state.posts = Storage.getPosts();
    this.state.chatMessages = Storage.getChatMessages();
    this.state.completedTasks = Storage.getTasks(userId) || [];
    
    const profile = Storage.getProfile(userId);
    this.state.selectedAuras = profile.selectedAuras || [];
    this.state.wallpaper = profile.wallpaper || this.state.wallpaper;
    this.state.bio = profile.bio || 'Building my energy. One aura at a time. ⚡';
  },

  updateOnlineStatus() {
    if (this.state.user) {
      Storage.updateOnlineStatus(this.state.user.username);
    }
    this.state.onlineUsers = Storage.getOnlineUsers();
    
    const onlineCount = document.getElementById('onlineCount');
    if (onlineCount) {
      onlineCount.textContent = Object.keys(this.state.onlineUsers).length;
    }
    
    // Update user list
    this.renderUserList();
  },

  renderUserList() {
    const container = document.getElementById('usersListContainer');
    if (!container) return;
    
    // Get all users except current user
    const allUsers = this.state.allUsers || [];
    const currentUser = this.state.user;
    const otherUsers = allUsers.filter(u => u.id !== currentUser?.id);
    
    if (otherUsers.length === 0) {
      container.innerHTML = '<span style="font-size:11px;color:#94a3b8;">No other users yet. Invite friends!</span>';
      return;
    }
    
    container.innerHTML = otherUsers.map(u => {
      const isOnline = this.state.onlineUsers[u.username];
      const isFriend = this.state.friends.includes(u.id);
      return `<span onclick="Nexus.startChat('${u.id}', '${escapeHtml(u.username)}')" 
                   style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:12px;cursor:pointer;background:${isOnline ? 'rgba(74,222,128,0.2)' : 'rgba(0,0,0,0.04)'};border:1px solid ${isOnline ? '#4ade80' : 'transparent'};font-size:11px;">
                ${isOnline ? '🟢' : '⚪'} ${escapeHtml(u.username)}
                ${isFriend ? ' ⭐' : ''}
              </span>`;
    }).join('');
  },

  startChat(userId, username) {
    this.state.currentChatUser = { id: userId, username };
    this.navigate('chat');
    this.toast(`💬 Chatting with ${username}`);
  },

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

  setBg(url) {
    this.state.wallpaper = url;
    const existingStyle = document.querySelector('style[data-bg]');
    if (existingStyle) existingStyle.remove();
    
    const s = document.createElement('style');
    s.setAttribute('data-bg', '');
    s.textContent = `body::before{background-image:url('${url}')!important}`;
    document.head.appendChild(s);
    
    Storage.updateProfile(this.state.user.id, { wallpaper: url });
  },

  navigate(page) {
    document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.remove('active');
      if (b.dataset.page === page) b.classList.add('active');
    });

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      bottomNav.style.display = (page === 'select') ? 'none' : 'flex';
    }

    if (page === 'select') this.renderAuraGrid();
    if (page === 'dashboard') this.renderDashboard();
    if (page === 'diary') this.renderDiary();
    if (page === 'routine') this.renderRoutines();
    if (page === 'chat') this.renderChat();
    if (page === 'social') this.renderSocial();
    if (page === 'profile') this.renderProfile();
    if (page === 'wallpapers') this.renderWallpapers();

    if (page === 'chat') {
      this.updateOnlineStatus();
      setInterval(() => this.updateOnlineStatus(), 5000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Aura functions
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
        <span class="emoji">${aura.emoji}</span><div class="info"><h3>${aura.name}</h3><p>${aura.desc}</p></div><span class="check-mark">✓</span></div>`;
    }).join('');
    const counter = document.getElementById('counter');
    if (counter) counter.textContent = this.state.selectedAuras.length;
  },

  confirmSelection() {
    if (!this.state.selectedAuras.length) { 
      this.toast('Select at least one'); 
      return; 
    }
    Storage.updateProfile(this.state.user.id, { selectedAuras: this.state.selectedAuras });
    this.navigate('social');
    this.toast('Auras activated');
  },

  // Dashboard
  renderDashboard() {
    if (!this.state.selectedAuras.length) { 
      this.navigate('select'); 
      return; 
    }

    const tasks = getTasks();
    const total = tasks.length;
    const done = this.state.completedTasks.filter(i => i < total).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const streak = this.calcStreak();
    const primaryAura = AURAS[this.state.selectedAuras[0]];
    const circ = 2 * Math.PI * 43;
    const offset = circ - (pct / 100) * circ;

    const homeTitle = document.getElementById('homeTitle');
    const homeBadge = document.getElementById('homeBadge');
    const scoreEl = document.getElementById('score');
    const taskProgress = document.getElementById('taskProgress');
    const streakCount = document.getElementById('streakCount');
    const tasksDone = document.getElementById('tasksDone');
    const diaryCount = document.getElementById('diaryCount');
    const msgCount = document.getElementById('msgCount');

    if (homeTitle) homeTitle.textContent = this.state.selectedAuras.map(k => AURAS[k].emoji + ' ' + AURAS[k].name).join(' + ');
    if (homeBadge) homeBadge.textContent = '⚡ ' + this.state.selectedAuras.map(k => AURAS[k].emoji).join('');
    if (scoreEl) scoreEl.textContent = pct + '%';
    if (taskProgress) taskProgress.textContent = done + '/' + total;
    if (streakCount) streakCount.textContent = streak;
    if (tasksDone) tasksDone.textContent = done;
    if (diaryCount) diaryCount.textContent = this.state.diary.length;
    if (msgCount) msgCount.textContent = this.state.chatMessages.length;

    const ring = document.getElementById('scoreRing');
    if (ring) {
      ring.style.strokeDashoffset = offset;
      if (primaryAura) ring.style.stroke = primaryAura.accent;
    }

    const tasksContainer = document.getElementById('tasks');
    if (tasksContainer) {
      tasksContainer.innerHTML = tasks.map((t, i) => {
        const c = this.state.completedTasks.includes(i);
        return `<div class="task-item${c ? ' done' : ''}" onclick="Nexus.toggleTask(${i})"><div class="check-box">${c ? '✓' : ''}</div><span class="task-text">${escapeHtml(t)}</span></div>`;
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
    this.renderDashboard();
  },

  calcStreak() {
    let s = 0; 
    const now = new Date();
    const tasks = getTasks();
    const total = tasks.length;
    const done = this.state.completedTasks.filter(i => i < total).length;
    
    const streaks = Storage.getStreaks(this.state.user.id);
    
    if (done === total && total > 0) {
      const today = new Date().toISOString().split('T')[0];
      if (!streaks[today]) {
        streaks[today] = true;
        Storage.setStreaks(this.state.user.id, streaks);
      }
    }
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (streaks[key]) s++;
      else break;
    }
    return s;
  },

  resetDay() {
    if (!confirm("Reset today's tasks?")) return;
    this.state.completedTasks = [];
    Storage.setTasks(this.state.user.id, []);
    this.renderDashboard();
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
    
    const streaks = Storage.getStreaks(this.state.user.id);
    for (let d = 1; d <= dim; d++) {
      const ds = new Date(y, m, d).toISOString().split('T')[0];
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

  // Diary
  saveDiary() {
    const content = document.getElementById('diaryInput').value.trim();
    const mood = document.getElementById('diaryMood').value.trim() || '—';
    if (!content) { this.toast('Write something'); return; }

    const entry = { 
      id: generateId(), 
      content, 
      mood, 
      createdAt: new Date().toISOString() 
    };

    Storage.addDiaryEntry(this.state.user.id, entry);
    this.state.diary = Storage.getDiaryEntries(this.state.user.id);
    
    document.getElementById('diaryInput').value = '';
    document.getElementById('diaryMood').value = '';
    this.renderDiary();
    this.toast('💾 Saved!');
  },

  deleteDiary(id) {
    Storage.deleteDiaryEntry(this.state.user.id, id);
    this.state.diary = Storage.getDiaryEntries(this.state.user.id);
    this.renderDiary();
  },

  renderDiary() {
    const container = document.getElementById('diaryEntries');
    if (!container) return;
    
    const search = (document.getElementById('diarySearch')?.value || '').toLowerCase();
    let entries = this.state.diary;
    
    if (search) {
      entries = entries.filter(e => 
        e.content.toLowerCase().includes(search) || 
        e.mood.toLowerCase().includes(search)
      );
    }
    
    if (!entries.length) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;">' + 
        (search ? '🔍 No matches.' : '📝 No entries yet. Start writing!') + 
        '</p>';
      return;
    }
    
    container.innerHTML = entries.map(e => `
      <div class="entry-card">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <small style="color:#94a3b8;">${new Date(e.createdAt).toLocaleDateString()} ${new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
          <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">${escapeHtml(e.mood)}</span>
        </div>
        <p style="font-size:13px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(e.content)}</p>
        <button class="btn-sm btn-danger" onclick="Nexus.deleteDiary('${e.id}')" style="margin-top:5px;">🗑️</button>
      </div>
    `).join('');
  },

  // Routines
  saveRoutine() {
    const title = document.getElementById('routineTitle').value.trim();
    const content = document.getElementById('routineInput').value.trim();
    if (!title || !content) { this.toast('Add title & description'); return; }

    const routine = { 
      id: generateId(), 
      title, 
      content, 
      createdAt: new Date().toISOString() 
    };

    Storage.addRoutine(this.state.user.id, routine);
    this.state.routines = Storage.getRoutines(this.state.user.id);
    
    document.getElementById('routineTitle').value = '';
    document.getElementById('routineInput').value = '';
    this.renderRoutines();
    this.toast('💾 Saved!');
  },

  deleteRoutine(id) {
    Storage.deleteRoutine(this.state.user.id, id);
    this.state.routines = Storage.getRoutines(this.state.user.id);
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
        <strong>${escapeHtml(r.title)}</strong>
        <small style="color:#94a3b8;display:block;">${new Date(r.createdAt).toLocaleDateString()}</small>
        <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">${escapeHtml(r.content)}</p>
        <button class="btn-sm btn-danger" onclick="Nexus.deleteRoutine('${r.id}')" style="margin-top:5px;">🗑️</button>
      </div>
    `).join('');
  },

  // Chat
  sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !this.state.user) return;

    const targetUserId = this.state.currentChatUser?.id || 'all';

    const message = {
      id: generateId(),
      username: this.state.user.username,
      userId: this.state.user.id,
      targetUserId: targetUserId,
      content: text,
      createdAt: new Date().toISOString()
    };

    Storage.addChatMessage(message);
    this.state.chatMessages = Storage.getChatMessages();
    input.value = '';
    this.renderChatMessages();
    
    // Add to friends if not already
    if (targetUserId !== 'all') {
      const friends = Storage.get(`nexus_friends_${this.state.user.id}`, []);
      if (!friends.includes(targetUserId)) {
        friends.push(targetUserId);
        Storage.set(`nexus_friends_${this.state.user.id}`, friends);
        this.state.friends = friends;
      }
    }
  },

  renderChat() {
    const myUsername = document.getElementById('myUsername');
    if (myUsername) myUsername.textContent = this.state.user?.username || '—';
    this.renderUserList();
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
    
    const filteredMessages = this.state.currentChatUser 
      ? messages.filter(m => m.userId === this.state.currentChatUser.id || m.targetUserId === this.state.user.id || m.userId === this.state.user.id)
      : messages;
    
    if (!filteredMessages.length) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">💬 No messages with this user yet. Say hi!</p>';
      return;
    }
    
    container.innerHTML = filteredMessages.map(m => {
      const me = m.userId === this.state.user?.id;
      const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin:3px 0;">
        <div style="max-width:82%;">
          <div class="chat-bubble ${me ? 'chat-sent' : 'chat-received'}">
            <div style="font-size:10px;font-weight:600;opacity:0.7;">${escapeHtml(m.username)} · ${time}</div>
            <p style="margin:2px 0 0;">${escapeHtml(m.content)}</p>
          </div>
          ${me ? `<button class="btn-sm btn-danger" onclick="Nexus.deleteMessage('${m.id}')" style="font-size:9px;padding:2px 5px;margin-top:1px;">🗑️</button>` : ''}
        </div>
      </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  },

  deleteMessage(id) {
    let messages = Storage.getChatMessages();
    messages = messages.filter(m => m.id !== id);
    Storage.set('nexus_chat', messages);
    this.state.chatMessages = messages;
    this.renderChatMessages();
  },

  // Social Feed
  createPost() {
    const input = document.getElementById('postInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) { this.toast('Write something'); return; }

    const avatar = this.state.selectedAuras.length ? 
      this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
    const randImg = UNSPLASH ? UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)] : null;

    const post = {
      id: generateId(),
      userId: this.state.user.id,
      author: this.state.user.username,
      avatar: avatar,
      text: escapeHtml(text),
      image: randImg,
      likes: [],
      createdAt: new Date().toISOString()
    };

    Storage.addPost(post);
    this.state.posts = Storage.getPosts();
    input.value = '';
    this.renderSocial();
    this.toast('Posted! ✨');
  },

  likePost(postId) {
    Storage.toggleLike(postId, this.state.user.id);
    this.state.posts = Storage.getPosts();
    this.renderSocial();
  },

  deletePost(postId) {
    if (!confirm('Delete this post?')) return;
    Storage.deletePost(postId);
    this.state.posts = Storage.getPosts();
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
      avatarEl.textContent = this.state.selectedAuras.length ? 
        this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
    }

    try {
      const posts = this.state.posts || [];
      
      if (!posts.length) {
        container.innerHTML = `<div style="text-align:center;padding:40px 0;color:#94a3b8;">
          <div style="font-size:48px;margin-bottom:12px;">📸</div>
          <p>No posts yet. Share your journey!</p>
        </div>`;
        return;
      }

      container.innerHTML = posts.map(p => {
        const liked = (p.likes || []).includes(this.state.user.id);
        const timeAgo = this.timeSince(p.createdAt);
        const imageUrl = p.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80';
        
        return `
          <div class="ig-post">
            <div class="ig-post-header">
              <div class="ig-post-avatar">${escapeHtml(p.avatar || '😊')}</div>
              <span class="ig-post-user">${escapeHtml(p.author)}</span>
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
            <div class="ig-post-likes">${(p.likes || []).length} ${(p.likes || []).length === 1 ? 'like' : 'likes'}</div>
            <div class="ig-post-caption"><strong>${escapeHtml(p.author)}</strong> ${escapeHtml(p.text)}</div>
            <div class="ig-post-comment" onclick="Nexus.toast('Comment feature coming soon')">View all comments</div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('Render social error:', error);
      container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px;">❌ Failed to load feed</p>';
    }
  },

  // Profile
  editProfile() {
    const newBio = prompt('Edit your bio:', this.state.bio || '');
    if (newBio !== null) {
      this.state.bio = newBio.trim() || 'Building my energy. One aura at a time. ⚡';
      Storage.updateProfile(this.state.user.id, { bio: this.state.bio });
      this.renderProfile();
      this.toast('Bio updated');
    }
  },

  changeUsername() {
    const newName = prompt('Enter new username:', this.state.user.username);
    if (newName && newName.trim()) {
      const users = Storage.getAllUsers();
      if (users.find(u => u.username === newName.trim() && u.id !== this.state.user.id)) {
        this.toast('Username taken');
        return;
      }
      
      const user = users.find(u => u.id === this.state.user.id);
      if (user) {
        user.username = newName.trim();
        Storage.set('nexus_users', users);
        this.state.user.username = newName.trim();
        Storage.setUser(this.state.user);
        this.renderProfile();
        this.toast('Username updated');
      }
    }
  },

  renderProfile() {
    const avatarEmoji = this.state.selectedAuras.length ? 
      this.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';

    const profileAvatarEmoji = document.getElementById('profileAvatarEmoji');
    const profileName = document.getElementById('profileName');
    const profileUsername = document.getElementById('profileUsername');
    const profileBio = document.getElementById('profileBio');

    if (profileAvatarEmoji) profileAvatarEmoji.textContent = avatarEmoji;
    if (profileName) profileName.textContent = this.state.user?.username || '—';
    if (profileUsername) profileUsername.textContent = '@' + (this.state.user?.username || '—');
    if (profileBio) profileBio.textContent = this.state.bio || 'Building my energy. One aura at a time. ⚡';

    const userPosts = this.state.posts.filter(p => p.userId === this.state.user.id);
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
      <div style="aspect-ratio:1;background-image:url('${p.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'}');background-size:cover;background-position:center;border-radius:4px;cursor:pointer;" onclick="Nexus.toast('${escapeHtml(p.text.substring(0, 30))}...')"></div>
    `).join('');
  },

  // Wallpapers
  setWallpaper(url) {
    this.state.wallpaper = url;
    this.setBg(url);
    this.renderWallpapers();
    this.toast('Applied');
  },

  randomWallpaper() {
    if (UNSPLASH && UNSPLASH.length) {
      this.setWallpaper(UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]);
    }
  },

  renderWallpapers() {
    const wpCount = document.getElementById('wpCount');
    const grid = document.getElementById('wpGrid');
    
    if (wpCount) {
      wpCount.textContent = (UNSPLASH ? UNSPLASH.length : 0) + ' wallpapers';
    }
    if (!grid) return;
    
    if (!UNSPLASH || !UNSPLASH.length) {
      grid.innerHTML = '<p style="color:#94a3b8;text-align:center;">No wallpapers available</p>';
      return;
    }
    
    grid.innerHTML = UNSPLASH.map(url => {
      const selected = this.state.wallpaper === url;
      return `<div class="wp-thumb${selected ? ' selected' : ''}" style="background-image:url('${url}')" onclick="Nexus.setWallpaper('${url}')"></div>`;
    }).join('');
  },

  logout() {
    if (!confirm('Logout?')) return;
    Storage.remove('nexus_user');
    window.location.href = 'index.html';
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Nexus.init());
else Nexus.init();