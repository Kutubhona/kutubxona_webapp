// Elements
const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category-btn");
const toggleThemeBtn = document.getElementById("toggleTheme");
const uploadSection = document.getElementById("uploadSection");
const showUploadBtn = document.getElementById("showUploadBtn");
const uploadForm = document.getElementById("uploadForm");
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

const pdfOptions = document.getElementById("pdfOptions");
const openPDFBtn = document.getElementById("openPDFBtn");
const downloadPDFBtn = document.getElementById("downloadPDFBtn");
const downloadMessage = document.getElementById("downloadMessage");
const openDownloaded = document.getElementById("openDownloaded");

let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

// Render books
function renderBooks(list) {
  booksContainer.innerHTML = list.length
    ? list.map(book => `
      <div class="book-card">
        <div class="book-title">${book.title || "Nomsiz kitob"}</div>
        <div class="book-desc">${book.description || ""}</div>
        <div class="card-actions">
          <button class="btn btn-ghost" onclick="showPDFOptions('${book.link}')">📄 PDF</button>
          ${isAdmin ? `<button class="btn btn-danger" onclick="deleteBook('${book.id}', '${book.link}')">❌ O‘chirish</button>` : ""}
        </div>
      </div>
    `).join('')
    : "<p style='text-align:center;opacity:0.7;'>Hozircha bu yerda kitob yo‘q...</p>";
}

// PDF options
function showPDFOptions(pdfURL) {
  currentPDF = pdfURL;
  pdfOptions.removeAttribute("hidden");
  downloadMessage.setAttribute("hidden", "");
}
openPDFBtn.addEventListener("click", () => currentPDF && window.open(currentPDF, "_blank"));
downloadPDFBtn.addEventListener("click", () => {
  if (!currentPDF) return;
  const link = document.createElement("a");
  link.href = currentPDF;
  link.download = "kitob.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();

  openDownloaded.href = currentPDF;
  downloadMessage.removeAttribute("hidden");
});

// Filter
function filterBooks() {
  const q = searchInput.value.toLowerCase();
  const filtered = allBooks.filter(book =>
    (!activeCategory || book.category === activeCategory) &&
    (!q || (book.title && book.title.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => b.classList.remove("active"));
    activeCategory = activeCategory === btn.dataset.category ? "" : btn.dataset.category;
    if (activeCategory) btn.classList.add("active");
    filterBooks();
  });
});
searchInput.addEventListener("input", filterBooks);

// Theme toggle
function updateThemeBtn() {
  toggleThemeBtn.textContent = document.body.classList.contains("dark") ? "🌞 Yorug' rejim" : "🌙 Qorong'u rejim";
}
function loadTheme() {
  document.body.className = localStorage.getItem("theme") || "light";
  updateThemeBtn();
}
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.className);
  updateThemeBtn();
});

// Admin rejim
showUploadBtn.addEventListener("click", () => {
  const password = prompt("Kitob qo‘shish/o‘chirish uchun parolni kiriting:");
  if (password === "ibr2010071717.se") {
    uploadSection.removeAttribute("hidden");
    isAdmin = true;
    filterBooks();
  } else {
    alert("❌ Noto‘g‘ri parol!");
  }
});

// Upload
uploadForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("bookTitle").value.trim();
  const description = document.getElementById("bookDescription").value.trim();
  const category = document.getElementById("bookCategory").value;
  const file = document.getElementById("bookFile").files[0];
  if (!file) return alert("❌ PDF fayl tanlanmagan!");

  const cleanName = file.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_\-.]/g,"");
  const uniqueName = `${Date.now()}_${cleanName}`;

  const storageRef = firebase.storage().ref(`books/${uniqueName}`);
  const uploadTask = storageRef.put(file, {customMetadata:{secret_code:"ibr2010071717.se"}});
  progressContainer.removeAttribute("hidden");
  progressBar.style.width="0%"; progressBar.textContent="0%";

  uploadTask.on("state_changed",
    snap => {
      const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
      progressBar.style.width=`${prog.toFixed(0)}%`;
      progressBar.textContent=`${prog.toFixed(0)}%`;
    },
    err => {
      alert("❌ Yuklashda xatolik: "+err.message);
      progressContainer.setAttribute("hidden","");
    },
    async () => {
      const fileURL = await storageRef.getDownloadURL();
      await firebase.firestore().collection("books").add({title,description,category,link:fileURL});
      alert("✅ Kitob qo‘shildi!");
      progressContainer.setAttribute("hidden","");
      uploadForm.reset();
      uploadSection.setAttribute("hidden","");
    }
  );
});

// Delete
async function deleteBook(bookId, fileURL) {
  if (!isAdmin) return alert("❌ Sizda huquq yo‘q!");
  if (!confirm("Haqiqatan ham o‘chirishni xohlaysizmi?")) return;

  try {
    await firebase.firestore().collection("books").doc(bookId).delete();
    const fileRef = firebase.storage().refFromURL(fileURL);
    await fileRef.delete();
    alert("✅ Kitob o‘chirildi!");
  } catch(err) {
    alert("❌ O‘chirishda xatolik: "+err.message);
  }
}

// Listen firestore
firebase.firestore().collection("books").onSnapshot(snap => {
  allBooks = snap.docs.map(doc => ({id:doc.id, ...doc.data()}));
  filterBooks();
});

// Init
window.addEventListener("DOMContentLoaded", loadTheme);
