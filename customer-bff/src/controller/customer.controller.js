import axios from 'axios';

const customerHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' },
    UNAUTHORIZED: { code: 401, status: 'UNAUTHORIZED' }
};

// const CUSTOMER_BACKEND_URL = 'http://localhost:3000'; // URL of the customer-backend service
const CUSTOMER_BACKEND_URL = 'http://10.0.0.49:3000';

export const addCustomer = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const customerData = req.body;
        const response = await axios.post(`${CUSTOMER_BACKEND_URL}/customers`, customerData);
        res.status(customerHttpStatus.CREATED.code).json(response.data);
      } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
          res.status(error.response.status).send(error.response.data);
        } else {
          res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
        }
      }

      // Send message to Kafka
      const message = {
        customerId: customer.id,
        userId,
        name,
        phone,
        address,
        address2,
        city,
        state,
        zipcode
      };

      const payloads = [{
        topic: 'vkaulagi.customer.evt',
        messages: JSON.stringify(message)
      }];

      producer.send(payloads, (error, data) => {
        if (error) {
          logger.error(`Error sending message to Kafka: ${error}`);
        } else {
          logger.info(`Message sent to Kafka topic ${payloads.topic}: ${JSON.stringify(data)}`);
        }
      });

      //return res.status(customerHttpStatus.CREATED.code).header('Location', locationHeader).send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
      return res.status(customerHttpStatus.CREATED.code).header('Location', locationHeader).send({ customer });
      
};

export const retrieveCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { 'user-agent': userAgent } = req.headers;
    const response = await axios.get(`${CUSTOMER_BACKEND_URL}/customers/${id}`);

    // Check if client is a mobile device and remove unnecessary attributes
    if (userAgent && userAgent.includes('Mobile')) {
      delete response.data.address;
      delete response.data.address2;
      delete response.data.city;
      delete response.data.state;
      delete response.data.zipcode;
    }

    res.status(customerHttpStatus.OK.code).json(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        res.status(customerHttpStatus.NOT_FOUND.code).send('ID does not exist in the system');
      } else {
        res.status(error.response.status).send(error.response.data);
      }
    } else {
      res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.status);
    }
  }
};

export const retrieveCustomerByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    const { 'user-agent': userAgent } = req.headers;
    const response = await axios.get(`${CUSTOMER_BACKEND_URL}/customers?userId=${userId}`);

    // Check if client is a mobile device and remove unnecessary attributes
    if (userAgent && userAgent.includes('Mobile')) {
      delete response.data.address;
      delete response.data.address2;
      delete response.data.city;
      delete response.data.state;
      delete response.data.zipcode;
    }

    res.status(customerHttpStatus.OK.code).json(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        res.status(customerHttpStatus.NOT_FOUND.code).send('User-ID does not exist in the system');
      } else {
        res.status(error.response.status).send(error.response.data);
      }
    } else {
      res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.status);
    }
  }
};

export default customerHttpStatus;