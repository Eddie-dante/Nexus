Nexus.renderStories = function() {
  const row = document.getElementById('storyRow');
  if (!row) return;
  const users = [...new Set(Nexus.state.socialPosts.map(p => p.author))];
  if (!users.length) {
    row.innerHTML = '<div style="display:flex;gap:10px;padding:4px 0;color:#94a3b8;font-size:12px;">No stories yet</div>';
    return;
  }
  row.innerHTML = users.slice(0, 10).map(u => {
    const post = Nexus.state.socialPosts.find(p => p.author === u);
    const emoji = post ? post.avatar : '😊';
    return `<div class="ig-story"><div class="ig-story-avatar"><div class="inner">${emoji}</div></div><span class="ig-story-name">${u}</span></div>`;
  }).join('');
};

Nexus.createPost = function() {
  const input = document.getElementById('postInput');
  const text = input.value.trim();
  if (!text) { Nexus.toast('Write something'); return; }
  const avatar = Nexus.state.selectedAuras.length ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
  const randImg = UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)];
  Nexus.state.socialPosts.unshift({
    id: Date.now().toString(),
    author: Nexus.state.user.username,
    avatar,
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
    image: randImg
  });
  Nexus.saveLocalData();
  input.value = '';
  Nexus.renderSocial();
  Nexus.renderStories();
  Nexus.toast('Posted!');
};

Nexus.likePost = function(postId) {
  const post = Nexus.state.socialPosts.find(p => p.id === postId);
  if (!post) return;
  if (Nexus.state.likedPosts.includes(postId)) {
    Nexus.state.likedPosts = Nexus.state.likedPosts.filter(id => id !== postId);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    Nexus.state.likedPosts.push(postId);
    post.likes++;
  }
  Nexus.saveLocalData();
  Nexus.renderSocial();
};

Nexus.deletePost = function(postId) {
  if (!confirm('Delete this post?')) return;
  Nexus.state.socialPosts = Nexus.state.socialPosts.filter(p => p.id !== postId);
  Nexus.state.likedPosts = Nexus.state.likedPosts.filter(id => id !== postId);
  Nexus.saveLocalData();
  Nexus.renderSocial();
  Nexus.renderStories();
};

Nexus.timeSince = function(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return diff + 's';
  if (diff < 3600) return Math.floor(diff / 60) + 'm';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd';
  return date.toLocaleDateString();
};

Nexus.renderSocial = function() {
  const container = document.getElementById('socialFeed');
  if (!container) return;

  const avatarEl = document.getElementById('postAvatarEmoji');
  if (avatarEl) {
    avatarEl.textContent = Nexus.state.selectedAuras.length ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
  }

  if (!Nexus.state.socialPosts.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px 0;color:#94a3b8;">
      <div style="font-size:48px;margin-bottom:12px;">📸</div>
      <p>No posts yet. Share your journey!</p>
    </div>`;
    return;
  }

  container.innerHTML = Nexus.state.socialPosts.map(p => {
    const liked = Nexus.state.likedPosts.includes(p.id);
    const timeAgo = Nexus.timeSince(new Date(p.createdAt));
    return `
      <div class="ig-post">
        <div class="ig-post-header">
          <div class="ig-post-avatar">${p.avatar}</div>
          <span class="ig-post-user">${p.author}</span>
          <span class="ig-post-time">${timeAgo}</span>
          ${p.author === Nexus.state.user?.username ? `<button class="btn-sm btn-danger" onclick="Nexus.deletePost('${p.id}')" style="font-size:11px;padding:2px 8px;">🗑️</button>` : ''}
        </div>
        <div class="ig-post-image" style="background-image:url('${p.image || UNSPLASH[0]}')">
          ${p.image ? '' : '📷'}
        </div>
        <div class="ig-post-actions">
          <button class="ig-post-action ${liked ? 'liked' : ''}" onclick="Nexus.likePost('${p.id}')">${liked ? '❤️' : '🤍'}</button>
          <button class="ig-post-action" onclick="Nexus.toast('Comment feature coming soon')">💬</button>
          <button class="ig-post-action" onclick="Nexus.toast('Share feature coming soon')">📤</button>
        </div>
        <div class="ig-post-likes">${p.likes} ${p.likes === 1 ? 'like' : 'likes'}</div>
        <div class="ig-post-caption"><strong>${p.author}</strong> ${p.text}</div>
        <div class="ig-post-comment" onclick="Nexus.toast('Comment feature coming soon')">View all comments</div>
      </div>
    `;
  }).join('');
};