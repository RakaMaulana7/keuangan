// ===== transaksi.js =====

let transactions = [];
let categories = [];
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchCategories();
  await fetchTransactions();
  setDefaultDate();
  populateCategorySelects();
  renderTable(transactions);
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

function populateCategorySelects() {
  const filterCat = document.getElementById('filterKategori');
  const formCat = document.getElementById('fKategori');
  
  if (!filterCat || !formCat) return;

  const filterCurrent = filterCat.value;
  const formCurrent = formCat.value;

  filterCat.innerHTML = '<option value="all">Semua Kategori</option>';
  formCat.innerHTML = '';

  categories.forEach(c => {
    filterCat.innerHTML += `<option value="${c.nama}">${c.nama}</option>`;
    formCat.innerHTML += `<option value="${c.nama}">${c.nama}</option>`;
  });

  if (filterCurrent) filterCat.value = filterCurrent;
  if (formCurrent) formCat.value = formCurrent;
}

function getCategoryIcon(catName) {
  const cat = categories.find(c => c.nama === catName);
  return cat ? cat.icon : 'tag';
}

function filterTransactions() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const type  = document.getElementById('filterType').value;
  const cat   = document.getElementById('filterKategori').value;

  const result = transactions.filter(t => {
    const matchQ = t.deskripsi.toLowerCase().includes(query) || (t.catatan && t.catatan.toLowerCase().includes(query));
    const matchT = type === 'all' || t.tipe === type;
    const matchC = cat === 'all' || t.kategori === cat;
    return matchQ && matchT && matchC;
  });

  renderTable(result);
}

function renderTable(data) {
  const tbody = document.getElementById('trxTableBody');
  const empty = document.getElementById('tableEmpty');
  const count = document.getElementById('trxCount');
  
  if (!tbody) return;

  count.textContent = `${data.length} Transaksi`;

  if (data.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = data.map(t => {
      const cls = t.tipe === 'pemasukan' ? 'income' : 'expense';
      const icon = getCategoryIcon(t.kategori);
      const parts = t.tanggal.split('-');
      const d = parts[2] ? `${parts[2]}/${parts[1]}/${parts[0]}` : t.tanggal;
      const tLabel = t.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran';

      return `
        <tr>
          <td style="color:var(--text-secondary)">${d}</td>
          <td>
            <div style="font-weight:600">${t.deskripsi}</div>
            ${t.catatan ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">${t.catatan}</div>` : ''}
          </td>
          <td>
            <div class="kategori-cell">
              ${lucideIcon(icon, 14)}
              <span>${t.kategori}</span>
            </div>
          </td>
          <td>
            <span class="type-badge ${t.tipe}">${tLabel}</span>
          </td>
          <td class="amount-cell amount-${cls}">${t.tipe === 'pemasukan'?'+':'-'}${formatRupiah(t.jumlah)}</td>
          <td>
            <div class="actions-cell">
              <button class="btn-icon edit" onclick="openEdit('${t.id}')" title="Edit">
                ${lucideIcon('edit-2')}
              </button>
              <button class="btn-icon del" onclick="openDelete('${t.id}')" title="Hapus">
                ${lucideIcon('trash-2')}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (window.refreshIcons) window.refreshIcons();
}

function setDefaultDate() {
  const tpl = new Date().toISOString().split('T')[0];
  const el = document.getElementById('fTanggal');
  if (el && !el.value) el.value = tpl;
}

// ===== MODAL LOGIC =====
function openModal() {
  document.getElementById('modalTitle').textContent = 'Tambah Transaksi';
  document.getElementById('submitBtn').textContent = 'Simpan';
  document.getElementById('trxForm').reset();
  document.getElementById('editId').value = '';
  setDefaultDate();
  document.getElementById('modalOverlay').classList.add('active');
}

function openEdit(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;
  document.getElementById('modalTitle').textContent = 'Edit Transaksi';
  document.getElementById('submitBtn').textContent = 'Perbarui';
  document.getElementById('editId').value = t.id;
  document.getElementById('fDeskripsi').value = t.deskripsi;
  document.getElementById('fJumlah').value = t.jumlah;
  document.getElementById('fTipe').value = t.tipe;
  document.getElementById('fKategori').value = t.kategori;
  document.getElementById('fTanggal').value = t.tanggal;
  document.getElementById('fCatatan').value = t.catatan || '';
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function closeModalOutside(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

async function submitForm(e) {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const data = {
    deskripsi: document.getElementById('fDeskripsi').value.trim(),
    jumlah:    parseFloat(document.getElementById('fJumlah').value),
    tipe:      document.getElementById('fTipe').value,
    kategori:  document.getElementById('fKategori').value,
    tanggal:   document.getElementById('fTanggal').value,
    catatan:   document.getElementById('fCatatan').value.trim(),
  };

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Menyimpan...';

  const url    = id ? `/api/transactions/${id}` : '/api/transactions';
  const method = id ? 'PUT' : 'POST';
  const res    = await authFetch(url, { method, body: JSON.stringify(data) });

  btn.disabled = false;
  btn.textContent = originalText;

  if (!res) return;
  const result = await res.json();

  if (!res.ok) {
    showToast(result.error || 'Gagal menyimpan transaksi.', 'error');
    return;
  }

  if (id) {
    const idx = transactions.findIndex(x => x.id === id);
    if (idx !== -1) transactions[idx] = result;
    showToast('Transaksi berhasil diperbarui!', 'success');
  } else {
    transactions.unshift(result); // put at top
    showToast('Transaksi berhasil ditambahkan!', 'success');
  }

  closeModal();
  filterTransactions();
}

// ===== DELETE LOGIC =====
function openDelete(id) {
  pendingDeleteId = id;
  document.getElementById('deleteOverlay').style.display = 'flex';
  setTimeout(() => document.getElementById('deleteOverlay').classList.add('active'), 10);
}

function closeDelete() {
  document.getElementById('deleteOverlay').classList.remove('active');
  setTimeout(() => { document.getElementById('deleteOverlay').style.display = 'none'; }, 300);
  pendingDeleteId = null;
}

function closeDeleteOutside(e) {
  if (e.target === document.getElementById('deleteOverlay')) closeDelete();
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('confirmDeleteBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Menghapus...'; }

  const res = await authFetch(`/api/transactions/${pendingDeleteId}`, { method: 'DELETE' });

  if (btn) { btn.disabled = false; btn.textContent = 'Hapus'; }

  if (!res) return;

  if (res.ok) {
    transactions = transactions.filter(t => t.id !== pendingDeleteId);
    closeDelete();
    filterTransactions();
    showToast('Transaksi berhasil dihapus!', 'info');
  } else {
    const result = await res.json();
    showToast(result.error || 'Gagal menghapus transaksi.', 'error');
    closeDelete();
  }
}
