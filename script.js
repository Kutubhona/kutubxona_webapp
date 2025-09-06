/* ==========================
   PREMIUM SCRIPT (FULL)
   - Firebase integration preserved
   - Admin modal login (not prompt)
   - Upload / delete functioning identical to original
   - Splash, theme, modals, reveal on scroll
   ========================== */

/* ---------- FIREBASE INIT (unchanged) ---------- */
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

/* ---------- ELEMENTS ---------- */
const html = document.documentElement;
const themeToggle = document.getElementById('toggleTheme');
const searchInput = document.getElementById('searchInput');
const categoriesRow = document.querySelector('.categories-row');
const booksContainer = document.getElementById('booksContainer');

const showLoginBtn = document.getElementById('showLoginBtn');
const loginModalBackdrop = document.getElementById('loginModal');
const loginSubmit = document.getElementById('loginSubmit');
const loginCancel = document.getElementById('loginCancel');
const adminPassInput = document.getElementById('adminPass');
const loginError = document.getElementById('loginError');

const adminPanel = document.getElementById('adminPanel');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const adminLogout = document.getElementById('adminLogout');

const pdfModalBackdrop = document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadNotice = document.getElementById('downloadNotice');
const openDownloaded = document.getElementById('openDownloaded');
const closePdfModal = document.getElementById('closePdfModal');

/* ---------- STATE ---------- */
let allBooks = [];
let activeCategory = '';
let isAdmin = false;
let currentPDF = '';

/* ---------- THEME ---------- */
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
function loadTheme() {
  const saved = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}
themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  // subtle flash
  document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.06)'},{filter:'brightness(1)'}],{duration:260});
  setTheme(next);
});

/* ---------- SPLASH SEQUENCE ---------- */
const splash = document.getElementById('splash');
const splashTitle = document.getElementById('splashTitle');
const splashSubtitle = document.getElementById('splashSubtitle');
function runSplash() {
  // show 2.3s as requested then animate out
  setTimeout(()=> {
    splashTitle.style.transform = 'translateY(-40px)'; splashTitle.style.opacity = '0';
    splashSubtitle.style.transform = 'translateY(40px)'; splashSubtitle.style.opacity = '0';
    setTimeout(()=> { splash.remove(); revealAll(); }, 800);
  }, 2300);
}

/* ---------- RENDER / FILTER ---------- */
function bookCard(book) {
  return `
    <article class="book-card reveal" data-id="${book.id}" data-category="${book.category || ''}">
      <div class="book-title">${escapeHtml(book.title || 'Nomsiz kitob')}</div>
      <div class="book-desc">${escapeHtml(book.description || '')}</div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-action="open-pdf" data-link="${book.link}">📄 PDF</button>
        ${isAdmin ? `<button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">❌ O‘chirish</button>` : ''}
      </div>
    </article>`;
}
function renderBooks(list) {
  booksContainer.innerHTML = list.length ? list.map(bookCard).join('') : `<p style="text-align:center;opacity:.7">Hozircha kitob yo‘q...</p>`;
  revealAll();
}
function filterBooks() {
  const q = (searchInput.value || '').toLowerCase().trim();
  const filtered = allBooks.filter(b =>
    (!activeCategory || b.category === activeCategory) &&
    (!q || (b.title && b.title.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}

/* ---------- CATEGORIES CLICK (delegation) ---------- */
categoriesRow.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const cat = btn.dataset.category;
  if (activeCategory === cat) {
    activeCategory = '';
    btn.classList.remove('active');
  } else {
    activeCategory = cat;
    // toggle other buttons
    categoriesRow.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.category === cat));
  }
  filterBooks();
});

/* ---------- SEARCH ---------- */
searchInput.addEventListener('input', filterBooks);

/* ---------- PDF MODAL ---------- */
function showPdfModal(url) {
  currentPDF = url;
  downloadNotice.classList.add('hidden');
  pdfModalBackdrop.classList.add('show');
  pdfModalBackdrop.setAttribute('aria-hidden', 'false');
}
openPDFBtn.addEventListener('click', ()=> currentPDF && window.open(currentPDF, '_blank'));
downloadPDFBtn.addEventListener('click', ()=>{
  if (!currentPDF) return;
  const a = document.createElement('a'); a.href = currentPDF; a.download = 'kitob.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = currentPDF;
  downloadNotice.classList.remove('hidden');
});
closePdfModal.addEventListener('click', ()=> {
  pdfModalBackdrop.classList.remove('show'); pdfModalBackdrop.setAttribute('aria-hidden','true');
});
pdfModalBackdrop.addEventListener('click', e => {
  if (e.target === pdfModalBackdrop) { pdfModalBackdrop.classList.remove('show'); pdfModalBackdrop.setAttribute('aria-hidden','true'); }
});

/* ---------- CARD ACTIONS (delegate) ---------- */
booksContainer.addEventListener('click', async (e) => {
  const openBtn = e.target.closest('[data-action="open-pdf"]');
  if (openBtn) { showPdfModal(openBtn.dataset.link); return; }
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn) { await deleteBook(delBtn.dataset.id, delBtn.dataset.link); return; }
});

/* ---------- ADMIN LOGIN (modal) ---------- */
const LOGIN_PASSWORD = "ibr2010071717.se"; // keep same password per your original
showLoginBtn.addEventListener('click', () => {
  document.getElementById('loginModal').classList.add('show');
  document.getElementById('loginModal').setAttribute('aria-hidden','false');
  adminPassInput.value = '';
  loginError.classList.add('visually-hidden');
  setTimeout(()=> adminPassInput.focus(), 120);
});
loginCancel.addEventListener('click', () => {
  document.getElementById('loginModal').classList.remove('show');
  document.getElementById('loginModal').setAttribute('aria-hidden','true');
});
loginSubmit.addEventListener('click', () => {
  const val = adminPassInput.value || '';
  if (val === LOGIN_PASSWORD) {
    isAdmin = true;
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('loginModal').setAttribute('aria-hidden','true');
    adminPanel.classList.remove('hidden'); adminPanel.setAttribute('aria-hidden','false');
    // highlight admin area for a moment
    adminPanel.animate([{transform:'translateY(8px)', boxShadow:'0 6px 22px rgba(0,0,0,0.08)'},{transform:'none'}],{duration:420});
  } else {
    loginError.classList.remove('visually-hidden');
  }
});

/* admin logout */
adminLogout.addEventListener('click', () => {
  isAdmin = false;
  adminPanel.classList.add('hidden'); adminPanel.setAttribute('aria-hidden','true');
});

/* ---------- UPLOAD (Firebase Storage + Firestore) ---------- */
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!isAdmin) { alert('❌ Siz admin emassiz!'); return; }

  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];

  if (!file) { alert('❌ PDF fayl tanlanmagan!'); return; }

  try {
    const cleanName = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const uniqueName = `${Date.now()}_${cleanName}`;

    const storageRef = firebase.storage().ref(`books/${uniqueName}`);
    const uploadTask = storageRef.put(file, { customMetadata: { secret_code: LOGIN_PASSWORD } });

    progressWrap.classList.remove('hidden'); progressWrap.setAttribute('aria-hidden','false');
    progressBar.style.width = '0%'; progressBar.textContent = '0%';

    uploadTask.on('state_changed',
      snapshot => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = `${p.toFixed(0)}%`;
        progressBar.textContent = `${p.toFixed(0)}%`;
      },
      err => {
        console.error('Upload error:', err);
        alert('❌ Yuklash xatosi: ' + err.message);
        progressWrap.classList.add('hidden'); progressWrap.setAttribute('aria-hidden','true');
      },
      async () => {
        const fileURL = await storageRef.getDownloadURL();
        await firebase.firestore().collection('books').add({
          title, description, category, link: fileURL, createdAt: firebase.firestore.FieldValue.serverTimestamp(), secret_code: LOGIN_PASSWORD
        });
        alert('✅ Kitob muvaffaqiyatli qo‘shildi!');
        uploadForm.reset();
        progressWrap.classList.add('hidden'); progressWrap.setAttribute('aria-hidden','true');
      }
    );
  } catch (err) {
    console.error('Upload exception:', err);
    alert('❌ Xatolik: ' + err.message);
    progressWrap.classList.add('hidden'); progressWrap.setAttribute('aria-hidden','true');
  }
});

/* ---------- DELETE ---------- */
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) { alert('❌ Sizda o‘chirish huquqi yo‘q!'); return; }
  if (!confirm('Haqiqatan ham bu kitobni o‘chirmoqchimisiz?')) return;

  try {
    await firebase.firestore().collection('books').doc(bookId).delete();
    const storageRef = firebase.storage().refFromURL(fileURL);
    await storageRef.delete();
    alert('✅ Kitob muvaffaqiyatli o‘chirildi!');
  } catch (err) {
    console.error('Delete error:', err);
    alert('❌ O‘chirishda xatolik: ' + (err.message || err));
  }
}

/* ---------- FIRESTORE REALTIME LISTENER ---------- */
firebase.firestore().collection('books').orderBy('createdAt','desc').onSnapshot(snapshot => {
  allBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filterBooks();
}, err => {
  console.error('Firestore snapshot error:', err);
});

/* ---------- REVEAL ON SCROLL ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
function revealAll() { document.querySelectorAll('.reveal').forEach(el => io.observe(el)); }

/* ---------- UTILS ---------- */
function escapeHtml(str){
  return ('' + str).replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}

/* ---------- INIT ---------- */
loadTheme();
runSplash();
window.addEventListener('load', () => {
  // ensure initial reveal registration
  setTimeout(revealAll, 600);
});
