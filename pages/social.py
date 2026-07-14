# pages/2_📸_Social.py - Social Feed page
import streamlit as st
from datetime import datetime
import time

# ==================== LOAD DATA ====================
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

# ==================== PAGE ====================
st.markdown("# 📸 Social Feed")

# ==================== CREATE POST ====================
with st.expander("➕ What's on your mind?", expanded=False):
    with st.form("post_form"):
        post_text = st.text_area("Share your journey...", placeholder="What's happening?", key="post_input", height=80)
        post_image = st.text_input("Image URL (optional)", placeholder="https://images.unsplash.com/...")
        submitted = st.form_submit_button("Post", use_container_width=True)
        
        if submitted and post_text.strip():
            posts = load_data("posts.json")
            posts.insert(0, {
                "id": "post_" + str(int(time.time() * 1000)),
                "author": st.session_state.username,
                "text": post_text.strip(),
                "image": post_image if post_image else None,
                "likes": 0,
                "liked_by": [],
                "timestamp": datetime.now().isoformat(),
                "avatar": "😊"
            })
            save_data("posts.json", posts)
            st.rerun()

# ==================== DISPLAY POSTS ====================
posts = load_data("posts.json")

if not posts:
    st.info("📸 No posts yet. Be the first to share!")
else:
    for post in posts:
        with st.container():
            st.markdown(f"""
            <div class="post-card">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <span style="font-size:24px;">{post.get('avatar', '😊')}</span>
                    <strong>@{post.get('author', 'Unknown')}</strong>
                    <span style="font-size:10px;color:#94a3b8;">{post.get('timestamp', '')[:16]}</span>
                </div>
                <p>{post.get('text', '')}</p>
                {f'<img src="{post.get("image")}" style="width:100%;border-radius:8px;margin:4px 0;max-height:300px;object-fit:cover;" />' if post.get('image') else ''}
                <div style="display:flex;gap:16px;margin-top:8px;font-size:13px;color:#94a3b8;">
                    <span>❤️ {post.get('likes', 0)} likes</span>
                    <span>💬 0 comments</span>
                </div>
            </div>
            """, unsafe_allow_html=True)