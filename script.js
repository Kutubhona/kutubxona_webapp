// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuk-PhyFg5j7JkVnvfcYfBKGMoNZtT02s",
  authDomain: "kutubxona-79dd3.firebaseapp.com",
  projectId: "kutubxona-79dd3",
  storageBucket: "kutubxona-79dd3.appspot.com",
  messagingSenderId: "593289819612",
  appId: "1:593289819612:web:89b9a8dd933f945eb78b19",
  measurementId: "G-Z0Z4FWPWP8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

let books = [];
let filterCategory = "";
let filterSearch = "";
let currentPdfUrl = "";

// Wait for DOM
document.addEventListener("DOMContentLoaded", () => {
  handleSplash();
  initTheme();
  setupListeners();
  loadBooks();
});

function handleSplash() {
  const splash = document.getElementById("splash");
  splash.addEventListener("animationend", () => {
    splash.style.display = "none";
  });
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.replace("light", "dark");
  updateThemeBtn();
}

function updateThemeBtn() {
  const btn = document.getElementById("toggleTheme");
  if (document.body.classList.contains("dark")) {
    btn.textContent = "☀️ Yorug‘";
  } else {
    btn.textContent = "🌙 Qorong‘u";
  }
}

function setupListeners() {
  // Theme toggle
  document.getElementById("toggleTheme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
    updateThemeBtn();
  });

  // Search
  document.getElementById("searchInput").addEventListener("input", (e) => {
    filterSearch = e.target.value.trim().toLowerCase();
    displayBooks();
  });

  // Category filter
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (filterCategory === btn.dataset.category) {
        filterCategory = "";
        btn.classList.remove("active");
      } else {
        filterCategory = btn.dataset.category;
        document
          .querySelectorAll(".category-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      }
      displayBooks();
    });
  });

  // Admin mode toggle (demo: simple prompt)
  document.getElementById("adminToggle").addEventListener("click", () => {
    const section = document.getElementById("uploadSection");
    if (section.hidden) {
      const pwd = prompt("Admin parolni kiriting:");
      if (pwd === "admin123") section.hidden = false;
      else alert("Noto‘g‘ri parol");
    } else {
      section.hidden = true;
    }
  });

  // Upload form
  document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("bookTitle").value.trim();
    const desc = document.getElementById("bookDescription").value.trim();
    const category = document.getElementById("bookCategory").value;
    const file = document.getElementById("bookFile").files[0];
    const progressWrap = document.getElementById("progressWrap");
    const progressBar = document.getElementById("progressBar");

    progressWrap.hidden = false;
    const storageRef = storage.ref(`books/${Date.now()}_${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      "state_changed",
      (snap) => {
        const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${Math.round(percent)}%`;
      },
      (err) => {
        alert("Yuklash xatosi: " + err.message);
      },
      async () => {
        const url = await uploadTask.snapshot.ref.getDownloadURL();
        await db.collection("books").add({
          title,
          desc,
          category,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        alert("Kitob muvaffaqiyatli qo‘shildi!");
        document.getElementById("uploadForm").reset();
        progressWrap.hidden = true;
      }
    );
  });

  // Modal controls
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document
    .getElementById("openPDFBtn")
    .addEventListener("click", () => window.open(currentPdfUrl, "_blank"));
  document
    .getElementById("downloadPDFBtn")
    .addEventListener("click", downloadPdf);
}

// Real-time load
function loadBooks() {
  db.collection("books")
    .orderBy("timestamp", "desc")
    .onSnapshot((snap) => {
      books = [];
      snap.forEach((doc) => books.push({ id: doc.id, ...doc.data() }));
      displayBooks();
    });
}

// Render & filter
function displayBooks() {
  const container = document.getElementById("booksContainer");
  container.innerHTML = "";
  books.forEach((b) => {
    const matchesCategory = !filterCategory || b.category === filterCategory;
    const text = (b.title + b.desc).toLowerCase();
    const matchesSearch = !filterSearch || text.includes(filterSearch);

    if (!matchesCategory || !matchesSearch) return;

    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
      <h3 class="book-title">${b.title}</h3>
      <p class="book-desc">${b.desc}</p>
      <div class="card-actions">
        <button class="btn btn-ghost readBtn" data-url="${b.url}">📖</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach modal opener
  document.querySelectorAll(".readBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPdfUrl = btn.dataset.url;
      openModal();
    });
  });
}

function openModal() {
  const modal = document.getElementById("pdfModal");
  document.getElementById("downloadNotice").hidden = true;
  modal.classList.add("show");
}

function closeModal() {
  document.getElementById("pdfModal").classList.remove("show");
}

// Download and show link
async function downloadPdf() {
  const notice = document.getElementById("downloadNotice");
  const link = document.getElementById("openDownloaded");
  const resp = await fetch(currentPdfUrl);
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = "kitob.pdf";
  notice.hidden = false;
}
