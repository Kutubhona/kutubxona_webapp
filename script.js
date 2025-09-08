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

// Category Overlay elements
const overlay = document.getElementById('categoryOverlay');
const overlayClose = document.getElementById('overlayClose');
const overlayBooks = document.getElementById('overlayBooks');
const overlayTitle = document.getElementById('overlayTitle');

// Splash elements
const splash = document.getElementById('splash');

// State
let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

// =================== THEME ===================
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const themeText = {
    'light': '<i class="fas fa-moon"></i> Қоронғу режим',
    'dark': '<i class="fas fa-sun"></i> Ёруғ режим'
  };
  toggleThemeBtn.innerHTML = themeText[theme];
}

function loadTheme() {
  const saved = localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}

toggleThemeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.body.animate([{ filter:'brightness(1.0)' },{ filter:'brightness(1.06)' },{ filter:'brightness(1.0)'}], { duration: 320 });
  setTheme(next);
});

// =================== LANGUAGE ===================
const TRANSLATIONS = {
    'Кутубхонага': 'Kutubxonaga',
    'Хуш келибсиз!': 'Xush kelibsiz!',
    'Премиум Кутубхона': 'Premium Kutubxona',
    'Сизга китоб тавсия қиламиз!': 'Sizga kitob tavsiya qilamiz!',
    'Қайси китобни қидиряпсиз?': 'Qaysi kitobni qidiryapsiz?',
    'Қоронғу режим': 'Qorong‘u rejim',
    'Ёруғ режим': 'Yorug‘ rejim',
    'Тил': 'Til',
    'Қуръони Карим': 'Qur’oni Karim',
    'Тафсир китоблари': 'Tafsir kitoblari',
    'Ҳадис китоблари': 'Hadis kitoblari',
    'Фиқҳий китоблари': 'Fiqhiy kitoblari',
    'Ақида китоблари': 'Aqida kitoblari',
    'Тарих китоблари': 'Tarix kitoblari',
    'Сийрат китоблари': 'Siyrat kitoblari',
    'Саҳобалар ҳаёти': 'Sahobalar hayoti',
    'Ахлоқ ва тарбия': 'Axloq va tarbiya',
    'Дуо ва зикрлар': 'Duo va zikrlar',
    'Ал-Ваъй журнали': 'Al-Va’y jurnali',
    'Ҳизб китоблари': 'Hizb kitoblari',
    'Admin Rejim': 'Admin Rejim',
    'Янги китоб қўшиш': 'Yangi kitob qo‘shish',
    'Китоб номи': 'Kitob nomi',
    'Тавсиф': 'Tavsif',
    'Категория танланг': 'Kategoriya tanlang',
    'Китоб қўшиш': 'Kitob qo‘shish',
    'PDF билан нима қилмоқчисиз?': 'PDF bilan nima qilmoqchisiz?',
    'Браузерда очиш': 'Brauzerda ochish',
    'Юклаб олиш': 'Yuklab olish',
    'PDF қурилмангизга муваффақиятли юкланди!': 'PDF qurilmangizga muvaffaqiyatli yuklandi!',
    'Юкланган PDF\'ни очиш': 'Yuklangan PDF\'ni ochish',
    'Ҳозирча бу ерда китоб йўқ...': 'Hozircha bu yerda kitob yo‘q...',
    'PDF': 'PDF',
    'Ўчириш': 'O‘chirish',
    'Китоб қўшиш ва ўчириш учун паролни киритинг:': 'Kitob qo‘shish va o‘chirish uchun parolni kiriting:',
    'Админ режимига муваффақиятли кирдингиз!': 'Admin rejimiga muvaffaqiyatli kirdingiz!',
    'Нотўғри парол!': 'Noto‘g‘ri parol!',
    'PDF файл танланмаган!': 'PDF fayl tanlanmagan!',
    'Юклашда хатолик: ': 'Yuklashda xatolik: ',
    'Китоб муваффақиятли қўшилди!': 'Kitob muvaffaqiyatli qo‘shildi!',
    'Хатолик: ': 'Xatolik: ',
    'Сизда ўчириш ҳуқуқи йўқ!': 'Sizda o‘chirish huquqi yo‘q!',
    'Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?': 'Haqiqatan ham bu kitobni o‘chirmoqchimisiz?',
    'Китоб муваффақиятли ўчирилди!': 'Kitob muvaffaqiyatli o‘chirildi!',
    'Ўчиришда хатолик: ': 'O‘chirishda xatolik: '
};

let isKirill = true;

function switchLanguage() {
    isKirill = !isKirill;
    const elements = document.querySelectorAll('[data-original-text], h1, h2, p, button, input, option, .book-title, .book-desc, .book-category');

    elements.forEach(el => {
        const originalText = el.getAttribute('data-original-text') || el.textContent.trim();
        
        if (!el.hasAttribute('data-original-text') && el.tagName !== 'I' && el.tagName !== 'SPAN' && !el.classList.contains('fa-key')) {
            el.setAttribute('data-original-text', originalText);
        }
        
        const key = el.getAttribute('data-original-text');
        
        if (isKirill) {
            el.textContent = key;
        } else { // Lotin
            if (TRANSLATIONS[key]) {
                el.textContent = TRANSLATIONS[key];
            }
        }

        if (el.tagName === 'INPUT' && el.type === 'text' && el.placeholder) {
            el.placeholder = isKirill ? Object.keys(TRANSLATIONS).find(k => TRANSLATIONS[k] === el.placeholder) || el.placeholder : TRANSLATIONS[el.placeholder] || el.placeholder;
        }

        if (el.tagName === 'SELECT' && el.options) {
            Array.from(el.options).forEach(option => {
                const originalOptionText = option.getAttribute('data-original-text') || option.textContent.trim();
                if (!option.hasAttribute('data-original-text')) {
                    option.setAttribute('data-original-text', originalOptionText);
                }
                const optionKey = option.getAttribute('data-original-text');

                if (isKirill) {
                    option.textContent = optionKey;
                } else {
                    if (TRANSLATIONS[optionKey]) {
                        option.textContent = TRANSLATIONS[optionKey];
                    }
                }
            });
        }
    });

    // Icons qayta tiklash
    document.querySelectorAll('.category-btn').forEach(btn => {
        const icon = btn.querySelector('i');
        const originalText = btn.getAttribute('data-original-text');
        btn.innerHTML = `${icon.outerHTML} ${isKirill ? originalText : TRANSLATIONS[originalText] || originalText}`;
    });
    
    // Theme tugmasini yangilash
    const themeIcon = toggleThemeBtn.querySelector('i');
    const themeText = isKirill ? 'Қоронғу режим' : 'Qorong‘u rejim';
    toggleThemeBtn.innerHTML = `${themeIcon.outerHTML} ${themeText}`;

    // Admin tugmasini yangilash
    const adminIcon = adminToggleBtn.querySelector('i');
    const adminText = isKirill ? 'Admin Rejim' : 'Admin Rejim'; // Bu text o'zgarmaydi
    adminToggleBtn.innerHTML = `${adminIcon.outerHTML} ${adminText}`;
    
    // Upload tugmasini yangilash
    const uploadBtn = document.querySelector('#uploadForm .btn-primary');
    if (uploadBtn) {
        const uploadIcon = uploadBtn.querySelector('i');
        const uploadText = isKirill ? 'Китоб қўшиш' : 'Kitob qo‘shish';
        uploadBtn.innerHTML = `${uploadIcon.outerHTML} ${uploadText}`;
    }

    filterBooks();
}

toggleLangBtn.addEventListener('click', switchLanguage);


// =================== SPLASH SEQUENCE ===================
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
  const title = isKirill ? book.title : TRANSLATIONS[book.title] || book.title;
  const description = isKirill ? book.description : TRANSLATIONS[book.description] || book.description;
  const category = isKirill ? book.category : TRANSLATIONS[book.category] || book.category;
  
  return `
    <article class="card reveal" data-id="${book.id}">
      <span class="book-category">${category || 'Умумий'}</span>
      <div class="book-title">${title || 'Номсиз китоб'}</div>
      <div class="book-desc">${description || ''}</div>
      <div class="card-actions">
        <button class="btn" data-action="pdf" data-link="${book.link}">
          <i class="fas fa-file-pdf"></i> ${isKirill ? 'PDF' : 'PDF'}
        </button>
        ${isAdmin ? `
          <button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">
            <i class="fas fa-trash"></i> ${isKirill ? 'Ўчириш' : 'O‘chirish'}
          </button>
        ` : ''}
      </div>
    </article>
  `;
}

function renderBooks(list) {
  const noBooksMessage = isKirill ? `Ҳозирча бу ерда китоб йўқ...` : `Hozircha bu yerda kitob yo‘q...`;
  booksContainer.innerHTML = list.length 
    ? list.map(bookCardTemplate).join('') 
    : `<p class="no-books-message">${noBooksMessage}</p>`;
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

// Search input
searchInput.addEventListener('input', filterBooks);

// =================== CATEGORY OVERLAY ===================
function openOverlay(category) {
    activeCategory = category;
    overlayTitle.textContent = category;
    categoryButtons.forEach(b =>
      b.classList.toggle('active', b.dataset.category === activeCategory)
    );
    // faqat shu kategoriyadan kitoblarni chiqaramiz
    const filtered = allBooks.filter(b => b.category === activeCategory);
    overlayBooks.innerHTML = filtered.length
      ? filtered.map(bookCardTemplate).join('')
      : `<p class="no-books-message">${isKirill ? 'Ҳозирча бу ерда китоб йўқ...' : 'Hozircha bu yerda kitob yo‘q...'}</p>`;
    revealAll();
    overlay.hidden = false;
    setTimeout(() => overlay.classList.add('show'), 10);
  }

function closeOverlay() {
    overlay.classList.remove('show');
    setTimeout(() => { overlay.hidden = true; }, 400);
}

overlayClose.addEventListener('click', closeOverlay);

// category tugmalarini yangilash
categoryButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const cat = e.target.closest('.category-btn').dataset.category;
    openOverlay(cat);
  });
});

// =================== PDF MODAL ===================
function showPDFOptions(pdfURL) {
  currentPDF = pdfURL; 
  downloadNotice.hidden = true;
  pdfModal.hidden = false;
  setTimeout(() => pdfModal.classList.add('show'), 10);
}

openPDFBtn.addEventListener('click', () => { 
  if (currentPDF) window.open(currentPDF, '_blank'); 
});

downloadPDFBtn.addEventListener('click', () => {
  if (!currentPDF) return; 
  const a = document.createElement('a'); 
  a.href = currentPDF; 
  a.download = 'kitob.pdf'; 
  document.body.appendChild(a); 
  a.click(); 
  a.remove();
  openDownloaded.href = currentPDF; 
  downloadNotice.hidden = false;
});

modalClose.addEventListener('click', () => {
  pdfModal.classList.remove('show');
  setTimeout(() => { pdfModal.hidden = true; }, 300);
});

pdfModal.addEventListener('click', (e) => { 
  if (e.target === pdfModal) {
    pdfModal.classList.remove('show');
    setTimeout(() => { pdfModal.hidden = true; }, 300);
  }
});

// Delegate actions on cards
booksContainer.addEventListener('click', (e) => {
  const pdfBtn = e.target.closest('[data-action="pdf"]');
  if (pdfBtn) { 
    showPDFOptions(pdfBtn.dataset.link); 
    return; 
  }
  
  const delBtn = e.target.closest('[data-action="delete"]');
  if (delBtn) { 
    deleteBook(delBtn.dataset.id, delBtn.dataset.link); 
  }
});

// =================== ADMIN ===================
adminToggleBtn.addEventListener('click', () => {
  const password = prompt(isKirill ? "Китоб қўшиш ва ўчириш учун паролни киритинг:" : "Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
  if (password === "ibr2010071717.se") {
    isAdmin = true; 
    uploadSection.hidden = false;
    uploadSection.classList.add('reveal');
    setTimeout(() => uploadSection.classList.add('show'), 10);
    filterBooks();
    alert(isKirill ? "✅ Админ режимига муваффақиятли кирдингиз!" : "✅ Admin rejimiga muvaffaqiyatli kirdingiz!");
  } else {
    alert(isKirill ? "❌ Нотўғри парол!" : "❌ Noto‘g‘ri parol!");
  }
});

// =================== UPLOAD ===================
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];
  
  if (!file) { 
    alert(isKirill ? '❌ PDF файл танланмаган!' : '❌ PDF fayl tanlanmagan!'); 
    return; 
  }
  
  try {
    const clean = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const unique = `${Date.now()}_${clean}`;
    const storageRef = firebase.storage().ref(`books/${unique}`);
    const uploadTask = storageRef.put(file, { 
      customMetadata: { secret_code: 'ibr2010071717.se' } 
    });
    
    progressWrap.hidden = false;
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    
    uploadTask.on('state_changed', 
      (snap) => {
        const p = (snap.bytesTransferred / snap.totalBytes) * 100;
        progressBar.style.width = `${p.toFixed(0)}%`;
        progressBar.textContent = `${p.toFixed(0)}%`;
      }, 
      (err) => {
        console.error('❌ Yuklash xatolik:', err);
        progressWrap.hidden = true;
        alert(isKirill ? '❌ Юклашда хатолик: ' + err.message : '❌ Yuklashda xatolik: ' + err.message);
      }, 
      async () => {
        const url = await storageRef.getDownloadURL();
        await firebase.firestore().collection('books').add({ 
          title, 
          description, 
          category, 
          link: url, 
          secret_code: 'ibr2010071717.se',
          created: new Date()
        });
        
        alert(isKirill ? '✅ Китоб муваффақиятли қўшилди!' : '✅ Kitob muvaffaqiyatli qo‘shildi!');
        progressWrap.hidden = true;
        uploadForm.reset();
        uploadSection.hidden = true;
      }
    );
  } catch(err) {
    console.error('❌ Xatolik:', err);
    alert(isKirill ? '❌ Хатолик: ' + err.message : '❌ Xatolik: ' + err.message);
    progressWrap.hidden = true;
  }
});

// =================== DELETE ===================
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) { 
    alert(isKirill ? '❌ Сизда ўчириш ҳуқуқи йўқ!' : '❌ Sizda o‘chirish huquqi yo‘q!'); 
    return; 
  }
  
  if (!confirm(isKirill ? 'Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?' : 'Haqiqatan ham bu kitobni o‘chirmoqchimisiz?')) return;
  
  try {
    await firebase.firestore().collection('books').doc(bookId).delete();
    const ref = firebase.storage().refFromURL(fileURL);
    await ref.delete();
    alert(isKirill ? '✅ Китоб муваффақиятли ўчирилди!' : '✅ Kitob muvaffaqiyatli o‘chirildi!');
  } catch(err) {
    console.error('❌ O‘chirish xatolik:', err);
    alert(isKirill ? '❌ Ўчиришда хатолик: ' + err.message : '❌ O‘chirishda xatolik: ' + err.message);
  }
}

// =================== FIRESTORE SYNC ===================
function loadBooks() {
  firebase.firestore().collection('books').onSnapshot(snap => {
    allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    booksContainer.innerHTML = ""; // 🔥 asosiy sahifada kitoblar ko‘rinmasligi uchun
  }, err => console.error('❌ Firestore xatolik:', err));
}

// =================== REVEAL ON SCROLL ===================
const io = new IntersectionObserver((entries) => {
  for (const e of entries) { 
    if (e.isIntersecting) { 
      e.target.classList.add('show'); 
      io.unobserve(e.target); 
    } 
  }
}, { threshold: 0.1 });

function revealAll() {
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// =================== INIT ===================
loadTheme();
runSplash();
loadBooks();
