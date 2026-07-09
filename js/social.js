// js/social.js - COMPLETE
Nexus.renderStories = async function() {
  const row = document.getElementById('storyRow');
  if (!row) return;

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('author, avatar')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;

    const users = [...new Set((posts || []).map(p => p.author))];

    if (!users.length) {
      row.innerHTML = '<div style="display:flex;gap:10px;padding:4px 0;color:#94a3b8;font-size:12px;">No stories yet</div>';
      return;
    }

    row.innerHTML = users.slice(0, 10).map(u => {
      const post = (posts || []).find(p => p.author === u);
      const emoji = post ? post.avatar : '😊';
      return `<div class="ig-story"><div class="ig-story-avatar"><div class="inner">${emoji}</div></div><span class="ig-story-name">${escapeHtml(u)}</span></div>`;
    }).join('');
  } catch (error) {
    console.error('Stories error:', error);
  }
};

Nexus.createPost = async function() {
  const input = document.getElementById('postInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) { Nexus.toast('Write something'); return; }

  const cleanText = escapeHtml(text);
  const avatar = Nexus.state.selectedAuras.length ? 
    Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
  const randImg = UNSPLASH[Math.floor(Math.random() * UNSPLASH.length)];

  Nexus.setLoading(true);
  try {
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: Nexus.state.user.id,
        author: Nexus.state.user.username,
        avatar: avatar,
        text: cleanText,
        image: randImg,
        likes: 0
      });

    if (error) throw error;

    input.value = '';
    await Nexus.renderSocial();
    await Nexus.renderStories();
    Nexus.toast('Posted! ✨');
  } catch (error) {
    console.error('Post error:', error);
    Nexus.toast('Failed to post: ' + error.message);
  } finally {
    Nexus.setLoading(false);
  }
};

Nexus.likePost = async function(postId) {
  const liked = Nexus.state.likedPosts.includes(postId);

  try {
    if (liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', Nexus.state.user.id);
      
      Nexus.state.likedPosts = Nexus.state.likedPosts.filter(id => id !== postId);
    } else {
      await supabase
        .from('post_likes')
        .insert({ 
          post_id: postId, 
          user_id: Nexus.state.user.id 
        });
      
      Nexus.state.likedPosts.push(postId);
    }
    
    await Nexus.renderSocial();
  } catch (error) {
    console.error('Like error:', error);
    Nexus.toast('Failed to like post');
  }
};

Nexus.deletePost = async function(postId) {
  if (!confirm('Delete this post?')) return;
  
  Nexus.setLoading(true);
  try {
    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId);
    
    await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    Nexus.state.likedPosts = Nexus.state.likedPosts.filter(id => id !== postId);
    await Nexus.renderSocial();
    await Nexus.renderStories();
    Nexus.toast('Post deleted');
  } catch (error) {
    console.error('Delete error:', error);
    Nexus.toast('Failed to delete post');
  } finally {
    Nexus.setLoading(false);
  }
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

Nexus.renderSocial = async function() {
  const container = document.getElementById('socialFeed');
  if (!container) return;

  const avatarEl = document.getElementById('postAvatarEmoji');
  if (avatarEl) {
    avatarEl.textContent = Nexus.state.selectedAuras.length ? 
      Nexus.state.selectedAuras.map(k => AURAS[k].emoji).join('') : '😊';
  }

  try {
    const [postsRes, likesRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('post_likes').select('post_id').eq('user_id', Nexus.state.user.id)
    ]);

    if (postsRes.error) throw postsRes.error;
    if (likesRes.error) throw likesRes.error;

    Nexus.state.likedPosts = (likesRes.data || []).map(l => l.post_id);
    const posts = postsRes.data || [];

    if (!posts.length) {
      container.innerHTML = `<div style="text-align:center;padding:40px 0;color:#94a3b8;">
        <div style="font-size:48px;margin-bottom:12px;">📸</div>
        <p>No posts yet. Share your journey!</p>
      </div>`;
      return;
    }

    container.innerHTML = posts.map(p => {
      const liked = Nexus.state.likedPosts.includes(p.id);
      const timeAgo = Nexus.timeSince(new Date(p.created_at));
      return `
        <div class="ig-post">
          <div class="ig-post-header">
            <div class="ig-post-avatar">${escapeHtml(p.avatar || '😊')}</div>
            <span class="ig-post-user">${escapeHtml(p.author)}</span>
            <span class="ig-post-time">${timeAgo}</span>
            ${p.user_id === Nexus.state.user?.id ? `<button class="btn-sm btn-danger" onclick="Nexus.deletePost('${p.id}')" style="font-size:11px;padding:2px 8px;">🗑️</button>` : ''}
          </div>
          <div class="ig-post-image" style="background-image:url('${p.image || UNSPLASH[0]}')">
          </div>
          <div class="ig-post-actions">
            <button class="ig-post-action ${liked ? 'liked' : ''}" onclick="Nexus.likePost('${p.id}')">${liked ? '❤️' : '🤍'}</button>
            <button class="ig-post-action" onclick="Nexus.toast('Comment feature coming soon')">💬</button>
            <button class="ig-post-action" onclick="Nexus.toast('Share feature coming soon')">📤</button>
          </div>
          <div class="ig-post-likes">${p.likes || 0} ${(p.likes || 0) === 1 ? 'like' : 'likes'}</div>
          <div class="ig-post-caption"><strong>${escapeHtml(p.author)}</strong> ${escapeHtml(p.text)}</div>
          <div class="ig-post-comment" onclick="Nexus.toast('Comment feature coming soon')">View all comments</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Social feed error:', error);
    container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px;">❌ Failed to load feed</p>';
  }
};