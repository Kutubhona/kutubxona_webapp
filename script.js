// 🧩 Elementlar
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const uploadSection = document.getElementById('uploadSection');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadForm = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
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
    booksContainer.innerHTML = list.length
        ? list.map(book => `
            <div class="book-card">
                <h3>${book.title || "Nomsiz kitob"}</h3>
                <p>${book.description || ""}</p>
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
    const filtered = allBooks.filter(book =>
        (!activeCategory || book.category === activeCategory) &&
        (!query || (book.title && book.title.toLowerCase().includes(query)))
    );
    renderBooks(filtered);
}

// 🎯 Kategoriya tugmalari
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        activeCategory = activeCategory === btn.dataset.category ? "" : btn.dataset.category;
        if (activeCategory) btn.classList.add('active');
        filterBooks();
    });
});

// 🔎 Qidiruv
searchInput.addEventListener('input', filterBooks);

// 🌗 Tema boshqaruvi
function updateThemeButton() {
    toggleThemeBtn.textContent = body.classList.contains('dark') ? "🌞 Yorug' rejim" : "🌙 Qorong'u rejim";
}

function loadTheme() {
    body.className = localStorage.getItem('theme') || 'light';
    updateThemeButton();
}

toggleThemeBtn.addEventListener('click', () => {
    body.classList.toggle('light');
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.className);
    updateThemeButton();
});

// 📥 Admin rejim
showUploadBtn.addEventListener('click', () => {
    const password = prompt("Kitob qo‘shish va o‘chirish uchun parolni kiriting:");
    if (password === "ibr2010071717.se") {
        uploadSection.style.display = 'block';
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

    if (!file) {
        alert("❌ PDF fayl tanlanmagan!");
        return;
    }

    try {
        const cleanFileName = file.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
        const uniqueName = `${Date.now()}_${cleanFileName}`;

        const storageRef = firebase.storage().ref(`books/${uniqueName}`);
        const uploadTask = storageRef.put(file, {
            customMetadata: { secret_code: "ibr2010071717.se" }
        });

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = `${progress.toFixed(0)}%`;
                progressBar.textContent = `${progress.toFixed(0)}%`;
            },
            (error) => {
                console.error("❌ Yuklash xatolik:", error);
                progressContainer.style.display = 'none';
                alert("❌ Yuklashda xatolik: " + error.message);
            },
            async () => {
                const fileURL = await storageRef.getDownloadURL();
                await firebase.firestore().collection("books").add({
                    title,
                    description,
                    category,
                    link: fileURL,
                    secret_code: "ibr2010071717.se"
                });

                alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
                progressContainer.style.display = 'none';
                uploadForm.reset();
                uploadSection.style.display = 'none';
            }
        );

    } catch (err) {
        console.error("❌ Xatolik:", err);
        alert("❌ Xatolik: " + err.message);
        progressContainer.style.display = 'none';
    }
});

// 🗑 Kitobni o‘chirish
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

// 🔄 Firestore'dan real vaqtda kitoblarni olish
function loadBooksFromFirestore() {
    firebase.firestore().collection("books").onSnapshot(snapshot => {
        allBooks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        filterBooks();
    }, err => {
        console.error("❌ Firestore xatolik:", err);
    });
}

// 🚀 Boshlang'ich ishga tushirish
loadTheme();
loadBooksFromFirestore();
