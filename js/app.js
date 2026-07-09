// js/app.js - FIXED
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
    chatChannel: null,
    // ✅ ADD MISSING STATE
    diary: [],
    routines: [],
    isLoading: false,
    online: navigator.onLine
  },

  // ✅ Connection listener
  initConnectionListener() {
    window.addEventListener('online', () => {
      Nexus.state.online = true;
      Nexus.toast('🟢 Back online');
      Nexus.syncData();
    });
    window.addEventListener('offline', () => {
      Nexus.state.online = false;
      Nexus.toast('🔴 You are offline');
    });
  },

  // ✅ Sync offline data
  async syncData() {
    if (!Nexus.state.online) return;
    try {
      // Sync diary entries
      const offlineDiary = JSON.parse(localStorage.getItem('offline_diary') || '[]');
      if (offlineDiary.length) {
        for (const entry of offlineDiary) {
          await supabase.from('diary_entries').insert({
            user_id: Nexus.state.user.id,
            content: entry.content,
            mood: entry.mood,
            created_at: entry.createdAt
          });
        }
        localStorage.removeItem('offline_diary');
        await Nexus.loadDiary();
        Nexus.renderDiary();
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  },

  async init() {
    const saved = localStorage.getItem('nexus_user');
    if (!saved) { 
      window.location.href = 'index.html'; 
      return; 
    }

    Nexus.state.user = JSON.parse(saved);
    
    // ✅ Check session with Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      localStorage.removeItem('nexus_user');
      window.location.href = 'login.html';
      return;
    }

    await Nexus.loadProfile();
    Nexus.setBg(Nexus.state.wallpaper);
    Nexus.initConnectionListener();
    
    // Load local data
    Nexus.loadLocalData();

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

    // Enter key for post
    document.getElementById('postInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        Nexus.createPost();
      }
    });

    Nexus.navigate(Nexus.state.selectedAuras.length ? 'social' : 'select');
    console.log('⚡ Nexus · id³ ready');
  },

  // ✅ Load local data
  loadLocalData() {
    const userId = Nexus.state.user?.id || 'default';
    Nexus.state.diary = JSON.parse(localStorage.getItem(`nexus_diary_${userId}`) || '[]');
    Nexus.state.routines = JSON.parse(localStorage.getItem(`nexus_routines_${userId}`) || '[]');
  },

  // ✅ Save local data
  saveLocalData() {
    const userId = Nexus.state.user?.id || 'default';
    localStorage.setItem(`nexus_diary_${userId}`, JSON.stringify(Nexus.state.diary));
    localStorage.setItem(`nexus_routines_${userId}`, JSON.stringify(Nexus.state.routines));
  },

  // ✅ Enhanced toast
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

  // ✅ Loading state
  setLoading(state) {
    Nexus.state.isLoading = state;
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = state ? 'flex' : 'none';
    }
  },

  async loadProfile() {
    if (!Nexus.state.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', Nexus.state.user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        Nexus.state.profile = data;
        Nexus.state.selectedAuras = data.selected_auras || [];
        Nexus.state.wallpaper = data.wallpaper || Nexus.state.wallpaper;
        Nexus.state.bio = data.bio || 'Building my energy. One aura at a time. ⚡';
        await Nexus.loadTaskCompletions();
        await Nexus.loadStreakData();
      }
    } catch (error) {
      console.error('Profile load error:', error);
      Nexus.toast('Failed to load profile');
    }
  },

  async loadTaskCompletions() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('task_completions')
        .select('task_index')
        .eq('user_id', Nexus.state.user.id)
        .eq('completed_at', today);
      
      if (error) throw error;
      Nexus.state.completedTasks = (data || []).map(d => d.task_index);
    } catch (error) {
      console.error('Task completions load error:', error);
    }
  },

  async loadStreakData() {
    try {
      const { data, error } = await supabase
        .from('streak_days')
        .select('streak_date')
        .eq('user_id', Nexus.state.user.id);
      
      if (error) throw error;
      Nexus.state.streakData = {};
      (data || []).forEach(d => { Nexus.state.streakData[d.streak_date] = true; });
    } catch (error) {
      console.error('Streak data load error:', error);
    }
  },

  // ✅ Logout with auth
  async logout() {
    if (!confirm('Logout?')) return;
    
    try {
      // Cleanup chat channel
      if (Nexus.state.chatChannel) {
        supabase.removeChannel(Nexus.state.chatChannel);
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      localStorage.removeItem('nexus_user');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      Nexus.toast('Failed to logout');
    }
  },

  // ... keep all other existing methods (toggleAura, renderAuraGrid, confirmSelection, etc.)
  // They remain the same, just ensure error handling is added
  
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
  }
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => Nexus.init());
else Nexus.init();