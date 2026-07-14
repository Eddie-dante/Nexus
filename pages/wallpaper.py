# pages/6_🎨_Wallpapers.py - Wallpapers page
import streamlit as st

# ==================== WALLPAPERS ====================
WALLPAPERS = [
    {"name": "🌌 Galaxy", "url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80"},
    {"name": "🏔️ Mountains", "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"},
    {"name": "🌊 Ocean", "url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80"},
    {"name": "🌅 Sunset", "url": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=1920&q=80"},
    {"name": "🌿 Forest", "url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"},
    {"name": "🎨 Cyber", "url": "https://images.unsplash.com/photo-1515634928625-85bc09c9cbba?w=1920&q=80"},
    {"name": "🌸 Cherry", "url": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80"},
    {"name": "❄️ Aurora", "url": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1920&q=80"},
    {"name": "🏙️ City", "url": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80"},
    {"name": "🏝️ Beach", "url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80"},
    {"name": "🍁 Autumn", "url": "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=1920&q=80"},
    {"name": "💜 Lavender", "url": "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=1920&q=80"},
]

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

def save_data(filename, data):
    import json, os
    path = os.path.join("data", filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# ==================== PAGE ====================
st.markdown("# 🎨 Wallpapers")

# Get current wallpaper
profiles = load_data("profiles.json")
current_wallpaper = profiles.get(st.session_state.username, {}).get("wallpaper", WALLPAPERS[0]["url"])

# ==================== DISPLAY WALLPAPERS ====================
st.markdown("### Choose your background")

cols = st.columns(4)
for i, wp in enumerate(WALLPAPERS):
    with cols[i % 4]:
        is_selected = wp["url"] == current_wallpaper
        st.markdown(f"""
        <div style="
            aspect-ratio: 16/10;
            border-radius: 12px;
            background-image: url('{wp["url"]}');
            background-size: cover;
            background-position: center;
            border: 3px solid {'#0f172a' if is_selected else 'transparent'};
            cursor: pointer;
            position: relative;
            margin-bottom: 4px;
            transition: all 0.3s;
        ">
            {f'<div style="position:absolute;top:4px;right:4px;background:#0f172a;color:white;padding:2px 8px;border-radius:8px;font-size:9px;">✅ Selected</div>' if is_selected else ''}
        </div>
        """, unsafe_allow_html=True)
        
        if st.button(f"Apply {wp['name']}", key=f"wp_{i}", use_container_width=True):
            profiles = load_data("profiles.json")
            if st.session_state.username not in profiles:
                profiles[st.session_state.username] = {}
            profiles[st.session_state.username]["wallpaper"] = wp["url"]
            save_data("profiles.json", profiles)
            st.rerun()

st.markdown("---")
st.markdown("💡 *Select a wallpaper to change your app background!*")