import express from 'express';
import ip from 'ip';
import dotenv from 'dotenv';
import cors from 'cors';
import customerHttpStatus from './controller/customer.controller.js';
import customerRoutes from './route/customer.route.js';
import logger from './util/logger.js';
import authenticate from './middleware/authenticate.js';
import Response from './domain/response.js';

dotenv.config();
const PORT = process.env.SERVER_PORT || 80;
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => res.send(new Response(customerHttpStatus.OK.code, customerHttpStatus.OK.status, 'API, v1.0.0 - All Systems Go')));

app.use(authenticate); // Middleware for JWT token validation

app.use('/customers', customerRoutes);

app.all('*', (req, res) => res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'Route does not exist on the server')));
// app.listen(PORT, () => logger.info(`Server running on: ${ip.address()}:${PORT}`));
const server = app.listen(PORT, () => logger.info(`Server running on: ${ip.address()}:${PORT}`));
server.keepAliveTimeout = 5000;
server.headersTimeout = 5100; 