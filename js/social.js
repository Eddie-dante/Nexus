Nexus.createPost = async function() {
  const text = document.getElementById('postInput').value.trim();
  if (!text) { Nexus.toast('Write something'); return; }
  const avatar = Nexus.state.selectedAuras.length ? Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
  await supabase.from('posts').insert({ user_id: Nexus.state.user.id, author: Nexus.state.user.username, avatar, text });
  document.getElementById('postInput').value = '';
  Nexus.toast('Posted');
};

Nexus.likePost = async function(postId) {
  const liked = Nexus.state.likedPosts.includes(postId);
  if (liked) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', Nexus.state.user.id);
    await supabase.rpc('decrement_likes', { post_id: postId });
    Nexus.state.likedPosts = Nexus.state.likedPosts.filter(id => id !== postId);
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: Nexus.state.user.id });
    await supabase.rpc('increment_likes', { post_id: postId });
    Nexus.state.likedPosts.push(postId);
  }
  Nexus.renderSocial();
};

Nexus.deletePost = async function(postId) {
  await supabase.from('posts').delete().eq('id', postId);
  Nexus.renderSocial();
};

Nexus.renderSocial = async function() {
  const container = document.getElementById('socialFeed');
  if (!container) return;
  const [postsRes, likesRes] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('post_likes').select('post_id').eq('user_id', Nexus.state.user.id)
  ]);
  Nexus.state.likedPosts = (likesRes.data || []).map(l => l.post_id);
  const posts = postsRes.data || [];
  if (!posts.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No posts yet. Be the first!</p>';
    return;
  }
  container.innerHTML = posts.map(p => {
    const liked = Nexus.state.likedPosts.includes(p.id);
    const isOwner = p.user_id === Nexus.state.user?.id;
    return `<div class="post-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <div class="post-avatar">${p.avatar}</div>
        <div><strong>${p.author}</strong><br><small style="color:#94a3b8;">${new Date(p.created_at).toLocaleDateString()}</small></div>
      </div>
      <p style="font-size:12px;">${p.text}</p>
      <div class="post-actions">
        <span class="post-action${liked ? ' liked' : ''}" onclick="Nexus.likePost('${p.id}')">${liked ? '❤️' : '🤍'} ${p.likes}</span>
        ${isOwner ? `<span class="post-action" onclick="Nexus.deletePost('${p.id}')" style="color:#ef4444;">🗑️</span>` : ''}
      </div>
    </div>`;
  }).join('');
};