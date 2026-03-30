const express = require('express');
const db      = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require valid JWT
router.use(authMiddleware);

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// GET /api/transactions
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY tanggal DESC, created_at DESC'
    ).all(req.user.userId);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data transaksi.' });
  }
});

// POST /api/transactions
router.post('/', (req, res) => {
  try {
    const { deskripsi, jumlah, tipe, kategori, tanggal, catatan } = req.body;

    if (!deskripsi || !jumlah || !tipe || !kategori || !tanggal)
      return res.status(400).json({ error: 'Field wajib tidak boleh kosong.' });
    if (!['pemasukan', 'pengeluaran'].includes(tipe))
      return res.status(400).json({ error: 'Tipe transaksi tidak valid.' });

    const id        = generateId();
    const createdAt = new Date().toISOString();

    db.prepare(
      `INSERT INTO transactions
       (id, user_id, deskripsi, jumlah, tipe, kategori, tanggal, catatan, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, req.user.userId, deskripsi, parseFloat(jumlah), tipe, kategori, tanggal, catatan || '', createdAt);

    const row = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan transaksi.' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);

    if (!existing)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });

    const { deskripsi, jumlah, tipe, kategori, tanggal, catatan } = req.body;

    db.prepare(
      `UPDATE transactions
       SET deskripsi=?, jumlah=?, tipe=?, kategori=?, tanggal=?, catatan=?
       WHERE id=? AND user_id=?`
    ).run(
      deskripsi  ?? existing.deskripsi,
      jumlah     !== undefined ? parseFloat(jumlah) : existing.jumlah,
      tipe       ?? existing.tipe,
      kategori   ?? existing.kategori,
      tanggal    ?? existing.tanggal,
      catatan    ?? existing.catatan,
      req.params.id,
      req.user.userId
    );

    const updated = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui transaksi.' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.user.userId);

    if (!existing)
      return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.userId);

    res.json({ message: 'Transaksi berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus transaksi.' });
  }
});

module.exports = router;
