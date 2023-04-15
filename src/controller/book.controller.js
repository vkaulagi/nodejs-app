import database from '../config/mysql.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import QUERY_BOOK from '../query/book.query.js';

const bookHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' }
};

export const addBook = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, adding book`);
    database.query(QUERY_BOOK.ADD_BOOK, Object.values(req.body), (error, results) => {
        if(!results) {
            logger.error(error.message);
            res.status(bookHttpStatus.BAD_REQUEST.code).send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        }
        else {
            const book = { ISBN: results.insertedISBN, ...req.body, created_at: new Date() };
            res.status(bookHttpStatus.CREATED.code).send(new Response(bookHttpStatus.CREATED.code, bookHttpStatus.CREATED.status, 'Successful book creation', { book }));
        }
    });
};

export const retrieveBook = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving book`);
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [req.params.ISBN], (error, results) => {
        if(!results[0]) {
            res.status(bookHttpStatus.NOT_FOUND.code).send(new Response(bookHttpStatus.NOT_FOUND.code, bookHttpStatus.NOT_FOUND.status, 'ISBN not found'));
        }
        else {
            res.status(bookHttpStatus.OK.code).send(new Response(bookHttpStatus.OK.code, bookHttpStatus.OK.status, 'Success', results[0]));
        }
    });
};

export const updateBook = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving book`);
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [req.params.ISBN], (error, results) => {
        if(!results[0]) {
            res.status(bookHttpStatus.NOT_FOUND.code).send(new Response(bookHttpStatus.NOT_FOUND.code, bookHttpStatus.NOT_FOUND.status, 'ISBN not found'));
        } 
        else {
            logger.info(`${req.method} ${req.originalUrl}, updating book`);
            database.query(QUERY_BOOK.UPDATE_BOOK, [...Object.values(req.body), req.params.ISBN], (error, results) => {
                if(!error) {
                    res.status(bookHttpStatus.OK.code).send(new Response(bookHttpStatus.OK.code, bookHttpStatus.OK.status, 'Successful book update', { ISBN: req.params.ISBN, ...req.body }));
                }
                else {
                    logger.error(error.message);
                    res.status(bookHttpStatus.BAD_REQUEST.code).send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
                }
            });
        }
    });
};

export default bookHttpStatus;