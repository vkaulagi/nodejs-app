import database from '../config/mysql.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import QUERY_BOOK from '../query/book.query.js';

const bookHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' },
    NO_CONTENT: { code: 204, status: 'NO_CONTENT' }
};

/*
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
*/

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

/*
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
*/

/*
export const updateBook = (req, res) => {
    const { ISBN, title, author, description, genre, price, quantity } = req.body;
  
    // Check if ISBN exists
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
      if (error) {
        logger.error(error.message);
        return res
          .status(bookHttpStatus.BAD_REQUEST.code)
          .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
      }
  
      if (!results[0]) {
        return res
          .status(bookHttpStatus.NOT_FOUND.code)
          .send(new Response(bookHttpStatus.NOT_FOUND.code, bookHttpStatus.NOT_FOUND.status, 'ISBN not found'));
      }
  
      // Update book info
      database.query(QUERY_BOOK.UPDATE_BOOK, [title, author, description, genre, price, quantity, ISBN], (error, results) => {
        if (error) {
          logger.error(error.message);
          return res
            .status(bookHttpStatus.BAD_REQUEST.code)
            .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        }
  
        // Get updated book info
        database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
          if (error) {
            logger.error(error.message);
            return res
              .status(bookHttpStatus.BAD_REQUEST.code)
              .send(new Response(bookHttpStatus.BAD_REQUEST.code, bookHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
          }
  
          const updatedBook = results[0];
          return res
            .status(bookHttpStatus.OK.code)
            .send(new Response(bookHttpStatus.OK.code, bookHttpStatus.OK.status, 'Successful book update', updatedBook));
        });
      });
    });
  };
  */

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

/*  export const retrieveRelatedBooks = async (req, res) => {
    const { isbn } = req.params;
    try {
      const [rows] = await db.query(RETRIEVE_BOOK, [isbn, isbn]);
      if (!rows.length) {
        return res.status(404).json({ message: 'Book not found' });
      }
      return res.status(200).json({ data: rows });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }; */

/*  export const retrieveRelatedBooks = async (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving related books`);
    try {
      const isbn = req.params.ISBN;
      const response = await axios.get(`http://44.214.218.139/books/${isbn}/related-books`);
      const relatedBooks = response.data;
  
      if (relatedBooks && relatedBooks.length > 0) {
        const bookTitles = relatedBooks.map((book) => ({
          ISBN: book.ISBN,
          title: book.title,
          Author: book.Author,
        }));
        res.status(bookHttpStatus.OK.code).send(bookTitles);
      } else {
        res.sendStatus(bookHttpStatus.NO_CONTENT.code);
      }
    } catch (error) {
      logger.error(error.message);
      res.status(bookHttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(bookHttpStatus.INTERNAL_SERVER_ERROR.code, bookHttpStatus.INTERNAL_SERVER_ERROR.status, 'Error retrieving related books'));
    }
  }; */

  let failureCount = 0;
  let circuitBreakerOpen = false;
  
  const FAILURE_THRESHOLD = 1;
  const RETRY_TIMEOUT = 60000; // 5 seconds
  
  export const retrieveRelatedBooks = async (req, res) => {
    try {
      const isbn = req.params.ISBN;
  
      // If the circuit breaker is open, throw an error immediately
      if (circuitBreakerOpen) {
        throw new Error('Circuit breaker open. Please try again later.');
      }
  
      const response = await axios.get(`http://44.214.218.139/recommended-titles/isbn/${isbn}`);
      const relatedBooks = response.data;
  
      // Reset failure count if request succeeds
      failureCount = 0;
  
      if (relatedBooks.length > 0) {
        const bookTitles = relatedBooks.map((book) => ({
          ISBN: book.ISBN,
          title: book.title,
          Author: book.Author,
        }));
        res.status(bookHttpStatus.OK.code).send(bookTitles);
      } else {
        res.sendStatus(bookHttpStatus.NO_CONTENT.code);
      }
    } catch (error) {
      logger.error(error.message);
  
      if (error.response && error.response.status === 404) {
        res.sendStatus(bookHttpStatus.NO_CONTENT.code);
      } else {
        failureCount++;
  
        if (failureCount >= FAILURE_THRESHOLD) {
          circuitBreakerOpen = true;
          setTimeout(() => {
            circuitBreakerOpen = false;
            failureCount = 0;
          }, RETRY_TIMEOUT);
        }
  
        res.status(bookHttpStatus.INTERNAL_SERVER_ERROR.code).send(new Response(bookHttpStatus.INTERNAL_SERVER_ERROR.code, bookHttpStatus.INTERNAL_SERVER_ERROR.status, 'Error retrieving related books'));
      }
    }
  };

export default bookHttpStatus;