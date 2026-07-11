// server.js - Complete Backend API for Render
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// ==================== USERS ====================

// Create tables if they don't exist
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        username TEXT UNIQUE NOT NULL,
        bio TEXT DEFAULT 'Building my energy. One aura at a time. ⚡',
        wallpaper TEXT DEFAULT 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
        selected_auras TEXT[] DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        username TEXT NOT NULL,
        content TEXT NOT NULL,
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

    console.log('✅ All tables created/verified');
  } catch (error) {
    console.error('❌ Database init error:', error);
  }
}

initDatabase();

// ==================== USERS ====================

// Signup
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  try {
    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const id = 'user_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create user
    await pool.query(
      'INSERT INTO users (id, username, password) VALUES ($1, $2, $3)',
      [id, username, hashedPassword]
    );

    // Create profile
    await pool.query(
      'INSERT INTO profiles (id, username) VALUES ($1, $2)',
      [id, username]
    );

    res.json({ success: true, user: { id, username } });
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
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const result = await pool.query(
      'SELECT id, username FROM users WHERE username = $1 AND password = $2',
      [username, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by id
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROFILES ====================

// Get profile
app.get('/api/profiles/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
app.put('/api/profiles/:userId', async (req, res) => {
  const { bio, wallpaper, selected_auras } = req.body;
  try {
    await pool.query(
      'UPDATE profiles SET bio = COALESCE($1, bio), wallpaper = COALESCE($2, wallpaper), selected_auras = COALESCE($3, selected_auras), updated_at = NOW() WHERE id = $4',
      [bio, wallpaper, selected_auras, req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== CHAT ====================

// Get chat messages
app.get('/api/chat', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send chat message
app.post('/api/chat', async (req, res) => {
  const { user_id, username, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }

  try {
    const id = 'msg_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
    await pool.query(
      'INSERT INTO chat_messages (id, user_id, username, content) VALUES ($1, $2, $3, $4)',
      [id, user_id, username, content]
    );
    const result = await pool.query('SELECT * FROM chat_messages WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Send chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete chat message
app.delete('/api/chat/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM chat_messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DIARY ====================

// Get diary entries
app.get('/api/diary/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM diary_entries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get diary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add diary entry
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
    console.error('Add diary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete diary entry
app.delete('/api/diary/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM diary_entries WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete diary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ROUTINES ====================

// Get routines
app.get('/api/routines/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM routines WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get routines error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add routine
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
    console.error('Add routine error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete routine
app.delete('/api/routines/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM routines WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete routine error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== POSTS ====================

// Get posts
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add post
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
    console.error('Add post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like/unlike post
app.post('/api/posts/:id/like', async (req, res) => {
  const { user_id } = req.body;
  try {
    // Get current likes
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
    console.error('Like error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== TASKS ====================

// Get tasks for today
app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_index FROM task_completions WHERE user_id = $1 AND completed_date = CURRENT_DATE',
      [req.params.userId]
    );
    res.json(result.rows.map(r => r.task_index));
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle task
app.post('/api/tasks/:userId/toggle', async (req, res) => {
  const { task_index } = req.body;
  try {
    // Check if exists
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
    console.error('Toggle task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== STREAKS ====================

// Get streaks
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
    console.error('Get streaks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark streak
app.post('/api/streaks/:userId', async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO streaks (user_id, streak_date) VALUES ($1, CURRENT_DATE) ON CONFLICT DO NOTHING',
      [req.params.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark streak error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not connected'}`);
});