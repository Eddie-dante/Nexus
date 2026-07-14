# Create auth.js
echo "// js/auth.js - Auth Logic
const Auth = {
    loadAuth() {
        try {
            const raw = localStorage.getItem('nexus_auth');
            if (raw) {
                const data = JSON.parse(raw);
                if (data && data.username) {
                    Nexus.state.username = data.username;
                    const userData = JSON.parse(localStorage.getItem('nexus_data_' + data.username) || '{}');
                    Object.assign(Nexus.state, userData);
                    return true;
                }
            }
        } catch (e) {}
        return false;
    },

    saveAuth() {
        localStorage.setItem('nexus_auth', JSON.stringify({ username: Nexus.state.username }));
        localStorage.setItem('nexus_data_' + Nexus.state.username, JSON.stringify({
            selectedAuras: Nexus.state.selectedAuras,
            completedTasks: Nexus.state.completedTasks,
            streakData: Nexus.state.streakData,
            wallpaper: Nexus.state.wallpaper,
            diary: Nexus.state.diary,
            routines: Nexus.state.routines,
            posts: Nexus.state.posts,
            likedPosts: Nexus.state.likedPosts,
            bio: Nexus.state.bio
        }));
    },

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const user = document.getElementById('signupUser').value.trim();
        const pass = document.getElementById('signupPass').value.trim();
        if (!name || !user || !pass) {
            Nexus.toast('Please fill all fields');
            return;
        }
        const users = JSON.parse(localStorage.getItem('nexus_users') || '{}');
        if (users[user]) {
            Nexus.toast('Username already exists');
            return;
        }
        users[user] = { name, password: pass, created: Date.now() };
        localStorage.setItem('nexus_users', JSON.stringify(users));
        Nexus.state.username = user;
        Nexus.state.selectedAuras = [];
        Nexus.state.completedTasks = [];
        Nexus.state.streakData = {};
        Nexus.state.diary = [];
        Nexus.state.routines = [];
        Nexus.state.posts = [];
        Nexus.state.likedPosts = [];
        Nexus.state.bio = 'Building my energy. One aura at a time. ⚡';
        this.saveAuth();
        Nexus.toast('Account created! Welcome ' + name);
        Nexus.navigate('select');
    },

    handleLogin() {
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();
        if (!user || !pass) {
            Nexus.toast('Enter username and password');
            return;
        }
        const users = JSON.parse(localStorage.getItem('nexus_users') || '{}');
        if (!users[user] || users[user].password !== pass) {
            Nexus.toast('Invalid credentials');
            return;
        }
        Nexus.state.username = user;
        const userData = JSON.parse(localStorage.getItem('nexus_data_' + user) || '{}');
        Object.assign(Nexus.state, userData);
        Nexus.state.chatMessages = Storage.getChat();
        this.saveAuth();
        Nexus.setBg(Nexus.state.wallpaper);
        Nexus.toast('Welcome back, ' + users[user].name);
        Nexus.navigate('social');
    },

    logout() {
        if (!confirm('Logout?')) return;
        Nexus.state.username = '';
        localStorage.removeItem('nexus_auth');
        Nexus.toast('Logged out');
        Nexus.navigate('landing');
    }
};" > js/auth.js