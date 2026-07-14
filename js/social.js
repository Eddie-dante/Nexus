// js/social.js - Social Feed Logic
const Social = {
    renderStories() {
        const row = document.getElementById('storyRow');
        if (!row) return;
        const users = [...new Set(Nexus.state.posts.map(p => p.author))];
        if (users.length === 0) {
            row.innerHTML = '<div style="display:flex;gap:10px;padding:4px 0;color:#94a3b8;font-size:12px;">No stories yet</div>';
            return;
        }
        row.innerHTML = users.slice(0, 10).map(u => {
            const post = Nexus.state.posts.find(p => p.author === u);
            const emoji = post ? post.avatar : '😊';
            return `<div class="ig-story"><div class="ig-story-avatar"><div class="inner">${emoji}</div></div><span class="ig-story-name">${u}</span></div>`;
        }).join('');
    },

    createPost() {
        const input = document.getElementById('postInput');
        const text = input.value.trim();
        if (!text) {
            Nexus.toast('Write something');
            return;
        }
        const avatar = Nexus.state.selectedAuras.length > 0 ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
        const randImg = UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)];
        Nexus.state.posts.unshift({
            id: Date.now(),
            author: Nexus.state.username || 'You',
            avatar: avatar,
            text: text,
            time: new Date().toISOString(),
            likes: 0,
            image: randImg
        });
        Auth.saveAuth();
        input.value = '';
        this.render();
        this.renderStories();
        Nexus.toast('📝 Posted!');
    },

    likePost(id) {
        const post = Nexus.state.posts.find(x => x.id === id);
        if (!post) return;
        if (Nexus.state.likedPosts.includes(id)) {
            Nexus.state.likedPosts = Nexus.state.likedPosts.filter(x => x !== id);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            Nexus.state.likedPosts.push(id);
            post.likes++;
        }
        Auth.saveAuth();
        this.render();
    },

    deletePost(id) {
        if (!confirm('Delete this post?')) return;
        Nexus.state.posts = Nexus.state.posts.filter(p => p.id !== id);
        Nexus.state.likedPosts = Nexus.state.likedPosts.filter(x => x !== id);
        Auth.saveAuth();
        this.render();
        this.renderStories();
    },

    timeSince(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return diff + 's';
        if (diff < 3600) return Math.floor(diff / 60) + 'm';
        if (diff < 86400) return Math.floor(diff / 3600) + 'h';
        if (diff < 604800) return Math.floor(diff / 86400) + 'd';
        return date.toLocaleDateString();
    },

    render() {
        const container = document.getElementById('socialFeed');
        if (!container) return;
        const avatarEl = document.getElementById('postAvatarEmoji');
        if (avatarEl) {
            avatarEl.textContent = Nexus.state.selectedAuras.length > 0 ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
        }
        if (Nexus.state.posts.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px 0;color:#94a3b8;"><div style="font-size:48px;margin-bottom:12px;">📸</div><p>No posts yet. Share your journey!</p></div>';
            return;
        }
        container.innerHTML = Nexus.state.posts.map(p => {
            const liked = Nexus.state.likedPosts.includes(p.id);
            const timeAgo = this.timeSince(new Date(p.time));
            return `<div class="ig-post"><div class="ig-post-header"><div class="ig-post-avatar">${p.avatar}</div><span class="ig-post-user">${p.author}</span><span class="ig-post-time">${timeAgo}</span>${p.author === Nexus.state.username ? `<button class="btn-sm btn-danger" onclick="Nexus.deletePost(${p.id})" style="font-size:11px;padding:2px 8px;">🗑️</button>` : ''}</div><div class="ig-post-image" style="background-image:url('${p.image || UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)]}');background-size:cover;background-position:center;"></div><div class="ig-post-actions"><button class="ig-post-action ${liked ? 'liked' : ''}" onclick="Nexus.likePost(${p.id})">${liked ? '❤️' : '🤍'}</button><button class="ig-post-action" onclick="Nexus.toast('💬 Comment feature coming soon')">💬</button><button class="ig-post-action" onclick="Nexus.toast('📤 Share feature coming soon')">📤</button></div><div class="ig-post-likes">${p.likes} ${p.likes === 1 ? 'like' : 'likes'}</div><div class="ig-post-caption"><strong>${p.author}</strong> ${p.text}</div><div class="ig-post-comment" onclick="Nexus.toast('💬 Comment feature coming soon')">View all comments</div></div>`;
        }).join('');
    }
};