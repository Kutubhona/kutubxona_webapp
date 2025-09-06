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
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryRow = document.getElementById('categories');
const toggleThemeBtn = document.getElementById('toggleTheme');
const themeLabel = document.getElementById('themeLabel');
const uploadSection = document.getElementById('uploadSection');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadForm = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const cancelUpload = document.getElementById('cancelUpload');

// Modal
const pdfModal = document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');
const openDownloaded = document.getElementById('openDownloaded');
const closePDFModal = document.getElementById('closePDFModal');

// Splash
const splash = document.getElementById('splash');
const splashTitle = document.getElementById('splashTitle');
const splashSubtitle = document.getElementById('splashSubtitle');

// State
let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

// =================== THEME ===================
function setTheme(theme){
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeLabel.textContent = theme === 'dark' ? "Qorong'" : "Yorug'";
}
function loadTheme(){
  const saved = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}
toggleThemeBtn.addEventListener('click', ()=>{
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  // small flash animation
  document.body.animate([{ filter:'brightness(1.0)' },{ filter:'brightness(1.06)' },{ filter:'brightness(1.0)'}], { duration: 320 });
  setTheme(next);
});

// =================== SPLASH SEQUENCE ===================
function runSplash(){
  // show for ~2.3s then animate out
  setTimeout(()=>{
    splashTitle.classList.add('slide-up');
    splashSubtitle.style.animationDelay = '100ms';
    splashSubtitle.classList.add('slide-up');
    setTimeout(()=> splash.classList.add('hide'), 720);
    setTimeout(()=> {
      if (splash && splash.parentNode) splash.remove();
      // reveal initial content animations
      revealAll();
    }, 1500);
  }, 2300);
}

// =================== RENDER BOOKS ===================
function bookCardTemplate(book){
  return `
    <article class="card reveal" data-id="${book.id}">
      <div class="book-title">${book.title || 'Nomsiz kitob'}</div>
      <div class="book-desc">${book.description || ''}</div>
      <div class="card-actions">
        <button class="btn" data-action="pdf" data-link="${book.link}">📄 PDF</button>
        ${isAdmin ? `<button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">❌ O‘chirish</button>` : ''}
      </div>
    </article>
  `;
}
function renderBooks(list){
  booksContainer.innerHTML = list.length ? list.map(bookCardTemplate).join('') : `<p style="opacity:.7;text-align:center">Hozircha bu yerda kitob yo‘q...</p>`;
  revealAll();
}

// =================== FILTERING ===================
function filterBooks(){
  const q = (searchInput.value || '').toLowerCase();
  const filtered = allBooks.filter(b => (!activeCategory || b.category === activeCategory) && (!q || (b.title && b.title.toLowerCase().includes(q))));
  renderBooks(filtered);
}

// Category click
categoryRow.addEventListener('click', (e)=>{
  const btn = e.target.closest('.cat');
  if(!btn) return;
  const cat = btn.dataset.category;
  if(activeCategory === cat) { activeCategory = ""; }
  else { activeCategory = cat; }
  [...categoryRow.querySelectorAll('.cat')].forEach(b => b.classList.toggle('active', b.dataset.category === activeCategory));
  filterBooks();
});

// Search input
searchInput.addEventListener('input', filterBooks);

// =================== PDF MODAL ===================
function showPDFOptions(pdfURL){
  currentPDF = pdfURL; downloadMessage.classList.add('hidden');
  pdfModal.classList.add('show');
}
openPDFBtn.addEventListener('click', ()=>{ if(currentPDF) window.open(currentPDF, '_blank'); });
downloadPDFBtn.addEventListener('click', ()=>{
  if(!currentPDF) return; const a = document.createElement('a'); a.href = currentPDF; a.download = 'kitob.pdf'; document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = currentPDF; downloadMessage.classList.remove('hidden');
});
closePDFModal.addEventListener('click', ()=> pdfModal.classList.remove('show'));
pdfModal.addEventListener('click', (e)=>{ if(e.target === pdfModal) pdfModal.classList.remove('show'); });

// Delegate actions on cards
booksContainer.addEventListener('click', (e)=>{
  const pdfBtn = e.target.closest('[data-action="pdf"]');
  if(pdfBtn) { showPDFOptions(pdfBtn.dataset.link); return; }
  const delBtn = e.target.closest('[data-action="delete"]');
  if(delBtn) { deleteBook(delBtn.dataset.id, delBtn.dataset.link); }
});

// =================== ADMIN ===================
showUploadBtn.addEventListener('click', () => {
  const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
  if (password === "ibr2010071717.se") {
    isAdmin = true; uploadSection.classList.remove('hidden');
    filterBooks();
  } else {
    alert("❌ Noto‘g‘ri parol!");
  }
});
cancelUpload.addEventListener('click', ()=> uploadSection.classList.add('hidden'));

// =================== UPLOAD ===================
uploadForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];
  if(!file){ alert('❌ PDF fayl tanlanmagan!'); return; }
  try {
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const uploadTask = storageRef.put(file, { customMetadata: { secret_code: 'ibr2010071717.se' }});
    progressContainer.classList.remove('hidden'); progressContainer.setAttribute('aria-hidden','false');
    progressBar.style.width = '0%'; progressBar.textContent = '0%';
    uploadTask.on('state_changed', (snap)=>{
      const p = (snap.bytesTransferred / snap.totalBytes) * 100;
      progressBar.style.width = `${p.toFixed(0)}%`;
      progressBar.textContent = `${p.toFixed(0)}%`;
    }, (err)=>{
      console.error('❌ Yuklash xatolik:', err);
      progressContainer.classList.add('hidden');
      alert('❌ Yuklashda xatolik: ' + err.message);
    }, async ()=>{
      const url = await storageRef.getDownloadURL();
      await firebase.firestore().collection('books').add({ title, description, category, link: url, secret_code: 'ibr2010071717.se' });
      alert('✅ Kitob muvaffaqiyatli qo‘shildi!');
      progressContainer.classList.add('hidden');
      uploadForm.reset(); uploadSection.classList.add('hidden');
    });
  } catch(err){
    console.error('❌ Xatolik:', err);
    alert('❌ Xatolik: ' + err.message);
    progressContainer.classList.add('hidden');
  }
});

// =================== DELETE ===================
async function deleteBook(bookId, fileURL){
  if(!isAdmin){ alert('❌ Sizda o‘chirish huquqi yo‘q!'); return; }
  if(!confirm('Haqiqatan ham bu kitobni o‘chirmoqchimisiz?')) return;
  try{
    await firebase.firestore().collection('books').doc(bookId).delete();
    const ref = firebase.storage().refFromURL(fileURL);
    await ref.delete();
    alert('✅ Kitob muvaffaqiyatli o‘chirildi!');
  } catch(err){
    console.error('❌ O‘chirish xatolik:', err);
    alert('❌ O‘chirishda xatolik: ' + err.message);
  }
}

// =================== FIRESTORE SYNC ===================
function loadBooks(){
  firebase.firestore().collection('books').onSnapshot(snap =>{
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    filterBooks();
  }, err => console.error('❌ Firestore xatolik:', err));
}

// =================== REVEAL ON SCROLL ===================
const io = new IntersectionObserver((entries)=>{
  for(const e of entries){ if(e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } }
}, { threshold: .12 });
function revealAll(){
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// =================== INIT ===================
loadTheme();
runSplash();
loadBooks();
