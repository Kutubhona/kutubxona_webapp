const booksData = {
  Islam: [
    { title: "Islom Kitob 1", file: "pdf/Islam1.pdf" },
    { title: "Islom Kitob 2", file: "pdf/Islam2.pdf" }
  ],
  Fiqh: [
    { title: "Fiqh Kitob 1", file: "pdf/Fiqh1.pdf" },
    { title: "Fiqh Kitob 2", file: "pdf/Fiqh2.pdf" }
  ],
  Hadis: [
    { title: "Hadis Kitob 1", file: "pdf/Hadis1.pdf" },
    { title: "Hadis Kitob 2", file: "pdf/Hadis2.pdf" }
  ],
  Tafsir: [
    { title: "Tafsir Kitob 1", file: "pdf/Tafsir1.pdf" },
    { title: "Tafsir Kitob 2", file: "pdf/Tafsir2.pdf" }
  ],
  Tarix: [
    { title: "Tarix Kitob 1", file: "pdf/Tarix1.pdf" },
    { title: "Tarix Kitob 2", file: "pdf/Tarix2.pdf" }
  ],
  Ilm: [
    { title: "Ilm Kitob 1", file: "pdf/Ilm1.pdf" },
    { title: "Ilm Kitob 2", file: "pdf/Ilm2.pdf" }
  ]
};

const buttons = document.querySelectorAll(".topic-btn");
const booksContainer = document.getElementById("books-container");

// Mavzu tugmasi bosilganda
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const topic = btn.getAttribute("data-topic");
    displayBooks(topic);
  });
});

// Kitoblarni ko‘rsatish
function displayBooks(topic) {
  booksContainer.innerHTML = "";
  booksData[topic].forEach(book => {
    const div = document.createElement("div");
    div.className = "book";
    div.innerHTML = `<a href="${book.file}" target="_blank">${book.title}</a>`;
    booksContainer.appendChild(div);
  });
}

// Qidiruv funksiyasi
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  booksContainer.innerHTML = "";

  let found = false;

  Object.keys(booksData).forEach(topic => {
    booksData[topic].forEach(book => {
      if(book.title.toLowerCase().includes(query)) {
        found = true;
        const div = document.createElement("div");
        div.className = "book";
        div.innerHTML = `<a href="${book.file}" target="_blank">${book.title}</a>`;
        booksContainer.appendChild(div);
      }
    });
  });

  if(!found) {
    booksContainer.innerHTML = "<p>Hech qanday natija topilmadi.</p>";
  }
});
