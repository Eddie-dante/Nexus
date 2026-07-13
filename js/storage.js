// js/storage.js - Complete storage
const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    },

    getUser() {
        return this.get('nexus_user');
    },

    setUser(user) {
        return this.set('nexus_user', user);
    },

    getChat() {
        return this.get('nexus_chat', []);
    },

    setChat(messages) {
        return this.set('nexus_chat', messages);
    },

    getDiary(userId) {
        return this.get(`nexus_diary_${userId}`, []);
    },

    setDiary(userId, entries) {
        return this.set(`nexus_diary_${userId}`, entries);
    },

    getRoutines(userId) {
        return this.get(`nexus_routines_${userId}`, []);
    },

    setRoutines(userId, routines) {
        return this.set(`nexus_routines_${userId}`, routines);
    },

    getPosts() {
        return this.get('nexus_posts', []);
    },

    setPosts(posts) {
        return this.set('nexus_posts', posts);
    },

    getProfile(userId) {
        return this.get(`nexus_profile_${userId}`, {
            bio: 'Building my energy. One aura at a time. ⚡',
            wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
            selectedAuras: []
        });
    },

    setProfile(userId, profile) {
        return this.set(`nexus_profile_${userId}`, profile);
    },

    getUsers() {
        return this.get('nexus_users', []);
    },

    setUsers(users) {
        return this.set('nexus_users', users);
    },

    addUser(user) {
        const users = this.getUsers();
        if (users.find(u => u.username === user.username)) return false;
        users.push(user);
        return this.setUsers(users);
    },

    findUser(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password) || null;
    },

    getTasks(userId) {
        return this.get(`nexus_tasks_${userId}`, []);
    },

    setTasks(userId, tasks) {
        return this.set(`nexus_tasks_${userId}`, tasks);
    },

    getStreaks(userId) {
        return this.get(`nexus_streaks_${userId}`, {});
    },

    setStreaks(userId, streaks) {
        return this.set(`nexus_streaks_${userId}`, streaks);
    },

    getOnline() {
        return this.get('nexus_online', {});
    },

    setOnline(online) {
        return this.set('nexus_online', online);
    },

    updateOnline(username) {
        const online = this.getOnline();
        online[username] = Date.now();
        const now = Date.now();
        for (const [key, value] of Object.entries(online)) {
            if (now - value > 30000) delete online[key];
        }
        return this.setOnline(online);
    },

    clearAll() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            return false;
        }
    }
};

window.Storage = Storage;
console.log('✅ Storage ready');