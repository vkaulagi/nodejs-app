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

export const retrieveCustomerByUserId = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, retrieving customer by id`);
    database.query(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, [req.params.userId], (error, results) => {
        if(!results[0]) {
            res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'User-ID does not exist in the system'));
        }
        else {
            res.status(customerHttpStatus.OK.code).send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'Success', results[0]));
        }
    });
};

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

export default customerHttpStatus;