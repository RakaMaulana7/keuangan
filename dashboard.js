// ===== dashboard.js =====

let categories = [];
let transactions = [];

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCategories();
  await fetchTransactions();
  renderDashboard();
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

function renderDashboard() {
  let income = 0, expense = 0;
  transactions.forEach(t => {
    if (t.tipe === 'pemasukan') income += t.jumlah;
    else expense += t.jumlah;
  });

  document.getElementById('totalPemasukan').textContent   = formatRupiah(income);
  document.getElementById('totalPengeluaran').textContent = formatRupiah(expense);
  document.getElementById('saldoBersih').textContent      = formatRupiah(income - expense);
  document.getElementById('totalCount').textContent       = transactions.length;

  const recentList = document.getElementById('recentList');
  const recentEmpty = document.getElementById('recentEmpty');
  
  if (transactions.length === 0) {
    recentList.style.display = 'none';
    recentEmpty.style.display = 'block';
  } else {
    recentEmpty.style.display = 'none';
    recentList.style.display = 'block';
    
    // latest 5
    const latest = transactions.slice(0, 5);
    recentList.innerHTML = latest.map(t => {
      const cls = t.tipe === 'pemasukan' ? 'income' : 'expense';
      const icon = getCategoryIcon(t.kategori);
      const sign = t.tipe === 'pemasukan' ? '+' : '-';
      
      const parts = t.tanggal.split('-');
      const d = parts[2] ? `${parts[2]}/${parts[1]}/${parts[0]}` : t.tanggal;

      return `
        <div class="trx-item">
          <div class="trx-category-icon ${cls}">
            ${lucideIcon(icon)}
          </div>
          <div class="trx-info">
            <div class="trx-desc">${t.deskripsi}</div>
            <div class="trx-meta">${t.kategori} &bull; ${d}</div>
          </div>
          <div class="trx-amount ${cls}">${sign}${formatRupiah(t.jumlah)}</div>
        </div>
      `;
    }).join('');
  }

  // Refresh lucide icons that were just added
  if (window.refreshIcons) {
    window.refreshIcons();
  }
}
