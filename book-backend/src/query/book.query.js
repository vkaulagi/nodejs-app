const QUERY_BOOK = {
    ADD_BOOK: 'INSERT INTO Book(ISBN, title, Author, description, genre, price, quantity) VALUES (?, ? ,? ,?, ?, ?, ?)',
    RETRIEVE_BOOK: 'SELECT * FROM Book WHERE ISBN = ?',
    UPDATE_BOOK: 'UPDATE Book SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ? WHERE ISBN = ?'
}

export default QUERY_BOOK;