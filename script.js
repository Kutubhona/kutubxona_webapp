/* =========================================================
Unified JS — script-part1 + script-part2
========================================================= */

/* ---------- Elementlar ---------- */
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

/* =========================================================
Splash screen — 2 soniya ko‘rinadi, keyin yo‘qoladi
========================================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!introScreen) return;
    introScreen.style.animation = 'fadeOut 1s ease forwards';
    setTimeout(() => {
      introScreen.remove();
    }, 1000);
  }, 2000);
});

/* =========================================================
Ripple effekti
========================================================= */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  btn.style.setProperty('--x', x + 'px');
  btn.style.setProperty('--y', y + 'px');
  btn.classList.remove('active');
  void btn.offsetWidth;
  btn.classList.add('active');
});

/* =========================================================
Reveal on scroll
========================================================= */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* =========================================================
Kategoriya tugmalari
========================================================= */
document.querySelectorAll('.cat-btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    btn.style.setProperty('--x', `${e.offsetX}px`);
    btn.style.setProperty('--y', `${e.offsetY}px`);
  });
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    activeCategory = btn.dataset.category || '';
    filterBooks();
  });
});

/* =========================================================
Tema toggle — localStorage bilan
========================================================= */
function applySavedTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') body.classList.add('dark');
  if (saved === 'light') body.classList.remove('dark');
  updateThemeButton();
}
function updateThemeButton() {
  const isDark = body.classList.contains('dark');
  toggleThemeBtn.textContent = isDark ? '☀️ Yorug‘' : '🌙 Qorong‘u';
}
toggleThemeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeButton();
});
applySavedTheme();

/* =========================================================
Kitoblarni render qilish
========================================================= */
function renderBooks(list) {
  if (!list.length) {
    booksContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  booksContainer.innerHTML = list
    .map(
      (book) => `
    <article class="book reveal">
      <div class="book__glow"></div>
      <h3 class="book__title">${escapeHTML(book.title) || 'Nomsiz kitob'}</h3>
      <p class="book__desc">${escapeHTML(book.description || '')}</p>
      <div class="book__actions">
        <a class="btn btn--primary ripple" href="${book.link}" target="_blank" rel="noopener">📖 PDF</a>
        <button class="btn btn--ghost ripple" data-action="options" data-link="${book.link}" data-title="${encodeURIComponent(
        book.title || 'kitob'
      )}">📄 Variantlar</button>
        ${
          isAdmin
            ? `<button class="btn btn--danger ripple" data-action="delete" data-id="${book.id}" data-link="${book.link}" data-title="${escapeHTML(
                book.title || ''
              )}">❌ O‘chirish</button>`
            : ''
        }
      </div>
    </article>
  `
    )
    .join('');

  booksContainer.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* =========================================================
Filter — qidiruv + kategoriya
========================================================= */
function filterBooks() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = allBooks.filter((b) => {
    const catOk = !activeCategory || b.category === activeCategory;
    const txtOk =
      (b.title || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q);
    return catOk && txtOk;
  });
  renderBooks(filtered);
}
searchInput.addEventListener('input', filterBooks);

/* =========================================================
Admin rejim
========================================================= */
showUploadBtn?.addEventListener('click', () => {
  const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
  if (password === 'ibr2010071717.se') {
    isAdmin = true;
    uploadSection.hidden = false;
    filterBooks();
  } else {
    alert('❌ Noto‘g‘ri parol!');
  }
});

/* =========================================================
Upload — Firebase Storage + Firestore
========================================================= */
uploadForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = (bookTitleEl.value || '').trim();
  const description = (bookDescriptionEl.value || '').trim();
  const category = bookCategoryEl.value;
  const file = bookFileEl.files[0];
  if (!file) return;

  try {
    const clean = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
    const unique = `${Date.now()}_${clean}`;

    const storageRef = firebase.storage().ref(`books/${unique}`);
    const task = storageRef.put(file);

    progressContainer.hidden = false;
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    task.on('state_changed', (snap) => {
      const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      progressBar.style.width = p + '%';
      progressBar.textContent = p + '%';
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

/* =========================================================
O‘chirish — Firestore + Storage
========================================================= */
async function deleteBook(bookId, fileURL, bookTitle = '') {
  if (!isAdmin) return alert('❌ Sizda o‘chirish huquqi yo‘q!');
  const name = bookTitle ? `"${bookTitle}" ` : '';
  if (!confirm(`${name}nomli kitobni o‘chirmoqchimisiz?`)) return;
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

/* =========================================================
Event delegation — options/delete tugmalari
========================================================= */
booksContainer?.addEventListener('click', (e) => {
  const btn = e.target.closest('button, a');
  if (!btn) return;

  const action = btn.getAttribute('data-action');
  if (action === 'options') {
    const link = btn.getAttribute('data-link');
    const encTitle = btn.getAttribute('data-title') || 'kitob';
    showPDFOptions(link, decodeURIComponent(encTitle));
  } else if (action === 'delete') {
    const id = btn.getAttribute('data-id');
    const link = btn.getAttribute('data-link');
    const title = btn.getAttribute('data-title') || '';
    deleteBook(id, link, title);
  }
});

/* =========================================================
PDF variantlari — ochish / yuklab olish
========================================================= */
function showPDFOptions(url, title = 'kitob') {
  currentPDF = url;
  currentPDFTitle = title || 'kitob';
  if (pdfOptions) {
    pdfOptions.hidden = false;
  }
  if (downloadMessage) {
    downloadMessage.hidden = true;
  }
}

openPDFBtn?.addEventListener('click', () => {
  if (!currentPDF) return;
  window.open(currentPDF, '_blank', 'noopener');
});

downloadPDFBtn?.addEventListener('click', () => {
  if (!currentPDF) return;
  const a = document.createElement('a');
  a.href = currentPDF;
  const safeName = (currentPDFTitle || 'kitob').replace(/[\\/:*?"<>|]+/g, '').trim() || 'kitob';
  a.download = `${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  if (openDownloaded) openDownloaded.href = currentPDF;
  if (downloadMessage) downloadMessage.hidden = false;
});

/* =========================================================
Firestore — real-time obuna
========================================================= */
function subscribeBooks() {
  firebase
    .firestore()
    .collection('books')
    .orderBy('title')
    .onSnapshot(
      (snap) => {
        allBooks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        filterBooks();
      },
      (err) => console.error(err)
    );
}
subscribeBooks();
