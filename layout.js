// ===== layout.js - Global Layout Injection (Sidebar & Topbar) =====

document.addEventListener('DOMContentLoaded', () => {
  injectBackground();
  injectSidebar();
  injectTopbar();
  handleResponsive();
  window.addEventListener('resize', handleResponsive);
  
  // Refresh Lucide icons after injection
  if (window.refreshIcons) window.refreshIcons();
});

function injectBackground() {
  const bgHTML = `
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
  `;
  document.body.insertAdjacentHTML('afterbegin', bgHTML);
}

function injectSidebar() {
  const user = getUser() || { name: 'User', email: 'Personal Finance' };
  const avatarChar = (user.name || 'U')[0].toUpperCase();
  
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon"><i data-lucide="credit-card"></i></div>
        <span>TransaksiKu</span>
      </div>
      <nav class="sidebar-nav">
        <a href="dashboard.html" class="nav-item ${currentPath.includes('dashboard') || currentPath === '' ? 'active' : ''}">
          <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span> Dashboard
        </a>
        <a href="transaksi.html" class="nav-item ${currentPath.includes('transaksi') ? 'active' : ''}">
          <span class="nav-icon"><i data-lucide="wallet"></i></span> Transaksi
        </a>
        <a href="laporan.html" class="nav-item ${currentPath.includes('laporan') ? 'active' : ''}">
          <span class="nav-icon"><i data-lucide="bar-chart-2"></i></span> Laporan
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info" style="position: relative; cursor: pointer; display: flex; align-items: center; justify-content: space-between; width: 100%; border-radius: 8px; padding: 4px; transition: background 0.2s;" onclick="toggleProfileMenu(event)">
          <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
            <div class="user-avatar">${avatarChar}</div>
            <div class="user-details" style="flex: 1; overflow: hidden;">
              <div class="user-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name}</div>
              <div class="user-role" style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.email}</div>
            </div>
          </div>
          <i data-lucide="chevron-up" style="width:16px; height:16px; color: var(--text-muted); flex-shrink: 0;"></i>
          
          <!-- Popover Menu -->
          <div id="profileMenu" class="profile-menu" style="display: none; position: absolute; bottom: calc(100% + 10px); left: 0; right: 0; background: #1a1c2e; border: 1px solid var(--border); border-radius: 12px; padding: 6px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); z-index: 200;">
            <a href="setting.html" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: var(--text-primary); text-decoration: none; border-radius: 8px; font-size: 0.85rem; font-weight: 500; transition: background 0.2s;">
              <i data-lucide="settings" style="width: 16px; height: 16px;"></i> Pengaturan
            </a>
            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 4px 0;"></div>
            <a href="#" onclick="logout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: var(--accent-expense); text-decoration: none; border-radius: 8px; font-size: 0.85rem; font-weight: 500; transition: background 0.2s;">
              <i data-lucide="log-out" style="width: 16px; height: 16px;"></i> Keluar
            </a>
          </div>
        </div>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
}

function injectTopbar() {
  const mainEl = document.getElementById('main');
  if (!mainEl) return;
  
  // Page titles map
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
  let title = 'Dashboard';
  let actionHtml = '';

  if (currentPath.includes('transaksi')) {
    title = 'Transaksi';
    actionHtml = `<button class="btn-primary" onclick="openModal()" id="btnAddTransaksi"><i data-lucide="plus"></i> Tambah Transaksi</button>`;
  } else if (currentPath.includes('laporan')) {
    title = 'Laporan Keuangan';
  } else if (currentPath.includes('setting')) {
    title = 'Pengaturan Kategori';
    actionHtml = `<button class="btn-primary" onclick="openModal()"><i data-lucide="plus"></i> Kategori Baru</button>`;
  }

  const topbarHTML = `
    <header class="topbar">
      <button class="menu-btn" onclick="toggleSidebar()" title="Toggle Menu"><i data-lucide="menu"></i></button>
      <div class="topbar-title">${title}</div>
      <div class="topbar-actions">${actionHtml}</div>
    </header>
  `;
  mainEl.insertAdjacentHTML('afterbegin', topbarHTML);
}

// Layout interaction logic
let sidebarOpen = false;

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    const main = document.getElementById('main');
    if (main) main.classList.toggle('full');
  }
}

function handleResponsive() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main');
  if (!sidebar || !main) return;
  
  if (window.innerWidth <= 900) {
    sidebar.classList.remove('open', 'collapsed');
    main.style.marginLeft = '0';
  } else {
    sidebar.classList.remove('open', 'collapsed');
    main.style.marginLeft = '';
    main.classList.remove('full');
  }
}

function toggleProfileMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('profileMenu');
  if (menu) {
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';
  }
}

// Close profile menu if clicked outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileMenu');
  if (menu && menu.style.display === 'block') {
    menu.style.display = 'none';
  }
});

function logout(e) {
  if (e) e.preventDefault();
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'auth.html';
}
