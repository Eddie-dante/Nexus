// js/chat.js - COMPLETE REWRITE
Nexus.initChat = function() {
  if (Nexus.state.chatChannel) {
    supabase.removeChannel(Nexus.state.chatChannel);
  }
  
  Nexus.state.chatChannel = supabase
    .channel('chat_channel')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages' 
      },
      (payload) => {
        Nexus.addChatMessage(payload.new);
      }
    )
    .subscribe();
};

Nexus.sendMessage = async function() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !Nexus.state.user) return;

  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: Nexus.state.user.id,
        username: Nexus.state.user.username,
        content: text,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    input.value = '';
  } catch (error) {
    console.error('Failed to send message:', error);
    Nexus.toast('Failed to send message');
  }
};

Nexus.addChatMessage = function(message) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  const me = message.user_id === Nexus.state.user?.id;
  const time = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  const msgDiv = document.createElement('div');
  msgDiv.style.display = 'flex';
  msgDiv.style.justifyContent = me ? 'flex-end' : 'flex-start';
  msgDiv.style.margin = '3px 0';
  msgDiv.innerHTML = `
    <div style="max-width:82%;">
      <div class="chat-bubble ${me ? 'chat-sent' : 'chat-received'}">
        <div style="font-size:10px;font-weight:600;opacity:0.7;">${escapeHtml(message.username)} · ${time}</div>
        <p style="margin:2px 0 0;">${escapeHtml(message.content)}</p>
      </div>
    </div>
  `;
  
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
};

Nexus.loadMessages = async function() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (error) throw error;
    
    container.innerHTML = '';
    if (!data || !data.length) {
      container.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:16px;">💬 No messages yet. Start the conversation!</p>';
      return;
    }
    
    data.forEach(msg => Nexus.addChatMessage(msg));
  } catch (error) {
    console.error('Failed to load messages:', error);
    container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:16px;">❌ Failed to load messages</p>';
  }
};

Nexus.renderChat = function() {
  document.getElementById('myUsername').textContent = Nexus.state.user?.username || '—';
  Nexus.loadMessages();
  Nexus.initChat();
};

Nexus.deleteMessage = function(id) {
  // Optional: implement if needed
  Nexus.toast('Delete feature coming soon');
};