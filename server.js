// server.js - Simple server that preserves your file structure
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CORS ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.static('.')); // Serve all files from root

// ==================== DATA DIRECTORY ====================
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Data files
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

// ==================== HELPERS ====================
function readJSON(file, defaultData) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Read error:', e);
  }
  return defaultData;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Write error:', e);
    return false;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!' });
});

// ==================== AUTH ====================

// Signup
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username 2-20 characters' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return res.status(400).json({ error: 'Only letters and numbers' });
  }

  try {
    const users = readJSON(USERS_FILE, {});
    
    if (Object.keys(users).some(u => u.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    users[username] = hashPassword(password);
    writeJSON(USERS_FILE, users);
    
    const profiles = readJSON(PROFILES_FILE, {});
    profiles[username] = {
      bio: '',
      wallpaper: '🌈 Gradient',
      status: '',
      last_seen: new Date().toISOString()
    };
    writeJSON(PROFILES_FILE, profiles);
    
    res.json({ success: true, message: 'Account created!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const users = readJSON(USERS_FILE, {});
    const hashed = hashPassword(password);
    
    let foundUser = null;
    for (const [u, h] of Object.entries(users)) {
      if (u.toLowerCase() === username.toLowerCase()) {
        if (h === hashed) {
          foundUser = u;
          break;
        }
        return res.status(401).json({ error: 'Wrong password' });
      }
    }
    
    if (!foundUser) {
      return res.status(401).json({ error: 'Username not found' });
    }
    
    const profiles = readJSON(PROFILES_FILE, {});
    if (profiles[foundUser]) {
      profiles[foundUser].last_seen = new Date().toISOString();
      writeJSON(PROFILES_FILE, profiles);
    }
    
    res.json({ success: true, username: foundUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== MESSAGES ====================

// Get messages
app.get('/api/messages', (req, res) => {
  try {
    const messages = readJSON(MESSAGES_FILE, []);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
app.post('/api/messages', (req, res) => {
  const { username, text } = req.body;
  
  if (!username || !text) {
    return res.status(400).json({ error: 'Username and text required' });
  }

  try {
    const messages = readJSON(MESSAGES_FILE, []);
    
    const message = {
      id: 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
      username: username,
      text: text.substring(0, 1000),
      timestamp: new Date().toISOString(),
      reactions: {}
    };
    
    messages.push(message);
    
    if (messages.length > 300) {
      messages.splice(0, messages.length - 300);
    }
    
    writeJSON(MESSAGES_FILE, messages);
    res.json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete message
app.delete('/api/messages/:id', (req, res) => {
  try {
    const messages = readJSON(MESSAGES_FILE, []);
    const filtered = messages.filter(m => m.id !== req.params.id);
    writeJSON(MESSAGES_FILE, filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROFILES ====================

// Get profiles
app.get('/api/profiles', (req, res) => {
  try {
    const profiles = readJSON(PROFILES_FILE, {});
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
app.put('/api/profiles/:username', (req, res) => {
  const { bio, wallpaper, status } = req.body;
  const username = req.params.username;

  try {
    const profiles = readJSON(PROFILES_FILE, {});
    
    if (!profiles[username]) {
      profiles[username] = {};
    }
    
    if (bio !== undefined) profiles[username].bio = bio;
    if (wallpaper !== undefined) profiles[username].wallpaper = wallpaper;
    if (status !== undefined) profiles[username].status = status;
    profiles[username].last_seen = new Date().toISOString();
    
    writeJSON(PROFILES_FILE, profiles);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== WALLPAPERS ====================

// Get wallpapers
app.get('/api/wallpapers', (req, res) => {
  const wallpapers = {
    "🌈 Gradient": "gradient",
    "✨ Purple": "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80",
    "🌌 Nebula": "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80",
    "🌊 Ocean": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80",
    "🏔️ Stars": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    "🌸 Cherry": "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80",
    "🌅 Sunset": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&q=80",
    "🌿 Forest": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    "🏙️ City": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    "🔥 Lava": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "🎨 Cyber": "https://images.unsplash.com/photo-1515634928625-85bc09c9cbba?w=800&q=80",
    "🏝️ Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    "❄️ Aurora": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=800&q=80",
    "🍁 Autumn": "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&q=80",
    "💜 Lavender": "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?w=800&q=80",
    "🏔️ Alpine": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80",
    "🌄 Desert": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
  };
  res.json(wallpapers);
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Server running on port ' + PORT);
  console.log('📁 Data directory: ' + DATA_DIR);
  console.log('📝 Messages file: ' + MESSAGES_FILE);
  console.log('👤 Users file: ' + USERS_FILE);
});