const express = require('express');
const db      = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require valid JWT
router.use(authMiddleware);

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// GET /api/categories
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, nama, icon FROM categories WHERE user_id = ? ORDER BY nama ASC'
    ).all(req.user.userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data kategori.' });
  }
});

// POST /api/categories
router.post('/', (req, res) => {
  try {
    const { nama, icon } = req.body;

    if (!nama || !icon)
      return res.status(400).json({ error: 'Nama dan ikon wajib diisi.' });

    // Check if category name already exists for this user (case-insensitive)
    const existing = db.prepare(
      'SELECT id FROM categories WHERE user_id = ? AND LOWER(nama) = ?'
    ).get(req.user.userId, nama.toLowerCase());

    if (existing)
      return res.status(400).json({ error: 'Kategori dengan nama ini sudah ada.' });

    const id = generateId();

    db.prepare(
      'INSERT INTO categories (id, user_id, nama, icon) VALUES (?, ?, ?, ?)'
    ).run(id, req.user.userId, nama.trim(), icon.trim());

    const row = db.prepare('SELECT id, nama, icon FROM categories WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambah kategori.' });
  }
});

// PUT /api/categories/:id
router.put('/:id', (req, res) => {
  try {
    const { nama, icon } = req.body;
    
    if (!nama || !icon)
      return res.status(400).json({ error: 'Nama dan ikon wajib diisi.' });

    const existing = db.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);

    if (!existing)
      return res.status(404).json({ error: 'Kategori tidak ditemukan.' });

    // Check if new name exists elsewhere
    const nameConflict = db.prepare(
      'SELECT id FROM categories WHERE user_id = ? AND LOWER(nama) = ? AND id != ?'
    ).get(req.user.userId, nama.toLowerCase(), req.params.id);

    if (nameConflict)
      return res.status(400).json({ error: 'Kategori dengan nama ini sudah ada.' });

    db.prepare(
      'UPDATE categories SET nama=?, icon=? WHERE id=? AND user_id=?'
    ).run(nama.trim(), icon.trim(), req.params.id, req.user.userId);

    const updated = db.prepare('SELECT id, nama, icon FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui kategori.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM categories WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);

    if (!existing)
      return res.status(404).json({ error: 'Kategori tidak ditemukan.' });

    db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.userId);

    res.json({ message: 'Kategori berhasil dihapus.', deletedId: req.params.id, deletedNama: existing.nama });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus kategori.' });
  }
});

module.exports = router;
