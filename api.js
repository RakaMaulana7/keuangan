// ===== api.js - Core Utilities & API Helpers =====

const SESSION_KEY = 'transaksi_ku_session';

// SESSION GUARD - Run immediately on any protected page
(function() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) { window.location.href = 'auth.html'; return; }
  try {
    const s = JSON.parse(raw);
    if (!s.token) window.location.href = 'auth.html';
  } catch(e) { window.location.href = 'auth.html'; }
})();

function getToken() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)).token; } catch(e) { return null; }
}

function getUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
}

async function authFetch(url, options = {}) {
  const token = getToken();
  options.headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  try {
    const res = await fetch(url, options);
    if (res.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = 'auth.html';
      return null;
    }
    return res;
  } catch(e) {
    showToast('Tidak dapat terhubung ke server!', 'error');
    return null;
  }
}

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function lucideIcon(name, size = 18) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`;
}

// Global Toast logic
function showToast(msg, type = 'info') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  
  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

window.refreshIcons = function() {
  if (window.lucide) {
    lucide.createIcons();
    // Prevent double processing which wipes inner SVG paths
    document.querySelectorAll('svg[data-lucide]').forEach(svg => {
      svg.removeAttribute('data-lucide');
    });
  }
};

// Wait for DOM to init lucide icons generically if needed
document.addEventListener('DOMContentLoaded', () => {
  window.refreshIcons();
});
