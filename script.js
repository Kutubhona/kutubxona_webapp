document.addEventListener('DOMContentLoaded', () => {
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
    const overlayClose = document.getElementById('overlayClose');
  
    // Modal elements
    const pdfModal = document.getElementById('pdfModal');
    const openPDFBtn = document.getElementById('openPDFBtn');
    const downloadPDFBtn = document.getElementById('downloadPDFBtn');
    const modalCloseBtn = pdfModal.querySelector('.modal-close');
    const downloadNotice = document.getElementById('downloadNotice');
    const openDownloaded = document.getElementById('openDownloaded');
  
    // Category Overlay elements
    const categoryOverlay = document.getElementById('categoryOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayBooks = document.getElementById('overlayBooks');
  
    // =================== VARIABLES ===================
    let allBooks = [];
    let isAdmin = false;
    let isKirill = html.lang === 'uz';
    let currentPDFUrl = '';
  
    // =================== UTILS ===================
    function getTranslation(key, lang = html.lang) {
      const translations = {
        uz: {
          "libraryTitle": "Премиум Кутубхона",
          "librarySubtitle": "Ассалому алайкум! Кутубхонага хуш келибсиз!",
          "searchPlaceholder": "Китоб номи ёки муаллиф...",
          "allBooks": "Барча китоблар",
          "addNewBook": "Янги китоб қўшиш",
          "adminPanel": "Админ панели",
          "enterBookTitle": "Китоб номини киритинг",
          "enterAuthor": "Муаллифни киритинг",
          "selectCategory": "Категорияни танланг",
          "addBookBtn": "Китоб қўшиш",
          "uploading": "Юкланмоқда...",
          "uploadSuccess": "✅ Китоб муваффақиятли қўшилди!",
          "uploadError": "❌ Юклашда хатолик:",
          "deleteConfirm": "Ҳақиқатан ҳам бу китобни ўчирмоқчимисиз?",
          "deleteSuccess": "✅ Китоб муваффақиятли ўчирилди!",
          "deleteError": "❌ Ўчиришда хатолик:",
          "overlayTitle": "Китоблар",
          "whatToDoWithPDF": "PDF билан нима қилмоқчисиз?",
          "openInBrowser": "Браузерда очиш",
          "download": "Юклаб олиш",
          "downloadSuccess": "✅ PDF қурилмангизга муваффақиятли юкланди!",
          "openDownloadedPDF": "Юкланган PDF'ни очиш",
          "loginMessage": "Сиз администратор сифатида киришингиз керак.",
          "booksFound": "топилди",
          "noBooksFound": "Ҳеч қандай китоб топилмади. ",
          "bookCategory": "Категория",
        },
        latin: {
          "libraryTitle": "Premium Kutubxona",
          "librarySubtitle": "Assalomu alaykum! Kutubxonaga xush kelibsiz!",
          "searchPlaceholder": "Kitob nomi yoki muallif...",
          "allBooks": "Barcha kitoblar",
          "addNewBook": "Yangi kitob qo‘shish",
          "adminPanel": "Admin paneli",
          "enterBookTitle": "Kitob nomini kiriting",
          "enterAuthor": "Muallifni kiriting",
          "selectCategory": "Kategoriyani tanlang",
          "addBookBtn": "Kitob qo‘shish",
          "uploading": "Yuklanmoqda...",
          "uploadSuccess": "✅ Kitob muvaffaqiyatli qo‘shildi!",
          "uploadError": "❌ Yuklashda xatolik:",
          "deleteConfirm": "Haqiqatan ham bu kitobni o‘chirmoqchimisiz?",
          "deleteSuccess": "✅ Kitob muvaffaqiyatli o‘chirildi!",
          "deleteError": "❌ O‘chirishda xatolik:",
          "overlayTitle": "Kitoblar",
          "whatToDoWithPDF": "PDF bilan nima qilmoqchisiz?",
          "openInBrowser": "Brauzerda ochish",
          "download": "Yuklab olish",
          "downloadSuccess": "✅ PDF qurilmangizga muvaffaqiyatli yuklandi!",
          "openDownloadedPDF": "Yuklangan PDF'ni ochish",
          "loginMessage": "Siz administrator sifatida kirishingiz kerak.",
          "booksFound": "topildi",
          "noBooksFound": "Hech qanday kitob topilmadi. ",
          "bookCategory": "Kategoriya",
        }
      };
      return translations[lang][key] || key;
    }
  
    function updateTexts() {
      const lang = html.lang;
      isKirill = lang === 'uz';
      document.querySelector('header h1').textContent = getTranslation('libraryTitle', lang);
      document.querySelector('header .subtitle').textContent = getTranslation('librarySubtitle', lang);
      document.getElementById('searchInput').placeholder = getTranslation('searchPlaceholder', lang);
      document.getElementById('allBooksBtn').textContent = getTranslation('allBooks', lang);
      document.getElementById('uploadSectionTitle').textContent = getTranslation('addNewBook', lang);
      document.getElementById('adminToggle').textContent = getTranslation('adminPanel', lang);
      document.getElementById('bookTitle').placeholder = getTranslation('enterBookTitle', lang);
      document.getElementById('bookAuthor').placeholder = getTranslation('enterAuthor', lang);
      document.getElementById('bookCategory').querySelector('option[value=""]').textContent = getTranslation('selectCategory', lang);
      document.getElementById('uploadForm').querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-upload"></i> ${getTranslation('addBookBtn', lang)}`;
      document.getElementById('pdfModal').querySelector('h3').innerHTML = `<i class="fas fa-file-pdf"></i> ${getTranslation('whatToDoWithPDF', lang)}`;
      openPDFBtn.innerHTML = `<i class="fas fa-eye"></i> ${getTranslation('openInBrowser', lang)}`;
      downloadPDFBtn.innerHTML = `<i class="fas fa-download"></i> ${getTranslation('download', lang)}`;
      downloadNotice.querySelector('p').innerHTML = `<i class="fas fa-check-circle"></i> ${getTranslation('downloadSuccess', lang)}`;
      openDownloaded.innerHTML = `<i class="fas fa-external-link-alt"></i> ${getTranslation('openDownloadedPDF', lang)}`;
      document.getElementById('overlayTitle').textContent = getTranslation('overlayTitle', lang);
    }
  
    // =================== TEMA VA TIL ALMASHISH ===================
    toggleThemeBtn.addEventListener('click', () => {
      if (html.dataset.theme === 'dark') {
        html.dataset.theme = 'light';
      } else {
        html.dataset.theme = 'dark';
      }
    });
  
    toggleLangBtn.addEventListener('click', () => {
      if (html.lang === 'uz') {
        html.lang = 'latin';
      } else {
        html.lang = 'uz';
      }
      updateTexts();
      // Til o'zgarganda qidiruv natijalarini tozalash uchun
      filterAndRenderBooks();
    });
  
    // =================== FUNCTIONS ===================
    function createBookCard(book, parentElement) {
      const card = document.createElement('div');
      card.className = 'card reveal';
      card.dataset.bookId = book.id;
  
      const transliterateText = (text) => {
        return isKirill ? transliterate(text) : text;
      };
      
      card.innerHTML = `
        <span class="book-category">${transliterateText(book.category) || transliterateText(getTranslation('bookCategory', html.lang))}</span>
        <h2 class="book-title">${transliterateText(book.title)}</h2>
        <p class="book-desc">${transliterateText(book.author)}</p>
        <div class="card-actions">
          <button class="btn btn-primary open-pdf-btn"><i class="fas fa-eye"></i></button>
          <button class="btn btn-danger delete-btn" ${isAdmin ? '' : 'hidden'}><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
  
      const openBtn = card.querySelector('.open-pdf-btn');
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(book);
      });
  
      const deleteBtn = card.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBook(book.id, book.fileURL);
      });
  
      parentElement.appendChild(card);
    }
  
    function renderBooks(books, container) {
      container.innerHTML = '';
      books.forEach(book => createBookCard(book, container));
      
      // Animatsiya uchun
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          } else {
            entry.target.classList.remove('show');
          }
        });
      });
      
      container.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }
  
    function filterAndRenderBooks() {
      const searchTerm = searchInput.value.toLowerCase();
      
      if (searchTerm.length > 0) {
        const filteredBooks = allBooks.filter(book => 
          (isKirill ? transliterate(book.title) : book.title).toLowerCase().includes(searchTerm) ||
          (isKirill ? transliterate(book.author) : book.author).toLowerCase().includes(searchTerm)
        );
        renderBooks(filteredBooks, booksContainer);
        if (filteredBooks.length === 0) {
          booksContainer.innerHTML = `<p class="center-text">${getTranslation('noBooksFound')}</p>`;
        }
      } else {
        // Asosiy sahifada kitoblarni ko'rsatmaslik uchun booksContainer'ni tozalash
        booksContainer.innerHTML = '';
      }
    }
  
    function showOverlay(category, books) {
      overlayTitle.textContent = isKirill ? transliterate(category) : category;
      overlayBooks.innerHTML = '';
      const filteredBooks = books.filter(b => b.category === category);
      renderBooks(filteredBooks, overlayBooks);
      
      const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
      if (categoryBtn) {
        const computedStyle = getComputedStyle(categoryBtn);
        const background = computedStyle.background;
        categoryOverlay.style.setProperty('--active-cat-bg', background);
      }
      
      categoryOverlay.classList.add('show');
    }
  
    function hideOverlay() {
      categoryOverlay.classList.remove('show');
    }
  
    // =================== EVENTS ===================
    searchInput.addEventListener('input', filterAndRenderBooks);
  
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        showOverlay(category, allBooks);
      });
    });
  
    overlayClose.addEventListener('click', hideOverlay);
    categoryOverlay.addEventListener('click', (e) => {
      if (e.target === categoryOverlay) {
        hideOverlay();
      }
    });
  
    document.getElementById('allBooksBtn').addEventListener('click', () => {
      // Barcha kitoblar tugmasi bosilganda asosiy sahifani tozalash
      booksContainer.innerHTML = '';
      searchInput.value = '';
    });
  
    // Admin panelini ko'rsatish/yashirish
    adminToggleBtn.addEventListener('click', () => {
      isAdmin = !isAdmin;
      uploadSection.hidden = !isAdmin;
      document.querySelectorAll('.delete-btn').forEach(btn => btn.hidden = !isAdmin);
    });
  
    // Fayl yuklash
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = document.getElementById('bookFile').files[0];
      const title = document.getElementById('bookTitle').value;
      const author = document.getElementById('bookAuthor').value;
      const category = document.getElementById('bookCategory').value;
  
      if (!file || !title || !author || !category) {
        console.error('Barcha maydonlar to\'ldirilishi shart!');
        return;
      }
  
      const storageRef = firebase.storage().ref();
      const fileRef = storageRef.child(`books/${file.name}`);
      const uploadTask = fileRef.put(file);
  
      progressWrap.hidden = false;
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = progress + '%';
          progressBar.textContent = `${Math.round(progress)}%`;
        }, 
        (error) => {
          console.error(getTranslation('uploadError'), error);
          alert(`${getTranslation('uploadError')}: ${error.message}`);
          progressWrap.hidden = true;
        }, 
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(async (downloadURL) => {
            try {
              await firebase.firestore().collection('books').add({
                title: title,
                author: author,
                category: category,
                fileURL: downloadURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
              });
              alert(getTranslation('uploadSuccess'));
              uploadForm.reset();
              progressWrap.hidden = true;
            } catch (err) {
              console.error('❌ Firestorega saqlashda xatolik:', err);
              alert(`${getTranslation('uploadError')}: ${err.message}`);
            }
          });
        }
      );
    });
  
    // Modal funksiyalari
    function openModal(book) {
      currentPDFUrl = book.fileURL;
      pdfModal.hidden = false;
      downloadNotice.hidden = true;
      openPDFBtn.disabled = false;
      downloadPDFBtn.disabled = false;
    }
  
    modalCloseBtn.addEventListener('click', () => pdfModal.hidden = true);
    pdfModal.addEventListener('click', (e) => {
      if (e.target === pdfModal) {
        pdfModal.hidden = true;
      }
    });
  
    // PDF'ni ochish
    openPDFBtn.addEventListener('click', () => {
      if (currentPDFUrl) {
        window.open(currentPDFUrl, '_blank');
      }
      pdfModal.hidden = true;
    });
  
    // PDF'ni yuklash
    downloadPDFBtn.addEventListener('click', async () => {
      if (currentPDFUrl) {
        try {
          const response = await fetch(currentPDFUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = currentPDFUrl.split('/').pop().split('?')[0];
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          
          downloadNotice.hidden = false;
          openDownloaded.href = url;
          
        } catch (err) {
          console.error('❌ Yuklashda xatolik:', err);
          alert(`${getTranslation('downloadError')}: ${err.message}`);
        }
      }
      pdfModal.hidden = true;
    });
  
    // Kitobni o'chirish
    async function deleteBook(bookId, fileURL) {
      if (!isAdmin) {
        console.warn(getTranslation('loginMessage'));
        return;
      }
      
      if (!confirm(getTranslation('deleteConfirm'))) return;
      
      try {
        await firebase.firestore().collection('books').doc(bookId).delete();
        const ref = firebase.storage().refFromURL(fileURL);
        await ref.delete();
        alert(getTranslation('deleteSuccess'));
      } catch(err) {
        console.error('❌ O‘chirish xatolik:', err);
        alert(`${getTranslation('deleteError')}: ${err.message}`);
      }
    }
  
    // =================== FIRESTORE SYNC ===================
    function loadBooks() {
      firebase.firestore().collection('books').onSnapshot(snap => {
        allBooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        filterAndRenderBooks(); 
      }, err => console.error('❌ Firestore xatolik:', err));
    }
  
    // =================== REVEAL ON SCROLL ===================
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(element => io.observe(element));
  
    // Transliteratsiya funksiyasi
    const transliterationMap = {
      "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo", "ж": "j",
      "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
      "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "x", "ц": "s",
      "ч": "ch", "ш": "sh", "щ": "sh", "ъ": "'", "ы": "i", "ь": "'", "э": "e",
      "ю": "yu", "я": "ya", "А": "A", "Б": "B", "В": "V", "Г": "G", "Д": "D",
      "Е": "E", "Ё": "Yo", "Ж": "J", "З": "Z", "И": "I", "Й": "Y", "К": "K",
      "Л": "L", "М": "M", "Н": "N", "О": "O", "П": "P", "Р": "R", "С": "S",
      "Т": "T", "У": "U", "Ф": "F", "Х": "X", "Ц": "S", "Ч": "Ch", "Ш": "Sh",
      "Щ": "Sh", "Ъ": "'", "Ы": "I", "Ь": "'", "Э": "E", "E", "Ю": "Yu", "Я": "Ya",
      "ғ": "g‘", "қ": "q", "ў": "o‘", "ҳ": "h", "Ғ": "G‘", "Қ": "Q", "Ў": "O‘", "Ҳ": "H",
      "ʼ": "'", 
      "‘": "'", "’": "'", "“": "\"", "”": "\"",
    };
    function transliterate(text) {
      if (!text) return "";
      return text.split('').map(char => transliterationMap[char] || char).join('');
    }
  
    // Initial calls
    loadBooks();
    updateTexts();
  
    // Splash screen
    window.addEventListener('load', () => {
      document.getElementById('splash').classList.add('splash-fade-out');
      setTimeout(() => {
        document.getElementById('splash').hidden = true;
      }, 800);
    });
  });
