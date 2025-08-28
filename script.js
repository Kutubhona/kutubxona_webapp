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
  ]
};

const buttons = document.querySelectorAll(".topic-btn");
const booksContainer = document.getElementById("books-container");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const topic = btn.getAttribute("data-topic");
    displayBooks(topic);
  });
});

function displayBooks(topic) {
  booksContainer.innerHTML = "";
  booksData[topic].forEach(book => {
    const div = document.createElement("div");
    div.className = "book";
    div.innerHTML = `<a href="${book.file}" target="_blank">${book.title}</a>`;
    booksContainer.appendChild(div);
  });
}
