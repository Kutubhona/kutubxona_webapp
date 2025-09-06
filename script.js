// =================== ELEMENTS ===================
const body = document.body;
const splash = document.getElementById('splash');
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const toggleLangBtn = document.getElementById('toggleLang');

// Admin va yuklash
const adminToggleBtn = document.getElementById('adminToggle');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const bookTitleInput = document.getElementById('bookTitle');
const bookDescInput  = document.getElementById('bookDescription');
const bookCatSelect  = document.getElementById('bookCategory');
const bookFileInput  = document.getElementById('bookFile');
const progressWrap = document.getElementById('progressWrap');
const progressBar  = document.getElementById('progressBar');

// PDF modal
const pdfModal = document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadNotice = document.getElementById('downloadNotice');
const openDownloaded = document.getElementById('openDownloaded');
const modalClose = document.querySelector('.modal-close');

// =================== STATE ===================
const state = {
  theme: 'light',
  lang: 'cy',
  allBooks: [],
  activeCategory: '',
  isAdmin: false,
  currentPDF: ''
};

// =================== THEME ===================
function setTheme(next){
  body.classList.remove('light','dark');
  body.classList.add(next);
  state.theme = next;
  localStorage.setItem('theme', next);
  toggleThemeBtn.innerHTML = next === 'dark'
      ? '<i class="fas fa-sun"></i> Ёруғ режим'
      : '<i class="fas fa-moon"></i> Қоронғу режим';
}
function loadTheme(){
  const saved = localStorage.getItem('theme');
  if (saved) setTheme(saved);
  else setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
toggleThemeBtn?.addEventListener('click', ()=>{
  const next = body.classList.contains('dark') ? 'light' : 'dark';
  body.animate([{filter:'brightness(1)'},{filter:'brightness(1.06)'},{filter:'brightness(1)'}],{duration:320});
  setTheme(next);
});

// =================== LANGUAGE ===================
function isInAdmin(el){
  return uploadSection && (el === uploadSection || uploadSection.contains(el));
}
function toCyr(text){ return text.replace(/sh/g,'ш').replace(/Sh/g,'Ш'); }
function toLat(text){ return text.replace(/ш/g,'sh').replace(/Ш/g,'Sh'); }

function prepareTranslitTargets(){
  const all = Array.from(document.querySelectorAll(
    'h1,h2,h3,h4,h5,h6,p,span,a,div,button,.category-btn,.book-title,.book-desc,.book-category,.subtitle'
  )).filter(el => !isInAdmin(el) && !el.closest('.no-translate'));
  return all;
}
function applyLanguage(lang){
  state.lang = lang;
  localStorage.setItem('lang', lang);
  toggleLangBtn.innerHTML = lang === 'cy'
      ? '<i class="fas fa-language"></i> Лотинча'
      : '<i class="fas fa-language"></i> Кириллча';
  const nodes = prepareTranslitTargets();
  nodes.forEach(el => {
    if (!el.dataset.txOriginal) el.dataset.txOriginal = el.textContent;
    if (lang === 'cy') el.textContent = toCyr(el.dataset.txOriginal);
    else el.textContent = toLat(el.dataset.txOriginal);
  });
}
function loadLanguage(){
  const saved = localStorage.getItem('lang');
  applyLanguage(saved === 'la' ? 'la' : 'cy');
}
toggleLangBtn?.addEventListener('click', ()=>{
  const next = (state.lang === 'cy') ? 'la' : 'cy';
  applyLanguage(next);
});

// =================== SPLASH ===================
function runSplash(){
  if (!splash) return;
  setTimeout(()=>{
    splash.classList.add('splash-fade-out');
    setTimeout(()=>{ splash.remove(); revealAll(); }, 820);
  }, 2000);
}

// =================== BOOKS ===================
function cardTemplate(b){
  return `
    <article class="card reveal" data-id="${b.id}">
      <span class="book-category">${b.category || 'Умумий'}</span>
      <div class="book-title">${b.title || 'Номсиз китоб'}</div>
      <div class="book-desc">${b.description || ''}</div>
      <div class="card-actions">
        <button class="btn" data-action="pdf" data-link="${b.link || ''}"><i class="fas fa-file-pdf"></i> PDF</button>
        ${state.isAdmin ? `<button class="btn btn-danger" data-action="delete" data-id="${b.id}" data-link="${b.link || ''}"><i class="fas fa-trash"></i> Ўчириш</button>` : ''}
      </div>
    </article>
  `;
}
function renderBooks(list){
  booksContainer.innerHTML = (list && list.length) ? list.map(cardTemplate).join('') : '<p class="no-books-message reveal">Ҳозирча китоб йўқ…</p>';
  revealAll();
  applyLanguage(state.lang); // qo'shimcha: kitob va kategoriyalar ham translit qilinsin
}
function filterBooks(){
  const q = (searchInput?.value || '').toLowerCase();
  const filtered = (state.allBooks || []).filter(b =>
    (!state.activeCategory || b.category === state.activeCategory) &&
    (!q || (b.title && b.title.toLowerCase().includes(q)) ||
           (b.description && b.description.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}
categoryButtons.forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const cat = e.currentTarget.dataset.category;
    state.activeCategory = (state.activeCategory === cat) ? '' : cat;
    categoryButtons.forEach(b => b.classList.toggle('active', b.dataset.category === state.activeCategory));
    filterBooks();
  });
});
searchInput?.addEventListener('input', filterBooks);

// =================== PDF MODAL ===================
function showPDFOptions(pdfURL){
  state.currentPDF = pdfURL || '';
  pdfModal.hidden = false;
  setTimeout(()=> pdfModal.classList.add('show'), 10);
}
openPDFBtn?.addEventListener('click', ()=>{
  if (state.currentPDF) window.open(state.currentPDF, '_blank');
});
downloadPDFBtn?.addEventListener('click', ()=>{
  if (!state.currentPDF) return;
  const a = document.createElement('a');
  a.href = state.currentPDF; a.download = 'kitob.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = state.currentPDF;
  downloadNotice.hidden = false;
});
modalClose?.addEventListener('click', ()=>{
  pdfModal.classList.remove('show');
  setTimeout(()=> pdfModal.hidden = true, 280);
});
pdfModal?.addEventListener('click', (e)=>{
  if (e.target === pdfModal){
    pdfModal.classList.remove('show');
    setTimeout(()=> pdfModal.hidden = true, 280);
  }
});
booksContainer?.addEventListener('click', (e)=>{
  const pdfBtn = e.target.closest('[data-action="pdf"]');
  if (pdfBtn){ showPDFOptions(pdfBtn.dataset.link); return; }
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn){ deleteBook(delBtn.dataset.id, delBtn.dataset.link); }
});

// =================== ADMIN ===================
adminToggleBtn?.addEventListener('click', ()=>{
  const password = prompt("Китоб қўшиш ва ўчириш учун паролни киритинг:");
  if (password === "ibr2010071717.se"){
    state.isAdmin = true;
    alert("✅ Admin Rejim га муваффақиятли кирдингиз!");
    uploadSection.hidden = false;
    uploadSection.classList.add('reveal');
    setTimeout(()=> uploadSection.classList.add('show'), 10);
    filterBooks();
  } else {
    alert("❌ Нотўғри парол!");
  }
});

// =================== UPLOAD ===================
uploadForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if (!state.isAdmin) return;

  const title = bookTitleInput?.value.trim();
  const description = bookDescInput?.value.trim();
  const category = bookCatSelect?.value;
  const file = bookFileInput?.files[0];
  if (!file) return;

  try{
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const uploadTask = storageRef.put(file);

    progressWrap.hidden = false;
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    uploadTask.on('state_changed',
      snap=>{
        const p = (snap.bytesTransferred/snap.totalBytes)*100;
        progressBar.style.width = `${p.toFixed(0)}%`;
        progressBar.textContent = `${p.toFixed(0)}%`;
      },
      err=>{
        console.error(err);
        progressWrap.hidden = true;
      },
      async ()=>{
        const url = await storageRef.getDownloadURL();
        await firebase.firestore().collection('books').add({
          title, description, category, link: url,
          created: new Date()
        });
        alert("✅ Китоб қўшилди!");
        progressWrap.hidden = true;
        uploadForm.reset();
        uploadSection.hidden = true;
      }
    );
  }catch(err){
    console.error(err);
    progressWrap.hidden = true;
  }
});

// =================== DELETE ===================
async function deleteBook(bookId, fileURL){
  if (!state.isAdmin) return;
  if (!confirm('Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?')) return;
  try{
    await firebase.firestore().collection('books').doc(bookId).delete();
    if (fileURL){
      const ref = firebase.storage().refFromURL(fileURL);
      await ref.delete();
    }
    alert('✅ Ўчирилди!');
  }catch(err){ console.error(err); }
}

// =================== FIRESTORE REAL-TIME ===================
function loadBooks(){
  firebase.firestore().collection('books').onSnapshot(
    snap=>{
      state.allBooks = snap.docs.map(d=>({ id: d.id, ...d.data() }));
      filterBooks();
    }
  );
}

// =================== REVEAL ===================
const io = new IntersectionObserver((entries)=>{
  for (const e of entries){
    if (e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
  }
},{threshold:0.12});
function revealAll(){
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
}

// =================== INIT ===================
function init(){
  loadTheme();
  runSplash();
  loadBooks();
  loadLanguage();
}
document.addEventListener('DOMContentLoaded', init);
