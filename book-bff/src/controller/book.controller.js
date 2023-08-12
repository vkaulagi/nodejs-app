import axios from 'axios';

const bookHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' },
    UNAUTHORIZED: { code: 401, status: 'UNAUTHORIZED' }
};

// const BOOK_BACKEND_URL = 'http://localhost:3000'; // URL of the book-backend service
const BOOK_BACKEND_URL = 'http://10.0.20.188:3000';

export const addBook = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const bookData = req.body;
        const response = await axios.post(`${BOOK_BACKEND_URL}/books`, bookData);
        res.status(bookHttpStatus.CREATED.code).json(response.data);
      } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        }
      }
};

export const retrieveBook = async (req, res) => {
    try {
        const { ISBN } = req.params;
        const { 'user-agent': userAgent } = req.headers;
        // const response = await axios.get(`${BOOK_BACKEND_URL}/books/isbn/${ISBN}`);
        let endpoint = `${BOOK_BACKEND_URL}/books/isbn/${ISBN}`;
        if (!isNaN(Number(ISBN))) {
          endpoint = `${BOOK_BACKEND_URL}/books/${ISBN}`;
        }
        const response = await axios.get(endpoint);
    
        if (userAgent && userAgent.includes('Mobile')) {
          // Replace "non-fiction" with 3 if the client is a mobile device
          // response.data.genre = response.data.genre.replace('non-fiction', 3);
          response.data.genre = 3;
        }
    
        res.status(bookHttpStatus.OK.code).json(response.data);
      } catch (error) {
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        }
      }
};

export const updateBook = async (req, res) => {
    try {
        const { ISBN } = req.params;
        const { 'user-agent': userAgent } = req.headers;
        const bookData = req.body;
        const response = await axios.put(`${BOOK_BACKEND_URL}/books/${ISBN}`, bookData);
        // if (userAgent && userAgent.includes('Mobile')) {
        //     // Replace "non-fiction" with 3 if the client is a mobile device
        //     response.data.genre = response.data.genre.replace('non-fiction', '3');
        //   }
        res.status(bookHttpStatus.OK.code).json(response.data);
      } catch (error) {
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(bookHttpStatus.BAD_REQUEST.code).send(bookHttpStatus.BAD_REQUEST.code);
        }
      }
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