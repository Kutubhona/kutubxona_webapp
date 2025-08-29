// 📚 Kitoblar ma'lumotlari
const books = [
    {
        title: "Hadislar",
        category: "Hadis",
        link: "pdf/hadis/hadis1.pdf",
        description: "Muhim hadislarni o'z ichiga oladi."
    },
    {
        title: "Islom Tarixi",
        category: "Tarix",
        link: "pdf/tarix/tarix1.pdf",
        description: "Islom tarixining asosiy voqealari."
    },
    {
        title: "Fiqh Asoslari",
        category: "Fiqh",
        link: "pdf/fiqh/fiqh1.pdf",
        description: "Fiqh asoslari va qoidalari."
    },
    {
        title: "Fiqh Savol-Javoblar",
        category: "Fiqh",
        link: "pdf/01-Низоми-Ислом.pdf",
        description: "Fiqh bo‘yicha savol-javoblar to‘plami."
    },
    {
        title: "Tarixi Tabariy",
        category: "Hadis",
        link: "pdf/hadis/TARIXI_TABARIY_PDF.pdf",
        description: "Tarixiy hadislar to‘plami."
    }
];

// 🧩 Elementlarni olish
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const body = document.body;

let activeCategory = ""; // Hozirgi tanlangan kategoriya

// 📦 Kitoblarni render qilish
function renderBooks(filteredBooks) {
    const uniqueBooks = [];
    const titles = new Set();

    filteredBooks.forEach(book => {
        const uniqueKey = book.title + book.link;
        if (!titles.has(uniqueKey)) {
            titles.add(uniqueKey);
            uniqueBooks.push(book);
        }
    });

    booksContainer.innerHTML = '';
    if (uniqueBooks.length === 0) {
        booksContainer.innerHTML = '<p>Hozircha bu yerda kitob yo‘q...</p>';
        return;
    }

    uniqueBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <a href="${book.link}" target="_blank">PDF ni ochish</a>
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

// 🚀 Dastlab barcha kitoblar
renderBooks(books);

// 🎯 Kategoriya bo'yicha filtrlash + active class
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        if (activeCategory === btn.dataset.category) {
            activeCategory = ""; // toggle off
        } else {
            activeCategory = btn.dataset.category;
            btn.classList.add('active');
        }
        filterBooks();
    });
});

// 🔎 Qidiruv funksiyasi
searchInput.addEventListener('input', filterBooks);

// 🌗 Yorug' va qorong'u rejim + localStorage saqlash
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) body.className = savedTheme;
    toggleThemeBtn.textContent = body.classList.contains('dark') ? "🌞 Yorug' rejim" : "🌙 Qorong'u rejim";
}
loadTheme();

toggleThemeBtn.addEventListener('click', () => {
    body.classList.toggle('light');
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.className);
    toggleThemeBtn.textContent = body.classList.contains('dark') ? "🌞 Yorug' rejim" : "🌙 Qorong'u rejim";
});
