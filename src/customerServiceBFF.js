const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const config = require('./config');

const app = express();
app.use(bodyParser.json());

app.get('/customers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const decodedToken = jwt.decode(authHeader);
    const customerId = decodedToken.customerId;
    
    const url = `${config.backendServiceUrl}/customers/${customerId}`;
    const response = await axios.get(url);

    // modify response to add user agent header
    response.data.userAgent = req.headers['user-agent'];

    res.send(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

app.post('/customers', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const decodedToken = jwt.decode(authHeader);
    const customerId = decodedToken.customerId;

    // add customerId to the request body
    req.body.customerId = customerId;

    const url = `${config.backendServiceUrl}/customers`;
    const response = await axios.post(url, req.body);

    res.send(response.data);
  } catch (error) {
    res.status(error.response.status).send(error.response.data);
  }
});

module.exports = app;


/*
const express = require('express');
const axios = require('axios');
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;

const customerServiceUrl = 'http://localhost:3000'; // URL of the Customer service

app.use(express.json());

// Validate request
const validateRequest = [
  check('firstName').isLength({ min: 2 }).withMessage('First name must be at least 2 characters long'),
  check('lastName').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long'),
  check('email').isEmail().withMessage('Invalid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Handle requests for customer creation
app.post('/customers', validateRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Forward request to customer service
    const response = await axios.post(`${customerServiceUrl}/customers`, req.body);
    // Modify response for mobile user-agent
    const ua = req.headers['user-agent'];
    if (ua && ua.includes('Mobile')) {
      const modifiedResponse = { message: 'Customer created successfully' };
      return res.status(201).json(modifiedResponse);
    }
    return res.status(201).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Handle requests for customer retrieval
app.get('/customers/:id', async (req, res) => {
  try {
    // Forward request to customer service
    const response = await axios.get(`${customerServiceUrl}/customers/${req.params.id}`);
    // Modify response for mobile user-agent
    const ua = req.headers['user-agent'];
    if (ua && ua.includes('Mobile')) {
      const modifiedResponse = { firstName: response.data.firstName, lastName: response.data.lastName };
      return res.status(200).json(modifiedResponse);
    }
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`BFF listening at http://localhost:${port}`);
});
*/
