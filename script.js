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

// 📥 Kitob qo‘shish tugmasi (parol bilan)
showUploadBtn.addEventListener('click', () => {
    const password = prompt("Kitob qo‘shish uchun parolni kiriting:");
    if (password === "ibr2010071717.se") {
        uploadSection.style.display = 'block';
    } else {
        alert("❌ Noto‘g‘ri parol!");
    }
});

// 📤 Yangi kitob qo‘shish
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("✅ Form yuborildi");

    const title = document.getElementById('bookTitle').value.trim();
    const description = document.getElementById('bookDescription').value.trim();
    const category = document.getElementById('bookCategory').value;
    const fileInput = document.getElementById('bookFile');
    const file = fileInput.files[0];

    if (!file) {
        alert("❌ PDF fayl tanlanmagan!");
        return;
    }

    try {
        const storageRef = firebase.storage().ref(`books/${Date.now()}_${file.name}`);
        const uploadTask = await storageRef.put(file);
        const fileURL = await storageRef.getDownloadURL();

        await firebase.firestore().collection("books").add({
            title,
            description,
            category,
            link: fileURL,
            secret: "abrakadabra123"
        });

        alert("✅ Kitob muvaffaqiyatli qo‘shildi!");
        uploadForm.reset();
        uploadSection.style.display = 'none';
    } catch (err) {
        console.error("❌ Xatolik:", err);
        alert("❌ Xatolik: " + err.message);
    }
});

// 🔄 Firestore'dan real vaqtda kitoblarni olish
function loadBooksFromFirestore() {
    firebase.firestore().collection("books").onSnapshot(snapshot => {
        allBooks = snapshot.docs.map(doc => doc.data());
        filterBooks();
    }, err => {
        console.error("❌ Firestore xatolik:", err);
    });
}

// 🚀 Boshlang'ich ishga tushirish
loadTheme();
loadBooksFromFirestore();
