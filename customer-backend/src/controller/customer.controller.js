import database from '../config/mysql.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import QUERY_CUSTOMER from '../query/customer.query.js';
import kafka from 'kafka-node';

const customerHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' }
};

export const retrieveCustomerById = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by id`);
    const id = req.params.id;
    if(isNaN(id)) {
        res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
    }
    else {
        database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_ID, [id], (error, results) => {
            if(!results[0]) {
                res.status(customerHttpStatus.NOT_FOUND.code).send(customerHttpStatus.NOT_FOUND.code);
            }
            else {
                res.status(customerHttpStatus.OK.code).send(results[0]);
            }
        });
    }
};

export const retrieveCustomerByUserId = (req, res) => {
    const userId = req.query.userId;
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by user ID: ${userId}`);
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, [userId], (error, results) => {
        // Validate the userId as a valid email address
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(userId)) {
            return res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
        }
        else if (!results[0]) {
            res.status(customerHttpStatus.NOT_FOUND.code).send(customerHttpStatus.NOT_FOUND.code);
        }
        else {
            res.status(customerHttpStatus.OK.code).send(results[0]);
        }
    });
};

export const addCustomer = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);

    const { userId, name, phone, address, address2, city, state, zipcode } = req.body;

    // Validate the request data
    if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
    }

    // Validate the userId as a valid email address
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(userId)) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
    }

    // Validate the state as a valid 2-letter US state abbreviation
    const stateRegex = /^[A-Z]{2}$/;
    if (!stateRegex.test(state)) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(customerHttpStatus.BAD_REQUEST.code);
    }

    // Check if the user ID already exists in the database
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, userId, (error, results) => {
        if (error) {
            logger.error(error.message);
            return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(customerHttpStatus.UNPROCESSABLE_CONTENT.code);
        }

        if (results.length > 0) {
            return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send({ message: 'This user ID already exists in the system.' });
        }

        // If user ID is unique, add the customer to the database
        database.query(QUERY_CUSTOMER.ADD_CUSTOMER, Object.values(req.body), (error, results) => {
            if (error) {
                logger.error(error.message);
                return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(customerHttpStatus.UNPROCESSABLE_CONTENT.code);
            }

            const customer = { id: results.insertId, ...req.body };
            return res.status(customerHttpStatus.CREATED.code).send(customer);
        });
    });

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

      return res.status(customerHttpStatus.CREATED.code).header('Location', locationHeader).send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
    
};

export default customerHttpStatus;