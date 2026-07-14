# pages/1_💬_Chat.py - Chat (same as HTML)
import streamlit as st
from datetime import datetime
import time

def load_data(filename):
    import json, os
    path = os.path.join("data", filename)
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_data(filename, data):
    import json, os
    path = os.path.join("data", filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

st.markdown("# 💬 Chat")

# Load messages
messages = load_data("messages.json")

# Display messages (same as HTML - chat bubbles)
if messages:
    for msg in messages[-50:]:
        is_me = msg.get("username") == st.session_state.username
        
        col1, col2 = st.columns([1, 1])
        if is_me:
            with col2:
                st.markdown(f"""
                <div class="chat-sent">
                    <div style="font-size:10px;opacity:0.7;">{msg.get('username')} · {msg.get('timestamp', '')[:16]}</div>
                    <div>{msg.get('text', '')}</div>
                </div>
                """, unsafe_allow_html=True)
        else:
            with col1:
                st.markdown(f"""
                <div class="chat-received">
                    <div style="font-size:10px;opacity:0.7;">{msg.get('username')} · {msg.get('timestamp', '')[:16]}</div>
                    <div>{msg.get('text', '')}</div>
                </div>
                """, unsafe_allow_html=True)
else:
    st.info("💬 No messages yet. Start the conversation!")

# Send message
st.markdown("---")
col1, col2 = st.columns([5, 1])
with col1:
    msg = st.text_input("Message", key="chat_input", placeholder="Type a message...", label_visibility="collapsed")
with col2:
    if st.button("📤 Send", use_container_width=True):
        if msg and msg.strip():
            messages = load_data("messages.json")
            messages.append({
                "id": "msg_" + str(int(time.time() * 1000)),
                "username": st.session_state.username,
                "text": msg.strip(),
                "timestamp": datetime.now().isoformat()
            })
            save_data("messages.json", messages)
            st.rerun()