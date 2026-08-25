/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()

let transactions = [];
let editItem = null; // id transaksi yang sedang diedit

/**
 * Menghasilkan ID unik untuk setiap transaksi.
 * Menggabungkan timestamp dan angka acak untuk mengurangi kemungkinan tabrakan.
 * Contoh penggunaan: const id = generateId();
 */
function generateId() {
  return (+new Date()).toString(36) + Math.random().toString(36).slice(2, 9);
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
let incomeList;
let expenseList;
/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */

/**
 * TODO [Skilled]:
 * Tambahkan validasi input sebelum menyimpan data:
 *  - Tampilkan alert() dan hentikan proses jika judul kosong
 *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
 */

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Validasi input kosong sebelum disimpan
function validateTransactionInput({ title, amount }) {
  if (!title || !title.trim()) {
    return { ok: false, message: 'Keterangan tidak boleh kosong.' };
  }
  if (!Number.isFinite(amount) || amount < 1) {
    return { ok: false, message: 'Nominal harus lebih besar dari 0.' };
  }
  return { ok: true };
}

// Pastikan fungsi tersedia secara global (mencegah ReferenceError jika handler dijalankan di konteks berbeda)
window.validateTransactionInput = validateTransactionInput;

function createTransactionCard(tx) {
    const card = document.createElement('div');
    card.className = 'transactionItem';
    card.setAttribute('data-testid', 'transactionItem');
    card.dataset.id = tx.id;

    const title = document.createElement('h3');
    title.className = 'transactionItemTitle';
    title.textContent = tx.title;
    title.setAttribute('data-testid', 'transactionItemTitle');

    const amount = document.createElement('p');
    amount.className = 'transactionItemAmount';
    amount.setAttribute('data-testid', 'transactionItemAmount');
    amount.textContent = 'Nominal: ' + formatCurrency(tx.amount);

    const date = document.createElement('p');
    date.className = 'transactionItemDate';
    date.textContent = 'Tanggal: ' + tx.date;
    date.setAttribute('data-testid', 'transactionItemDate');

    const typeEl = document.createElement('p');
    typeEl.className = 'transactionItemType';
    typeEl.setAttribute('data-testid', 'transactionItemType');
    typeEl.textContent = 'Tipe: ' + (tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran');

    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'transactionItemActions';

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.setAttribute('data-testid', 'transactionItemEditButton');
    btnEdit.className = 'tx-btn tx-btn-edit';
    btnEdit.textContent = 'Edit';

    const btnEditType = document.createElement('button');
    btnEditType.type = 'button';
    btnEditType.setAttribute('data-testid', 'transactionItemEditTypeButton');
    btnEditType.className = 'tx-btn tx-btn-edit-type';
    btnEditType.textContent = 'Ubah Tipe';

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.setAttribute('data-testid', 'transactionItemDeleteButton');
    btnDelete.className = 'tx-btn tx-btn-delete';
    btnDelete.textContent = 'Hapus';

    actionsWrap.appendChild(btnEdit);
    actionsWrap.appendChild(btnEditType);
    actionsWrap.appendChild(btnDelete);

    // Susun elemen kartu
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(amount);
    card.appendChild(typeEl);
    card.appendChild(actionsWrap);

    return card;
}

function renderTransactions(list = transactions) {
    // Kosongkan container jika ada
    if (incomeList) incomeList.innerHTML = '';
    if (expenseList) expenseList.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) return;

    list.forEach(tx => {
        const card = createTransactionCard(tx);
        if (tx.type === 'income') {
            if (incomeList) incomeList.appendChild(card);
        } else {
            if (expenseList) expenseList.appendChild(card);
        }
    });
}


function loadTransactions() {
  try {
    const raw = localStorage.getItem('transactions');
    transactions = raw ? JSON.parse(raw) : [];
    // pastikan amount bertipe Number
    transactions = transactions.map(t => ({ ...t, amount: Number(t.amount || 0) }));
  } catch (e) {
    console.warn('Gagal memuat transaksi:', e);
    transactions = [];
  }
}

// Hitung total pemasukan, pengeluaran, dan saldo
function calculateTotals(list = transactions) {
  const totalIncome = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

// Update panel ringkasan di DOM
function updateSummary() {
  const { totalIncome, totalExpense, balance } = calculateTotals();
  const balanceEl = document.querySelector('.tracker-summary__balance-amount');
  const incomeEl = document.querySelector('.tracker-summary__stat-amount--income');
  const expenseEl = document.querySelector('.tracker-summary__stat-amount--expense');
  if (balanceEl) balanceEl.textContent = formatCurrency(balance);
  if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(totalExpense);
}

// Pasang event handler setelah DOM siap agar penonaktifan validasi HTML5 efektif
document.addEventListener('DOMContentLoaded', () => {
  const transactionFormEl = document.getElementById('transactionForm');
  const titleInputEl = document.getElementById('transactionFormTitleInput');
  const amountInputEl = document.getElementById('transactionFormAmountInput');
  const dateInputEl = document.getElementById('transactionFormDateInput');
  const typeInputEl = document.getElementById('transactionFormTypeSelect');

  if (!transactionFormEl) {
    console.warn('#transactionForm tidak ditemukan di DOM.');
    return;
  }

  // Menonaktifkan validasi browser (tooltip "Please fill out this field.")
  transactionFormEl.setAttribute('novalidate', '');

  // Memuat atau merender data yang tersimpan
  loadTransactions();
  renderTransactions();
  updateSummary();

// Pastikan list tersedia lalu pasang listener event delegation
incomeList = document.getElementById('incomeList');
expenseList = document.getElementById('expenseList');
if (incomeList) incomeList.addEventListener('click', handleTransactionDeleteClick);
if (expenseList) expenseList.addEventListener('click', handleTransactionDeleteClick);
if (incomeList) incomeList.addEventListener('click', handleTransactionEditListClick);
if (expenseList) expenseList.addEventListener('click', handleTransactionEditListClick);

  transactionFormEl.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log('submit handler called');

    const title = (document.getElementById('transactionFormTitleInput')?.value || '').trim();
    const amountRaw = document.getElementById('transactionFormAmountInput')?.value;
    const amount = (amountRaw === '' || amountRaw == null) ? NaN : Number(amountRaw);
    const date = document.getElementById('transactionFormDateInput')?.value || new Date().toLocaleDateString('id-ID');
    const rawTypeValue = document.getElementById('transactionFormTypeInput')?.value
      || document.querySelector('#transactionForm select')?.value
      || document.querySelector('#transactionForm input[name="type"]:checked')?.value;
    const type = resolveTransactionTypeFromValue(rawTypeValue);

    /* helper: normalisasi nilai tipe transaksi menjadi 'income' atau 'expense' */
    function resolveTransactionTypeFromValue(raw) {
      const v = String(raw ?? '').trim().toLowerCase();
      if (!v) return 'expense';
      if (v.includes('income') || v.includes('masuk') || v.includes('+') || v === 'in' || v === '1') return 'income';
      return 'expense';
    }

    if (!title) {
      alert('Keterangan tidak boleh kosong.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 1) {
      alert('Nominal harus lebih besar dari 0.');
      return;
    }

    // gunakan dataset pada form sebagai sumber truth untuk mode edit (lebih tahan terhadap masalah scope)
    const formEditId = transactionFormEl.dataset.editId || editItem || null;
    const submitBtn = document.querySelector('[data-testid="transactionFormSubmitButton"]');
    if (formEditId) {
      const idx = transactions.findIndex(t => String(t.id) === String(formEditId));
      if (idx !== -1) {
        transactions[idx].title = title;
        transactions[idx].amount = amount;
        transactions[idx].date = date;
        transactions[idx].type = type;
        if (typeof saveTransactions === 'function') saveTransactions();
        // reset mode edit
        if (transactionFormEl && transactionFormEl.dataset) delete transactionFormEl.dataset.editId;
        editItem = null; // tetap reset global jika digunakan
        if (submitBtn) submitBtn.textContent = 'Simpan';
        transactionFormEl.reset();
        // render sudah dipicu oleh saveTransactions via event, tapi pastikan immediate render
        if (typeof renderTransactions === 'function') renderTransactions();
        if (typeof updateSummary === 'function') updateSummary();
        return;
      }
    }

    const newTx = {
      id: generateId(),
      title,
      amount,
      date,
      type
    };

    transactions.push(newTx);
    saveTransactions();
    renderTransactions();
    updateSummary();
    transactionFormEl.reset();
  });
});


/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */


// Memuat data dari localStorage 
function loadTransactions() {
  try {
    const raw = localStorage.getItem('transactions');
    transactions = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Gagal memuat data dari localStorage', e);
    transactions = [];
  }
}

// Fungsi kalkulasi total pemasukan, pengeluaran, dan saldo
function calculateTotals(list = transactions) {
  const totalIncome = list
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = list
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const balance = totalIncome - totalExpense;
  return { totalIncome, totalExpense, balance };
}

// Update tampilan dari hasil kalkulasi
function updateSummary() {
  const { totalIncome, totalExpense, balance } = calculateTotals();

  const balanceEl = document.querySelector('.tracker-summary__balance-amount');
  const incomeEl = document.querySelector('.tracker-summary__stat-amount--income');
  const expenseEl = document.querySelector('.tracker-summary__stat-amount--expense');

  if (balanceEl) balanceEl.textContent = formatCurrency(balance);
  if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
  if (expenseEl) expenseEl.textContent = formatCurrency(totalExpense);
}


// Inisialisasi saat load: muat data, render transaksi, dan update summary
document.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  renderTransactions();
  updateSummary();
});

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */
// Hapus transaksi berdasarkan id, simpan dan update UI
function deleteTransactionById(id) {
  transactions = transactions.filter(t => t.id !== id);
  if (typeof saveTransactions === 'function') saveTransactions();
  if (typeof renderTransactions === 'function') renderTransactions();
  if (typeof updateSummary === 'function') updateSummary();
}

// Event delegation: tangani klik tombol Hapus pada kedua list
function handleTransactionDeleteClick(e) {
  const delBtn = e.target.closest('button[data-testid="transactionItemDeleteButton"]');
  if (!delBtn) return;

  const card = delBtn.closest('[data-testid="transactionItem"]');
  if (!card) return;

  const id = card.dataset.id;
  if (!id) return;

  if (!confirm('Hapus transaksi ini?')) return;

  deleteTransactionById(id);
}

// Pasang listener (letakkan setelah inisialisasi incomeList/expenseList)
if (incomeList) incomeList.addEventListener('click', handleTransactionDeleteClick);
if (expenseList) expenseList.addEventListener('click', handleTransactionDeleteClick);

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */

// Fungsi isi form dengan data transaksi untuk diedit
function startEditTransaction(id) {
  const tx = transactions.find(t => String(t.id) === String(id));
  if (!tx) return;

  const form = document.getElementById('transactionForm');
  const titleEl = document.getElementById('transactionFormTitleInput');
  const amountEl = document.getElementById('transactionFormAmountInput');
  const dateEl = document.getElementById('transactionFormDateInput');
  const typeEl = document.getElementById('transactionFormTypeSelect');

  // Isi nilai ke form
  if (titleEl) titleEl.value = tx.title;
  if (amountEl) amountEl.value = tx.amount;
  if (dateEl) dateEl.value = tx.date;
  if (typeEl) typeEl.value = tx.type;

  // Tandai sedang edit (global dan dataset form)
  editItem = String(tx.id);
  if (form) form.dataset.editId = String(tx.id);

  // Ubah tombol submit menjadi mode update
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update';
  }
  if (titleEl) titleEl.focus();
}

// Event delegation: tangani klik Edit (menggunakan tombol yang ada)
function handleTransactionEditListClick(e) {
  // Tangani Ubah Tipe terlebih dahulu
  const editTypeBtn = e.target.closest('button[data-testid="transactionItemEditTypeButton"]');
  if (editTypeBtn) {
    const card = editTypeBtn.closest('[data-testid="transactionItem"]');
    const id = card && card.dataset && card.dataset.id;
    if (id) toggleTransactionTypeById(id);
    return;
  }

  // tangani Edit
  const editBtn = e.target.closest('button[data-testid="transactionItemEditButton"]');
  if (editBtn) {
    const card = editBtn.closest('[data-testid="transactionItem"]');
    const id = card && card.dataset && card.dataset.id;
    if (id) startEditTransaction(id);
    return;
  }
}

if (incomeList) incomeList.addEventListener('click', handleTransactionEditListClick);
if (expenseList) expenseList.addEventListener('click', handleTransactionEditListClick);


/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */
// Helper: emit custom event saat transaksi berubah
function emitTransactionUpdated() {
  document.dispatchEvent(new Event('transaction:updated'));
}

// Konsolidasikan saveTransactions: simpan lalu emit event
function saveTransactions() {
  try {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    emitTransactionUpdated(); // <-- trigger UI update
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage', e);
  }
}

// Listener untuk meng-handle update UI setelah data berubah
document.addEventListener('transaction:updated', () => {
  if (typeof renderTransactions === 'function') renderTransactions();
  if (typeof updateSummary === 'function') updateSummary();
});

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */
// Fungsi untuk toggle tipe transaksi
function toggleTransactionTypeById(id) {
  const idx = transactions.findIndex(t => String(t.id) === String(id));
  if (idx === -1) return;
  transactions[idx].type = transactions[idx].type === 'income' ? 'expense' : 'income';
  if (typeof saveTransactions === 'function') saveTransactions();
  if (typeof renderTransactions === 'function') renderTransactions();
  if (typeof updateSummary === 'function') updateSummary();
}

function handleTransactionListClick(e) {
  // Pastikan parameter benar dan gunakan handler yang aman
  const editTypeBtn = e.target.closest('button[data-testid="transactionItemEditTypeButton"]');
  if (editTypeBtn) {
    const card = editTypeBtn.closest('[data-testid="transactionItem"]');
    const id = card && card.dataset && card.dataset.id;
    if (id) toggleTransactionTypeById(id);
    return;
  }
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */



// Event listener untuk pencarian transaksi berdasarkan judul
const searchInput = document.getElementById('searchTransactionFormTitleInput')
  || document.querySelector('#searchTransaction input[type="search"], #searchQuery');
const searchForm = document.getElementById('searchTransactionForm');

// Pastikan form tidak melakukan submit yang menyebabkan reload halaman
const form = searchInput && searchInput.closest('form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', function (e) {
    const q = (e.target.value || '').trim().toLowerCase();

    // Dapatkan container list (pakai variabel global jika ada, fallback ke DOM)
    const incList = (typeof incomeList !== 'undefined' && incomeList) ? incomeList : document.getElementById('incomeList');
    const expList = (typeof expenseList !== 'undefined' && expenseList) ? expenseList : document.getElementById('expenseList');

    // Bila query kosong, kembalikan tampilan penuh (gunakan renderTransactions jika tersedia)
    if (!q) {
      if (typeof renderTransactions === 'function') {
        renderTransactions();
        return;
      }
      // Fallback: kosongkan lalu render semua manual jika renderTransactions tidak tersedia
    }

    // Filter transaksi berdasarkan judul
    const source = Array.isArray(transactions) ? transactions : [];
    const filtered = source.filter(t => String(t.title || '').toLowerCase().includes(q));

    // Bersihkan tampilan saat ini
    if (incList) incList.innerHTML = '';
    if (expList) expList.innerHTML = '';

    // Tampilkan hasil filter saja
    filtered.forEach(tx => {
      if (typeof createTransactionCard !== 'function') return;
      const card = createTransactionCard(tx);
      if (!card) return;
      if (String(tx.type) === 'income') {
        if (incList) incList.appendChild(card);
      } else {
        if (expList) expList.appendChild(card);
      }
    });
  });
}


  // Dark theme toggle
(function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const stored = localStorage.getItem('theme'); // 'dark' | 'light' | null
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');

  function apply(mode) {
    const isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark-theme', isDark);
    btn.classList.toggle('active', isDark);
    btn.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('theme', mode);
  }

  apply(initial);

  btn.addEventListener('click', () => {
    const nowDark = document.documentElement.classList.contains('dark-theme');
    apply(nowDark ? 'light' : 'dark');
  });
})();