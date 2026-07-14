# pages/7_👤_Profile.py - Profile (same as HTML)
import streamlit as st

def load_data(filename):
    import json, os
    path = os.path.join("data", filename)
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_data(filename, data):
    import json, os
    path = os.path.join("data", filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

st.markhare("# 👤 Profile")

# Load data
profiles = load_data("profiles.json")
messages = load_data("messages.json")
posts = load_data("posts.json")

user_profile = profiles.get(st.session_state.username, {})
user_messages = [m for m in messages if m.get("username") == st.session_state.username]
user_posts = [p for p in posts if p.get("author") == st.session_state.username]

# Profile header (same as HTML)
col1, col2 = st.columns([1, 3])
with col1:
    st.markdown(f"""
    <div style="text-align:center;">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);padding:3px;margin:0 auto;">
            <div style="width:100%;height:100%;border-radius:50%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;font-size:36px;">😊</div>
        </div>
        <div style="font-size:20px;font-weight:700;">@{st.session_state.username}</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown(f"""
    <div style="padding:8px 0;">
        <div style="font-size:13px;color:#475569;">{user_profile.get('bio', 'Building my energy. One aura at a time. ⚡')}</div>
        <div style="display:flex;gap:32px;margin:12px 0 8px;">
            <div style="text-align:center;"><strong>{len(user_posts)}</strong><div style="font-size:11px;color:#94a3b8;">Posts</div></div>
            <div style="text-align:center;"><strong>{len(user_messages)}</strong><div style="font-size:11px;color:#94a3b8;">Messages</div></div>
            <div style="text-align:center;"><strong>{len(set([m.get('username') for m in messages if m.get('username')]))}</strong><div style="font-size:11px;color:#94a3b8;">Community</div></div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# Edit profile (same as HTML)
st.markdown("---")
st.markdown("### ✏️ Edit Profile")
with st.form("profile_form"):
    bio = st.text_area("Bio", value=user_profile.get('bio', 'Building my energy. One aura at a time. ⚡'), max_chars=200)
    submitted = st.form_submit_button("💾 Save", use_container_width=True)
    if submitted:
        profiles = load_data("profiles.json")
        profiles[st.session_state.username]["bio"] = bio
        save_data("profiles.json", profiles)
        st.session_state.bio = bio
        st.success("✅ Bio updated!")
        st.rerun()

# Your posts grid (same as HTML)
st.markdown("---")
st.markdown("### 📸 Your Posts")
if not user_posts:
    st.info("No posts yet.")
else:
    st.markdown('<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">', unsafe_allow_html=True)
    for p in user_posts:
        st.markdown(f"""
        <div style="aspect-ratio:1;background: