# pages/5_📋_Routine.py - Routines (same as HTML)
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

st.markdown("# 📋 Routines")

# Load routines
routines = load_data("routines.json")
user_routines = [r for r in routines if r.get("username") == st.session_state.username]

# New routine
with st.form("routine_form"):
    st.markdown("### ✏️ Create Routine")
    title = st.text_input("Title", placeholder="Morning Ritual")
    content = st.text_area("Description", placeholder="Write your routine steps...", height=80)
    submitted = st.form_submit_button("💾 Save", use_container_width=True)
    if submitted and title.strip() and content.strip():
        routines = load_data("routines.json")
        routines.append({
            "id": "routine_" + str(int(time.time() * 1000)),
            "username": st.session_state.username,
            "title": title.strip(),
            "content": content.strip(),
            "timestamp": datetime.now().isoformat()
        })
        save_data("routines.json", routines)
        st.rerun()

# Display routines
st.markdown("---")
st.markdown("### 📋 Your Routines")
if not user_routines:
    st.info("No routines yet. Create one!")
else:
    for routine in reversed(user_routines):
        st.markdown(f"""
        <div style="background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.04);border-radius:13px;padding:12px;margin-bottom:7px;">
            <strong>{routine.get('title', '')}</strong>
            <small style="color:#94a3b8;display:block;">{routine.get('timestamp', '')[:16]}</small>
            <p style="font-size:12px;margin-top:3px;white-space:pre-wrap;">{routine.get('content', '')}</p>
        </div>
        """, unsafe_allow_html=True)