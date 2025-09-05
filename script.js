/* =========================================================
   script.js — Premium interaktivlik:
   - Splash yopish, reveal animatsiya
   - Dark/Light tema toggle + saqlash
   - Ripple effekti (har safar yangi elementlarga ham)
   - Firebase: upload, progress, Firestore’ga yozish
   - Kitoblarni o‘qish/yuklab olish
   - Qidiruv va kategoriya bo‘yicha filtr
   ========================================================= */

(() => {
  // ------------- DOM -------------
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

  const introScreen = $("#introScreen");
  const searchInput = $("#searchInput");
  const toggleThemeBtn = $("#toggleTheme");
  const booksContainer = $("#booksContainer");
  const emptyState = $("#emptyState");

  const showUploadBtn = $("#showUploadBtn");
  const uploadSection = $("#uploadSection");
  const uploadForm = $("#uploadForm");
  const bookTitle = $("#bookTitle");
  const bookDescription = $("#bookDescription");
  const bookCategory = $("#bookCategory");
  const bookFile = $("#bookFile");

  const progressContainer = $("#progressContainer");
  const progressBar = $("#progressBar");

  const pdfOptions = $("#pdfOptions");
  const openPDFBtn = $("#openPDFBtn");
  const downloadPDFBtn = $("#downloadPDFBtn");
  const downloadMessage = $("#downloadMessage");
  const openDownloaded = $("#openDownloaded");

  const catButtons = $$(".cat-btn");

  // ------------- State -------------
  let ALL_BOOKS = [];     // {id,title,description,category,url,createdAt}
  let currentFilter = { search: "", category: "" };
  let currentPDFUrl = ""; // oxirgi tanlangan/yuklangan fayl

  // ------------- Helpers -------------
  const fmt = {
    trim(s) { return (s || "").toString().trim(); },
    lower(s) { return this.trim(s).toLowerCase(); }
  };

  function setBodyTheme(mode) {
    // mode: 'dark' | 'light' | 'auto'
    if (mode === "dark") {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
      if (toggleThemeBtn) toggleThemeBtn.textContent = "🌞 Yorug‘";
    } else if (mode === "light") {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
      if (toggleThemeBtn) toggleThemeBtn.textContent = "🌙 Qorong‘u";
    } else {
      // auto: OS ga qarab
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setBodyTheme(prefersDark ? "dark" : "light");
      return;
    }
  }

  function applySavedTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setBodyTheme(saved);
    } else {
      setBodyTheme("auto");
    }
  }

  function attachRipple(root = document) {
    $$(".ripple", root).forEach(el => {
      if (el.__rippleBound) return;
      el.__rippleBound = true;

      el.addEventListener("pointerdown", e => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - rect.left}px`);
        el.style.setProperty("--y", `${e.clientY - rect.top}px`);
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), 450);
      }, { passive: true });
    });
  }

  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function setHidden(el, val) { if (el) el.hidden = !!val; }

  function updateEmptyState() {
    const visibleCards = $$(".book", booksContainer);
    if (!visibleCards.length) {
      emptyState.classList.remove("hidden");
    } else {
      emptyState.classList.add("hidden");
    }
  }

  function createBookCard(doc) {
    const card = document.createElement("div");
    card.className = "book reveal";
    card.dataset.id = doc.id;
    card.dataset.category = doc.category || "";

    card.innerHTML = `
      <div class="book__glow"></div>
      <h3 class="book__title text-lg">${escapeHTML(doc.title)}</h3>
      <p class="book__desc">${escapeHTML(doc.description || "")}</p>
      <div class="book__actions mt-2">
        <button class="btn btn--ghost ripple js-open">📖 Ochish</button>
        <button class="btn btn--primary ripple js-download">⬇️ Yuklab olish</button>
      </div>
    `;

    // Actions
    const openBtn = $(".js-open", card);
    const dlBtn = $(".js-download", card);

    openBtn.addEventListener("click", () => openPDF(doc.url));
    dlBtn.addEventListener("click", () => downloadPDF(doc.url, doc.title));

    // Hook ripple to new nodes
    attachRipple(card);

    return card;
  }

  function escapeHTML(s) {
    return (s || "").toString()
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderBooks(list) {
    booksContainer.innerHTML = "";
    const frag = document.createDocumentFragment();
    list.forEach(b => frag.appendChild(createBookCard(b)));
    booksContainer.appendChild(frag);

    // Trigger reveal in view
    requestAnimationFrame(() => revealScan());
    updateEmptyState();
  }

  function filterBooks() {
    const s = fmt.lower(currentFilter.search);
    const c = fmt.trim(currentFilter.category);
    const filtered = ALL_BOOKS.filter(b => {
      const okCat = !c || (b.category === c);
      const okSearch = !s || (
        fmt.lower(b.title).includes(s) ||
        fmt.lower(b.description || "").includes(s)
      );
      return okCat && okSearch;
    });
    renderBooks(filtered);
  }

  function markActiveCategory(cat) {
    catButtons.forEach(btn => btn.classList.remove("active"));
    const btn = catButtons.find(b => (b.dataset.category || "") === cat);
    if (btn) btn.classList.add("active");
  }

  function openPDF(url) {
    if (!url) return;
    currentPDFUrl = url;

    // PDF options panel (agar ishlatmoqchi bo‘lsangiz)
    show(pdfOptions);
    downloadMessage.hidden = true;

    // Bitta bosishda darrov brauzerda ham ochib yuboramiz (user istagi)
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function downloadPDF(url, suggestedName = "kitob") {
    if (!url) return;
    currentPDFUrl = url;

    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(suggestedName)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      // UI feedback
      downloadMessage.hidden = false;
      openDownloaded.href = url;
      openDownloaded.target = "_blank";
    } catch {
      alert("Yuklab olishda muammo yuz berdi. Qayta urinib ko‘ring.");
    }
  }

  function sanitizeFilename(name) {
    return (name || "kitob")
      .replace(/[\/\\?%*:|"<>]/g, "-")
      .slice(0, 100);
  }

  // ------------- Splash -------------
  function closeSplash(delay = 1600) {
    if (!introScreen) return;
    setTimeout(() => {
      introScreen.style.animation = "fadeOut .6s ease forwards";
      setTimeout(() => introScreen.remove(), 700);
    }, delay);
  }

  // ------------- Reveal on scroll -------------
  let revealObserver;
  function setupReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("in"));
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => revealObserver.observe(el));
  }
  function revealScan() {
    $$(".reveal:not(.in)").forEach(el => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("in");
    });
  }

  // ------------- Firebase -------------
  const db = firebase.firestore();
  const storage = firebase.storage();

  async function fetchBooks() {
    try {
      const snap = await db.collection("books").orderBy("createdAt", "desc").get();
      ALL_BOOKS = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() || {})
      }));
      filterBooks();
    } catch (e) {
      console.error(e);
      alert("Kitoblarni yuklashda muammo. Internetni tekshiring.");
    }
  }

  function watchBooksRealtime() {
    // Agar real-time xohlasangiz (ixtiyoriy). Pastdagi fetchBooks o‘rniga chaqiring.
    return db.collection("books").orderBy("createdAt", "desc")
      .onSnapshot(snap => {
        ALL_BOOKS = snap.docs.map(d => ({ id: d.id, ...(d.data() || {}) }));
        filterBooks();
      }, err => {
        console.error(err);
      });
  }

  async function uploadBook({ title, description, category, file }) {
    const ts = Date.now();
    const safeTitle = sanitizeFilename(title);
    const path = `books/${safeTitle}-${ts}.pdf`;
    const ref = storage.ref().child(path);

    // Progress UI
    setHidden(progressContainer, false);
    progressBar.style.width = "0%";
    progressBar.textContent = "0%";

    return new Promise((resolve, reject) => {
      const task = ref.put(file);
      task.on("state_changed",
        snap => {
          if (!snap.totalBytes) return;
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          progressBar.style.width = `${pct}%`;
          progressBar.textContent = `${pct}%`;
        },
        err => {
          setHidden(progressContainer, true);
          reject(err);
        },
        async () => {
          try {
            const url = await ref.getDownloadURL();
            await db.collection("books").add({
              title,
              description,
              category,
              url,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            setHidden(progressContainer, true);
            resolve(url);
          } catch (e) {
            setHidden(progressContainer, true);
            reject(e);
          }
        }
      );
    });
  }

  // ------------- Events -------------
  document.addEventListener("DOMContentLoaded", () => {
    // Theme
    applySavedTheme();

    // Splash
    closeSplash(1400);

    // Reveal
    setupReveal();

    // Attach Ripple to initial
    attachRipple();

    // Theme toggle
    if (toggleThemeBtn) {
      toggleThemeBtn.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark");
        setBodyTheme(isDark ? "light" : "dark");
      });
    }

    // Search
    if (searchInput) {
      searchInput.addEventListener("input", e => {
        currentFilter.search = fmt.trim(e.target.value);
        filterBooks();
      });
    }

    // Categories
    catButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.category || "";
        currentFilter.category = (currentFilter.category === cat) ? "" : cat; // toggle
        markActiveCategory(currentFilter.category);
        filterBooks();
      });
      // Mousemove highlight for cat-btn hover glow origin
      btn.addEventListener("pointermove", e => {
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
        btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }, { passive: true });
    });

    // Admin panel show/hide
    if (showUploadBtn && uploadSection) {
      showUploadBtn.addEventListener("click", () => {
        uploadSection.hidden = !uploadSection.hidden;
        // Scroll to panel when shown
        if (!uploadSection.hidden) {
          uploadSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }

    // Upload form
    if (uploadForm) {
      uploadForm.addEventListener("submit", async e => {
        e.preventDefault();

        const title = fmt.trim(bookTitle.value);
        const description = fmt.trim(bookDescription.value);
        const category = fmt.trim(bookCategory.value);
        const file = bookFile.files && bookFile.files[0];

        if (!title || !description || !category || !file) {
          alert("Iltimos, barcha maydonlarni to‘ldiring va PDF tanlang.");
          return;
        }
        if (file.type !== "application/pdf") {
          alert("Faqat PDF fayllar qabul qilinadi.");
          return;
        }

        try {
          const url = await uploadBook({ title, description, category, file });
          currentPDFUrl = url;

          // UI
          uploadForm.reset();
          show(pdfOptions);
          downloadMessage.hidden = true;

          // Kitoblar ro‘yxatini yangilash
          fetchBooks();

          // Foydalanuvchiga tez amallar
          openPDFBtn?.focus();
        } catch (e2) {
          console.error(e2);
          alert("Yuklashda muammo yuz berdi. Qayta urinib ko‘ring.");
        }
      });
    }

    // PDF options panel actions
    if (openPDFBtn) {
      openPDFBtn.addEventListener("click", () => {
        if (!currentPDFUrl) {
          alert("Avval PDF tanlang yoki yuklang.");
          return;
        }
        window.open(currentPDFUrl, "_blank", "noopener,noreferrer");
      });
    }
    if (downloadPDFBtn) {
      downloadPDFBtn.addEventListener("click", () => {
        if (!currentPDFUrl) {
          alert("Avval PDF tanlang yoki yuklang.");
          return;
        }
        downloadPDF(currentPDFUrl, "kitob");
      });
    }

    // Initial data
    fetchBooks();
    // Re-attach ripple for dynamically added content (observer)
    observeMutationsForRipple();
  });

  // ------------- Mutation observer for ripple on dynamic nodes -------------
  function observeMutationsForRipple() {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) {
              // attach ripple inside new subtree
              attachRipple(n);
            }
          });
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

})();
```
