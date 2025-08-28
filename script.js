const filterButtons = document.querySelectorAll('.filter-btn');
const books = document.querySelectorAll('.book');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        books.forEach(book => {
            if (category === 'all' || book.dataset.category === category) {
                book.style.display = 'block';
            } else {
                book.style.display = 'none';
            }
        });
    });
});
