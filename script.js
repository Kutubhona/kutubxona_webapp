// 🧩 Elementlar
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const uploadSection = document.getElementById('uploadSection');
const showUploadBtn = document.getElementById('showUploadBtn');
const uploadForm = document.getElementById('uploadForm');
const body = document.body;

let activeCategory = "";
let allBooks = [];

// 📦 Kitoblarni chiqarish
function renderBooks(list) {
    booksContainer.innerHTML = list.length
        ? list.map(book => `
            <div class="book-card">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
                <a href="${book.link}" target="_blank">PDF ni ochish</a>
            </div>
        `).join('')
        : '<p>Hozircha bu yerda kitob yo‘q...</p>';
}

// 🔍 Filtrlash
function filterBooks() {
    const query = searchInput.value.toLowerCase();
    const filtered = allBooks.filter(book =>
        (!activeCategory || book.category === activeCategory) &&
        (!query || book.title.toLowerCase().includes(query))
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

// 📥 Kitob qo‘shish formasi ko‘rsatish
showUploadBtn.addEventListener('click', () => {
    uploadSection.style.display = uploadSection.style.display === 'none' ? 'block' : 'none';
});

// 📤 Yangi kitob qo‘shish
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('bookTitle').value;
    const description = document.getElementById('bookDescription').value;
    const category = document.getElementById('bookCategory').value;
    const file = document.getElementById('bookFile').files[0];

    if (!file) return alert("PDF tanlang!");

    try {
        // Faylni Storage'ga yuklash
        const storageRef = storage.ref(`books/${Date.now()}_${file.name}`);
        await storageRef.put(file);
        const fileURL = await storageRef.getDownloadURL();

        // Firestore'ga yozish
        await db.collection("books").add({
            title,
            description,
            category,
            link: fileURL
        });

        alert("✅ Kitob qo‘shildi!");
        uploadForm.reset();
        uploadSection.style.display = 'none';
    } catch (err) {
        console.error(err);
        alert("❌ Xatolik yuz berdi!");
    }
});

// 🔄 Firestore'dan real vaqtda kitoblarni olish
function loadBooksFromFirestore() {
    db.collection("books").onSnapshot(snapshot => {
        allBooks = snapshot.docs.map(doc => doc.data());
        filterBooks();
    });
}

// 🚀 Boshlang'ich ishga tushirish
loadTheme();
loadBooksFromFirestore();
