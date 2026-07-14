// js/app.js - Main Controller
const Nexus = {
    state: {
        user: null,
        username: '',
        selectedAuras: [],
        completedTasks: [],
        streakData: {},
        wallpaper: typeof UNSPLASH !== 'undefined' ? UNSPLASH[0] : '',
        diary: [],
        routines: [],
        posts: [],
        likedPosts: [],
        bio: 'Building my energy. One aura at a time. ⚡',
        chatMessages: []
    },

    init() {
        const loggedIn = Auth.loadAuth();
        if (loggedIn) {
            this.state.chatMessages = Storage.getChat();
            this.setBg(this.state.wallpaper);
            document.getElementById('myUsername').textContent = this.state.username;
            this.updateOnline();
            this.navigate('social');
        } else {
            this.navigate('landing');
        }
        setInterval(() => {
            if (this.state.username) this.updateOnline();
        }, 5000);
        console.log('⚡ Nexus ready');
    },

    navigate(page) {
        console.log('Navigating to:', page);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
        
        // Show target page
        const target = document.getElementById('page-' + page);
        if (target) {
            target.classList.add('active');
            console.log('✅ Page found:', page);
        } else {
            console.log('❌ Page not found:', page);
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.page === page) b.classList.add('active');
        });

        // Show/hide bottom nav
        const nav = document.getElementById('bottomNav');
        const hideNav = ['landing', 'login', 'signup', 'select'];
        if (nav) {
            nav.style.display = hideNav.includes(page) ? 'none' : 'flex';
        }

        // Render page content
        if (page === 'select' && typeof Auras !== 'undefined') Auras.render();
        if (page === 'dashboard' && typeof Dashboard !== 'undefined') Dashboard.render();
        if (page === 'diary' && typeof Diary !== 'undefined') Diary.render();
        if (page === 'routine' && typeof Routine !== 'undefined') Routine.render();
        if (page === 'chat' && typeof Chat !== 'undefined') {
            Chat.render();
            Chat.startPoll();
        }
        if (page === 'social' && typeof Social !== 'undefined') {
            Social.render();
            Social.renderStories();
        }
        if (page === 'profile' && typeof Profile !== 'undefined') Profile.render();
        if (page === 'wallpapers' && typeof Wallpapers !== 'undefined') Wallpapers.render();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    toast(msg) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = msg;
        const container = document.getElementById('toastContainer');
        if (container) {
            container.appendChild(t);
            setTimeout(() => t.remove(), 2200);
        }
    },

    setBg(url) {
        if (!url) return;
        this.state.wallpaper = url;
        Auth.saveAuth();
        const s = document.createElement('style');
        s.textContent = `body::before{background-image:url('${url}')!important}`;
        const o = document.querySelector('style[data-bg]');
        if (o) o.remove();
        s.setAttribute('data-bg', '');
        document.head.appendChild(s);
    },

    updateOnline() {
        const u = JSON.parse(localStorage.getItem('nexus_online') || '{}');
        if (this.state.username) u[this.state.username] = Date.now();
        const n = Date.now();
        for (const [k, v] of Object.entries(u)) {
            if (n - v > 30000) delete u[k];
        }
        localStorage.setItem('nexus_online', JSON.stringify(u));
        const count = Object.keys(u).length;
        const onlineEl = document.getElementById('onlineCount');
        if (onlineEl) onlineEl.textContent = count;
        return count;
    },

    // ==================== AUTH HANDLERS ====================
    handleSignup() {
        if (typeof Auth !== 'undefined') Auth.handleSignup();
        else console.error('Auth not loaded');
    },

    handleLogin() {
        if (typeof Auth !== 'undefined') Auth.handleLogin();
        else console.error('Auth not loaded');
    },

    logout() {
        if (typeof Auth !== 'undefined') Auth.logout();
        else console.error('Auth not loaded');
    },

    // ==================== CHAT HANDLERS ====================
    sendMessage() {
        if (typeof Chat !== 'undefined') Chat.sendMessage();
    },

    deleteMessage(id) {
        if (typeof Chat !== 'undefined') Chat.deleteMessage(id);
    },

    changeUsername() {
        if (typeof Chat !== 'undefined') Chat.changeUsername();
    },

    // ==================== SOCIAL HANDLERS ====================
    createPost() {
        if (typeof Social !== 'undefined') Social.createPost();
    },

    likePost(id) {
        if (typeof Social !== 'undefined') Social.likePost(id);
    },

    deletePost(id) {
        if (typeof Social !== 'undefined') Social.deletePost(id);
    },

    // ==================== DIARY HANDLERS ====================
    saveDiary() {
        if (typeof Diary !== 'undefined') Diary.saveDiary();
    },

    deleteDiary(index) {
        if (typeof Diary !== 'undefined') Diary.deleteDiary(index);
    },

    renderDiary() {
        if (typeof Diary !== 'undefined') Diary.render();
    },

    // ==================== ROUTINE HANDLERS ====================
    saveRoutine() {
        if (typeof Routine !== 'undefined') Routine.saveRoutine();
    },

    deleteRoutine(id) {
        if (typeof Routine !== 'undefined') Routine.deleteRoutine(id);
    },

    // ==================== DASHBOARD HANDLERS ====================
    toggleTask(index) {
        if (typeof Dashboard !== 'undefined') Dashboard.toggleTask(index);
    },

    resetDay() {
        if (typeof Dashboard !== 'undefined') Dashboard.resetDay();
    },

    // ==================== AURA HANDLERS ====================
    toggleAura(key) {
        if (typeof Auras !== 'undefined') Auras.toggleAura(key);
    },

    confirmSelection() {
        if (typeof Auras !== 'undefined') Auras.confirmSelection();
    },

    renderAuraGrid() {
        if (typeof Auras !== 'undefined') Auras.render();
    },

    // ==================== WALLPAPER HANDLERS ====================
    setWallpaper(url) {
        if (typeof Wallpapers !== 'undefined') Wallpapers.setWallpaper(url);
    },

    randomWallpaper() {
        if (typeof Wallpapers !== 'undefined') Wallpapers.randomWallpaper();
    },

    renderWallpapers() {
        if (typeof Wallpapers !== 'undefined') Wallpapers.render();
    },

    // ==================== PROFILE HANDLERS ====================
    editProfile() {
        if (typeof Profile !== 'undefined') Profile.editProfile();
    },

    renderProfile() {
        if (typeof Profile !== 'undefined') Profile.render();
    }
};

// ==================== INITIALIZE ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
    Nexus.init();
}