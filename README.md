# Aplikasi Manajemen Transaksi Keuangan (Transaksi-ku)

Aplikasi berbasis web untuk mengelola transaksi keuangan pribadi Anda. Aplikasi ini memungkinkan pengguna untuk melacak pemasukan dan pengeluaran, melihat laporan keuangan, dan mengelola kategori transaksi.

## Fitur Utama

- **Autentikasi Pengguna:** Login dan registrasi yang aman menggunakan JWT (JSON Web Tokens) dan bcrypt untuk hashing password.
- **Dashboard:** Ringkasan keuangan Anda dalam satu halaman.
- **Manajemen Transaksi:** Tambah, edit, dan hapus transaksi (pemasukan dan pengeluaran).
- **Laporan Keuangan:** Lihat laporan dari transaksi Anda untuk melacak arus kas.
- **Pengaturan:** Kelola kategori transaksi Anda.

## Teknologi yang Digunakan

### Frontend
- HTML5
- CSS3 (Vanilla)
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- SQLite (Database)
- JSON Web Token (JWT) untuk autentikasi
- bcryptjs untuk keamanan password
- CORS

## Prasyarat Instalasi

Pastikan Anda telah menginstal lingkungan berikut di sistem Anda:
- [Node.js](https://nodejs.org/) (versi LTS yang direkomendasikan)
- [npm](https://www.npmjs.com/) (biasanya sudah terinstal bersama Node.js)

## Cara Menginstal dan Menjalankan

Ikuti langkah-langkah di bawah ini untuk menjalankan project ini di komputer lokal Anda:

1. **Clone repositori ini:**
   ```bash
   git clone <URL_REPOSITORI_ANDA>
   cd keuangan
   ```

2. **Instal dependensi:**
   Buka terminal di dalam direktori project dan jalankan perintah:
   ```bash
   npm install
   ```

3. **Jalankan Server Backend:**
   Aplikasi ini memerlukan backend untuk berjalan. Jalankan server dengan perintah:
   ```bash
   npm start
   ```
   Atau untuk mode pengembangan (dengan nodemon):
   ```bash
   npm run dev
   ```
   Server akan berjalan secara default di `http://localhost:3000` (atau port yang ditentukan di backend).

4. **Jalankan Frontend:**
   Buka file `auth.html` (atau halaman utama lain jika sudah ada routing khusus) secara langsung di browser Anda, atau gunakan ekstensi seperti Live Server di VS Code untuk pengalaman pengembangan yang lebih baik.

## Struktur Direktori

```
keuangan/
├── backend/            # Berisi logika server (Express), routing, dan database SQLite
├── *.html              # File antarmuka pengguna (auth.html, dashboard.html, dll)
├── *.css               # File styling
├── *.js                # File logika frontend
├── package.json        # Konfigurasi npm dan daftar dependensi
└── README.md           # Dokumentasi ini
```

## Lisensi

[Tambahkan informasi lisensi di sini jika ada]
