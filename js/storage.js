// js/storage.js - Local Storage
const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) { return defaultValue; }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) { return false; }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) { return false; }
    },

    getChat() {
        return this.get('nexus_chat', []);
    },

    setChat(messages) {
        return this.set('nexus_chat', messages.slice(-200));
    }
};