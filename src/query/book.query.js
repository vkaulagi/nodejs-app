const QUERY_BOOK = {
    ADD_BOOK: 'INSERT INTO Book(ISBN, title, Author, description, genre, price, quantity) VALUES (?, ? ,? ,?, ?, ?, ?)',
    RETRIEVE_BOOK: 'SELECT * FROM Book WHERE ISBN = ?',
    UPDATE_BOOK: 'UPDATE Book SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ? WHERE ISBN = ?',
    //RETRIEVE_RELATED_BOOKS: 'SELECT * FROM Book WHERE ISBN = ? OR genre = (SELECT genre FROM Book WHERE ISBN = ?)'
}

export default QUERY_BOOK;