const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'transaksi.db'));

// Performance mode - note: node:sqlite might not support all pragmas directly via exec, 
// but WAL is standard.
db.exec('PRAGMA journal_mode = WAL;');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    nama       TEXT NOT NULL,
    icon       TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    deskripsi  TEXT NOT NULL,
    jumlah     REAL NOT NULL,
    tipe       TEXT NOT NULL CHECK(tipe IN ('pemasukan','pengeluaran')),
    kategori   TEXT NOT NULL,
    tanggal    TEXT NOT NULL,
    catatan    TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

console.log('📦  Database siap: backend/transaksi.db (menggunakan node:sqlite built-in)');

module.exports = db;
