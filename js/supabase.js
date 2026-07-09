// js/storage.js - NEW FILE (replace supabase.js)
// Simple localStorage wrapper that works everywhere

const Storage = {
  // Get data from localStorage
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  // Set data in localStorage
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // Remove data
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Get all keys
  getAllKeys() {
    return Object.keys(localStorage);
  },

  // Clear all data
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // Get user data
  getUser() {
    return this.get('nexus_user');
  },

  // Set user data
  setUser(user) {
    return this.set('nexus_user', user);
  },

  // Get all users (for multi-user support)
  getAllUsers() {
    return this.get('nexus_users', []);
  },

  // Add a new user
  addUser(user) {
    const users = this.getAllUsers();
    // Check if username exists
    if (users.find(u => u.username === user.username)) {
      return false;
    }
    users.push(user);
    return this.set('nexus_users', users);
  },

  // Get user by username/password
  findUser(username, password) {
    const users = this.getAllUsers();
    return users.find(u => u.username === username && u.password === password) || null;
  },

  // Get user by id
  findUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  },

  // Get chat messages
  getChatMessages() {
    return this.get('nexus_chat', []);
  },

  // Add chat message
  addChatMessage(message) {
    const messages = this.getChatMessages();
    messages.push(message);
    // Keep last 500 messages
    if (messages.length > 500) {
      messages.splice(0, messages.length - 500);
    }
    return this.set('nexus_chat', messages);
  },

  // Get diary entries
  getDiaryEntries(userId) {
    return this.get(`nexus_diary_${userId}`, []);
  },

  // Add diary entry
  addDiaryEntry(userId, entry) {
    const entries = this.getDiaryEntries(userId);
    entries.unshift(entry);
    return this.set(`nexus_diary_${userId}`, entries);
  },

  // Delete diary entry
  deleteDiaryEntry(userId, entryId) {
    const entries = this.getDiaryEntries(userId);
    const filtered = entries.filter(e => e.id !== entryId);
    return this.set(`nexus_diary_${userId}`, filtered);
  },

  // Get routines
  getRoutines(userId) {
    return this.get(`nexus_routines_${userId}`, []);
  },

  // Add routine
  addRoutine(userId, routine) {
    const routines = this.getRoutines(userId);
    routines.unshift(routine);
    return this.set(`nexus_routines_${userId}`, routines);
  },

  // Delete routine
  deleteRoutine(userId, routineId) {
    const routines = this.getRoutines(userId);
    const filtered = routines.filter(r => r.id !== routineId);
    return this.set(`nexus_routines_${userId}`, filtered);
  },

  // Get posts
  getPosts() {
    return this.get('nexus_posts', []);
  },

  // Add post
  addPost(post) {
    const posts = this.getPosts();
    posts.unshift(post);
    if (posts.length > 100) {
      posts.splice(100);
    }
    return this.set('nexus_posts', posts);
  },

  // Delete post
  deletePost(postId) {
    const posts = this.getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    return this.set('nexus_posts', filtered);
  },

  // Like/unlike post
  toggleLike(postId, userId) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    
    const likes = post.likes || [];
    const index = likes.indexOf(userId);
    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(userId);
    }
    post.likes = likes;
    return this.set('nexus_posts', posts);
  },

  // Get online users (simulated)
  getOnlineUsers() {
    return this.get('nexus_online', {});
  },

  // Update online status
  updateOnlineStatus(username) {
    const online = this.getOnlineUsers();
    online[username] = Date.now();
    // Cleanup old entries (older than 30 seconds)
    const now = Date.now();
    for (const [key, value] of Object.entries(online)) {
      if (now - value > 30000) {
        delete online[key];
      }
    }
    return this.set('nexus_online', online);
  },

  // Get profile
  getProfile(userId) {
    return this.get(`nexus_profile_${userId}`, {
      bio: 'Building my energy. One aura at a time. ⚡',
      wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
      selectedAuras: []
    });
  },

  // Update profile
  updateProfile(userId, profile) {
    const current = this.getProfile(userId);
    const updated = { ...current, ...profile };
    return this.set(`nexus_profile_${userId}`, updated);
  }
};

// Make it globally available
window.Storage = Storage;

console.log('✅ Storage ready (localStorage mode)');
console.log('✅ All data will be stored locally');