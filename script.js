// Kitoblar ma'lumotlari
const books = [
    { title: "Sahih Hadislar", category: "Hadis", link: "pdf/hadis1.pdf" },
    { title: "Hadis to'plami 2", category: "Hadis", link: "pdf/hadis2.pdf" },
    { title: "Islom tarixi 1", category: "Tarix", link: "pdf/tarix1.pdf" },
    { title: "Islom tarixi 2", category: "Tarix", link: "pdf/tarix2.pdf" },
    { title: "Fiqh asoslari 1", category: "Fiqh", link: "pdf/fiqh1.pdf" },
    { title: "Fiqh asoslari 2", category: "Fiqh", link: "pdf/fiqh2.pdf" },
];

// Elementlarni olish
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const body = document.body;

// Kitoblarni render qilish
function renderBooks(filteredBooks) {
    booksContainer.innerHTML = '';
    if(filteredBooks.length === 0){
        booksContainer.innerHTML = '<p>Hozircha bu yerda kitob yo‘q...</p>';
        return;
    }

    filteredBooks.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <h3>${book.title}</h3>
            <a href="${book.link}" target="_blank">PDF ni ochish</a>
        `;
        booksContainer.appendChild(card);
    });
}

// Dastlab barcha kitoblar
renderBooks(books);

// Kategoriya bo'yicha filtrlash
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        const filtered = books.filter(book => book.category === category);
        renderBooks(filtered);
    });
});

// Qidiruv funksiyasi
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = books.filter(book => book.title.toLowerCase().includes(query));
    renderBooks(filtered);
});

// Yorug' va qorong'u rejim
toggleThemeBtn.addEventListener('click', () => {
    if(body.classList.contains('light')){
        body.classList.remove('light');
        body.classList.add('dark');
        toggleThemeBtn.textContent = "🌞 Yorug' rejim";
    } else {
        body.classList.remove('dark');
        body.classList.add('light');
        toggleThemeBtn.textContent = "🌙 Qorong'u rejim";
    }
});
