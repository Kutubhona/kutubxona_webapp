// 📚 Kitoblar ro‘yxati Firestore’dan olinadi
let books = [];

// 🧩 Elementlarni olish
const booksContainer   = document.getElementById('booksContainer');
const searchInput      = document.getElementById('searchInput');
const categoryButtons  = document.querySelectorAll('.category-btn');
const toggleThemeBtn   = document.getElementById('toggleTheme');
const uploadForm       = document.getElementById('uploadForm');
const showUploadBtn    = document.getElementById('showUploadBtn');
const uploadSection    = document.getElementById('uploadSection');
const body             = document.body;

let activeCategory = "";

// 📦 Kitoblarni render qilish
function renderBooks(filteredBooks) {
    booksContainer.innerHTML = '';
    if (filteredBooks.length === 0) return;

    filteredBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const pdfButton = `
            <a href="${book.link}" target="_blank" rel="noopener noreferrer">📖 PDF ni ochish</a>
            <a href="${book.link}" download style="display:block; margin-top:6px;">⬇️ Yuklab olish</a>
        `;

        card.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            ${pdfButton}
        `;
        booksContainer.appendChild(card);
    });
}

// 🔍 Filtrlash
function filterBooks() {
    const query = searchInput.value.toLowerCase();
    let filtered = books;

    if (activeCategory) {
        filtered = filtered.filter(book => book.category === activeCategory);
    }
    if (query) {
        filtered = filtered.filter(book => book.title.toLowerCase().includes(query));
    }

    renderBooks(filtered);
}

// 📊 Kategoriya sonlarini yangilash
function updateCategoryCounts() {
    categoryButtons.forEach(btn => {
        const category = btn.dataset.category;
        const count = books.filter(book => book.category === category).length;
        btn.textContent = `${category} (${count})`;
    });
}

// 🚀 Firestore’dan kitoblarni olish
function loadBooksFromFirestore() {
    db.collection("books").orderBy("title").onSnapshot(snapshot => {
        books = snapshot.docs.map(doc => doc.data());
        updateCategoryCounts();
        filterBooks();
    });
}

// 🎯 Kategoriya tugmalari
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        if (activeCategory === btn.dataset.category) {
            activeCategory = "";
        } else {
            activeCategory = btn.dataset.category;
            btn.classList.add('active');
        }
        filterBooks();
    });
});

// 🔎 Qidiruv
searchInput.addEventListener('input', filterBooks);

// 🌗 Tema yuklash
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) body.className = savedTheme;
    toggleThemeBtn.textContent = body.classList.contains('dark')
        ? "🌞 Yorug' rejim"
        : "🌙 Qorong'u rejim";
}
loadTheme();

// 🌗 Tema o‘zgartirish
toggleThemeBtn.addEventListener('click', () => {
    body.classList.toggle('light');
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.className);
    toggleThemeBtn.textContent = body.classList.contains('dark')
        ? "🌞 Yorug' rejim"
        : "🌙 Qorong'u rejim";
});

// 📥 Kitob qo‘shish tugmasi — parol tekshirish
showUploadBtn.addEventListener('click', () => {
    const password = prompt("Kitob qo‘shish uchun parolni kiriting:");
    if (password === "ibr2010071717.se") {
        uploadSection.style.display = "block";
        showUploadBtn.style.display = "none";
    } else {
        alert("❌ Noto‘g‘ri parol!");
    }
});

// 📤 Forma yuborilganda — PDF’ni Firebase Storage’ga yuklash
uploadForm.addEventListener('submit', async e => {
    e.preventDefault();

    const title       = document.getElementById('bookTitle').value.trim();
    const description = document.getElementById('bookDescription').value.trim();
    const category    = document.getElementById('bookCategory').value;
    const fileInput   = document.getElementById('bookFile');

    if (!title || !description || !category || fileInput.files.length === 0) {
        alert("Iltimos, barcha maydonlarni to‘ldiring.");
        return;
    }

    const file = fileInput.files[0];
    const storageRef = storage.ref(`pdf/${Date.now()}_${file.name}`);

    try {
        // Faylni yuklash
        await storageRef.put(file);
        const fileURL = await storageRef.getDownloadURL();

        // Firestore’ga yozish
        await db.collection("books").add({
            title,
            description,
            category,
            link: fileURL
        });

        alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
        uploadForm.reset();
    } catch (error) {
        console.error("Xatolik:", error);
        alert("❌ Yuklashda xatolik yuz berdi");
    }
});

// 📥 Boshlash
loadBooksFromFirestore();
