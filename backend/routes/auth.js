const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const db         = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Semua field harus diisi.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Format email tidak valid.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Kata sandi minimal 6 karakter.' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing)
      return res.status(409).json({ error: 'Email sudah terdaftar. Silakan masuk.' });

    const hashed    = await bcrypt.hash(password, 10);
    const id        = generateId();
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name.trim(), email.toLowerCase(), hashed, createdAt);

    // Seed default categories
    const defaultCategories = [
      { nama: 'Gaji', icon: 'briefcase' },
      { nama: 'Makanan', icon: 'utensils' },
      { nama: 'Transport', icon: 'car' },
      { nama: 'Belanja', icon: 'shopping-bag' },
      { nama: 'Kesehatan', icon: 'heart-pulse' },
      { nama: 'Hiburan', icon: 'gamepad-2' },
      { nama: 'Investasi', icon: 'trending-up' },
      { nama: 'Lainnya', icon: 'package' }
    ];
    const insertCat = db.prepare('INSERT INTO categories (id, user_id, nama, icon) VALUES (?, ?, ?, ?)');
    for (const cat of defaultCategories) {
      insertCat.run(generateId(), id, cat.nama, cat.icon);
    }

    res.status(201).json({
      message: 'Akun berhasil dibuat!',
      user: { id, name: name.trim(), email: email.toLowerCase() }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email dan password harus diisi.' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user)
      return res.status(401).json({ error: 'Email atau kata sandi salah.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Email atau kata sandi salah.' });

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
