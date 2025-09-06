/* ---------- ELEMENTS ---------- */
const html = document.documentElement;
const themeToggle = document.getElementById('toggleTheme');
const searchInput = document.getElementById('searchInput');
const categoriesRow = document.querySelector('.categories-row');
const booksContainer = document.getElementById('booksContainer');

const showUploadBtn = document.getElementById('showUploadBtn') || document.getElementById('adminToggle');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');

const splash = document.getElementById('splash');
const splashTitle = document.getElementById('splashTitle');
const splashSubtitle = document.getElementById('splashSubtitle');

/* PDF opsiyalar bo'limi (agar HTMLda bo'lsa) */
const pdfOptions = document.getElementById('pdfOptions') || document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadNotice = document.getElementById('downloadNotice');
const openDownloaded = document.getElementById('openDownloaded');
const modalClose = document.getElementById('modalClose');

/* ---------- STATE ---------- */
let allBooks = [];
let activeCategory = '';
let isAdmin = false;
let currentPdfUrl = '';

/* ---------- THEME ---------- */
function setTheme(theme) {
  if (theme === 'dark') html.classList.add('dark');
  else html.classList.remove('dark');
  localStorage.setItem('theme', theme);
}
function loadTheme() {
  const saved =
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.classList.contains('dark') ? 'light' : 'dark';
    setTheme(next);
    if (themeToggle && themeToggle.tagName === 'BUTTON') {
      themeToggle.textContent = html.classList.contains('dark') ? '☀️ Yorug‘' : '🌙 Qorong‘u';
    }
  });
}

/* ---------- SPLASH SCREEN ---------- */
function runSplash() {
  if (!splash || !splashTitle || !splashSubtitle) return;
  splash.style.display = 'flex';
  setTimeout(() => {
    splashTitle.style.transform = 'translateY(-60px)';
    splashTitle.style.opacity = '0';
    splashSubtitle.style.transform = 'translateY(60px)';
    splashSubtitle.style.opacity = '0';
    setTimeout(() => splash.remove(), 800);
  }, 2300);
}
runSplash();

/* ---------- FIREBASE (global firebase allaqachon init bo‘lgan deb hisoblaymiz) ---------- */
const db = firebase.firestore();
const storage = firebase.storage();

/* ---------- RENDER BOOKS ---------- */
function bookCard(book) {
  return `
    <article class="book-card reveal" data-id="${book.id}" data-category="${escapeHtml(book.category || '')}">
      <div class="book-title">${escapeHtml(book.title || '')}</div>
      <div class="book-desc">${escapeHtml(book.description || '')}</div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-action="open-pdf" data-link="${book.link}">📄 PDF</button>
        ${isAdmin ? `<button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">❌ O‘chirish</button>` : ''}
      </div>
    </article>
  `;
}
function renderBooks(list) {
  booksContainer.innerHTML = list.length
    ? list.map(bookCard).join('')
    : `<p style="text-align:center;opacity:.7">Hozircha kitob yo‘q...</p>`;
  revealAll();
}

/* ---------- FILTER & SEARCH ---------- */
function filterBooks() {
  const q = (searchInput?.value || '').toLowerCase().trim();
  const filtered = allBooks.filter(
    (b) =>
      (!activeCategory || b.category === activeCategory) &&
      (!q ||
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}
if (searchInput) searchInput.addEventListener('input', filterBooks);

/* ---------- CATEGORY CLICK ---------- */
if (categoriesRow) {
  categoriesRow.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cat = btn.dataset.category;
    if (activeCategory === cat) {
      activeCategory = '';
      btn.classList.remove('active');
    } else {
      activeCategory = cat;
      categoriesRow
        .querySelectorAll('button')
        .forEach((b) => b.classList.toggle('active', b.dataset.category === cat));
    }
    filterBooks();
  });
}

/* ---------- ADMIN SECTION ---------- */
if (showUploadBtn) {
  showUploadBtn.addEventListener('click', () => {
    if (!isAdmin) {
      const pass = prompt('Admin parolni kiriting:');
      if (pass === 'ibr2010071717.se') {
        isAdmin = true;
        alert('✅ Admin rejimga kirdingiz');
        if (uploadSection) uploadSection.hidden = false;
      } else {
        alert('❌ Parol noto‘g‘ri!');
      }
    } else {
      isAdmin = false;
      if (uploadSection) uploadSection.hidden = true;
      alert('🔒 Admin rejimdan chiqdingiz');
    }
  });
}

/* ---------- UPLOAD BOOK (CORS-siz: faqat getDownloadURL()) ---------- */
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('❌ Siz admin emassiz!');
      return;
    }

    const title = document.getElementById('bookTitle').value.trim();
    const description = document.getElementById('bookDescription').value.trim();
    const category = document.getElementById('bookCategory').value;
    const file = document.getElementById('bookFile').files[0];

    if (!file) {
      alert('❌ PDF fayl tanlanmagan!');
      return;
    }

    try {
      const cleanName = file.name
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\-.]/g, '');
      const uniqueName = `${Date.now()}_${cleanName}`;
      const storageRef = storage.ref(`books/${uniqueName}`);
      const uploadTask = storageRef.put(file);

      if (progressWrap) progressWrap.hidden = false;
      if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
      }

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressBar) {
            progressBar.style.width = `${p.toFixed(0)}%`;
            progressBar.textContent = `${p.toFixed(0)}%`;
          }
        },
        (err) => {
          console.error('Upload error:', err);
          alert('❌ Yuklash xatosi: ' + err.message);
          if (progressWrap) progressWrap.hidden = true;
        },
        async () => {
          // MUHIM: CORS CHIQMASLIGI UCHUN FAQAT getDownloadURL() dan foydlanamiz
          const fileURL = await storageRef.getDownloadURL();
          await db.collection('books').add({
            title,
            description,
            category,
            link: fileURL, // alt=media&token=... URL bo'ladi
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          alert('✅ Kitob muvaffaqiyatli qo‘shildi!');
          uploadForm.reset();
          if (progressWrap) progressWrap.hidden = true;
        }
      );
    } catch (err) {
      console.error(err);
      alert('❌ Xatolik: ' + err.message);
      if (progressWrap) progressWrap.hidden = true;
    }
  });
}

/* ---------- OPEN / DOWNLOAD PDF (CORS-siz: to‘g‘ridan-to‘g‘ri URL bilan) ---------- */
booksContainer.addEventListener('click', (e) => {
  const openBtn = e.target.closest('[data-action="open-pdf"]');
  if (openBtn) {
    const url = openBtn.dataset.link; // Firestore’dagi getDownloadURL()
    currentPdfUrl = url;

    // Agar modal bor bo‘lsa – modalni ko‘rsatamiz, bo‘lmasa to‘g‘ridan-to‘g‘ri ochamiz
    if (pdfOptions) {
      // pdfOptions: #pdfOptions yoki #pdfModal bo‘lishi mumkin
      if (pdfOptions.id === 'pdfModal') {
        pdfOptions.classList.add('show');
      } else {
        pdfOptions.hidden = false;
      }
      if (downloadNotice) downloadNotice.hidden = true;
    } else {
      window.open(url, '_blank');
    }
  }
});

/* Modal yopish (agar mavjud) */
if (modalClose) {
  modalClose.addEventListener('click', () => {
    const modal = document.getElementById('pdfModal');
    if (modal) modal.classList.remove('show');
  });
}

/* Brauzerda ochish tugmasi */
if (openPDFBtn) {
  openPDFBtn.addEventListener('click', () => {
    if (!currentPdfUrl) return;
    window.open(currentPdfUrl, '_blank');
  });
}

/* Yuklab olish (CORS-siz: a[download] bilan) */
if (downloadPDFBtn) {
  downloadPDFBtn.addEventListener('click', () => {
    if (!currentPdfUrl) return;
    const a = document.createElement('a');
    a.href = currentPdfUrl; // alt=media URL
    a.download = 'kitob.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (downloadNotice) downloadNotice.hidden = false;
    if (openDownloaded) {
      openDownloaded.href = currentPdfUrl;
      openDownloaded.target = '_blank';
    }
  });
}

/* ---------- DELETE BOOK ---------- */
booksContainer.addEventListener('click', async (e) => {
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn) {
    if (!isAdmin) {
      alert('❌ Sizda o‘chirish huquqi yo‘q!');
      return;
    }
    if (!confirm('Haqiqatan ham bu kitobni o‘chirmoqchimisiz?')) return;

    try {
      // Avval Firestore hujjatini o‘chir
      await db.collection('books').doc(delBtn.dataset.id).delete();
      // Keyin faylni o‘chir (refFromURL alt=media URL’dan ham to‘g‘ri ishlaydi)
      const storageRef = storage.refFromURL(delBtn.dataset.link);
      await storageRef.delete();
      alert('✅ Kitob muvaffaqiyatli o‘chirildi!');
    } catch (err) {
      console.error(err);
      alert('❌ O‘chirishda xatolik: ' + err.message);
    }
  }
});

/* ---------- FIRESTORE LISTENER ---------- */
db.collection('books')
  .orderBy('createdAt', 'desc')
  .onSnapshot(
    (snapshot) => {
      allBooks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      filterBooks();
    },
    (err) => {
      console.error('Firestore snapshot error:', err);
    }
  );

/* ---------- REVEAL ANIMATION ---------- */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('show');
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12 }
);
function revealAll() {
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

/* ---------- UTILS ---------- */
function escapeHtml(str) {
  return ('' + (str ?? '')).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

/* ---------- INIT ---------- */
loadTheme();
window.addEventListener('load', () => {
  setTimeout(revealAll, 600);
});
```
