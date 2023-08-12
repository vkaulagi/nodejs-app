const QUERY_CUSTOMER = {
    RETRIEVE_CUSTOMER_BY_ID: 'SELECT * FROM Customer WHERE id = ?',
    RETRIEVE_CUSTOMER_BY_USER_ID: 'SELECT * FROM Customer WHERE userId = ?',
    ADD_CUSTOMER: 'INSERT INTO Customer(userId, name, phone, address, address2, city, state, zipcode) VALUES (?, ? ,? ,?, ?, ?, ?, ?)'
}

export default QUERY_CUSTOMER;