// =================== FIREBASE INIT ===================
// Canvas tomonidan taqdim etilgan maxsus o'zgaruvchilar
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, onSnapshot, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// Firebase dasturini ishga tushirish
let app, auth, db, storage;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.error("❌ Firebase xatolik:", e);
}

// =================== GLOBAL STATE ===================
let allBooks = [];
let filteredBooks = [];
let currentCategory = 'all';
let isAdmin = false;
let userId = null;

// =================== DOM ELEMENTS ===================
const html = document.documentElement;
const splashScreen = document.getElementById('splash');
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const uploadSection = document.getElementById('uploadSection');
const adminToggleBtn = document.getElementById('adminToggle');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalButtons = document.getElementById('modalButtons');

// =================== UTILITY FUNCTIONS ===================
function showModal(title, message, buttons) {
  modalTitle.textContent = title;
  modalMessage.innerHTML = message;
  modalButtons.innerHTML = '';
  buttons.forEach(btn => {
    const buttonElement = document.createElement('button');
    buttonElement.textContent = btn.text;
    buttonElement.className = `btn ${btn.className}`;
    buttonElement.onclick = btn.handler;
    modalButtons.appendChild(buttonElement);
  });
  modal.classList.add('show');
}

function hideModal() {
  modal.classList.remove('show');
}

// =================== FIREBASE AUTHENTICATION ===================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    userId = user.uid;
    // Admins IDs - for demonstration purposes only.
    // In a real application, this should be handled securely on the backend.
    const adminUids = ['EXAMPLE_ADMIN_UID_1', 'EXAMPLE_ADMIN_UID_2']; 
    isAdmin = adminUids.includes(userId);
    console.log("✅ Foydalanuvchi tizimga kirdi:", userId, "Admin:", isAdmin);
    
    // UI ni yangilash
    adminToggleBtn.style.display = isAdmin ? 'block' : 'none';
    if (isAdmin) {
      uploadSection.style.display = 'block';
    }
    
    // Kitoblarni yuklashni boshlash
    loadBooks();
    
    // Splash screenni o'chirish
    splashScreen.classList.add('splash-fade-out');
    setTimeout(() => { splashScreen.style.display = 'none'; }, 800);
  } else {
    userId = null;
    isAdmin = false;
    console.log("❌ Foydalanuvchi tizimdan chiqdi.");
    // Kitoblarni o'chirish
    booksContainer.innerHTML = '<h2>Kitoblar topilmadi.</h2>';
    
    // Anonim tarzda kirish
    if (initialAuthToken) {
        await signInWithCustomToken(auth, initialAuthToken).catch((error) => {
            console.error("❌ Maxsus token bilan kirishda xatolik:", error);
        });
    } else {
        console.log("Anonim kirish...");
    }
  }
});

// =================== THEME TOGGLE ===================
toggleThemeBtn.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

// =================== ADMIN TOGGLE ===================
adminToggleBtn.addEventListener('click', () => {
  const isHidden = uploadSection.style.display === 'none';
  uploadSection.style.display = isHidden ? 'block' : 'none';
});

// =================== UI RENDER ===================
function renderBooks(books) {
  booksContainer.innerHTML = '';
  if (books.length === 0) {
    booksContainer.innerHTML = '<p class="text-center w-full">Hech qanday kitob topilmadi.</p>';
    return;
  }
  
  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'card reveal';
    card.dataset.id = book.id;
    card.innerHTML = `
      <h3 class="book-title">${book.title}</h3>
      <p class="book-desc">${book.description}</p>
      <div class="card-actions">
          <button class="btn btn-primary open-pdf-btn"><i class="fas fa-eye"></i> O‘qish</button>
          <button class="btn btn-danger delete-btn"><i class="fas fa-trash"></i> O‘chirish</button>
      </div>
    `;
    
    // PDFni ochish tugmasi
    const openBtn = card.querySelector('.open-pdf-btn');
    openBtn.addEventListener('click', () => {
      window.open(book.url, '_blank');
    });
    
    // Kitobni o'chirish tugmasi (faqat adminlar uchun)
    const deleteBtn = card.querySelector('.delete-btn');
    if (isAdmin) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteBook(book.id, book.fileRef);
      });
    } else {
      deleteBtn.style.display = 'none';
    }
    
    booksContainer.appendChild(card);
  });
}

function filterBooks() {
  filteredBooks = allBooks.filter(book => {
    const matchesCategory = currentCategory === 'all' || book.category === currentCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
                          book.description.toLowerCase().includes(searchInput.value.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  renderBooks(filteredBooks);
}

// =================== EVENT LISTENERS ===================
searchInput.addEventListener('input', filterBooks);

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    filterBooks();
  });
});

// =================== UPLOAD FORM ===================
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value;
  const description = document.getElementById('bookDescription').value;
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];
  
  if (!file) return;
  
  const storageRef = ref(storage, `books/${file.name}_${Date.now()}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  progressWrap.hidden = false;
  progressBar.style.width = '0%';
  
  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressBar.style.width = progress + '%';
      progressBar.textContent = `${Math.round(progress)}%`;
    },
    (error) => {
      console.error("❌ Yuklashda xatolik:", error);
      showModal('Xatolik', `<p>Faylni yuklashda xatolik yuz berdi: ${error.message}</p>`, [{ text: 'Yopish', className: 'btn-danger', handler: hideModal }]);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      try {
        const bookData = {
          title,
          description,
          category,
          url: downloadURL,
          fileRef: uploadTask.snapshot.ref.fullPath,
          createdAt: new Date()
        };
        const booksCollection = collection(db, `artifacts/${appId}/public/data/books`);
        await addDoc(booksCollection, bookData);
        
        showModal('Muvaffaqiyatli!', '✅ Kitob muvaffaqiyatli qo‘shildi!', [{ text: 'Yopish', className: 'btn-primary', handler: hideModal }]);
        uploadForm.reset();
        progressWrap.hidden = true;
      } catch (err) {
        console.error("❌ Firestore xatolik:", err);
        showModal('Xatolik', `<p>Kitob ma'lumotlarini saqlashda xatolik: ${err.message}</p>`, [{ text: 'Yopish', className: 'btn-danger', handler: hideModal }]);
      }
    }
  );
});

// =================== DELETE FUNCTION ===================
async function deleteBook(bookId, fileRefPath) {
  showModal(
    'O‘chirishni tasdiqlang',
    '<p>Haqiqatan ham bu kitobni o‘chirmoqchimisiz?</p>',
    [
      { text: 'Yo‘q', className: 'btn-ghost', handler: hideModal },
      { text: 'Ha, o‘chirish', className: 'btn-danger', handler: async () => {
          hideModal();
          try {
            await deleteDoc(doc(db, `artifacts/${appId}/public/data/books/${bookId}`));
            const fileRef = ref(storage, fileRefPath);
            await deleteObject(fileRef);
            showModal('Muvaffaqiyatli!', '✅ Kitob muvaffaqiyatli o‘chirildi!', [{ text: 'Yopish', className: 'btn-primary', handler: hideModal }]);
          } catch(err) {
            console.error('❌ O‘chirishda xatolik:', err);
            showModal('Xatolik', `<p>O‘chirishda xatolik: ${err.message}</p>`, [{ text: 'Yopish', className: 'btn-danger', handler: hideModal }]);
          }
        }
      }
    ]
  );
}

// =================== FIRESTORE SYNC ===================
function loadBooks() {
  const booksCollection = collection(db, `artifacts/${appId}/public/data/books`);
  onSnapshot(booksCollection, (snapshot) => {
    allBooks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    filterBooks();
  }, (err) => {
    console.error('❌ Firestore xatolik:', err);
  });
}

// =================== REVEAL ANIMATION ===================
window.addEventListener('scroll', () => {
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => {
    const elTop = el.getBoundingClientRect().top;
    if (elTop < window.innerHeight - 100) {
      el.classList.add('show');
    }
  });
});
