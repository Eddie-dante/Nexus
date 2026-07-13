// js/api.js - Complete API Client
(function() {
    // Use window.API_BASE_URL set in HTML
    const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';
    
    // Also set it on the window object if not already
    if (!window.API_BASE_URL) {
        window.API_BASE_URL = API_BASE_URL;
    }

    const API = {
        baseURL: API_BASE_URL,

        // Helper for fetch requests
        async request(endpoint, options = {}) {
            const url = `${this.baseURL}${endpoint}`;
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(options.headers || {})
                    }
                });
                
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Request failed');
                }
                return data;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        // ==================== USERS ====================
        
        signup(username, password) {
            return this.request('/signup', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        login(username, password) {
            return this.request('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        getUser(id) {
            return this.request(`/users/${id}`);
        },

        // ==================== PROFILES ====================

        getProfile(userId) {
            return this.request(`/profiles/${userId}`);
        },

        updateProfile(userId, data) {
            return this.request(`/profiles/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        // ==================== CHAT ====================

        getChatMessages() {
            return this.request('/chat');
        },

        sendMessage(userId, username, content) {
            return this.request('/chat', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, username, content })
            });
        },

        deleteMessage(id) {
            return this.request(`/chat/${id}`, {
                method: 'DELETE'
            });
        },

        // ==================== DIARY ====================

        getDiaryEntries(userId) {
            return this.request(`/diary/${userId}`);
        },

        addDiaryEntry(userId, content, mood) {
            return this.request('/diary', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, content, mood })
            });
        },

        deleteDiaryEntry(id) {
            return this.request(`/diary/${id}`, {
                method: 'DELETE'
            });
        },

        // ==================== ROUTINES ====================

        getRoutines(userId) {
            return this.request(`/routines/${userId}`);
        },

        addRoutine(userId, title, content) {
            return this.request('/routines', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, title, content })
            });
        },

        deleteRoutine(id) {
            return this.request(`/routines/${id}`, {
                method: 'DELETE'
            });
        },

        // ==================== POSTS ====================

        getPosts() {
            return this.request('/posts');
        },

        addPost(userId, author, avatar, text, image) {
            return this.request('/posts', {
                method: 'POST',
                body: JSON.stringify({ user_id: userId, author, avatar, text, image })
            });
        },

        deletePost(id) {
            return this.request(`/posts/${id}`, {
                method: 'DELETE'
            });
        },

        likePost(postId, userId) {
            return this.request(`/posts/${postId}/like`, {
                method: 'POST',
                body: JSON.stringify({ user_id: userId })
            });
        },

        // ==================== TASKS ====================

        getTasks(userId) {
            return this.request(`/tasks/${userId}`);
        },

        toggleTask(userId, taskIndex) {
            return this.request(`/tasks/${userId}/toggle`, {
                method: 'POST',
                body: JSON.stringify({ task_index: taskIndex })
            });
        },

        // ==================== STREAKS ====================

        getStreaks(userId) {
            return this.request(`/streaks/${userId}`);
        },

        markStreak(userId) {
            return this.request(`/streaks/${userId}`, {
                method: 'POST'
            });
        },

        // ==================== HEALTH ====================

        health() {
            return this.request('/health');
        }
    };

    // Make it globally available
    window.API = API;

    console.log('✅ API client ready, baseURL:', API_BASE_URL);
})();