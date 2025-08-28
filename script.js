// Kitoblar ma'lumotlari
const books = [
    { title: "Islom tarixi 1", category: "Islom", link: "https://github.com/Kutubhona/kutubxona_webapp/pdf/islom1.pdf" },
    { title: "Islom tarixi 2", category: "Islom", link: "https://github.com/Kutubhona/kutubxona_webapp/pdf/islom2.pdf" },
    { title: "Islom tarixi 3", category: "Islom", link: "https://github.com/Kutubhona/kutubxona_webapp/pdf/islom3.pdf" },
    // Boshqa kategoriyalar uchun kitoblar (ixtiyoriy)
    { title: "Fiqh asoslari", category: "Fiqh", link: "pdf/fiqh_asoslari.pdf" },
    { title: "Hadis to'plami", category: "Hadis", link: "pdf/hadis_toplami.pdf" },
    { title: "Tafsir al-Qur'on", category: "Tafsir", link: "pdf/tafsir_alquron.pdf" },
];


// Elementlarni olish
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');

// Kitoblarni render qilish
function renderBooks(filteredBooks) {
    booksContainer.innerHTML = '';
    if(filteredBooks.length === 0){
        booksContainer.innerHTML = '<p>Kitob topilmadi...</p>';
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
