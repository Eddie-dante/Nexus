Nexus.sendMessage = function() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !Nexus.state.user) return;

  const chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
  chat.push({
    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5),
    username: Nexus.state.user.username,
    userId: Nexus.state.user.id,
    text,
    createdAt: new Date().toISOString()
  });
  if (chat.length > 200) chat.splice(0, chat.length - 200);
  localStorage.setItem('nexus_chat', JSON.stringify(chat));
  input.value = '';
  Nexus.renderChatMessages();
};

Nexus.deleteMessage = function(id) {
  let chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
  chat = chat.filter(m => m.id !== id);
  localStorage.setItem('nexus_chat', JSON.stringify(chat));
  Nexus.renderChatMessages();
};

Nexus.renderChat = function() {
  document.getElementById('myUsername').textContent = Nexus.state.user?.username || '—';
  Nexus.renderChatMessages();
  if (Nexus.state.onlineInterval) clearInterval(Nexus.state.onlineInterval);
  Nexus.state.onlineInterval = setInterval(() => {
    Nexus.renderChatMessages();
    const u = JSON.parse(localStorage.getItem('nexus_online') || '{}');
    if (Nexus.state.user) u[Nexus.state.user.username] = Date.now();
    const now = Date.now();
    for (const [k, v] of Object.entries(u)) { if (now - v > 30000) delete u[k]; }
    localStorage.setItem('nexus_online', JSON.stringify(u));
    document.getElementById('onlineCount').textContent = Object.keys(u).length;
  }, 1000);
};

Nexus.renderChatMessages = function() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const chat = JSON.parse(localStorage.getItem('nexus_chat') || '[]');
  if (!chat.length) {
    container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">No messages yet.</p>';
    return;
  }
  container.innerHTML = chat.map(m => {
    const me = m.userId === Nexus.state.user?.id;
    const time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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