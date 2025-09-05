// ==================== 🧩 ELEMENTLARNI TANLASH ====================
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const body = document.body;

// 📄 Modal va forma elementlari
const adminModal = document.getElementById('adminModal');
const adminForm = document.getElementById('adminForm');
const closeButtons = document.querySelectorAll('.modal-content .close-btn');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const pdfOptions = document.getElementById('pdfOptions');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');

let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

const ADMIN_PASSWORD = "ibr2010071717.se";

// ==================== 📦 KITOBLARNI CHIQARISH ====================
function renderBooks(list) {
  booksContainer.innerHTML = list.length
    ? list.map((book, index) => `
      <div class="book-card reveal" style="--i: ${index};">
        <div class="book-title">${book.title || "Nomsiz kitob"}</div>
        <div class="book-desc">${book.description || ""}</div>
        <div class="card-actions">
          <button class="btn btn-ghost" onclick="showPDFOptions('${book.link}')">
            <i class="fas fa-file-pdf"></i> PDF
          </button>
          ${isAdmin ? `<button class="btn btn-danger" onclick="deleteBook('${book.id}', '${book.link}')">
            <i class="fas fa-trash-alt"></i> O‘chirish
          </button>` : ""}
        </div>
      </div>
    `).join('')
    : '<p class="no-books">Hozircha bu yerda kitob yo‘q...</p>';
}

// ==================== 📄 PDF TANLOV OYNASI ====================
function showPDFOptions(pdfURL) {
  currentPDF = pdfURL;
  pdfOptions.classList.add('show');
}
openPDFBtn.addEventListener('click', () => {
  if (currentPDF) window.open(currentPDF, "_blank");
});
downloadPDFBtn.addEventListener('click', () => {
  if (!currentPDF) return;
  const link = document.createElement("a");
  link.href = currentPDF;
  link.download = "kitob.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  downloadMessage.classList.add('show');
  setTimeout(() => downloadMessage.classList.remove('show'), 5000);
});

// ==================== 🔍 FILTRLASH VA QIDIRUV ====================
function filterBooks() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = allBooks.filter(book =>
    (!activeCategory || book.category === activeCategory) &&
    (!query || (book.title && book.title.toLowerCase().includes(query)) || (book.description && book.description.toLowerCase().includes(query)))
  );
  renderBooks(filtered);
}
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => b.classList.remove('active'));
    if (btn.dataset.category === activeCategory) {
      activeCategory = "";
    } else {
      activeCategory = btn.dataset.category;
      btn.classList.add('active');
    }
    filterBooks();
  });
});
searchInput.addEventListener('input', filterBooks);

// ==================== 🌗 TEMA BOSHQARUVI ====================
function updateThemeButton() {
  toggleThemeBtn.innerHTML = body.classList.contains('dark') ? "🌞 Yorug' rejim" : "🌙 Qorong'u rejim";
}
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  body.className = savedTheme;
  updateThemeButton();
}
toggleThemeBtn.addEventListener('click', () => {
  body.classList.toggle('light');
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.className);
  updateThemeButton();
});

// ==================== 🔑 ADMIN REJIM MODAL ====================
showUploadBtn.addEventListener('click', () => {
  adminModal.classList.add('show');
});
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    adminModal.classList.remove('show');
    uploadSection.removeAttribute('hidden');
    filterBooks();
    alert("✅ Admin rejimiga muvaffaqiyatli kirildi!");
  } else {
    alert("❌ Noto‘g‘ri parol!");
  }
});
closeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal-overlay').classList.remove('show');
  });
});

// ==================== 📤 YANGI KITOB QO‘SHISH ====================
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];

  if (!file) {
    alert("❌ PDF fayl tanlanmagan!");
    return;
  }
  
  // Parol tekshiruvi. Bu xavfsizlik uchun emas, faqat UI uchun!
  if (!isAdmin) {
    alert("❌ Sizda kitob qo'shish huquqi yo'q!");
    return;
  }

  try {
    const cleanFileName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
    const uniqueName = `${Date.now()}_${cleanFileName}`;
    const storageRef = firebase.storage().ref(`books/${uniqueName}`);
    const uploadTask = storageRef.put(file);

    progressContainer.removeAttribute('hidden');
    uploadForm.style.display = 'none';

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressBar.style.width = `${progress.toFixed(0)}%`;
        progressBar.textContent = `${progress.toFixed(0)}%`;
      },
      (error) => {
        console.error("❌ Yuklash xatolik:", error);
        progressContainer.setAttribute('hidden', '');
        uploadForm.style.display = 'block';
        alert("❌ Yuklashda xatolik: " + error.message);
      },
      async () => {
        const fileURL = await storageRef.getDownloadURL();
        await firebase.firestore().collection("books").add({
          title,
          description,
          category,
          link: fileURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
        progressContainer.setAttribute('hidden', '');
        uploadForm.style.display = 'block';
        uploadForm.reset();
        uploadSection.setAttribute('hidden', '');
      }
    );

  } catch (err) {
    console.error("❌ Xatolik:", err);
    alert("❌ Xatolik: " + err.message);
  }
});

// ==================== 🗑 KITOBNI O‘CHIRISH ====================
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) {
    alert("❌ Sizda o‘chirish huquqi yo‘q!");
    return;
  }
  if (!confirm("Haqiqatan ham bu kitobni o‘chirmoqchimisiz?")) return;
  try {
    await firebase.firestore().collection("books").doc(bookId).delete();
    const storageRef = firebase.storage().refFromURL(fileURL);
    await storageRef.delete();
    alert("✅ Kitob muvaffaqiyatli o‘chirildi!");
  } catch (err) {
    console.error("❌ O‘chirish xatolik:", err);
    alert("❌ O‘chirishda xatolik: " + err.message);
  }
}

// ==================== 🔄 FIRESTORE'DAN KITOBLARNI O‘QISH ====================
function loadBooksFromFirestore() {
  firebase.firestore().collection("books").orderBy("createdAt", "desc").onSnapshot(snapshot => {
    allBooks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    filterBooks();
  }, err => {
    console.error("❌ Firestore xatolik:", err);
  });
}

// ==================== 🚀 BOSHLANG‘ICH ISHGA TUSHIRISH ====================
document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadBooksFromFirestore();
});
