const books = [
    {
        title: "Tarixi Tabariy",
        category: "Hadis",
        link: "pdf/hadis/TARIXI_TABARIY_PDF.pdf",
        description: "Tarixiy hadislar to‘plami."
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
    }
];

const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const body = document.body;

let activeCategory = "";

function renderBooks(filteredBooks) {
    booksContainer.innerHTML = '';
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = '<p></p>';
        return;
    }

    filteredBooks.forEach(book => {
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

function updateCategoryCounts() {
    categoryButtons.forEach(btn => {
        const category = btn.dataset.category;
        const count = books.filter(book => book.category === category).length;
        btn.textContent = `${category} (${count})`;
    });
}

renderBooks([]);
updateCategoryCounts();

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

searchInput.addEventListener('input', filterBooks);

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
