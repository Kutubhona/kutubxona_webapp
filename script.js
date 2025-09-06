/* ---------- ELEMENTS ---------- */
const html=document.documentElement;
const themeToggle=document.getElementById('toggleTheme');
const searchInput=document.getElementById('searchInput');
const categoriesRow=document.querySelector('.categories-row');
const booksContainer=document.getElementById('booksContainer');

const showLoginBtn=document.getElementById('showLoginBtn');
const adminPanel=document.getElementById('adminPanel');
const uploadForm=document.getElementById('uploadForm');
const progressWrap=document.getElementById('progressWrap');
const progressBar=document.getElementById('progressBar');
const adminLogout=document.getElementById('adminLogout');

const pdfModalBackdrop=document.getElementById('pdfModal');
const openPDFBtn=document.getElementById('openPDFBtn');
const downloadPDFBtn=document.getElementById('downloadPDFBtn');
const downloadNotice=document.getElementById('downloadNotice');
const openDownloaded=document.getElementById('openDownloaded');
const closePdfModal=document.getElementById('closePdfModal');

const splash=document.getElementById('splash');
const splashTitle=document.getElementById('splashTitle');
const splashSubtitle=document.getElementById('splashSubtitle');

/* ---------- STATE ---------- */
let allBooks=[]; let activeCategory=''; let isAdmin=false; let currentPDF='';

/* ---------- THEME ---------- */
function setTheme(theme){html.setAttribute('data-theme',theme);localStorage.setItem('theme',theme);}
function loadTheme(){const saved=localStorage.getItem('theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');setTheme(saved);}
themeToggle.addEventListener('click',()=>{const next=html.getAttribute('data-theme')==='dark'?'light':'dark';document.body.animate([{filter:'brightness(1)'},{filter:'brightness(1.06)'},{filter:'brightness(1)'}],{duration:260});setTheme(next);});

/* ---------- SPLASH ---------- */
function runSplash(){setTimeout(()=>{splashTitle.style.transform='translateY(-40px)';splashTitle.style.opacity='0';splashSubtitle.style.transform='translateY(40px)';splashSubtitle.style.opacity='0';setTimeout(()=>{splash.remove();revealAll();},800);},2300);}

/* ---------- BOOKS ---------- */
function escapeHtml(str){return(''+str).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
function bookCard(book){return `<article class="book-card reveal" data-id="${book.id}" data-category="${book.category||''}"><div class="book-title">${escapeHtml(book.title||'Nomsiz kitob')}</div><div class="book-desc">${escapeHtml(book.description||'')}</div><div class="card-actions"><button class="btn btn-ghost" data-action="open-pdf" data-link="${book.link}">📄 PDF</button>${isAdmin?`<button class="btn btn-danger" data-action="delete" data-id="${book.id}" data-link="${book.link}">❌ O‘chirish</button>`:''}</div></article>`;}
function renderBooks(list){booksContainer.innerHTML=list.length?list.map(bookCard).join(''):`<p style="text-align:center;opacity:.7">Hozircha kitob yo‘q...</p>`;revealAll();}
function filterBooks(){const q=(searchInput.value||'').toLowerCase().trim();const filtered=allBooks.filter(b=>(!activeCategory||b.category===activeCategory)&&(!q||(b.title&&b.title.toLowerCase().includes(q))));renderBooks(filtered);}

/* ---------- CATEGORY CLICK ---------- */
categoriesRow.addEventListener('click',e=>{const btn=e.target.closest('button');if(!btn)return;const cat=btn.dataset.category;if(activeCategory===cat){activeCategory='';btn.classList.remove('active');}else{activeCategory=cat;categoriesRow.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.category===cat));}filterBooks();});
searchInput.addEventListener('input',filterBooks);

/* ---------- PDF MODAL ---------- */
function showPdfModal(url){currentPDF=url;downloadNotice.classList.add('hidden');pdfModalBackdrop.classList.add('show');pdfModalBackdrop.setAttribute('aria-hidden','false');}
openPDFBtn.addEventListener('click',()=>currentPDF&&window.open(currentPDF,'_blank'));
downloadPDFBtn.addEventListener('click',()=>{if(!currentPDF)return;const a=document.createElement('a');a.href=currentPDF;a.download='kitob.pdf';document.body.appendChild(a);a.click();a.remove();openDownloaded.href=currentPDF;downloadNotice.classList.remove('hidden');});
closePdfModal.addEventListener('click',()=>{pdfModalBackdrop.classList.remove('show');pdfModalBackdrop.setAttribute('aria-hidden','true');});
pdfModalBackdrop.addEventListener('click',e=>{if(e.target===pdfModalBackdrop){pdfModalBackdrop.classList.remove('show');pdfModalBackdrop.setAttribute('aria-hidden','true');}});

/* ---------- ADMIN ---------- */
const LOGIN_PASSWORD="ibr2010071717.se";

showLoginBtn.addEventListener('click',()=>{adminPanel.classList.remove('hidden');isAdmin=true;});
adminLogout.addEventListener('click',()=>{adminPanel.classList.add('hidden');isAdmin=false;});

/* ---------- UPLOAD ---------- */
uploadForm.addEventListener('submit',async(e)=>{e.preventDefault();if(!isAdmin){alert('❌ Siz admin emassiz!');return;}const title=document.getElementById('bookTitle').value.trim();const description=document.getElementById('bookDescription').value.trim();const category=document.getElementById('bookCategory').value;const file=document.getElementById('bookFile').files[0];if(!file){alert('❌ PDF fayl tanlanmagan!');return;}try{const cleanName=file.name.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_\-.]/g,'');const uniqueName=`${Date.now()}_${cleanName}`;const storageRef=firebase.storage().ref(`books/${uniqueName}`);const uploadTask=storageRef.put(file,{customMetadata:{secret_code:LOGIN_PASSWORD}});progressWrap.classList.remove('hidden');progressBar.style.width='0%';progressBar.textContent='0%';uploadTask.on('state_changed',snapshot=>{const p=(snapshot.bytesTransferred/snapshot.totalBytes)*100;progressBar.style.width=`${p.toFixed(0)}%`;progressBar.textContent=`${p.toFixed(0)}%`;},err=>{console.error('Upload error:',err);alert('❌ Yuklash xatosi: '+err.message);progressWrap.classList.add('hidden');},async()=>{const fileURL=await storageRef.getDownloadURL();await firebase.firestore().collection('books').add({title,description,category,link:fileURL,createdAt:firebase.firestore.FieldValue.serverTimestamp(),secret_code:LOGIN_PASSWORD});alert('✅ Kitob muvaffaqiyatli qo‘shildi!');uploadForm.reset();progressWrap.classList.add('hidden');}});}catch(err){console.error('Upload exception:',err);alert('❌ Xatolik: '+err.message);progressWrap.classList.add('hidden');}});

/* ---------- DELETE ---------- */
async function deleteBook(bookId,fileURL){if(!isAdmin){alert('❌ Sizda o‘chirish huquqi yo‘q!');return;}if(!confirm('Haqiqatan ham bu kitobni o‘chirmoqchimisiz?'))return;try{await firebase.firestore().collection('books').doc(bookId).delete();const storageRef=firebase.storage().refFromURL(fileURL);await storageRef.delete();alert('✅ Kitob muvaffaqiyatli o‘chirildi!');}catch(err){console.error('Delete error:',err);alert('❌ O‘chirishda xatolik: '+(err.message||err));}}

/* ---------- FIRESTORE REALTIME LISTENER ---------- */
firebase.firestore().collection('books').orderBy('createdAt','desc').onSnapshot(snapshot=>{allBooks=snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));filterBooks();},err=>{console.error('Firestore snapshot error:',err);});

/* ---------- REVEAL ON SCROLL ---------- */
const io=new IntersectionObserver((entries)=>{entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('show');io.unobserve(en.target);}})},{threshold:0.12});
function revealAll(){document.querySelectorAll('.reveal').forEach(el=>io.observe(el));}

/* ---------- INIT ---------- */
loadTheme();
runSplash();
window.addEventListener('load',()=>{setTimeout(revealAll,600);});
