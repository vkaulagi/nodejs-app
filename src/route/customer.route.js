import express from 'express';
import { retrieveCustomerById, retrieveCustomerByUserId, addCustomer } from '../controller/customer.controller.js';

const customerRoutes = express.Router();

customerRoutes.route('/').post(addCustomer);
customerRoutes.route('/:id').get(retrieveCustomerById);
customerRoutes.route('/:userId').get(retrieveCustomerByUserId);

export default customerRoutes;