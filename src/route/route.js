import express from 'express';
import { retrieveCustomerById, retrieveCustomerByUserId, addCustomer } from '../controller/customer.controller.js';
import { addBook, retrieveBook, updateBook } from '../controller/book.controller.js';

const routes = express.Router();

routes.route('/customers').post(addCustomer);
routes.route('/customers/:id').get(retrieveCustomerById);
routes.route('/customers?userId=:userId').get(retrieveCustomerByUserId);

routes.route('/books').post(addBook);
routes.route('/books/:ISBN').put(updateBook);
routes.route('/books/isbn/:ISBN').get(retrieveBook);
routes.route('/books/:ISBN').get(retrieveBook);

export default routes;