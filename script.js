const progressBar = document.getElementById('progressBar');
const body = document.body;

// 📄 PDF tanlov oynasi elementlari
const pdfOptions = document.getElementById('pdfOptions');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadMessage = document.getElementById('downloadMessage');
const openDownloaded = document.getElementById('openDownloaded');

let activeCategory = "";
let allBooks = [];
let isAdmin = false; // 🔑 Admin rejimi
let currentPDF = ""; // Hozir tanlangan PDF URL

// 📦 Kitoblarni chiqarish
function renderBooks(list) {
@@ -21,13 +29,42 @@ function renderBooks(list) {
           <div class="book-card">
               <h3>${book.title || "Nomsiz kitob"}</h3>
               <p>${book.description || ""}</p>
                <a href="${book.link}" target="_blank">PDF ni ochish</a>
                <button onclick="showPDFOptions('${book.link}')">📄 PDF variantlari</button>
               ${isAdmin ? `<button onclick="deleteBook('${book.id}', '${book.link}')">❌ O‘chirish</button>` : ""}
           </div>
       `).join('')
: '<p>Hozircha bu yerda kitob yo‘q...</p>';
}

// 📄 PDF tanlov oynasini ko‘rsatish
function showPDFOptions(pdfURL) {
    currentPDF = pdfURL;
    pdfOptions.style.display = 'block';
    downloadMessage.style.display = 'none';
}

// 📖 Brauzerda ochish
openPDFBtn.addEventListener('click', () => {
    if (currentPDF) {
        window.open(currentPDF, "_blank");
    }
});

// ⬇️ Yuklab olish
downloadPDFBtn.addEventListener('click', () => {
    if (!currentPDF) return;
    const link = document.createElement("a");
    link.href = currentPDF;
    link.download = "kitob.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ✅ Xabar va ochish tugmasini ko‘rsatish
    openDownloaded.href = currentPDF;
    downloadMessage.style.display = 'block';
});

// 🔍 Filtrlash
function filterBooks() {
const query = searchInput.value.toLowerCase();
@@ -68,19 +105,19 @@ toggleThemeBtn.addEventListener('click', () => {
updateThemeButton();
});

// 📥 Kitob qo‘shish tugmasi (parol bilan)
// 📥 Admin rejim
showUploadBtn.addEventListener('click', () => {
const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
if (password === "ibr2010071717.se") {
uploadSection.style.display = 'block';
        isAdmin = true; // ✅ Admin rejimi yoqildi
        filterBooks(); // O‘chirish tugmalari ko‘rinadi
        isAdmin = true;
        filterBooks();
} else {
alert("❌ Noto‘g‘ri parol!");
}
});

// 📤 Yangi kitob qo‘shish (progress bar bilan)
// 📤 Yangi kitob qo‘shish
uploadForm.addEventListener('submit', async (e) => {
e.preventDefault();

@@ -95,20 +132,14 @@ uploadForm.addEventListener('submit', async (e) => {
}

try {
        const cleanFileName = file.name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_\-.]/g, '');
        const cleanFileName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
const uniqueName = `${Date.now()}_${cleanFileName}`;

const storageRef = firebase.storage().ref(`books/${uniqueName}`);
const uploadTask = storageRef.put(file, {
            customMetadata: {
                secret_code: "ibr2010071717.se"
            }
            customMetadata: { secret_code: "ibr2010071717.se" }
});

        // 📊 Progress barni ko‘rsatish
progressContainer.style.display = 'block';
progressBar.style.width = '0%';
progressBar.textContent = '0%';
@@ -148,23 +179,18 @@ uploadForm.addEventListener('submit', async (e) => {
}
});

// 🗑 Kitobni o‘chirish (faqat admin)
// 🗑 Kitobni o‘chirish
async function deleteBook(bookId, fileURL) {
if (!isAdmin) {
alert("❌ Sizda o‘chirish huquqi yo‘q!");
return;
}

if (!confirm("Haqiqatan ham bu kitobni o‘chirmoqchimisiz?")) return;

try {
        // Firestore’dan hujjatni o‘chirish
await firebase.firestore().collection("books").doc(bookId).delete();

        // Storage’dan faylni o‘chirish
const storageRef = firebase.storage().refFromURL(fileURL);
await storageRef.delete();

alert("✅ Kitob muvaffaqiyatli o‘chirildi!");
} catch (err) {
console.error("❌ O‘chirish xatolik:", err);
