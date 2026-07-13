# Delete the corrupted file
rm server.js

# Create the correct server.js using a different method
cat > server.js << 'EOF'
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ==================== CORS ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use(express.json());
app.use(express.static('public'));

// ==================== DATABASE ====================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://eddie:zvaGwn5Bgu03lV7kvSPzbyAthKqHH3wW@dpg-d96g990k1i2s73fti8d0-a/wegem',
  ssl: { rejectUnauthorized: false }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running!', timestamp: new Date().toISOString() });
});

// ==================== AUTH ====================
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const id = 'user_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
      [id, username, hashedPassword]
    );

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET || 'nexus_super_secret_key_2024', { expiresIn: '7d' });
    res.json({ success: true, token, user: { id, username } });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'nexus_super_secret_key_2024', { expiresIn: '7d' });
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, username: user.username, avatar: user.avatar, bio: user.bio } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ==================== USERS ====================
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, avatar, bio FROM users ORDER BY username');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, avatar, bio FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { bio, avatar } = req.body;
  try {
    await pool.query(
      'UPDATE users SET bio = COALESCE($1, bio), avatar = COALESCE($2, avatar), updated_at = NOW() WHERE id = $3',
      [bio, avatar, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== POSTS ====================
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  const { user_id, author, avatar, text, image } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text required' });
  }

  try {
    const id = 'post_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    await pool.query(
      'INSERT INTO posts (id, user_id, author, avatar, text, image) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, user_id, author, avatar || '😊', text, image || null]
    );
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  const { user_id } = req.body;
  try {
    const result = await pool.query('SELECT likes FROM posts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    let likes = result.rows[0].likes || [];
    const index = likes.indexOf(user_id);
    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(user_id);
    }
    
    await pool.query('UPDATE posts SET likes = $1 WHERE id = $2', [likes, req.params.id]);
    res.json({ success: true, likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DIARY ====================
app.get('/api/diary/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/diary', async (req, res) => {
  const { user_id, content, mood } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }

  try {
    const id = 'diary_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    await pool.query(
      'INSERT INTO diary_entries (id, user_id, content, mood) VALUES ($1, $2, $3, $4)',
      [id, user_id, content, mood || null]
    );
    const result = await pool.query('SELECT * FROM diary_entries WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/diary/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM diary_entries WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROUTINES ====================
app.get('/api/routines/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM routines WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/routines', async (req, res) => {
  const { user_id, title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  try {
    const id = 'routine_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    await pool.query(
      'INSERT INTO routines (id, user_id, title, content) VALUES ($1, $2, $3, $4)',
      [id, user_id, title, content]
    );
    const result = await pool.query('SELECT * FROM routines WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/routines/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routines WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASKS ====================
app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_index FROM task_completions WHERE user_id = $1 AND completed_date = CURRENT_DATE',
      [req.params.userId]
    );
    res.json(result.rows.map(r => r.task_index));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:userId/toggle', async (req, res) => {
  const { task_index } = req.body;
  try {
    const existing = await pool.query(
      'SELECT * FROM task_completions WHERE user_id = $1 AND task_index = $2 AND completed_date = CURRENT_DATE',
      [req.params.userId, task_index]
    );
    
    if (existing.rows.length > 0) {
      await pool.query(
        'DELETE FROM task_completions WHERE user_id = $1 AND task_index = $2 AND completed_date = CURRENT_DATE',
        [req.params.userId, task_index]
      );
    } else {
      await pool.query(
        'INSERT INTO task_completions (user_id, task_index) VALUES ($1, $2)',
        [req.params.userId, task_index]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STREAKS ====================
app.get('/api/streaks/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT streak_date FROM streaks WHERE user_id = $1 ORDER BY streak_date DESC',
      [req.params.userId]
    );
    const streaks = {};
    result.rows.forEach(r => {
      streaks[r.streak_date] = true;
    });
    res.json(streaks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/streaks/:userId', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO streaks (user_id, streak_date) VALUES ($1, CURRENT_DATE) ON CONFLICT DO NOTHING',
      [req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEBSOCKET ====================
const clients = new Map();

wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket connection');
  let userId = null;

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'auth':
          userId = message.userId;
          const userResult = await pool.query('SELECT id, username, avatar FROM users WHERE id = $1', [userId]);
          if (userResult.rows.length === 0) {
            ws.send(JSON.stringify({ type: 'error', data: 'User not found' }));
            return;
          }
          
          const user = userResult.rows[0];
          clients.set(userId, { ws, username: user.username, userData: user });
          
          const onlineUsers = Array.from(clients.values()).map(c => ({
            id: c.userData.id,
            username: c.userData.username,
            avatar: c.userData.avatar
          }));
          
          ws.send(JSON.stringify({ type: 'users', data: onlineUsers }));
          
          broadcast({
            type: 'user_joined',
            data: { id: user.id, username: user.username, avatar: user.avatar }
          }, userId);
          
          console.log(`✅ ${user.username} connected`);
          break;

        case 'message':
          if (!userId) return;
          const sender = clients.get(userId);
          if (!sender) return;
          
          const msgData = {
            id: 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
            user_id: userId,
            username: sender.username,
            content: message.content,
            target_user_id: message.targetUserId || null,
            is_private: !!message.targetUserId,
            created_at: new Date().toISOString()
          };
          
          await pool.query(
            `INSERT INTO chat_messages (id, user_id, username, content, target_user_id, is_private) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [msgData.id, msgData.user_id, msgData.username, msgData.content, msgData.target_user_id, msgData.is_private]
          );
          
          broadcast({
            type: 'message',
            data: msgData
          });
          break;

        case 'typing':
          broadcast({
            type: 'typing',
            data: { userId, username: clients.get(userId)?.username, isTyping: message.isTyping }
          }, userId);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    if (userId && clients.has(userId)) {
      const user = clients.get(userId);
      clients.delete(userId);
      console.log(`🔴 ${user.username} disconnected`);
      
      broadcast({
        type: 'user_left',
        data: { id: userId, username: user.username }
      });
    }
  });
});

function broadcast(data, excludeUserId = null) {
  const message = JSON.stringify(data);
  clients.forEach((client, id) => {
    if (id !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}

// ==================== CREATE TABLES ====================
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '😊',
        bio TEXT DEFAULT 'Building my energy. One aura at a time. ⚡',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        author TEXT NOT NULL,
        avatar TEXT,
        text TEXT NOT NULL,
        image TEXT,
        likes TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
        target_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        is_private BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        mood TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_completions (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        task_index INTEGER NOT NULL,
        completed_date DATE DEFAULT CURRENT_DATE,
        UNIQUE(user_id, task_index, completed_date)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS streaks (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        streak_date DATE DEFAULT CURRENT_DATE,
        UNIQUE(user_id, streak_date)
      );
    `);

    // Create demo users
    const userCheck = await pool.query('SELECT * FROM users LIMIT 1');
    if (userCheck.rows.length === 0) {
      const demoUsers = [
        { id: 'demo_1', username: 'alex', password: 'password123' },
        { id: 'demo_2', username: 'sarah', password: 'password123' },
        { id: 'demo_3', username: 'mike', password: 'password123' },
        { id: 'demo_4', username: 'jessica', password: 'password123' },
        { id: 'demo_5', username: 'chris', password: 'password123' }
      ];

      for (const user of demoUsers) {
        const hashed = await bcrypt.hash(user.password, 10);
        await pool.query(
          'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [user.id, user.username, hashed]
        );
      }
      console.log('✅ Demo users created: alex, sarah, mike, jessica, chris (password: password123)');
    }

    console.log('✅ All tables created/verified');
  } catch (error) {
    console.error('❌ Database init error:', error);
  }
}

initDatabase();

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`🌐 API URL: https://nexus-realtime-jsti.onrender.com/api`);
  console.log(`🔗 WebSocket URL: wss://nexus-realtime-jsti.onrender.com`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
EOF

# Verify the file is correct
head -5 server.js