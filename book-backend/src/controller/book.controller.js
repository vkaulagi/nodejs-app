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
        res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        return;
    }

    database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
        if (results && results.length > 0) {
            logger.error('This ISBN already exists in the system.');
            res.status(bookHttpStatus.UNPROCESSABLE_CONTENT.code).send({ message: 'This ISBN already exists in the system.' });
        } else {
            database.query(QUERY_BOOK.ADD_BOOK, [ISBN, title, Author, description, genre, price, quantity], (error, results) => {
                if (error) {
                    logger.error(error.message);
                    res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
                } else {
                    const book = { ISBN, title, Author, description, genre, price, quantity };
                    res.status(bookHttpStatus.CREATED.code).send(book);
                }
            });
        }
    });
};

export const retrieveBook = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving book`);
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [req.params.ISBN], (error, results) => {
        if(!results[0]) {
            res.status(bookHttpStatus.NOT_FOUND.code).send(bookHttpStatus.NOT_FOUND.code);
        }
        else {
            res.status(bookHttpStatus.OK.code).send(results[0]);
        }
    });
};

export const updateBook = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, updating book`);
  
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    if (!ISBN || !title || !Author || !description || !genre || !price || !quantity) {
      res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
      return;
    }
    if (isNaN(parseFloat(price)) || !(/^\d+\.\d{2}$/).test(price)) {
        res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        return;
    }
  
    database.query(QUERY_BOOK.RETRIEVE_BOOK, [ISBN], (error, results) => {
      if (error) {
        logger.error(error.message);
        res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        return;
      }
  
      if (!results[0]) {
        res.status(bookHttpStatus.NOT_FOUND.code).send(bookHttpStatus.NOT_FOUND.code);
        return;
      }
  
      database.query(QUERY_BOOK.UPDATE_BOOK, [title, Author, description, genre, price, quantity, ISBN], (error, results) => {
        if (error) {
          logger.error(error.message);
          res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
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
  
        res.status(bookHttpStatus.OK.code).send(updatedBook);
      });
    });
};

let failureCount = 0;
let circuitBreakerOpen = false;
let lastFailureTime = null;

const FAILURE_THRESHOLD = 1;
const RETRY_TIMEOUT = 60000; // 60 seconds
const RESPONSE_TIMEOUT = 3000; // 3 seconds

export const retrieveRelatedBooks = async (req, res) => {
  try {
    const isbn = req.params.ISBN;

    // If the circuit breaker is open, throw an error immediately
    if (circuitBreakerOpen) {
      // const currentTime = new Date().getTime();
      // const timeSinceFailure = currentTime - lastFailureTime;
      // if (timeSinceFailure < RETRY_TIMEOUT) {
      //   //res.status(503).send(new Response(503, 'Service unavailable'));
      //   res.status(503);
      //   return;
      // } else {
      //   circuitBreakerOpen = false;
      //   failureCount = 0;
      //   lastFailureTime = null;
      // }
      return res.status(503);
    }

    const response = await axios({
      method: 'GET',
      url: `http://localhost:8080/recommendations/${ISBN}`,
      timeout: RESPONSE_TIMEOUT
    });
    const relatedBooks = response.data;

    // Reset failure count if request succeeds
    //failureCount = 0;

    if (relatedBooks.length > 0) {
      const bookTitles = relatedBooks.map((book) => ({
        ISBN: book.ISBN,
        title: book.title,
        Author: book.Author,
      }));
      res.status(200).send(bookTitles);
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    logger.error(error.message);

    if (error.code === 'ECONNABORTED') {
      // First timeout error, open the circuit breaker and return 504
      //if (failureCount === 0) {
        circuitBreakerOpen = true;
        setTimeout(() => circuitBreakerOpen = false, RETRY_TIMEOUT);
        //lastFailureTime = new Date().getTime();
        //res.status(504).send(new Response(504, 'Gateway timeout'));
        res.status(504); }
    //   //} 
    //   //else if (failureCount >= FAILURE_THRESHOLD) {
    //     // Circuit breaker is already open, return 503
    //     //res.status(503).send(new Response(503, 'Service unavailable'));
    //     //res.status(503);
    //   //} 
    //   else {
    //     // Increment failure count
    //     failureCount++;
    //     //res.status(500).send(new Response(500, 'Internal server error'));
    //     res.status(500);
    //   }
    // }
    else {
      //res.status(500).send(new Response(500, 'Internal server error'));
      res.status(500);
    }
  }
};

export default bookHttpStatus;