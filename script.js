const searchInput = document.getElementById('searchInput');
const toggleThemeBtn = document.getElementById('toggleTheme');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const progressBar = document.getElementById('progressBar');
const progressContainer = document.getElementById('progressContainer');
const booksContainer = document.getElementById('booksContainer');
const pdfOptions = document.getElementById('pdfOptions');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');
const openDownloaded = document.getElementById('openDownloaded');

let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

// 📦 Kitoblarni chiqarish
function renderBooks(list) {
  booksContainer.innerHTML = list.length
    ? list.map(book => `
      <div class="book-card animate__animated animate__fadeInUp">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-desc">${book.description}</p>
        <div class="card-actions">
          <a href="${book.link}" target="_blank" class="btn-primary">📖 PDF</a>
          <button onclick="showPDFOptions('${book.link}')" class="btn-danger">📄 Variantlar</button>
          ${isAdmin ? `<button onclick="deleteBook('${book.id}', '${book.link}')" class="btn-danger">❌ O‘chirish</button>` : ""}
        </div>
      </div>
    `).join('')
    : '<p class="text-center text-gray-500">Hozircha bu yerda kitob yo‘q...</p>';
}

// 📄 PDF variantlari
function showPDFOptions(pdfURL) {
  currentPDF = pdfURL;
  pdfOptions.hidden = false;
  downloadMessage.hidden = true;
}
openPDFBtn.addEventListener('click', () => currentPDF && window.open(currentPDF, "_blank"));
downloadPDFBtn.addEventListener('click', () => {
  if (!currentPDF) return;
  const link = document.createElement("a");
  link.href = currentPDF;
  link.download = "kitob.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  openDownloaded.href = currentPDF;
  downloadMessage.hidden = false;
});

// 🔍 Qidiruv va kategoriya
searchInput.addEventListener('input', filterBooks);
function filterBooks() {
  const query = searchInput.value.toLowerCase();
  const filtered = allBooks.filter(b =>
    (!activeCategory || b.category === activeCategory) &&
    (b.title.toLowerCase().includes(query) || b.description.toLowerCase().includes(query))
  );
  renderBooks(filtered);
}
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    filterBooks();
  });
});

// 🌙 Dark / Light Theme
function updateThemeButton() {
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? "☀️" : "🌙";
}
toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  updateThemeButton();
});
updateThemeButton();

// 🔑 Admin rejim
showUploadBtn.addEventListener('click', () => {
  const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
  if (password === "ibr2010071717.se") {
    uploadSection.hidden = false;
    isAdmin = true;
    filterBooks();
  } else {
    alert("❌ Noto‘g‘ri parol!");
  }
});

// 📤 Yangi kitob qo‘shish
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];
  if (!file) return;

  try {
    const cleanFileName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
    const uniqueName = `${Date.now()}_${cleanFileName}`;
    const storageRef = firebase.storage().ref(`books/${uniqueName}`);
    const uploadTask = storageRef.put(file);

    progressContainer.hidden = false;
    uploadTask.on("state_changed", (snap) => {
      const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
      progressBar.style.width = progress + "%";
      progressBar.textContent = Math.round(progress) + "%";
    });

    await uploadTask;
    const link = await storageRef.getDownloadURL();
    const docRef = await firebase.firestore().collection("books").add({ title, description, category, link });
    allBooks.push({ id: docRef.id, title, description, category, link });
    filterBooks();
    alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
    uploadForm.reset();
    progressContainer.hidden = true;
  } catch (err) {
    console.error(err);
    alert("❌ Kitob qo‘shishda xatolik!");
  }
});

// 🗑 Kitobni o‘chirish
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) return alert("❌ Sizda o‘chirish huquqi yo‘q!");
  if (!confirm("Haqiqatan ham bu kitobni o‘chirmoqchimisiz?")) return;
  try {
    await firebase.firestore().collection("books").doc(bookId).delete();
    const storageRef = firebase.storage().refFromURL(fileURL);
    await storageRef.delete();
    allBooks = allBooks.filter(b => b.id !== bookId);
    filterBooks();
    alert("✅ Kitob muvaffaqiyatli o‘chirildi!");
  } catch (err) {
    console.error(err);
    alert("❌ O‘chirishda xatolik!");
  }
}

// 🔄 Boshlang‘ich yuklash
async function loadBooks() {
  const snapshot = await firebase.firestore().collection("books").get();
  allBooks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  filterBooks();
}
loadBooks();
