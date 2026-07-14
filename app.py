# app.py - Main entry point (exact same flow as HTML)
import streamlit as st
import json
import os
import hashlib
from datetime import datetime
import time

# ==================== PAGE CONFIG ====================
st.set_page_config(
    page_title="Nexus · id³",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==================== LOAD CSS ====================
css_file = "css/style.css"
if os.path.exists(css_file):
    with open(css_file, 'r') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# ==================== DATA ====================
DATA_DIR = "data"
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def load_data(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_data(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# ==================== AUTH (Same as HTML) ====================
def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def login(username, password):
    users = load_data("users.json")
    if username in users and users[username].get("password") == hash_password(password):
        st.session_state.logged_in = True
        st.session_state.username = username
        # Load profile
        profiles = load_data("profiles.json")
        if username in profiles:
            st.session_state.bio = profiles[username].get("bio", "Building my energy. One aura at a time. ⚡")
            st.session_state.wallpaper = profiles[username].get("wallpaper", UNSPLASH[0] if 'UNSPLASH' in dir() else "")
            st.session_state.selected_auras = profiles[username].get("selected_auras", [])
        return True
    return False

def signup(username, password):
    users = load_data("users.json")
    if username in users:
        return False, "Username already exists"
    users[username] = {
        "password": hash_password(password),
        "created": datetime.now().isoformat()
    }
    save_data("users.json", users)
    # Create profile
    profiles = load_data("profiles.json")
    profiles[username] = {
        "bio": "Building my energy. One aura at a time. ⚡",
        "wallpaper": "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80",
        "selected_auras": [],
        "created": datetime.now().isoformat()
    }
    save_data("profiles.json", profiles)
    return True, "Account created! Please sign in."

def logout():
    st.session_state.logged_in = False
    st.session_state.username = ""
    st.rerun()

# ==================== INIT SESSION STATE ====================
if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.username = ""
    st.session_state.bio = "Building my energy. One aura at a time. ⚡"
    st.session_state.wallpaper = "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80"
    st.session_state.selected_auras = []

# ==================== SIDEBAR ====================
with st.sidebar:
    st.markdown('<div style="text-align:center;font-size:48px;">⚡</div>', unsafe_allow_html=True)
    st.markdown('<h1 style="text-align:center;font-size:28px;font-weight:800;">Nexus</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align:center;color:#64748b;font-size:13px;">Shape your presence. Manifest your energy.</p>', unsafe_allow_html=True)
    
    if st.session_state.logged_in:
        st.divider()
        st.markdown(f"**👤 @{st.session_state.username}**")
        st.markdown(f"*{st.session_state.bio[:50]}...*")
        
        # Online users count
        messages = load_data("messages.json")
        users = set([m.get("username") for m in messages if m.get("username")])
        st.markdown(f"🟢 **{len(users)}** users online")
        
        st.divider()
        if st.button("🚪 Logout", use_container_width=True):
            logout()

# ==================== AUTH SCREEN ====================
if not st.session_state.logged_in:
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown("""
        <div style="text-align:center;padding:40px 0;">
            <div style="font-size:72px;">⚡</div>
            <h1 style="font-size:44px;font-weight:800;">Nexus</h1>
            <p style="color:#64748b;">Shape your presence. Manifest your energy.</p>
        </div>
        """, unsafe_allow_html=True)
        
        tab1, tab2 = st.tabs(["🔐 Sign In", "✨ Sign Up"])
        
        with tab1:
            with st.form("login_form"):
                username = st.text_input("Username")
                password = st.text_input("Password", type="password")
                submitted = st.form_submit_button("Sign In", use_container_width=True)
                if submitted:
                    if login(username, password):
                        st.success("Welcome back! 🎉")
                        st.rerun()
                    else:
                        st.error("Invalid credentials")
        
        with tab2:
            with st.form("signup_form"):
                username = st.text_input("Choose Username")
                password = st.text_input("Create Password", type="password")
                confirm = st.text_input("Confirm Password", type="password")
                submitted = st.form_submit_button("Create Account", use_container_width=True)
                if submitted:
                    if not username or not password:
                        st.error("All fields required")
                    elif password != confirm:
                        st.error("Passwords do not match")
                    elif len(password) < 4:
                        st.error("Password must be at least 4 characters")
                    else:
                        success, msg = signup(username, password)
                        if success:
                            st.success(msg)
                            st.balloons()
                        else:
                            st.error(msg)
    st.stop()