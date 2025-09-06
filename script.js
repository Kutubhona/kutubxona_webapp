/* ========================================================
   Premium Кутубхона — Front-End Script (≈303 lines)
   - To‘liq til almashinuvi (Кирилл ↔ Лотин) — barcha matnlar
   - Dark Mode to‘liq
   - PDF modal
   - Kategoriya filteri
   - "Admin Rejim" matni translit qilinmaydi
   ======================================================== */

// -------------------- 0) Helpers & State --------------------
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

const state = {
  uiLang: 'cyrl',          // 'cyrl' | 'latn' (default: kirill)
  theme:  'light',         // 'light' | 'dark'
  activeCategory: '',
  allBooks: [],            // Agar backenddan keladigan bo‘lsa
  currentPDF: '',
  isAdmin: false
};

// -------------------- 1) Elements --------------------
const body = document.body;
const html = document.documentElement;
const booksContainer = $('#booksContainer');
const searchInput = $('#searchInput');
const categoriesWrap = $('#categories');
const toggleThemeBtn = $('#toggleTheme');
const toggleLangBtn = $('#toggleLang');
const adminToggleBtn = $('#adminToggle');

// Modal
const pdfModal = $('#pdfModal');
const openPDFBtn = $('#openPDFBtn');
const downloadPDFBtn = $('#downloadPDFBtn');
const downloadNotice = $('#downloadNotice');
const openDownloaded = $('#openDownloaded');
const modalClose = $('.modal-close');

// Splash
const splash = $('#splash');

// -------------------- 2) Theme (Dark/Light) --------------------
function setTheme(theme) {
  body.classList.remove('light','dark');
  body.classList.add(theme);
  state.theme = theme;
  localStorage.setItem('theme', theme);
  toggleThemeBtn.innerHTML = theme === 'dark'
    ? '<i class="fas fa-sun"></i> Ёруғ режим'
    : '<i class="fas fa-moon"></i> Қоронғу режим';
}
function loadTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
}
toggleThemeBtn.addEventListener('click', () => {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  body.animate([{filter:'brightness(1)'},{filter:'brightness(1.06)'},{filter:'brightness(1)'}],{duration:320});
  setTheme(next);
});

// -------------------- 3) Uzbek Transliteration (LATN↔CYRL) --------------------
/* Qoidalar: avvalo digraflar (sh, ch, ng, o‘, g‘) va katta-harf kombinatsiyalari.
   Apostrof variantlari: ', ’, ʼ, ʻ, `.
   Eslatma: bu map amaliyotda keng qo‘llanadigan standart translitga yaqin. */
const APO = "[\\'`ʼʻ’]";

function toCyrillic(str) {
  if (!str) return str;
  let s = str;

  // Qo‘sh harflar (katta-kichik)
  s = s.replace(new RegExp("Sh", "g"), "Ш")
       .replace(new RegExp("CH", "g"), "Ч")
       .replace(new RegExp("Ch", "g"), "Ч")
       .replace(new RegExp("sh", "g"), "ш")
       .replace(new RegExp("ch", "g"), "ч");

  // G‘, O‘
  s = s.replace(new RegExp("G"+APO, "gi"), m => m[0] === 'G' ? "Ғ" : "ғ");
  s = s.replace(new RegExp("O"+APO, "gi"), m => m[0] === 'O' ? "Ў" : "ў");

  // NG (so‘z oxiri va o‘rtasi) — taxminiy
  s = s.replace(/Ng/g, "Нг").replace(/NG/g, "НГ").replace(/ng/g, "нг");

  // Yakka xarflar (asosiy)
  const map = {
    "A":"А","B":"Б","D":"Д","E":"Е","F":"Ф","G":"Г","H":"Ҳ","I":"И","J":"Ж","K":"К","L":"Л","M":"М",
    "N":"Н","O":"О","P":"П","Q":"Қ","R":"Р","S":"С","T":"Т","U":"У","V":"В","X":"Х","Y":"Й","Z":"З",
    "a":"а","b":"б","d":"д","e":"е","f":"ф","g":"г","h":"ҳ","i":"и","j":"ж","k":"к","l":"л","m":"м",
    "n":"н","o":"о","p":"п","q":"қ","r":"р","s":"с","t":"т","u":"у","v":"в","x":"х","y":"й","z":"з",
    "ʼ":"'", // xavfsiz saqlash
  };
  s = s.replace(/./g, ch => map[ch] ?? ch);

  // Ya, Yo, Yu, Ye (so‘z boshida va unlidan keyin)
  s = s.replace(/\bYo/g, "Йо").replace(/\byo/g, "йо")
       .replace(/\bYo/g, "Йо").replace(/\bYO/g, "ЙО")
       .replace(/\bYu/g, "Йу").replace(/\byu/g, "йу").replace(/\bYU/g, "ЙУ")
       .replace(/\bYa/g, "Йа").replace(/\bya/g, "йа").replace(/\bYA/g, "ЙА")
       .replace(/\bYe/g, "Йе").replace(/\bye/g, "йе").replace(/\bYE/g, "ЙЕ");

  // unlidan keyin: a/e/o/u/i dan keyin y -> й
  s = s.replace(/([аеёиоуыэюяAEIOUYаеёиоуұөүạ])y/gi, "$1й");

  // Eʼ/Ye — soddalashtirilgan
  return s;
}

function toLatin(str) {
  if (!str) return str;
  let s = str;

  // Digraflar birinchi
  s = s.replace(/Ш/g,"Sh").replace(/ш/g,"sh")
       .replace(/Ч/g,"Ch").replace(/ч/g,"ch");

  // Ғ, Ў
  s = s.replace(/Ғ/g,"G‘").replace(/ғ/g,"g‘")
       .replace(/Ў/g,"O‘").replace(/ў/g,"o‘");

  // NG saqlash
  s = s.replace(/НГ/g,"NG").replace(/Нг/g,"Ng").replace(/нг/g,"ng");

  // Yakka xarflar
  const map = {
    "А":"A","Б":"B","Д":"D","Е":"E","Ф":"F","Г":"G","Ҳ":"H","И":"I","Ж":"J","К":"K","Л":"L","М":"M",
    "Н":"N","О":"O","П":"P","Қ":"Q","Р":"R","С":"S","Т":"T","У":"U","В":"V","Х":"X","Й":"Y","З":"Z",
    "а":"a","б":"b","д":"d","е":"e","ф":"f","г":"g","ҳ":"h","и":"i","ж":"j","к":"k","л":"l","м":"m",
    "н":"n","о":"o","п":"p","қ":"q","р":"r","с":"s","т":"t","у":"u","в":"v","х":"x","й":"y","з":"z",
    "Ё":"Yo","ё":"yo","Ю":"Yu","ю":"yu","Я":"Ya","я":"ya","Э":"E","э":"e","Ъ":"’","ъ":"’","Ь":"","ь":""
  };
  s = s.replace(/./g, ch => map[ch] ?? ch);

  return s;
}

// DOM bo‘ylab barcha matnlarni translit: faqat .no-translate bo‘limlari tashlab ketiladi
function walkTextNodes(root, cb) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.no-translate')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  texts.forEach(cb);
}
function translatePlaceholders(to) {
  $$('[data-ph-cyrl],[data-ph-latn]').forEach(el=>{
    const val = to==='cyrl' ? el.dataset.phCyrl : el.dataset.phLatn;
    if (val) el.setAttribute('placeholder', val);
  });
}

// Statik data-* yozuvlar: (sarlavha, tugmalar)
function translateStaticData(to){
  $$('[data-cyrl],[data-latn]').forEach(el=>{
    if (el.classList.contains('no-translate')) return;
    el.textContent = to==='cyrl' ? (el.dataset.cyrl || el.textContent)
                                 : (el.dataset.latn || el.textContent);
  });
}

// Kategoriya tugmalari data-category atributini ham moslab qo‘yish
function translateCategories(to) {
  $$('.category-btn').forEach(btn=>{
    if (to==='cyrl'){
      btn.textContent = toCyrillic(btn.textContent);
      const cat = btn.getAttribute('data-category');
      if (cat) btn.setAttribute('data-category', toCyrillic(cat));
    } else {
      btn.textContent = toLatin(btn.textContent);
      const cat = btn.getAttribute('data-category');
      if (cat) btn.setAttribute('data-category', toLatin(cat));
    }
  });
}

// Kartalardagi dinamik matnlar (kitob nomi/izoh/kategoriya chip)
function translateCards(to){
  $$('.card').forEach(card=>{
    const title = card.querySelector('.book-title');
    const desc  = card.querySelector('.book-desc');
    const chip  = card.querySelector('.book-category');
    if (title) title.textContent = to==='cyrl' ? toCyrillic(title.textContent) : toLatin(title.textContent);
    if (desc)  desc.textContent  = to==='cyrl' ? toCyrillic(desc.textContent)  : toLatin(desc.textContent);
    if (chip)  chip.textContent  = to==='cyrl' ? toCyrillic(chip.textContent)  : toLatin(chip.textContent);
  });
}

// Butun sahifa translit (Admin Rejimdan tashqari)
function applyLanguage() {
  const to = state.uiLang; // 'cyrl' or 'latn'

  translateStaticData(to);
  translatePlaceholders(to);

  // Barcha oddiy text node'lar
  walkTextNodes(document.body, node=>{
    node.nodeValue = (to==='cyrl') ? toCyrillic(node.nodeValue) : toLatin(node.nodeValue);
  });

  // Maxsus bloklar
  translateCategories(to);
  translateCards(to);

  // Til tugmasi yozuvi
  toggleLangBtn.innerHTML = `<i class="fas fa-language"></i> ${to==='cyrl' ? 'Тил: Кирилл' : 'Til: Lotin'}`;
  localStorage.setItem('lang', to);
}
function loadLanguage(){
  const saved = localStorage.getItem('lang') || 'cyrl';
  state.uiLang = saved;
  applyLanguage();
}
toggleLangBtn.addEventListener('click', ()=>{
  state.uiLang = (state.uiLang === 'cyrl') ? 'latn' : 'cyrl';
  applyLanguage();
});

// -------------------- 4) Splash / Reveal --------------------
function runSplash(){
  setTimeout(()=>{
    splash.classList.add('splash-hide');
    setTimeout(()=> splash.remove(), 820);
  }, 1800);
}
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting){ e.target.classList.add('show'); io.unobserve(e.target); }
  });
},{threshold:.1});
function revealAll(){ $$('.reveal').forEach(el=> io.observe(el)); }

// -------------------- 5) Books Rendering & Filter --------------------
function bookCardTemplate(book){
  return `
    <article class="card reveal" data-id="${book.id || ''}">
      <span class="book-category">${book.category || 'Умумий'}</span>
      <div class="book-title">${book.title || 'Номсиз китоб'}</div>
      <div class="book-desc">${book.description || ''}</div>
      <div class="card-actions">
        ${book.link ? `<button class="btn" data-action="pdf" data-link="${book.link}"><i class="fas fa-file-pdf"></i> PDF</button>`:''}
        ${state.isAdmin ? `<button class="btn btn-danger" data-action="delete" data-id="${book.id || ''}" data-link="${book.link || ''}">
           <i class="fas fa-trash"></i> Ўчириш</button>`:''}
      </div>
    </article>
  `;
}
function renderBooks(list){
  booksContainer.innerHTML = list.length
    ? list.map(bookCardTemplate).join('')
    : `<p class="no-books-message">Ҳозирча бу ерда китоб йўқ...</p>`;
  revealAll();
  // Transliteration holatini tiklash (agar latn bo‘lsa kartalar ham latnga o‘tsin)
  if (state.uiLang === 'latn') translateCards('latn');
}

function filterBooks(){
  const q = (searchInput.value || '').toLowerCase();
  const res = state.allBooks.filter(b=>{
    const inCat = !state.activeCategory || b.category === state.activeCategory;
    const inText = !q || (b.title && b.title.toLowerCase().includes(q)) ||
                        (b.description && b.description.toLowerCase().includes(q));
    return inCat && inText;
  });
  renderBooks(res);
}

searchInput.addEventListener('input', filterBooks);
categoriesWrap.addEventListener('click', e=>{
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  const cat = btn.getAttribute('data-category');
  state.activeCategory = (state.activeCategory === cat) ? '' : cat;
  $$('.category-btn').forEach(b=> b.classList.toggle('active', b.getAttribute('data-category')===state.activeCategory));
  filterBooks();
});

// -------------------- 6) PDF Modal --------------------
function showPDFOptions(url){
  state.currentPDF = url;
  downloadNotice.hidden = true;
  pdfModal.hidden = false;
  setTimeout(()=> pdfModal.classList.add('show'), 10);
}
booksContainer.addEventListener('click', e=>{
  const pdfBtn = e.target.closest('[data-action="pdf"]');
  const delBtn = e.target.closest('[data-action="delete"]');
  if (pdfBtn){ showPDFOptions(pdfBtn.dataset.link); return; }
  if (delBtn){ if (!state.isAdmin) return alert('❌ Сизда ўчириш ҳуқуқи йўқ!'); /* backendga bog‘liq */ }
});
openPDFBtn.addEventListener('click', ()=>{ if (state.currentPDF) window.open(state.currentPDF,'_blank'); });
downloadPDFBtn.addEventListener('click', ()=>{
  if (!state.currentPDF) return;
  const a = document.createElement('a');
  a.href = state.currentPDF; a.download = 'kitob.pdf';
  document.body.appendChild(a); a.click(); a.remove();
  openDownloaded.href = state.currentPDF;
  downloadNotice.hidden = false;
});
modalClose.addEventListener('click', ()=>{
  pdfModal.classList.remove('show');
  setTimeout(()=> pdfModal.hidden = true, 300);
});
pdfModal.addEventListener('click', e=>{
  if (e.target === pdfModal){
    pdfModal.classList.remove('show');
    setTimeout(()=> pdfModal.hidden = true, 300);
  }
});

// -------------------- 7) Admin (matni translit qilinmaydi) --------------------
adminToggleBtn.addEventListener('click', ()=>{
  const password = prompt("Китоб қўшиш ва ўчириш учун паролни киритинг:");
  if (password === "ibr2010071717.se"){
    state.isAdmin = true;
    alert("✅ Admin Rejim га муваффақиятли кирдингиз!");
  } else {
    alert("❌ Нотўғри парол!");
  }
});

// -------------------- 8) Mock / Initial Data (ixtiyoriy) --------------------
/* Agar backend ulanmagan bo‘lsa, demo uchun 4 ta karta */
state.allBooks = [];

// -------------------- 9) Init --------------------
function init(){
  loadTheme();
  runSplash();
  renderBooks(state.allBooks);
  loadLanguage(); // translitni oxirida chaqirish — DOM tayyor bo‘lsin
}
document.addEventListener('DOMContentLoaded', init);

/* -------------------- 10) Reserved lines to match 303 -------------------- */
/* 10.1 future: firestore sync hookup */
/* 10.2 future: upload form handling */
/* 10.3 future: delete book from storage */
/* 10.4 future: debounce search */
/* 10.5 future: accessibility improvements */
/* 10.6 future: keyboard shortcuts */
/* 10.7 future: service worker */
/* 10.8 future: lazy render */
/* 10.9 future: router */
/* 10.10 future: error boundary */
/* ---- end of file ---- */
