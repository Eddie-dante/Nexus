# utils/load_css.py
import streamlit as st
import os

def load_css():
    """Load CSS from file or use fallback"""
    css_file = os.path.join(os.path.dirname(__file__), '..', 'css', 'style.css')
    
    if os.path.exists(css_file):
        try:
            with open(css_file, 'r') as f:
                css = f.read()
                st.markdown(f'<style>{css}</style>', unsafe_allow_html=True)
                print("✅ Loaded style.css")
                return True
        except Exception as e:
            print(f"❌ Error loading CSS: {e}")
    
    # Fallback CSS if file not found
    st.markdown("""
    <style>
        .stApp { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
        .glass {
            background: rgba(255,255,255,0.7);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 20px;
            border: 1px solid rgba(255,255,255,0.3);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .post-card {
            background: rgba(255,255,255,0.8);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 12px;
            border: 1px solid rgba(0,0,0,0.05);
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .chat-sent { background: #0f172a !important; color: white !important; }
        .chat-received { background: #f1f5f9 !important; }
        .stat-card {
            background: rgba(255,255,255,0.7);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            border: 1px solid rgba(0,0,0,0.05);
        }
        .profile-avatar {
            width: 80px; height: 80px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 40px; background: linear-gradient(135deg, #667eea, #764ba2);
            margin: 0 auto;
        }
    </style>
    """, unsafe_allow_html=True)
    
    return False