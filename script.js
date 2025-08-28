// Mavzular va kitoblar ro'yxati
const data = {
    "Islom": [
        { title: "Islom Tarixi", pdf: "pdf/islom/islom_tarixi.pdf" },
        { title: "Qur'on Tafsiri", pdf: "pdf/islom/quron_tafsiri.pdf" }
    ],
    "Fiqh": [
        { title: "Fiqh Asoslari", pdf: "pdf/fiqh/fiqh_asoslari.pdf" },
        { title: "Namoz Qoidalari", pdf: "pdf/fiqh/namoz_qoidalari.pdf" }
    ],
    "Hadis": [
        { title: "Sahih Buxoriy", pdf: "pdf/hadis/sahih_buxoriy.pdf" },
        { title: "Riyozus Solihin", pdf: "pdf/hadis/riyozus_solihin.pdf" }
    ],
    "Tarix": [
        { title: "O'zbekiston Tarixi", pdf: "pdf/tarix/uzb_tarixi.pdf" },
        { title: "Islom Tarixi", pdf: "pdf/tarix/islom_tarixi.pdf" }
    ]
};

// Menu yaratish
const menuDiv = document.getElementById("menu");
Object.keys(data).forEach(topic => {
    const btn = document.createElement("button");
    btn.textContent = `${topic} (${data[topic].length})`;
    btn.onclick = () => showBooks(topic);
    menuDiv.appendChild(btn);
});

// Kitoblar ro'yxatini ko'rsatish
function showBooks(topic) {
    const booksDiv = document.getElementById("books");
    booksDiv.innerHTML = `<h2>${topic} kitoblari:</h2>`;
    
    data[topic].forEach(book => {
        const link = document.createElement("a");
        link.href = book.pdf;
        link.textContent = book.title;
        link.target = "_blank"; // yangi oynada ochadi
        booksDiv.appendChild(link);
        booksDiv.appendChild(document.createElement("br"));
    });
}
