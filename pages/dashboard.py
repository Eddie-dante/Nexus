# pages/3_📊_Dashboard.py - Dashboard page
import streamlit as st
from datetime import datetime, timedelta

# ==================== LOAD DATA ====================
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

# ==================== PAGE ====================
st.markdown("# 📊 Dashboard")

# Load data
messages = load_data("messages.json")
posts = load_data("posts.json")
diaries = load_data("diaries.json")
routines = load_data("routines.json")

# ==================== STATS ====================
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="stat-card">
        <div style="font-size:28px;">💬</div>
        <div style="font-size:24px;font-weight:700;">{len(messages)}</div>
        <div style="font-size:10px;color:#94a3b8;">Messages</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown(f"""
    <div class="stat-card">
        <div style="font-size:28px;">📸</div>
        <div style="font-size:24px;font-weight:700;">{len(posts)}</div>
        <div style="font-size:10px;color:#94a3b8;">Posts</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown(f"""
    <div class="stat-card">
        <div style="font-size:28px;">📖</div>
        <div style="font-size:24px;font-weight:700;">{len(diaries)}</div>
        <div style="font-size:10px;color:#94a3b8;">Diary Entries</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown(f"""
    <div class="stat-card">
        <div style="font-size:28px;">📋</div>
        <div style="font-size:24px;font-weight:700;">{len(routines)}</div>
        <div style="font-size:10px;color:#94a3b8;">Routines</div>
    </div>
    """, unsafe_allow_html=True)

# ==================== STREAK ====================
st.markdown("---")
st.markdown("### 🔥 Your Streak")

# Get user's messages by date
user_messages = [m for m in messages if m.get("username") == st.session_state.username]
dates = set()
for m in user_messages:
    try:
        date = m.get("timestamp", "")[:10]
        dates.add(date)
    except:
        pass

# Calculate streak
streak = 0
today = datetime.now().date()
for i in range(365):
    check_date = today - timedelta(days=i)
    date_str = check_date.isoformat()
    if date_str in dates:
        streak += 1
    else:
        break

col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    st.metric("🔥 Current Streak", f"{streak} days", delta="Keep going!" if streak > 0 else "Start your streak today!")

# ==================== USER ACTIVITY ====================
st.markdown("---")
st.markdown("### 👥 Community Activity")

# Show active users
users = set()
for m in messages:
    if m.get("username"):
        users.add(m.get("username"))

col1, col2 = st.columns(2)
with col1:
    st.markdown(f"**Active Users:** {len(users)}")

# Show recent messages
with col2:
    st.markdown("**Recent Activity:**")
    recent = messages[-5:] if messages else []
    for msg in reversed(recent):
        st.markdown(f"💬 @{msg.get('username', 'Unknown')}: {msg.get('text', '')[:40]}...")