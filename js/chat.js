let chatChannel = null;

Nexus.sendMessage = async function() {
  const text = document.getElementById('chatInput').value.trim();
  if (!text) return;
  await supabase.from('messages').insert({ user_id: Nexus.state.user.id, username: Nexus.state.user.username, text });
  document.getElementById('chatInput').value = '';
};

Nexus.deleteMessage = async function(id) {
  await supabase.from('messages').delete().eq('id', id);
};

Nexus.cleanupChat = function() {
  if (chatChannel) { supabase.removeChannel(chatChannel); chatChannel = null; }
};

Nexus.renderChat = async function() {
  document.getElementById('myUsername').textContent = Nexus.state.user?.username || '—';

  const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100);
  Nexus.state.chatMessages = data || [];
  Nexus.renderChatMessages();

  Nexus.cleanupChat();
  chatChannel = supabase.channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100);
      Nexus.state.chatMessages = data || [];
      Nexus.renderChatMessages();
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(100);
      Nexus.state.chatMessages = data || [];
      Nexus.renderChatMessages();
    })
    .subscribe();
};

Nexus.renderChatMessages = function() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  if (!Nexus.state.chatMessages.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No messages yet.</p>';
    return;
  }
  container.innerHTML = Nexus.state.chatMessages.map(m => {
    const me = m.user_id === Nexus.state.user?.id;
    const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `<div style="display:flex;justify-content:${me ? 'flex-end' : 'flex-start'};margin:3px 0;">
      <div style="max-width:82%;">
        <div class="chat-bubble ${me ? 'chat-sent' : 'chat-received'}">
          <div style="font-size:10px;font-weight:600;opacity:0.7;">${m.username} · ${time}</div>
          <p style="margin:2px 0 0;">${m.text}</p>
        </div>
        ${me ? `<button class="btn-sm btn-danger" onclick="Nexus.deleteMessage('${m.id}')" style="font-size:9px;padding:2px 5px;margin-top:1px;">🗑️</button>` : ''}
      </div>
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
};