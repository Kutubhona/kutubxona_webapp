// Elements
const body = document.body;
const booksContainer = document.getElementById('booksContainer');
const emptyState = document.getElementById('emptyState');

const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleTheme');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');

const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');

const pdfOptions = document.getElementById('pdfOptions');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');
const openDownloaded = document.getElementById('openDownloaded');

let allBooks = [];
let activeCategory = '';
let isAdmin = false;
let currentPDF = "";

// ---------- Ripple (all .ripple) ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.ripple');
  if (!btn) return;
  const r = btn.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  btn.style.setProperty('--x', x + 'px');
  btn.style.setProperty('--y', y + 'px');
  btn.classList.remove('active'); // restart
  void btn.offsetWidth;
  btn.classList.add('active');
});

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      io.unobserve(en.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Category click ----------
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    // sheen follow
    btn.style.setProperty('--x', `${e.offsetX}px`);
    btn.style.setProperty('--y', `${e.offsetY}px`);
  });
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    filterBooks();
  });
});

// ---------- Theme toggle ----------
function updateThemeButton() {
  const isDark = body.classList.contains('dark');
  toggleThemeBtn.textContent = isDark ? "☀️ Yorug‘" : "🌙 Qorong‘u";
}
toggleThemeBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  updateThemeButton();
});
updateThemeButton();

// ---------- Render ----------
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
      <h3 class="book__title">${book.title || "Nomsiz kitob"}</h3>
      <p class="book__desc">${book.description || ""}</p>
      <div class="book__actions">
        <a class="btn btn--primary ripple" href="${book.link}" target="_blank" rel="noopener">📖 PDF</a>
        <button class="btn btn--ghost ripple" onclick="showPDFOptions('${book.link}')">📄 Variantlar</button>
        ${isAdmin ? `<button class="btn btn--danger ripple" onclick="deleteBook('${book.id}','${book.link}')">❌ O‘chirish</button>` : ""}
      </div>
    </article>
  `).join('');

  // trigger reveal for new nodes
  booksContainer.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ---------- Filter ----------
function filterBooks() {
  const q = (searchInput.value || '').toLowerCase();
  const filtered = allBooks.filter(b => {
    const catOk = !activeCategory || b.category === activeCategory;
    const txtOk =
      (b.title || '').toLowerCase().includes(q) ||
      (b.description || '').toLowerCase().includes(q);
    return catOk && txtOk;
  });
  renderBooks(filtered);
}
searchInput.addEventListener('input', filterBooks);

// ---------- Admin mode ----------
showUploadBtn.addEventListener('click', () => {
  const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
  if (password === "ibr2010071717.se") {
    isAdmin = true;
    uploadSection.hidden = false;
    filterBooks();
  } else {
    alert("❌ Noto‘g‘ri parol!");
  }
});

// ---------- Upload ----------
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];
  if (!file) return;

  try {
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;

    const storageRef = firebase.storage().ref(`books/${unique}`);
    const task = storageRef.put(file);

    progressContainer.hidden = false;
    progressBar.style.width = '0%'; progressBar.textContent = '0%';

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
  } catch (err) {
    console.error(err);
    alert("❌ Kitob qo‘shishda xatolik!");
  }
});

// ---------- Delete ----------
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) return alert("❌ Sizda o‘chirish huquqi yo‘q!");
  if (!confirm("Haqiqatan ham bu kitobni o‘chirmoqchimisiz?")) return;
  try {
    await firebase.firestore().collection('books').doc(bookId).delete();
    const sr = firebase.storage().refFromURL(fileURL);
    await sr.delete();
  } catch (err) {
    console.error(err);
    alert("❌ O‘chirishda xatolik!");
  }
}
window.deleteBook = deleteBook; // expose for inline onclick

// ---------- PDF options ----------
function showPDFOptions(url){
  currentPDF = url;
  pdfOptions.hidden = false;
  downloadMessage.hidden = true;
}
window.showPDFOptions = showPDFOptions;

openPDFBtn.addEventListener('click', () => currentPDF && window.open(currentPDF, '_blank'));
downloadPDFBtn.addEventListener('click', () => {
  if (!currentPDF) return;
  const a = document.createElement('a');
  a.href = currentPDF; a.download = 'kitob.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = currentPDF;
  downloadMessage.hidden = false;
});

// ---------- Live load from Firestore (pro) ----------
function subscribeBooks(){
  firebase.firestore().collection('books').orderBy('title')
    .onSnapshot((snap) => {
      allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      filterBooks();
    }, (err)=> console.error(err));
}
subscribeBooks();
