// ===== laporan.js =====

let transactions = [];
let categories = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCategories();
  await fetchTransactions();
  renderKategoriReport();
  renderMonthlyReport();
});

async function fetchCategories() {
  const res = await authFetch('/api/categories');
  if (res && res.ok) {
    categories = await res.json();
  }
}

async function fetchTransactions() {
  const res = await authFetch('/api/transactions');
  if (res && res.ok) {
    transactions = await res.json();
  }
}

function getCategoryIcon(catName) {
  const cat = categories.find(c => c.nama === catName);
  return cat ? cat.icon : 'tag';
}

function renderKategoriReport() {
  const container = document.getElementById('kategoriReport');
  if (!container) return;

  const totals = {};
  transactions.filter(t => t.tipe === 'pengeluaran').forEach(t => {
    totals[t.kategori] = (totals[t.kategori] || 0) + t.jumlah;
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = entries[0]?.[1] || 1;

  if (entries.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">${lucideIcon('bar-chart-2', 40)}</div><p>Belum ada data pengeluaran</p></div>`;
    return;
  }
  
  container.innerHTML = entries.map(([kat, amt]) => {
    const icon = getCategoryIcon(kat);
    return `
      <div class="kategori-row">
        <div class="kategori-lucide-icon">${lucideIcon(icon, 20)}</div>
        <div class="kategori-bar-wrap">
          <div class="kategori-bar-label">
            <span>${kat}</span>
            <span style="color:var(--accent-expense)">${formatRupiah(amt)}</span>
          </div>
          <div class="kategori-bar-bg">
            <div class="kategori-bar-fill" style="width:${(amt/max*100).toFixed(1)}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.refreshIcons) window.refreshIcons();
}

function renderMonthlyReport() {
  const container = document.getElementById('monthlyReport');
  if (!container) return;

  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = thisMonth.filter(t => t.tipe === 'pemasukan').reduce((s, t) => s + t.jumlah, 0);
  const expense = thisMonth.filter(t => t.tipe === 'pengeluaran').reduce((s, t) => s + t.jumlah, 0);
  const balance = income - expense;
  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  container.innerHTML = `
    <div style="text-align:center;padding:12px 0 16px;color:var(--text-muted);font-size:0.8rem">${monthName}</div>
    <div class="monthly-stat">
      <div class="monthly-stat-label">${lucideIcon('arrow-down-circle', 16)} Pemasukan</div>
      <div class="monthly-stat-value" style="color:var(--accent-income)">${formatRupiah(income)}</div>
    </div>
    <div class="monthly-stat">
      <div class="monthly-stat-label">${lucideIcon('arrow-up-circle', 16)} Pengeluaran</div>
      <div class="monthly-stat-value" style="color:var(--accent-expense)">${formatRupiah(expense)}</div>
    </div>
    <div class="monthly-stat">
      <div class="monthly-stat-label">${lucideIcon('briefcase', 16)} Saldo Bersih</div>
      <div class="monthly-stat-value" style="color:${balance >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)'}">${formatRupiah(balance)}</div>
    </div>
    <div class="monthly-stat">
      <div class="monthly-stat-label">${lucideIcon('layers', 16)} Total Transaksi</div>
      <div class="monthly-stat-value" style="color:var(--accent)">${thisMonth.length}</div>
    </div>
  `;

  if (window.refreshIcons) window.refreshIcons();
}
