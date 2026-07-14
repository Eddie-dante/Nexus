# pages/4_📖_Diary.py - Diary (same as HTML)
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

st.markdown("# 📖 Diary")

# Load diary
diaries = load_data("diaries.json")
user_diaries = [d for d in diaries if d.get("username") == st.session_state.username]

# New entry
with st.form("diary_form"):
    st.markdown("### ✏️ Write Your Entry")
    content = st.text_area("", placeholder="Dear diary...", height=100, label_visibility="collapsed")
    mood = st.selectbox("How are you feeling?", ["😊 Happy", "😢 Sad", "😡 Angry", "😌 Calm", "🤔 Thoughtful", "⚡ Energetic"])
    submitted = st.form_submit_button("💾 Save", use_container_width=True)
    if submitted and content.strip():
        diaries = load_data("diaries.json")
        diaries.append({
            "id": "diary_" + str(int(time.time() * 1000)),
            "username": st.session_state.username,
            "content": content.strip(),
            "mood": mood,
            "timestamp": datetime.now().isoformat()
        })
        save_data("diaries.json", diaries)
        st.rerun()

# Display entries
st.markdown("---")
st.markdown("### 📝 Your Entries")
if not user_diaries:
    st.info("No entries yet. Start writing!")
else:
    for entry in reversed(user_diaries):
        st.markdown(f"""
        <div style="background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.04);border-radius:13px;padding:12px;margin-bottom:7px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                <small style="color:#94a3b8;">{entry.get('timestamp', '')[:16]}</small>
                <span style="font-size:10px;background:rgba(0,0,0,0.04);padding:2px 7px;border-radius:9px;">{entry.get('mood', '')}</span>
            </div>
            <p style="font-size:13px;white-space:pre-wrap;">{entry.get('content', '')}</p>
        </div>
        """, unsafe_allow_html=True)