const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const config = require('./config');

const app = express();
app.use(bodyParser.json());

app.get('/books', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const decodedToken = jwt.decode(authHeader);
    const customerId = decodedToken.customerId;

    const url = `${config.backendServiceUrl}/books?customerId=${customerId}`;
    const response = await axios.get(url);

    // modify response to add user agent header
    response.data.forEach((book) => {
      book.userAgent = req.headers['user-agent'];
    });

    res.send(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

module.exports = app;
