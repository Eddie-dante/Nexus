// js/storage.js - COMPLETE WITH USER MANAGEMENT
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

  // ==================== USERS ====================
  
  // Get all users
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

  // Find user by username/password
  findUser(username, password) {
    const users = this.getAllUsers();
    return users.find(u => u.username === username && u.password === password) || null;
  },

  // Find user by id
  findUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id) || null;
  },

  // Get current user
  getUser() {
    return this.get('nexus_user');
  },

  // Set current user
  setUser(user) {
    return this.set('nexus_user', user);
  },

  // ==================== FRIENDS ====================
  
  getFriends(userId) {
    return this.get(`nexus_friends_${userId}`, []);
  },

  addFriend(userId, friendId) {
    const friends = this.getFriends(userId);
    if (!friends.includes(friendId)) {
      friends.push(friendId);
      return this.set(`nexus_friends_${userId}`, friends);
    }
    return true;
  },

  // ==================== CHAT ====================

  getChatMessages() {
    return this.get('nexus_chat', []);
  },

  addChatMessage(message) {
    const messages = this.getChatMessages();
    messages.push(message);
    if (messages.length > 500) {
      messages.splice(0, messages.length - 500);
    }
    return this.set('nexus_chat', messages);
  },

  // ==================== DIARY ====================

  getDiaryEntries(userId) {
    return this.get(`nexus_diary_${userId}`, []);
  },

  addDiaryEntry(userId, entry) {
    const entries = this.getDiaryEntries(userId);
    entries.unshift(entry);
    return this.set(`nexus_diary_${userId}`, entries);
  },

  deleteDiaryEntry(userId, entryId) {
    const entries = this.getDiaryEntries(userId);
    const filtered = entries.filter(e => e.id !== entryId);
    return this.set(`nexus_diary_${userId}`, filtered);
  },

  // ==================== ROUTINES ====================

  getRoutines(userId) {
    return this.get(`nexus_routines_${userId}`, []);
  },

  addRoutine(userId, routine) {
    const routines = this.getRoutines(userId);
    routines.unshift(routine);
    return this.set(`nexus_routines_${userId}`, routines);
  },

  deleteRoutine(userId, routineId) {
    const routines = this.getRoutines(userId);
    const filtered = routines.filter(r => r.id !== routineId);
    return this.set(`nexus_routines_${userId}`, filtered);
  },

  // ==================== POSTS ====================

  getPosts() {
    return this.get('nexus_posts', []);
  },

  addPost(post) {
    const posts = this.getPosts();
    posts.unshift(post);
    if (posts.length > 100) {
      posts.splice(100);
    }
    return this.set('nexus_posts', posts);
  },

  deletePost(postId) {
    const posts = this.getPosts();
    const filtered = posts.filter(p => p.id !== postId);
    return this.set('nexus_posts', filtered);
  },

  toggleLike(postId, userId) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    
    if (!post.likes) post.likes = [];
    const index = post.likes.indexOf(userId);
    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(userId);
    }
    return this.set('nexus_posts', posts);
  },

  // ==================== ONLINE USERS ====================

  getOnlineUsers() {
    return this.get('nexus_online', {});
  },

  updateOnlineStatus(username) {
    const online = this.getOnlineUsers();
    online[username] = Date.now();
    const now = Date.now();
    for (const [key, value] of Object.entries(online)) {
      if (now - value > 30000) {
        delete online[key];
      }
    }
    return this.set('nexus_online', online);
  },

  // ==================== PROFILE ====================

  getProfile(userId) {
    return this.get(`nexus_profile_${userId}`, {
      bio: 'Building my energy. One aura at a time. ⚡',
      wallpaper: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
      selectedAuras: []
    });
  },

  updateProfile(userId, profile) {
    const current = this.getProfile(userId);
    const updated = { ...current, ...profile };
    return this.set(`nexus_profile_${userId}`, updated);
  },

  // ==================== TASKS ====================

  getTasks(userId) {
    return this.get(`nexus_tasks_${userId}`, []);
  },

  setTasks(userId, tasks) {
    return this.set(`nexus_tasks_${userId}`, tasks);
  },

  // ==================== STREAKS ====================

  getStreaks(userId) {
    return this.get(`nexus_streaks_${userId}`, {});
  },

  setStreaks(userId, streaks) {
    return this.set(`nexus_streaks_${userId}`, streaks);
  },

  // ==================== SEED DEMO USERS ====================

  seedDemoUsers() {
    const users = this.getAllUsers();
    if (users.length === 0) {
      // Create some demo users
      const demoUsers = [
        { id: 'demo_user_1', username: 'alex', password: 'password123', created: new Date().toISOString() },
        { id: 'demo_user_2', username: 'sarah', password: 'password123', created: new Date().toISOString() },
        { id: 'demo_user_3', username: 'mike', password: 'password123', created: new Date().toISOString() },
        { id: 'demo_user_4', username: 'jessica', password: 'password123', created: new Date().toISOString() },
        { id: 'demo_user_5', username: 'chris', password: 'password123', created: new Date().toISOString() }
      ];
      
      // Add each demo user
      demoUsers.forEach(u => {
        this.addUser(u);
        // Create profiles for demo users
        this.updateProfile(u.id, {
          bio: `Hi, I'm ${u.username}! 👋`,
          selectedAuras: ['focus', 'creativity']
        });
      });
      
      console.log('✅ Demo users created!');
    }
  }
};

// Make it globally available
window.Storage = Storage;

console.log('✅ Storage ready (localStorage mode)');