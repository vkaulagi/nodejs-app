import dotenv from 'dotenv';
import logger from '../util/logger.js';

dotenv.config();

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logger.error('Unauthorized: Missing Authorization header');
      return res.status(401).send(401);
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
      logger.error('Unauthorized: Missing JWT token');
      return res.status(401).send(401);
    }

    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      logger.error('Bad Request: Missing user-agent header');
      return res.status(400).send(400);
    }

    // Decode the token without verifying the signature
    const payloadBase64 = token.split('.')[1];
    const payloadString = Buffer.from(payloadBase64, 'base64').toString('utf-8');

    const user = JSON.parse(payloadString);

    if(!user.sub) {
      return res.status(401).send(401);
    }

    if(!user.exp) {
      return res.status(401).send(401);
    }

    if(!user.iss) {
      return res.status(401).send(401);
    }

    if (!['starlord', 'gamora', 'drax', 'rocket', 'groot'].includes(user.sub)) {
      logger.error('Unauthorized: Invalid JWT token (Invalid user)');
      return res.status(401).send(401);
    }

    if (user.exp <= Math.floor(Date.now() / 1000)) {
      logger.error('Unauthorized: JWT token has expired');
      return res.status(401).send(401);
    }

    if (user.iss !== 'cmu.edu') {
      logger.error('Unauthorized: Invalid JWT token (Invalid issuer)');
      return res.status(401).send(401);
    }

    next();
  } catch (error) {
    console.error('Error during JWT token decoding:', error.message);
    logger.error('Unauthorized: Invalid JWT token');
    return res.status(401).send(401);
  }
};

export default authenticate;



