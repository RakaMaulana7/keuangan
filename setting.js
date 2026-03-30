// ===== setting.js =====

let categories = [];
let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchCategories();
  updateIconPreview();
});

async function fetchCategories() {
  const res = await authFetch('/api/categories');
  if (res && res.ok) {
    categories = await res.json();
    renderTable();
  }
}

function renderTable() {
  const tbody = document.getElementById('catTableBody');
  const empty = document.getElementById('catEmpty');
  const count = document.getElementById('catCount');
  
  if (!tbody) return;

  count.textContent = `${categories.length} Kategori`;

  if (categories.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = categories.map(c => `
      <tr>
        <td data-label="Ikon">
          <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:rgba(149,105,255,0.1);border-radius:8px;color:var(--accent);">
            ${lucideIcon(c.icon, 18)}
          </div>
        </td>
        <td data-label="Nama Kategori" style="font-weight:600">${c.nama}</td>
        <td data-label="Aksi" style="text-align: right;">
          <div class="actions-cell" style="justify-content: flex-end;">
            <button class="btn-icon edit" onclick="openEdit('${c.id}')" title="Edit">
              ${lucideIcon('pencil', 15)}
            </button>
            <button class="btn-icon del" onclick="openDelete('${c.id}', '${c.nama}')" title="Hapus">
              ${lucideIcon('trash-2', 15)}
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  if (window.refreshIcons) {
    window.refreshIcons();
  }
}

function updateIconPreview() {
  const icon = document.getElementById('fIcon').value;
  const preview = document.getElementById('iconPreview');
  preview.innerHTML = lucideIcon(icon, 20);
  if (window.refreshIcons) window.refreshIcons();
}

// ===== MODAL LOGIC =====
function openModal() {
  document.getElementById('modalTitle').textContent = 'Tambah Kategori';
  document.getElementById('submitBtn').textContent = 'Simpan';
  document.getElementById('catForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('fIcon').value = 'tag';
  updateIconPreview();
  document.getElementById('modalOverlay').classList.add('active');
}

function openEdit(id) {
  const c = categories.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalTitle').textContent = 'Edit Kategori';
  document.getElementById('submitBtn').textContent = 'Perbarui';
  document.getElementById('editId').value = c.id;
  document.getElementById('fNama').value = c.nama;
  document.getElementById('fIcon').value = c.icon;
  updateIconPreview();
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
    nama: document.getElementById('fNama').value.trim(),
    icon: document.getElementById('fIcon').value
  };

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Menyimpan...';

  const url    = id ? `/api/categories/${id}` : '/api/categories';
  const method = id ? 'PUT' : 'POST';
  const res    = await authFetch(url, { method, body: JSON.stringify(data) });

  btn.disabled = false;
  btn.textContent = originalText;

  if (!res) return;
  const result = await res.json();

  if (!res.ok) {
    showToast(result.error || 'Gagal menyimpan kategori.', 'error');
    return;
  }

  if (id) {
    const idx = categories.findIndex(x => x.id === id);
    if (idx !== -1) categories[idx] = result;
    showToast('Kategori berhasil diperbarui!', 'success');
  } else {
    categories.push(result);
    // Sort alphabetically after add
    categories.sort((a,b) => a.nama.localeCompare(b.nama));
    showToast('Kategori berhasil ditambahkan!', 'success');
  }

  closeModal();
  renderTable();
}

// ===== DELETE LOGIC =====
function openDelete(id, name) {
  pendingDeleteId = id;
  document.getElementById('delKatName').textContent = name;
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

  const res = await authFetch(`/api/categories/${pendingDeleteId}`, { method: 'DELETE' });

  if (btn) { btn.disabled = false; btn.textContent = 'Hapus'; }

  if (!res) return;

  if (res.ok) {
    categories = categories.filter(c => c.id !== pendingDeleteId);
    closeDelete();
    renderTable();
    showToast('Kategori berhasil dihapus.', 'info');
  } else {
    const result = await res.json();
    showToast(result.error || 'Gagal menghapus kategori.', 'error');
    closeDelete();
  }
}
