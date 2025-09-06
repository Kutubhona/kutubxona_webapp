
// =================== FIREBASE INIT (siznikiga mos) ===================
const firebaseConfig = {
  apiKey: "AIzaSyDuk-PhyFg5j7JkVnvfcYfBKGMoNZtT02s",
  authDomain: "kutubxona-79dd3.firebaseapp.com",
  projectId: "kutubxona-79dd3",
  storageBucket: "kutubxona-79dd3.firebasestorage.app",
  messagingSenderId: "593289819612",
  appId: "1:593289819612:web:89b9a8dd933f945eb78b19",
  measurementId: "G-Z0Z4FWPWP8"
};
if (window.firebase && !firebase.apps.length) firebase.initializeApp(firebaseConfig);

// =================== ELEMENTS (index’ga mos ID/klasslar) ===================
const body = document.body;
const splash = document.getElementById('splash');
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const toggleLangBtn = document.getElementById('toggleLang');

// Admin va yuklash
const adminToggleBtn = document.getElementById('adminToggle');
const uploadSection = document.getElementById('uploadSection'); // Admin-only, translitsiz
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
  lang: 'cy', // default: Кирилл (Admin’dan tashqari hamma joy)
  allBooks: [],
  activeCategory: '',
  isAdmin: false,
  currentPDF: ''
};

// =================== THEME (dark/light) ===================
function setTheme(next){
  body.classList.remove('light','dark');
  body.classList.add(next);
  state.theme = next;
  localStorage.setItem('theme', next);
  if (toggleThemeBtn){
    toggleThemeBtn.innerHTML = next === 'dark'
      ? '<i class="fas fa-sun"></i> Ёруғ режим'
      : '<i class="fas fa-moon"></i> Қоронғу режим';
  }
}
function loadTheme(){
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') setTheme(saved);
  else setTheme(matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
toggleThemeBtn?.addEventListener('click', ()=>{
  const next = body.classList.contains('dark') ? 'light' : 'dark';
  body.animate([{filter:'brightness(1)'},{filter:'brightness(1.06)'},{filter:'brightness(1)'}],{duration:320});
  setTheme(next);
});

// =================== TIL (Latin <-> Кирилл) ===================
// Admin bo‘limi translit qilinmaydi (uploadSection ichidagi kontentni tashlab ketamiz)
function isInAdmin(el){
  return uploadSection && (el === uploadSection || uploadSection.contains(el));
}

// Minimal translit xarita (uzbek lotin <-> kirill)
const mapLatToCy = [
  ['O‘','Ў'],['G‘','Ғ'],['Sh','Ш'],['Ch','Ч'],['Yo','Ё'],['Yu','Ю'],['Ya','Я'],['Ng','Нг'],
  ['o‘','ў'],['g‘','ғ'],['sh','ш'],['ch','ч'],['yo','ё'],['yu','ю'],['ya','я'],['ng','нг'],
  ['O\'','Ў'],['G\'','Ғ'],['o\'','ў'],['g\'','ғ'],
  ['Q','Қ'],['q','қ'],['H','Ҳ'],['h','ҳ'],
  ['O','О'],['o','о'],['G','Г'],['g','г'],['E','Е'],['e','е'],['A','А'],['a','а'],
  ['B','Б'],['b','б'],['D','Д'],['d','д'],['J','Ж'],['j','ж'],['Z','З'],['z','з'],
  ['I','И'],['i','и'],['K','К'],['k','к'],['L','Л'],['l','л'],['M','М'],['m','м'],
  ['N','Н'],['n','н'],['P','П'],['p','п'],['R','Р'],['r','р'],['S','С'],['s','с'],
  ['T','Т'],['t','т'],['U','У'],['u','у'],['F','Ф'],['f','ф'],['X','Х'],['x','х'],
  ['Y','Й'],['y','й'],['’','ʼ'],["'",'ʼ']
];
const mapCyToLat = [
  ['Ў','O‘'],['Ғ','G‘'],['Ш','Sh'],['Ч','Ch'],['Ё','Yo'],['Ю','Yu'],['Я','Ya'],
  ['ў','o‘'],['ғ','g‘'],['ш','sh'],['ч','ch'],['ё','yo'],['ю','yu'],['я','ya'],
  ['Қ','Q'],['қ','q'],['Ҳ','H'],['ҳ','h'],
  ['Й','Y'],['й','y'],
  ['А','A'],['а','a'],['Б','B'],['б','b'],['В','V'],['в','v'],['Г','G'],['г','g'],
  ['Д','D'],['д','d'],['Е','E'],['е','e'],['Ж','J'],['ж','j'],['З','Z'],['з','z'],
  ['И','I'],['и','i'],['К','K'],['к','k'],['Л','L'],['л','l'],['М','M'],['м','m'],
  ['Н','N'],['н','n'],['О','O'],['о','o'],['П','P'],['п','p'],['Р','R'],['р','r'],
  ['С','S'],['с','s'],['Т','T'],['т','t'],['У','U'],['у','u'],['Ф','F'],['ф','f'],
  ['Х','X'],['х','x'],['Ц','Ts'],['ц','ts'],['Ъ','ʼ'],['ъ','ʼ'],['Ь',''],['ь','']
];

function toCyr(text){
  let out = text;
  // katta ikki belgili birikmalarni avval
  for (const [lat, cy] of mapLatToCy) out = out.split(lat).join(cy);
  return out;
}
function toLat(text){
  let out = text;
  for (const [cy, lat] of mapCyToLat) out = out.split(cy).join(lat);
  return out;
}

function prepareTranslitTargets(){
  // faqat matnli bloklar: headerlar, tugmalar, category nomlari, kartalar va h.k.
  const all = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6, p, span, a, button, .category-btn, .book-title, .book-desc, .book-category, .badge, .nav-link, .hero, .hero-title, .hero-sub, .footer, .card, .card *'))
    .filter(el => !isInAdmin(el) && !el.closest('[data-no-translit]') && !el.closest('input,textarea,select'));
  return all;
}

function applyLanguage(lang){
  state.lang = lang;
  localStorage.setItem('lang', lang);
  // Tugma yozuvi
  if (toggleLangBtn){
    toggleLangBtn.innerHTML = lang === 'cy'
      ? '<i class="fas fa-language"></i> Лотинча'
      : '<i class="fas fa-language"></i> Кириллча';
  }
  // Elementlar bo'ylab translit
  const nodes = prepareTranslitTargets();
  nodes.forEach(el => {
    const original = el.dataset.txOriginal ?? el.textContent;
    if (!el.dataset.txOriginal) {
      el.dataset.txOriginal = original;
      el.dataset.txLat = toLat(original);
      el.dataset.txCy  = toCyr(original);
    }
    el.textContent = (lang === 'cy') ? el.dataset.txCy : el.dataset.txLat;
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

// =================== BOOKS: render/filter ===================
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
  if (!booksContainer) return;
  booksContainer.innerHTML = (list && list.length) ? list.map(cardTemplate).join('') : '<p class="no-books-message reveal">Ҳозирча китоб йўқ…</p>';
  revealAll();
  // renderdan keyin til qo‘llaymiz (faqat Admindan tashqari)
  applyLanguage(state.lang);
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
  if (!pdfModal) return;
  if (downloadNotice) downloadNotice.hidden = true;
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
  if (openDownloaded) openDownloaded.href = state.currentPDF;
  if (downloadNotice) downloadNotice.hidden = false;
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

// =================== ADMIN (translitdan tashqari) ===================
adminToggleBtn?.addEventListener('click', ()=>{
  const password = prompt("Китоб қўшиш ва ўчириш учун паролни киритинг:");
  if (password === "ibr2010071717.se"){
    state.isAdmin = true;
    alert("✅ Admin Rejim га муваффақиятли кирдингиз!");
    if (uploadSection){
      uploadSection.hidden = false;
      uploadSection.setAttribute('data-no-translit','1'); // ehtiyot uchun
      uploadSection.classList.add('reveal');
      setTimeout(()=> uploadSection.classList.add('show'), 10);
    }
    filterBooks(); // kartalarda delete tugmasi paydo bo‘lsin
  } else {
    alert("❌ Нотўғри парол!");
  }
});

// =================== UPLOAD (Firebase Storage + Firestore) ===================
uploadForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  if (!state.isAdmin) { alert("❌ Админ эмассиз!"); return; }

  const title = bookTitleInput?.value.trim();
  const description = bookDescInput?.value.trim();
  const category = bookCatSelect?.value;
  const file = bookFileInput?.files[0];

  if (!file) { alert('❌ PDF файл танланмаган!'); return; }

  try{
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const uploadTask = storageRef.put(file, { customMetadata: { secret_code: 'ibr2010071717.se' } });

    if (progressWrap && progressBar){
      progressWrap.hidden = false;
      progressBar.style.width = '0%';
      progressBar.textContent = '0%';
    }

    uploadTask.on('state_changed',
      snap=>{
        const p = (snap.bytesTransferred/snap.totalBytes)*100;
        if (progressBar){
          progressBar.style.width = `${p.toFixed(0)}%`;
          progressBar.textContent = `${p.toFixed(0)}%`;
        }
      },
      err=>{
        console.error('❌ Yuklash xatolik:', err);
        if (progressWrap) progressWrap.hidden = true;
        alert('❌ Yuklashda xatolik: ' + err.message);
      },
      async ()=>{
        const url = await storageRef.getDownloadURL();
        await firebase.firestore().collection('books').add({
          title, description, category, link: url,
          secret_code: 'ibr2010071717.se',
          created: new Date()
        });
        alert("✅ Китоб муваффақиятли қўшилди!");
        if (progressWrap) progressWrap.hidden = true;
        uploadForm.reset();
        uploadSection.hidden = true;
      }
    );
  }catch(err){
    console.error('❌ Xatolik:', err);
    if (progressWrap) progressWrap.hidden = true;
    alert('❌ Xatolik: ' + err.message);
  }
});

// =================== DELETE ===================
async function deleteBook(bookId, fileURL){
  if (!state.isAdmin){ alert("❌ Сизда ўчириш ҳуқуқи йўқ!"); return; }
  if (!confirm('Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?')) return;
  try{
    await firebase.firestore().collection('books').doc(bookId).delete();
    if (fileURL){
      const ref = firebase.storage().refFromURL(fileURL);
      await ref.delete();
    }
    alert('✅ Китоб муваффақиятли ўчирилди!');
  }catch(err){
    console.error("❌ O'chirish xatolik:", err);
    alert("❌ O'chirishda xatolik: " + err.message);
  }
}

// =================== FIRESTORE REAL-TIME ===================
function loadBooks(){
  firebase.firestore().collection('books').onSnapshot(
    snap=>{
      state.allBooks = snap.docs.map(d=>({ id: d.id, ...d.data() }));
      filterBooks();
    },
    err=> console.error('❌ Firestore xatolik:', err)
  );
}

// =================== REVEAL ON SCROLL ===================
const io = new IntersectionObserver((entries)=>{
  for (const e of entries){
    if (e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
  }
}, { threshold: 0.12 });
function revealAll(){
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));
}

// =================== INIT ===================
function init(){
  loadTheme();
  runSplash();
  loadBooks();         // Firestore’ga ulangan
  loadLanguage();      // DOM tayyor bo'lgach translit
}
document.addEventListener('DOMContentLoaded', init);

/* -------------------- Reserved lines (yaqin 303 qator) -------------------- */
/* 10.1: firestore security rules */
/* 10.2: pagination / infinite scroll */
/* 10.3: cache (IndexedDB) */
/* 10.4: debounce search */
/* 10.5: offline banner */
/* 10.6: keyboard shortcuts */
/* 10.7: service worker */
/* 10.8: router state */
/* 10.9: badge counters */
/* 10.10: analytics hooks */
/* ---- end of file ---- */
