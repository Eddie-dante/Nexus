let chatChannel = null;
let onlineInterval = null;

Nexus.sendMessage = async function() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const { error } = await supabaseClient
    .from('messages')
    .insert({
      user_id: Nexus.state.session.user.id,
      username: Nexus.state.profile.username,
      text
    });

  if (error) { Nexus.toast('Error sending'); return; }
  input.value = '';
};

Nexus.deleteMessage = async function(id) {
  await supabaseClient.from('messages').delete().eq('id', id);
};

Nexus.renderChat = async function() {
  document.getElementById('myUsername').textContent = Nexus.state.profile?.username || '—';

  const { data: messages } = await supabaseClient
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(100);

  Nexus.state.chatMessages = messages || [];
  Nexus.renderChatMessages();

  if (chatChannel) supabaseClient.removeChannel(chatChannel);

  chatChannel = supabaseClient
    .channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      Nexus.state.chatMessages.push(payload.new);
      if (Nexus.state.chatMessages.length > 200) Nexus.state.chatMessages = Nexus.state.chatMessages.slice(-200);
      Nexus.renderChatMessages();
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
      Nexus.state.chatMessages = Nexus.state.chatMessages.filter(m => m.id !== payload.old.id);
      Nexus.renderChatMessages();
    })
    .subscribe();

  if (onlineInterval) clearInterval(onlineInterval);
  onlineInterval = setInterval(() => Nexus.updateOnlineCount(), 5000);
  Nexus.updateOnlineCount();
};

Nexus.updateOnlineCount = async function() {
  await supabaseClient
    .from('profiles')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', Nexus.state.session.user.id);

  const { count } = await supabaseClient
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', new Date(Date.now() - 30000).toISOString());

  document.getElementById('onlineCount').textContent = count || 0;
};

Nexus.renderChatMessages = function() {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  if (Nexus.state.chatMessages.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No messages yet.</p>';
    return;
  }

  container.innerHTML = Nexus.state.chatMessages.map(m => {
    const me = m.user_id === Nexus.state.session?.user?.id;
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

window.addEventListener('beforeunload', () => {
  if (chatChannel) supabaseClient.removeChannel(chatChannel);
  if (onlineInterval) clearInterval(onlineInterval);
});