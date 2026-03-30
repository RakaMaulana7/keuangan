const express = require('express');
const path    = require('path');
const cors    = require('cors');

// Initialize DB (creates tables if not exist)
require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories',   require('./routes/categories'));

// Default: redirect to auth page
app.get('/', (req, res) => res.redirect('/auth.html'));

app.listen(PORT, () => {
  console.log('\n✅  TransaksiKu backend berjalan!');
  console.log(`🌐  Buka browser: http://localhost:${PORT}/auth.html\n`);
});
