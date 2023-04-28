import express from 'express';
import { addBook, retrieveBook, retrieveRelatedBooks, updateBook } from '../controller/book.controller.js';

const bookRoutes = express.Router();

bookRoutes.route('/').post(addBook);
bookRoutes.route('/:ISBN').put(updateBook);
bookRoutes.route('/isbn/:ISBN').get(retrieveBook);
bookRoutes.route('/:ISBN').get(retrieveBook);
bookRoutes.route('/:ISBN/related-books').get(retrieveRelatedBooks);

export default bookRoutes;