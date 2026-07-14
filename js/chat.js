# Create chat.js
echo "// js/chat.js - Chat Logic
const Chat = {
    startPoll() {
        this.stopPoll();
        this.poll = setInterval(() => {
            const nm = Storage.getChat();
            if (JSON.stringify(nm) !== JSON.stringify(Nexus.state.chatMessages)) {
                Nexus.state.chatMessages = nm;
                this.renderMessages();
            }
            Nexus.updateOnline();
        }, 1000);
    },

    stopPoll() {
        if (this.poll) {
            clearInterval(this.poll);
            this.poll = null;
        }
    },

    sendMessage() {
        if (!Nexus.state.username) {
            Nexus.toast('Please log in');
            return;
        }
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;
        const message = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: Nexus.state.username,
            text: text,
            time: new Date().toISOString()
        };
        Nexus.state.chatMessages.push(message);
        if (Nexus.state.chatMessages.length > 200) Nexus.state.chatMessages = Nexus.state.chatMessages.slice(-200);
        Storage.setChat(Nexus.state.chatMessages);
        Nexus.updateOnline();
        input.value = '';
        this.renderMessages();
    },

    deleteMessage(id) {
        Nexus.state.chatMessages = Nexus.state.chatMessages.filter(m => m.id !== id);
        Storage.setChat(Nexus.state.chatMessages);
        this.renderMessages();
    },

    changeUsername() {
        const newName = prompt('Enter new username:', Nexus.state.username);
        if (newName && newName.trim()) {
            Nexus.state.username = newName.trim();
            Auth.saveAuth();
            document.getElementById('myUsername').textContent = Nexus.state.username;
            Nexus.updateOnline();
            Nexus.toast('Username updated');
        }
    },

    render() {
        document.getElementById('myUsername').textContent = Nexus.state.username || '—';
        document.getElementById('onlineCount').textContent = Nexus.updateOnline();
        this.renderMessages();
        this.startPoll();
    },

    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        if (Nexus.state.chatMessages.length === 0) {
            container.innerHTML = '<p style=\"color:#94a3b8;text-align:center;padding:16px;\">No messages yet.</p>';
            return;
        }
        container.innerHTML = Nexus.state.chatMessages.map(m => {
            const me = m.username === Nexus.state.username;
            const time = new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return '<div style=\"display:flex;justify-content:' + (me ? 'flex-end' : 'flex-start') + ';margin:3px 0;\"><div style=\"max-width:82%;\"><div class=\"chat-bubble ' + (me ? 'chat-sent' : 'chat-received') + '\"><div style=\"font-size:10px;font-weight:600;opacity:0.7;\">' + m.username + ' · ' + time + '</div><p style=\"margin:2px 0 0;\">' + m.text + '</p></div>' + (me ? '<button class=\"btn-sm btn-danger\" onclick=\"Nexus.deleteMessage(\'' + m.id + '\')\" style=\"font-size:9px;padding:2px 5px;margin-top:1px;\">🗑️</button>' : '') + '</div></div>';
        }).join('');
        container.scrollTop = container.scrollHeight;
    }
};" > js/chat.js