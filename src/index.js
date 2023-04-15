import express from 'express';
import ip from 'ip';
import dotenv from 'dotenv';
import cors from 'cors';
import Response from './domain/response.js';
import bookHttpStatus from './controller/book.controller.js';
import customerHttpStatus from './controller/customer.controller.js';
import bookRoutes from './route/book.route.js';
import customerRoutes from './route/customer.route.js';
import routes from './route/route.js';
import logger from './util/logger.js';

dotenv.config();
const PORT = process.env.SERVER_PORT || 3000;
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/books', bookRoutes);
app.use('/customers', customerRoutes);
//app.use('/', routes);
app.get('/', (req, res) => res.send(new Response(bookHttpStatus.OK.code, bookHttpStatus.OK.status, 'API, v1.0.0 - All Systems Go')));
app.all('*', (req, res) => res.status(customerHttpStatus.NOT_FOUND.code).send(new Response(customerHttpStatus.NOT_FOUND.code, customerHttpStatus.NOT_FOUND.status, 'Route does not exist on the server')));
app.listen(PORT, () => logger.info(`Server running on: ${ip.address()}:${PORT}`));