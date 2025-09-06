// script.js fayli uchun JavaScript kodlari
// =================== FIREBASE INIT ===================
const firebaseConfig = {
  apiKey: "AIzaSyDuk-PhyFg5j7JkVnvfcYfBKGMoNZtT02s",
  authDomain: "kutubxona-79dd3.firebaseapp.com",
  projectId: "kutubxona-79dd3",
  storageBucket: "kutubxona-79dd3.firebasestorage.app",
  messagingSenderId: "593289819612",
  appId: "1:593289819612:web:89b9a8dd933f945eb78b19",
  measurementId: "G-Z0Z4FWPWP8"
};
firebase.initializeApp(firebaseConfig);

// =================== ELEMENTS ===================
const html = document.documentElement;
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
const toggleThemeBtn = document.getElementById('toggleTheme');
const uploadSection = document.getElementById('uploadSection');
const adminToggleBtn = document.getElementById('adminToggle');
const uploadForm = document.getElementById('uploadForm');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');

// Modal elements
const pdfModal = document.getElementById('pdfModal');
const openPDFBtn = document.getElementById('openPDFBtn');
const downloadPDFBtn = document.getElementById('downloadPDFBtn');
const downloadNotice = document.getElementById('downloadNotice');
const openDownloaded = document.getElementById('openDownloaded');
const modalClose = document.querySelector('.modal-close');

// Splash elements
const splash = document.getElementById('splash');

// State
let activeCategory = "";
let allBooks = [];
let isAdmin = false;
let currentPDF = "";

// Qolgan JavaScript kodlari bu yerda davom etadi...
// To'liq JavaScript kodini script.js fayliga joylashtiring
