/* ---------- ELEMENTS ---------- */
const html = document.documentElement;
const themeToggle = document.getElementById('toggleTheme');
const searchInput = document.getElementById('searchInput');
const categoriesRow = document.querySelector('.categories-row');
const booksContainer = document.getElementById('booksContainer');

const showUploadBtn = document.getElementById('showUploadBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');

const splash = document.getElementById('splash');
const splashTitle = document.getElementById('splashTitle');
const splashSubtitle = document.getElementById('splashSubtitle');

/* ---------- STATE ---------- */
let allBooks = [];
let activeCategory = '';
let isAdmin = false;

/* ---------- THEME ---------- */
function setTheme(theme) {
  if(theme==='dark') html.classList.add('dark');
  else html.classList.remove('dark');
  localStorage.setItem('theme', theme);
}
function loadTheme() {
  const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  setTheme(saved);
}
themeToggle.addEventListener('click', ()=>{
  const next = html.classList.contains('dark')?'light':'dark';
  setTheme(next);
});

/* ---------- SPLASH SCREEN ---------- */
function runSplash() {
  splash.style.display='flex';
  setTimeout(()=>{
    splashTitle.style.transform='translateY(-60px)';
    splashTitle.style.opacity='0';
    splashSubtitle.style.transform='translateY(60px)';
    splashSubtitle.style.opacity='0';
    setTimeout(()=> splash.remove(), 800);
  },2300);
}
runSplash();

/* ---------- RENDER BOOKS ---------- */
function bookCard(book){
  return `
    <article class="book-card reveal" data-id="${book.id}" data-category="${book.category}">
      <div class="book-title">${escapeHtml(book.title)}</div>
      <div class="book-desc">${escapeHtml(book.description)}</div>
      <div class="card-actions">
        <button class="btn btn-ghost" data-action="open-pdf" data-link="${book.link}">📄 PDF</button>
        ${isAdmin? `<button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">❌ O‘chirish</button>` : ''}
      </div>
    </article>
  `;
}
function renderBooks(list){
  booksContainer.innerHTML = list.length ? list.map(bookCard).join('') : `<p style="text-align:center;opacity:.7">Hozircha kitob yo‘q...</p>`;
  revealAll();
}

/* ---------- FILTER & SEARCH ---------- */
function filterBooks(){
  const q = (searchInput.value||'').toLowerCase().trim();
  const filtered = allBooks.filter(b=>
    (!activeCategory || b.category===activeCategory) &&
    (!q || (b.title && b.title.toLowerCase().includes(q)))
  );
  renderBooks(filtered);
}
searchInput.addEventListener('input',filterBooks);

/* ---------- CATEGORY CLICK ---------- */
categoriesRow.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const cat = btn.dataset.category;
  if(activeCategory===cat){
    activeCategory='';
    btn.classList.remove('active');
  } else {
    activeCategory=cat;
    categoriesRow.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.category===cat));
  }
  filterBooks();
});

/* ---------- ADMIN SECTION ---------- */
showUploadBtn.addEventListener('click', ()=>{
  if(!isAdmin){
    const pass = prompt('Admin parolni kiriting:');
    if(pass==='ibr2010071717.se'){
      isAdmin=true;
      alert('✅ Admin rejimga kirdingiz');
      uploadSection.hidden=false;
    } else {
      alert('❌ Parol noto‘g‘ri!');
    }
  } else {
    isAdmin=false;
    uploadSection.hidden=true;
    alert('🔒 Admin rejimdan chiqdingiz');
  }
});

/* ---------- UPLOAD BOOK ---------- */
uploadForm.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!isAdmin){ alert('❌ Siz admin emassiz!'); return; }

  const title = document.getElementById('bookTitle').value.trim();
  const description = document.getElementById('bookDescription').value.trim();
  const category = document.getElementById('bookCategory').value;
  const file = document.getElementById('bookFile').files[0];

  if(!file){ alert('❌ PDF fayl tanlanmagan!'); return; }

  try {
    const cleanName = file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');
    const uniqueName = `${Date.now()}_${cleanName}`;
    const storageRef = firebase.storage().ref(`books/${uniqueName}`);
    const uploadTask = storageRef.put(file);

    progressWrap.hidden=false;
    progressBar.style.width='0%';
    progressBar.textContent='0%';

    uploadTask.on('state_changed', snapshot=>{
      const p = snapshot.bytesTransferred/snapshot.totalBytes*100;
      progressBar.style.width=`${p.toFixed(0)}%`;
      progressBar.textContent=`${p.toFixed(0)}%`;
    }, err=>{
      console.error('Upload error:',err);
      alert('❌ Yuklash xatosi: '+err.message);
      progressWrap.hidden=true;
    }, async ()=>{
      const fileURL = await storageRef.getDownloadURL();
      await firebase.firestore().collection('books').add({
        title, description, category, link:fileURL, createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('✅ Kitob muvaffaqiyatli qo‘shildi!');
      uploadForm.reset();
      progressWrap.hidden=true;
    });
  } catch(err){
    console.error(err);
    alert('❌ Xatolik: '+err.message);
    progressWrap.hidden=true;
  }
});

/* ---------- DELETE BOOK ---------- */
booksContainer.addEventListener('click', async e=>{
  const delBtn = e.target.closest('[data-action="delete"]');
  if(delBtn){
    if(!isAdmin){ alert('❌ Sizda o‘chirish huquqi yo‘q!'); return; }
    if(!confirm('Haqiqatan ham bu kitobni o‘chirmoqchimisiz?')) return;

    try{
      await firebase.firestore().collection('books').doc(delBtn.dataset.id).delete();
      const storageRef = firebase.storage().refFromURL(delBtn.dataset.link);
      await storageRef.delete();
      alert('✅ Kitob muvaffaqiyatli o‘chirildi!');
    } catch(err){
      console.error(err);
      alert('❌ O‘chirishda xatolik: '+err.message);
    }
  }
});

/* ---------- FIRESTORE LISTENER ---------- */
firebase.firestore().collection('books').orderBy('createdAt','desc').onSnapshot(snapshot=>{
  allBooks = snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
  filterBooks();
}, err=>{
  console.error('Firestore snapshot error:',err);
});

/* ---------- REVEAL ANIMATION ---------- */
const io = new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('show'); io.unobserve(en.target);}
  });
},{ threshold:0.12 });
function revealAll(){ document.querySelectorAll('.reveal').forEach(el=>io.observe(el)); }

/* ---------- UTILS ---------- */
function escapeHtml(str){ return (''+str).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

/* ---------- INIT ---------- */
loadTheme();
window.addEventListener('load',()=>{ setTimeout(revealAll,600); });
