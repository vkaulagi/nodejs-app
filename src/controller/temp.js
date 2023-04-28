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
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;

    // Data validation
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity || isNaN(price) || Number(price).toFixed(2) !== price.toString()) {
        logger.error('Illegal, missing, or malformed input');
        res.status(bookHttpStatus.BAD_REQUEST.code).send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        return;
    }

    database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
        if (results && results.length > 0) {
            logger.error('This ISBN already exists in the system.');
            res.status(422).send({ message: 'This ISBN already exists in the system.' });
        } else {
            database.query(QUERY_BOOK.ADD_BOOK, [ISBN, title, Author, description, genre, price, quantity], (error, results) => {
                if (error) {
                    logger.error(error.message);
                    res.status(bookHttpStatus.BAD_REQUEST.code).send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
                } else {
                    const book = { ISBN, title, Author, description, genre, price, quantity, created_at: new Date() };
                    //const location = `${req.baseUrl}/books/${ISBN}`;
                    //res.setHeader('Location', location);
                    res.status(bookHttpStatus.CREATED.code).send(new Response(bookHttpStatus.CREATED.code, bookHttpStatus.CREATED.status, 'Successful book creation', { book }));
                }
            });
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
    logger.info(`${req.method} ${req.originalUrl}, updating book`);
  
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      res
        .status(bookHttpStatus.BAD_REQUEST.code)
        .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
      return;
    }
    if (isNaN(parseFloat(price)) || !(/^\d+\.\d{2}$/).test(price)) {
        res.status(bookHttpStatus.BAD_REQUEST.code).send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        return;
    }
  
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
      if (error) {
        logger.error(error.message);
        res
          .status(bookHttpStatus.BAD_REQUEST.code)
          .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        return;
      }
  
      if (!results[0]) {
        res.status(bookHttpStatus.NOT_FOUND.code).send(new Response(bookHttpStatus.NOT_FOUND.code, bookHttpStatus.NOT_FOUND.status, 'ISBN not found'));
        return;
      }
  
      database.query(QUERY_BOOK.UPDATE_BOOK, [title, Author, description, genre, price, quantity, ISBN], (error, results) => {
        if (error) {
          logger.error(error.message);
          res
            .status(bookHttpStatus.BAD_REQUEST.code)
            .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
          return;
        }
  
        const updatedBook = {
          ISBN,
          title,
          Author,
          description,
          genre,
          price,
          quantity,
        };
  
        res.status(bookHttpStatus.OK.code).send(new Response(bookHttpStatus.OK.code, bookHttpStatus.OK.status, 'Successful book update', updatedBook));
      });
    });
  };

export default bookHttpStatus;