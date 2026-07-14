// js/app.js - Main Controller
const Nexus = {
    state: {
        user: null,
        username: '',
        selectedAuras: [],
        completedTasks: [],
        streakData: {},
        wallpaper: UNSPLASH ? UNSPLASH[0] : '',
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
        document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active');
            if (b.dataset.page === page) b.classList.add('active');
        });

        const nav = document.getElementById('bottomNav');
        const hideNav = ['landing', 'login', 'signup', 'select'];
        nav.style.display = hideNav.includes(page) ? 'none' : 'flex';

        if (page === 'select') Auras.render();
        if (page === 'dashboard') Dashboard.render();
        if (page === 'diary') Diary.render();
        if (page === 'routine') Routine.render();
        if (page === 'chat') Chat.render();
        if (page === 'social') Social.render();
        if (page === 'profile') Profile.render();
        if (page === 'wallpapers') Wallpapers.render();

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

    handleSignup() { Auth.handleSignup(); },
    handleLogin() { Auth.handleLogin(); },
    logout() { Auth.logout(); },

    sendMessage() { Chat.sendMessage(); },
    deleteMessage(id) { Chat.deleteMessage(id); },
    changeUsername() { Chat.changeUsername(); },

    createPost() { Social.createPost(); },
    likePost(id) { Social.likePost(id); },
    deletePost(id) { Social.deletePost(id); },

    saveDiary() { Diary.saveDiary(); },
    deleteDiary(index) { Diary.deleteDiary(index); },

    saveRoutine() { Routine.saveRoutine(); },
    deleteRoutine(id) { Routine.deleteRoutine(id); },

    toggleTask(index) { Dashboard.toggleTask(index); },
    resetDay() { Dashboard.resetDay(); },

    toggleAura(key) { Auras.toggleAura(key); },
    confirmSelection() { Auras.confirmSelection(); },

    setWallpaper(url) { Wallpapers.setWallpaper(url); },
    randomWallpaper() { Wallpapers.randomWallpaper(); },

    editProfile() { Profile.editProfile(); },
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Nexus.init());
} else {
    Nexus.init();
}