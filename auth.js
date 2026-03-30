/* ============================================================
   auth.js – TransaksiKu Authentication (API-backed)
   Data dikirim ke backend, BUKAN localStorage
   ============================================================ */

const SESSION_KEY = 'transaksi_ku_session';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go straight to app
  if (sessionStorage.getItem(SESSION_KEY)) {
    window.location.href = 'dashboard.html';
    return;
  }
  setupTogglePassword('loginPassword', 'toggleLoginPw');
  setupTogglePassword('regPassword',   'toggleRegPw');
  document.getElementById('regPassword').addEventListener('input', updatePasswordStrength);
});

function refreshIconsAuth() {
  if (window.lucide) {
    lucide.createIcons();
    document.querySelectorAll('svg[data-lucide]').forEach(svg => {
      svg.removeAttribute('data-lucide');
    });
  }
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');
  clearMessages();

  if (tab === 'login') {
    loginForm.style.display    = '';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.querySelector('input').focus();
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = '';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    registerForm.querySelector('input').focus();
  }
  refreshIconsAuth();
  return false;
}

// ===== REGISTER =====
async function handleRegister(e) {
  e.preventDefault();
  clearMessages();

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  // Client-side validations
  if (!name)                         return showError('register', 'Nama lengkap tidak boleh kosong.');
  if (!validateEmail(email))         return showError('register', 'Format email tidak valid.');
  if (password.length < 6)           return showError('register', 'Kata sandi minimal 6 karakter.');
  if (password !== confirm)          return showError('register', 'Konfirmasi kata sandi tidak cocok.');

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div><span>Mendaftarkan...</span>';

  try {
    const res  = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showError('register', data.error || 'Gagal mendaftar. Coba lagi.');
    } else {
      showSuccess('register', `Akun berhasil dibuat! Selamat datang, ${name}. Silakan masuk.`);
      document.getElementById('registerForm').reset();
      document.getElementById('pwStrength').style.display = 'none';
      setTimeout(() => switchTab('login'), 1600);
    }
  } catch (err) {
    showError('register', 'Tidak dapat terhubung ke server. Pastikan server berjalan (npm start).');
  }

  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="user-plus"></i><span>Buat Akun</span>';
  refreshIconsAuth();
}

// ===== LOGIN =====
async function handleLogin(e) {
  e.preventDefault();
  clearMessages();

  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');

  if (!validateEmail(email)) return showError('login', 'Format email tidak valid.');
  if (!password)             return showError('login', 'Kata sandi tidak boleh kosong.');

  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div><span>Memverifikasi...</span>';

  try {
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      showError('login', data.error || 'Email atau kata sandi salah.');
    } else {
      // Simpan token + info user ke sessionStorage
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        token: data.token,
        name:  data.user.name,
        email: data.user.email
      }));
      window.location.href = 'dashboard.html';
      return;
    }
  } catch (err) {
    showError('login', 'Tidak dapat terhubung ke server. Pastikan server berjalan (npm start).');
  }

  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="log-in"></i><span>Masuk</span>';
  refreshIconsAuth();
}

// ===== PASSWORD STRENGTH =====
function updatePasswordStrength() {
  const pw   = document.getElementById('regPassword').value;
  const bar  = document.getElementById('pwFill');
  const lbl  = document.getElementById('pwLabel');
  const wrap = document.getElementById('pwStrength');

  if (!pw) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';

  let score = 0;
  if (pw.length >= 6)           score++;
  if (pw.length >= 10)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw))  score++;

  const levels = [
    { label: 'Sangat Lemah', color: '#ef4444', width: '15%'  },
    { label: 'Lemah',        color: '#f97316', width: '30%'  },
    { label: 'Cukup',        color: '#eab308', width: '55%'  },
    { label: 'Kuat',         color: '#22c55e', width: '80%'  },
    { label: 'Sangat Kuat',  color: '#10b981', width: '100%' },
  ];
  const level = levels[Math.min(score, 4)];
  bar.style.width      = level.width;
  bar.style.background = level.color;
  lbl.textContent      = level.label;
  lbl.style.color      = level.color;
}

// ===== TOGGLE PASSWORD VISIBILITY =====
function setupTogglePassword(inputId, btnId) {
  const btn   = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type     = isHidden ? 'text' : 'password';
    btn.innerHTML  = isHidden
      ? '<i data-lucide="eye-off"></i>'
      : '<i data-lucide="eye"></i>';
    refreshIconsAuth();
  });
}

// ===== HELPERS =====
function showError(form, msg) {
  const el = document.getElementById(form === 'login' ? 'loginError' : 'registerError');
  el.innerHTML     = '⚠️ ' + msg;
  el.style.display = 'flex';
}
function showSuccess(form, msg) {
  const el = document.getElementById('registerSuccess');
  el.textContent   = '✓ ' + msg;
  el.style.display = 'flex';
}
function clearMessages() {
  ['loginError', 'registerError', 'registerSuccess'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.textContent = ''; }
  });
}
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
