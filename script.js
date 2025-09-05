// =========================================================
// Elements
// =========================================================
const body = document.body;
const booksContainer = document.getElementById('booksContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleTheme');

const showUploadBtn = document.getElementById('showUploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const bookTitleEl = document.getElementById('bookTitle');
const bookDescriptionEl = document.getElementById('bookDescription');
const bookCategoryEl = document.getElementById('bookCategory');
const bookFileEl = document.getElementById('bookFile');

const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

const pdfOptions = document.getElementById('pdfOptions');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');
const openDownloaded = document.getElementById('openDownloaded');

const introScreen = document.getElementById('introScreen');

let allBooks = [];
let activeCategory = '';
let isAdmin = false;
let currentPDF = '';
let currentPDFTitle = '';

// =========================================================
// Splash Screen
// =========================================================
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!introScreen) return;
    introScreen.style.animation = 'fadeOut 1s forwards';
    setTimeout(() => introScreen.remove(), 1000);
  }, 2000);
});

// =========================================================
// Ripple Effect
// =========================================================
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  btn.style.setProperty('--x', x + 'px');
  btn.style.setProperty('--y', y + 'px');
  btn.classList.remove('active');
  void btn.offsetWidth; // restart animation
  btn.classList.add('active');
});

// =========================================================
// Reveal on Scroll
// =========================================================
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// =========================================================
// Theme Toggle
// =========================================================
function applySavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') body.classList.add('dark');
  if (saved === 'light') body.classList.remove('dark');
  updateThemeButton();
}
function updateThemeButton() {
  toggleThemeBtn.textContent = body.classList.contains('dark')
    ? '☀️ Yorug‘'
    : '🌙 Qorong‘u';
}
toggleThemeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});
applySavedTheme();

// =========================================================
// Filter Search
// =========================================================
searchInput.addEventListener('input', filterBooks);

// =========================================================
// Category Buttons
// =========================================================
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category || '';
    filterBooks();
  });
});

// =========================================================
// Render Books
// =========================================================
function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderBooks(list) {
  if (!list.length) {
    booksContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  booksContainer.innerHTML = list.map(book => `
    <article class="book reveal">
      <div class="book__glow"></div>
      <h3 class="book__title">${escapeHTML(book.title) || 'Nomsiz kitob'}</h3>
      <p class="book__desc">${escapeHTML(book.description || '')}</p>
      <div class="book__actions">
        <a class="btn btn--primary ripple" href="${book.link}" target="_blank">📖 PDF</a>
        <button class="btn btn--ghost ripple" data-action="options" data-link="${book.link}" data-title="${encodeURIComponent(book.title || 'kitob')}">📄 Variantlar</button>
        ${isAdmin
          ? `<button class="btn btn--danger ripple" data-action="delete" data-id="${book.id}" data-link="${book.link}" data-title="${escapeHTML(book.title || '')}">❌ O‘chirish</button>`
          : ''}
      </div>
    </article>
  `).join('');
  booksContainer.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function filterBooks() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = allBooks.filter(b => {
    const catOk = !activeCategory || b.category === activeCategory;
    const txtOk = (b.title || '').toLowerCase().includes(q) ||
                  (b.description || '').toLowerCase().includes(q);
    return catOk && txtOk;
  });
  renderBooks(filtered);
}

// =========================================================
// Admin Login
// =========================================================
showUploadBtn?.addEventListener('click', () => {
  const password = prompt("Kitob qo‘shish va o‘chirish uchun parol:");
  if (password === 'ibr2010071717.se') {
    isAdmin = true;
    uploadSection.hidden = false;
    filterBooks();
  } else {
    alert('❌ Noto‘g‘ri parol!');
  }
});

// =========================================================
// Upload Book
// =========================================================
uploadForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = (bookTitleEl.value || '').trim();
  const description = (bookDescriptionEl.value || '').trim();
  const category = bookCategoryEl.value;
  const file = bookFileEl.files[0];
  if (!file) return alert('❌ PDF fayl tanlanmagan!');

  try {
    const clean = file.name.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-.]/g, '');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const task = storageRef.put(file);

    progressContainer.hidden = false;
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    task.on('state_changed', snapshot => {
      const p = Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100);
      progressBar.style.width = p + '%';
      progressBar.textContent = p + '%';
      progressBar.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)';
    });

    await task;
    const link = await storageRef.getDownloadURL();
    await firebase.firestore().collection('books').add({ title, description, category, link });

    uploadForm.reset();
    progressContainer.hidden = true;
    alert('✅ Kitob muvaffaqiyatli qo‘shildi!');
  } catch (err) {
    console.error(err);
    alert('❌ Kitob qo‘shishda xatolik!');
  }
});

// =========================================================
// Delete Book
// =========================================================
async function deleteBook(bookId, fileURL, title = '') {
  if (!isAdmin) return alert('❌ Sizda o‘chirish huquqi yo‘q!');
  if (!confirm(`"${title}" kitobini o‘chirmoqchimisiz?`)) return;
  try {
    await firebase.firestore().collection('books').doc(bookId).delete();
    const sr = firebase.storage().refFromURL(fileURL);
    await sr.delete();
    alert('🗑️ Kitob o‘chirildi.');
  } catch (err) {
    console.error(err);
    alert('❌ O‘chirishda xatolik!');
  }
}

// =========================================================
// Event Delegation (Book Actions)
// =========================================================
booksContainer?.addEventListener('click', (e) => {
  const btn = e.target.closest('button,a');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'options') {
    const link = btn.dataset.link;
    const title = decodeURIComponent(btn.dataset.title || 'kitob');
    showPDFOptions(link, title);
  } else if (action === 'delete') {
    deleteBook(btn.dataset.id, btn.dataset.link, btn.dataset.title || '');
  }
});

// =========================================================
// PDF Options
// =========================================================
function showPDFOptions(url, title = 'kitob') {
  currentPDF = url;
  currentPDFTitle = title;
  if (pdfOptions) pdfOptions.hidden = false;
  if (downloadMessage) downloadMessage.hidden = true;
}

openPDFBtn?.addEventListener('click', () => {
  if (currentPDF) window.open(currentPDF, '_blank');
});

downloadPDFBtn?.addEventListener('click', () => {
  if (!currentPDF) return;
  const a = document.createElement('a');
  a.href = currentPDF;
  const safeName = (currentPDFTitle || 'kitob')
    .replace(/[\\/:*?"<>|]+/g, '')
    .trim() || 'kitob';
  a.download = `${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (openDownloaded) openDownloaded.href = currentPDF;
  if (downloadMessage) downloadMessage.hidden = false;
});

// =========================================================
// Firestore Real-time Sync
// =========================================================
firebase.firestore().collection('books').orderBy('title')
  .onSnapshot(snap => {
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    filterBooks();
  }, err => console.error(err));
