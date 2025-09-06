// =================== FIREBASE INIT ===================
const firebaseConfig = {
  apiKey: "AIzaSyDuk-PhyFg5j7JkVnvfcYfBKGMoNZtT02s",
  authDomain: "kutubxona-79dd3.firebaseapp.com",
  projectId: "kutubxona-79dd3",
  storageBucket: "kutubxona-79dd3.firebasestorage.app",
  messagingSenderId: "593289819612",
  appId: "1:593289819612:web:89b9a8dd933f945eb78b19",
  measurementId: "G-Z0Z4FWPWP8"
};
firebase.initializeApp(firebaseConfig);

// =================== ELEMENTS ===================
const html = document.documentElement;
const body = document.body;
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const toggleLangBtn = document.getElementById('toggleLang');
const uploadSection = document.getElementById('uploadSection');
const adminToggleBtn = document.getElementById('adminToggle');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');

// Modal elements
const pdfModal = document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadNotice = document.getElementById('downloadNotice');
const openDownloaded = document.getElementById('openDownloaded');
const modalClose = document.querySelector('.modal-close');

// Splash
const splash = document.getElementById('splash');

// State
let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";
let uiLang = 'cyrl'; // default

// =================== THEME (fixed) ===================
function setTheme(theme) {
  // keep dataset for possible future use
  html.setAttribute('data-theme', theme);
  // body classes drive CSS
  body.classList.remove('light', 'dark');
  body.classList.add(theme);
  localStorage.setItem('theme', theme);
  toggleThemeBtn.innerHTML = theme === 'dark'
    ? '<i class="fas fa-sun"></i> Ёруғ режим'
    : '<i class="fas fa-moon"></i> Қоронғу режим';
}
function loadTheme() {
  const saved = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}
toggleThemeBtn.addEventListener('click', () => {
  const next = body.classList.contains('dark') ? 'light' : 'dark';
  document.body.animate([{ filter: 'brightness(1.0)' }, { filter: 'brightness(1.06)' }, { filter: 'brightness(1.0)' }], { duration: 320 });
  setTheme(next);
});

// =================== LANGUAGE TOGGLER (Кирилл ↔ Лотин) ===================
function applyLanguage() {
  // Buttons/text nodes with data-cyrl / data-latn
  document.querySelectorAll('[data-cyrl],[data-latn]').forEach(el => {
    const txt = el.dataset[uiLang];
    if (typeof txt === 'string') el.textContent = txt;
  });
  // Placeholders
  document.querySelectorAll('[data-ph-cyrl],[data-ph-latn]').forEach(el => {
    const key = uiLang === 'cyrl' ? 'phCyrl' : 'phLatn';
    const val = el.dataset[key];
    if (typeof val === 'string') el.setAttribute('placeholder', val);
  });
  // Toggle button label
  if (toggleLangBtn) {
    toggleLangBtn.innerHTML = `<i class="fas fa-language"></i> ${toggleLangBtn.dataset[uiLang]}`;
  }
  localStorage.setItem('lang', uiLang);
}
function loadLanguage() {
  uiLang = localStorage.getItem('lang') || 'cyrl';
  applyLanguage();
}
toggleLangBtn.addEventListener('click', () => {
  uiLang = uiLang === 'cyrl' ? 'latn' : 'cyrl';
  applyLanguage();
});

// =================== SPLASH ===================
function runSplash() {
  setTimeout(() => {
    splash.classList.add('splash-fade-out');
    setTimeout(() => {
      if (splash && splash.parentNode) splash.remove();
      revealAll();
    }, 800);
  }, 2800);
}

// =================== RENDER BOOKS ===================
function bookCardTemplate(book) {
  return `
    <article class="card reveal" data-id="${book.id}">
      <span class="book-category">${book.category || 'Умумий'}</span>
      <div class="book-title">${book.title || 'Номсиз китоб'}</div>
      <div class="book-desc">${book.description || ''}</div>
      <div class="card-actions">
        <button class="btn" data-action="pdf" data-link="${book.link}">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        ${isAdmin ? `
          <button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">
            <i class="fas fa-trash"></i> Ўчириш
          </button>
        ` : ''}
      </div>
    </article>
  `;
}
function renderBooks(list) {
  booksContainer.innerHTML = list.length
    ? list.map(bookCardTemplate).join('')
    : `<p class="no-books-message">Ҳозирча бу ерда китоб йўқ...</p>`;
  revealAll();
}

// =================== FILTERING ===================
function filterBooks() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = allBooks.filter(b =>
    (!activeCategory || b.category === activeCategory) &&
    (!q || (b.title && b.title.toLowerCase().includes(q)) ||
           (b.description && b.description.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}
categoryButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const cat = e.currentTarget.dataset.category;
    activeCategory = (activeCategory === cat) ? "" : cat;
    categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === activeCategory));
    filterBooks();
  });
});
searchInput.addEventListener('input', filterBooks);

// =================== PDF MODAL ===================
function showPDFOptions(pdfURL) {
  currentPDF = pdfURL;
  downloadNotice.hidden = true;
  pdfModal.hidden = false;
  setTimeout(() => pdfModal.classList.add('show'), 10);
}
openPDFBtn.addEventListener('click', () => { if (currentPDF) window.open(currentPDF, '_blank'); });
downloadPDFBtn.addEventListener('click', () => {
  if (!currentPDF) return;
  const a = document.createElement('a');
  a.href = currentPDF; a.download = 'kitob.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = currentPDF;
  downloadNotice.hidden = false;
});
modalClose.addEventListener('click', () => { pdfModal.classList.remove('show'); setTimeout(() => { pdfModal.hidden = true; }, 300); });
pdfModal.addEventListener('click', (e) => {
  if (e.target === pdfModal) { pdfModal.classList.remove('show'); setTimeout(() => { pdfModal.hidden = true; }, 300); }
});
booksContainer.addEventListener('click', (e) => {
  const pdfBtn = e.target.closest('[data-action="pdf"]');
  if (pdfBtn) { showPDFOptions(pdfBtn.dataset.link); return; }
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn) { deleteBook(delBtn.dataset.id, delBtn.dataset.link); }
});

// =================== ADMIN ===================
adminToggleBtn.addEventListener('click', () => {
  const password = prompt("Китоб қўшиш ва ўчириш учун паролни киритинг:");
  if (password === "ibr2010071717.se") {
    isAdmin = true;
    uploadSection.hidden = false;
    uploadSection.classList.add('reveal');
    setTimeout(() => uploadSection.classList.add('show'), 10);
    filterBooks();
    alert("✅ Admin Rejim га муваффақиятли кирдингиз!");
  } else {
    alert("❌ Нотўғри парол!");
  }
});

// =================== UPLOAD ===================
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];

  if (!file) { alert('❌ PDF файл танланмаган!'); return; }

  try {
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const uploadTask = storageRef.put(file, { customMetadata: { secret_code: 'ibr2010071717.se' } });

    progressWrap.hidden = false; progressBar.style.width = '0%'; progressBar.textContent = '0%';

    uploadTask.on('state_changed',
      (snap) => {
        const p = (snap.bytesTransferred / snap.totalBytes) * 100;
        progressBar.style.width = `${p.toFixed(0)}%`; progressBar.textContent = `${p.toFixed(0)}%`;
      },
      (err) => {
        console.error('❌ Юклаш хатолик:', err);
        progressWrap.hidden = true;
        alert('❌ Юклашда хатолик: ' + err.message);
      },
      async () => {
        const url = await storageRef.getDownloadURL();
        await firebase.firestore().collection('books').add({
          title, description, category, link: url, secret_code: 'ibr2010071717.se', created: new Date()
        });
        alert('✅ Китоб муваффақиятли қўшилди!');
        progressWrap.hidden = true; uploadForm.reset(); uploadSection.hidden = true;
      }
    );
  } catch(err) {
    console.error('❌ Хатолик:', err);
    alert('❌ Хатолик: ' + err.message);
    progressWrap.hidden = true;
  }
});

// =================== DELETE ===================
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) { alert('❌ Сизда ўчириш ҳуқуқи йўқ!'); return; }
  if (!confirm('Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?')) return;
  try {
    await firebase.firestore().collection('books').doc(bookId).delete();
    const ref = firebase.storage().refFromURL(fileURL);
    await ref.delete();
    alert('✅ Китоб муваффақиятли ўчирилди!');
  } catch(err) {
    console.error('❌ Ўчириш хатолик:', err);
    alert('❌ Ўчиришда хатолик: ' + err.message);
  }
}

// =================== FIRESTORE SYNC ===================
function loadBooks() {
  firebase.firestore().collection('books').onSnapshot(snap => {
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    filterBooks();
  }, err => console.error('❌ Firestore хатолик:', err));
}

// =================== REVEAL ON SCROLL ===================
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  }
}, { threshold: 0.1 });
function revealAll() { document.querySelectorAll('.reveal').forEach(el => io.observe(el)); }

// =================== INIT ===================
loadTheme();
loadLanguage();
runSplash();
loadBooks();
