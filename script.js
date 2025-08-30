// 📚 Kitoblar ma'lumotlari
const books = [
    {
        title: "Tarixi Tabariy",
        category: "Tarix",
        link: "pdf/tarix/TARIXI_TABARIY_PDF.pdf",
        description: "Tarixiy hadislar to‘plami."
    },
    {
        title: "Fiqh Asoslari",
        category: "Fiqh",
        link: "pdf/fiqh/fiqh1.pdf",
        description: "Fiqh asoslari va qoidalari."
    }
];

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

// 🔍 Filter funksiyasi: kategoriya + qidiruv
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

// 📊 Kategoriya tugmalariga kitob sonini qo‘shish
function updateCategoryCounts() {
    categoryButtons.forEach(btn => {
        const category = btn.dataset.category;
        const count = books.filter(book => book.category === category).length;
        btn.textContent = `${category} (${count})`;
    });
}

// 🚀 Sahifa yuklanganda
renderBooks([]);
updateCategoryCounts();

// 🎯 Kategoriya tugmasi bosilganda
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

// 🔎 Qidiruv oynasi
searchInput.addEventListener('input', filterBooks);

// 🌗 Yorug‘/qorong‘u rejimni yuklash
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) body.className = savedTheme;
    toggleThemeBtn.textContent = body.classList.contains('dark')
        ? "🌞 Yorug' rejim"
        : "🌙 Qorong'u rejim";
}
loadTheme();

// 🌗 Rejim tugmasi bosilganda
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

// 📥 Forma ishlashi — qurilmadan PDF tanlash
uploadForm.addEventListener('submit', e => {
    e.preventDefault();

    const title       = document.getElementById('bookTitle').value.trim();
    const description = document.getElementById('bookDescription').value.trim();
    const category    = document.getElementById('bookCategory').value;
    const fileInput   = document.getElementById('bookFile');

    if (!title || !description || !category || fileInput.files.length === 0) {
        alert("Iltimos, barcha maydonlarni to‘ldiring.");
        return;
    }

    // Tanlangan PDF faylga vaqtinchalik URL yaratamiz
    const file = fileInput.files[0];
    const fileURL = URL.createObjectURL(file);

    books.push({ title, description, category, link: fileURL });
    updateCategoryCounts();
    filterBooks();
    uploadForm.reset();
    alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
});
