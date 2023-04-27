import database from '../config/mysql.config.js';
import Response from '../domain/response.js';
import logger from '../util/logger.js';
import QUERY_CUSTOMER from '../query/customer.query.js';

const customerHttpStatus = {
    OK: { code: 200, status: 'OK' },
    CREATED: { code: 201, status: 'CREATED' },
    BAD_REQUEST: { code: 400, status: 'BAD_REQUEST' },
    NOT_FOUND: { code: 404, status: 'NOT_FOUND' },
    UNPROCESSABLE_CONTENT: { code: 422, status: 'UNPROCESSABLE_CONTENT' }
};

/*
export const retrieveCustomerById = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by id`);
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_ID, [req.params.id], (error, results) => {
        if(!results[0]) {
            res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'ID does not exist in the system'));
        }
        else {
            res.status(customerHttpStatus.OK.code).send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'Success', results[0]));
        }
    });
};
*/

export const retrieveCustomerById = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by id`);
    const id = parseInt(req.params.id);
    if(isNaN(id)) {
        res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'ID must be a valid number'));
    }
    else {
        database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_ID, [id], (error, results) => {
            if(!results[0]) {
                res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'ID does not exist in the system'));
            }
            else {
                res.status(customerHttpStatus.OK.code).send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'Success', results[0]));
            }
        });
    }
};

/*
export const retrieveCustomerByUserId = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by id`);
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, [req.params.userId], (error, results) => {
        // Validate the userId as a valid email address
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(userId)) {
            return res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid email address'));
        }
        else if(!results[0]) {
            res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'User-ID does not exist in the system'));
        }
        else {
            res.status(customerHttpStatus.OK.code).send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'Success', results[0]));
        }
    });
};
*/

export const retrieveCustomerByUserId = (req, res) => {
    const userId = req.query.userId;
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by user ID: ${userId}`);
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, [userId], (error, results) => {
        // Validate the userId as a valid email address
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(userId)) {
            return res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid email address'));
        }
        else if (!results[0]) {
            res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'User-ID does not exist in the system'));
        }
        else {
            res.status(customerHttpStatus.OK.code).send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'Success', results[0]));
        }
    });
};

/*
export const addCustomer = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);
    database.query(QUERY_CUSTOMER.ADD_CUSTOMER, Object.values(req.body), (error, results) => {
        if(!results) {
            logger.error(error.message);
            res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
        }
        else {
            const customer = { id: results.insertedId, ...req.body, created_at: new Date() };
            res.status(customerHttpStatus.CREATED.code).send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
        }
    });
};
*/

/*
export const addCustomer = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);
    
    const { userId, name, phone, address, city, state, zipcode, address2 } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userId)) {
        res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'User ID must be a valid email address'));
        return;
    }

    // Validate state abbreviation
    const stateRegex = /^[A-Za-z]{2}$/;
    if (!stateRegex.test(state)) {
        res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'State must be a valid 2-letter US state abbreviation'));
        return;
    }

    // Validate mandatory fields
    const mandatoryFields = ['userId', 'name', 'phone', 'address', 'city', 'state', 'zipcode'];
    const missingFields = mandatoryFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        const message = `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`;
        res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, message));
        return;
    }

    database.query(QUERY_CUSTOMER.ADD_CUSTOMER, Object.values(req.body), (error, results) => {
        if (error) {
            logger.error(error.message);
            res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
            return;
        }
        if (!results.insertId) {
            res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'This user ID already exists in the system.'));
            return;
        }

        const customer = { id: results.insertId, ...req.body, created_at: new Date() };
        const location = `${req.protocol}://${req.get('host')}${req.baseUrl}/customers/${customer.id}`;
        res.status(customerHttpStatus.CREATED.code).set('Location', location).send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
    });
};
*/

/*
export const addCustomer = (req, res) => {
    const { userId, name, phone, address, address2, city, state, zipcode } = req.body;
  
    // Validate input
    if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
      res.status(customerHttpStatus.BAD_REQUEST.code).send(
        new Response(
          customerHttpStatus.BAD_REQUEST.code,
          customerHttpStatus.BAD_REQUEST.status,
          'Illegal, missing, or malformed input'
        )
      );
      return;
    }
  
    const emailRegex = /\S+@\S+\.\S+/;
    const stateRegex = /^[A-Za-z]{2}$/;
  
    if (!emailRegex.test(userId) || !stateRegex.test(state)) {
      res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(
        new Response(
          customerHttpStatus.UNPROCESSABLE_CONTENT.code,
          customerHttpStatus.UNPROCESSABLE_CONTENT.status,
          'Invalid input format'
        )
      );
      return;
    }
  
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);
    database.query(QUERY_CUSTOMER.ADD_CUSTOMER, Object.values(req.body), (error, results) => {
      if (error) {
        logger.error(error.message);
        res.status(customerHttpStatus.BAD_REQUEST.code).send(
          new Response(
            customerHttpStatus.BAD_REQUEST.code,
            customerHttpStatus.BAD_REQUEST.status,
            'Illegal, missing, or malformed input'
          )
        );
      } else if (!results.insertedId) {
        res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(
          new Response(
            customerHttpStatus.UNPROCESSABLE_CONTENT.code,
            customerHttpStatus.UNPROCESSABLE_CONTENT.status,
            'User ID already exists in the system'
          )
        );
      } else {
        const customer = { id: results.insertedId, ...req.body, created_at: new Date() };
        res.status(customerHttpStatus.CREATED.code).send(
          new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', {
            customer,
          })
        );
      }
    });
  };
*/

export const addCustomer = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);

    const { userId, name, phone, address, address2, city, state, zipcode } = req.body;

    // Validate the request data
    if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
    }

    // Validate the userId as a valid email address
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(userId)) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid email address'));
    }

    // Validate the state as a valid 2-letter US state abbreviation
    const stateRegex = /^[A-Z]{2}$/;
    if (!stateRegex.test(state)) {
        return res.status(customerHttpStatus.BAD_REQUEST.code).send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid state abbreviation'));
    }

    // Check if the user ID already exists in the database
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, userId, (error, results) => {
        if (error) {
            logger.error(error.message);
            return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'Database error'));
        }

        if (results.length > 0) {
            return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'This user ID already exists in the system.'));
        }

        // If user ID is unique, add the customer to the database
        database.query(QUERY_CUSTOMER.ADD_CUSTOMER, Object.values(req.body), (error, results) => {
            if (error) {
                logger.error(error.message);
                return res.status(customerHttpStatus.UNPROCESSABLE_CONTENT.code).send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'Database error'));
            }

            const customer = { id: results.insertedId, ...req.body, created_at: new Date() };
            const locationHeader = `${req.protocol}://${req.get('host')}${req.originalUrl}/${customer.id}`;
            return res.status(customerHttpStatus.CREATED.code).header('Location', locationHeader).send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
        });
    });
};

export default customerHttpStatus;