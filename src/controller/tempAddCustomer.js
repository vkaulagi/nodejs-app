export const addCustomer = async (req, res) => {
    /*
    logger.info(`${req.method} ${req.originalUrl}, adding customer`);
  
    try {
      const { userId, name, phone, address, address2, city, state, zipcode } = req.body;
  
      // Validate the request data
      if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
        return res
          .status(customerHttpStatus.BAD_REQUEST.code)
          .send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Illegal, missing, or malformed input'));
      }
  
      // Validate the userId as a valid email address
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(userId)) {
        return res
          .status(customerHttpStatus.BAD_REQUEST.code)
          .send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid email address'));
      }
  
      // Validate the state as a valid 2-letter US state abbreviation
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(state)) {
        return res
          .status(customerHttpStatus.BAD_REQUEST.code)
          .send(new Response(customerHttpStatus.BAD_REQUEST.code, customerHttpStatus.BAD_REQUEST.status, 'Invalid state abbreviation'));
      }
  
      // Check if the user ID already exists in the database
      const [rows] = await database.execute(QUERY_CUSTOMER.RETRIEVE_CUSTOMER_BY_USER_ID, [userId]);
      if (rows.length > 0) {
        return res
          .status(customerHttpStatus.UNPROCESSABLE_CONTENT.code)
          .send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'This user ID already exists in the system.'));
      }
  
      // Add the customer to the database
      const [result] = await database.execute(QUERY_CUSTOMER.ADD_CUSTOMER, [userId, name, phone, address, address2, city, state, zipcode]);
      const customer = { id: result.insertId, ...req.body, created_at: new Date() };
      const locationHeader = `${req.protocol}://${req.get('host')}${req.originalUrl}/${customer.id}`;
      */

      logger.info(`${req.method} ${req.originalUrl}, adding customer`);

      try {
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
  
      producer.send({
        topic: `vkaulagi.customer.evt`,
        messages: [{ value: JSON.stringify(message) }],
      });
  
      logger.info(`Message sent to Kafka topic ${JSON.stringify(message)}`);
  
      res
        .status(customerHttpStatus.CREATED.code)
        .header('Location', locationHeader)
        .send(new Response(customerHttpStatus.CREATED.code, customerHttpStatus.CREATED.status, 'Successful customer creation', { customer }));
    } catch (error) {
      logger.error(error.message);
      res
        .status(customerHttpStatus.UNPROCESSABLE_CONTENT.code)
        .send(new Response(customerHttpStatus.UNPROCESSABLE_CONTENT.code, customerHttpStatus.UNPROCESSABLE_CONTENT.status, 'Database error'));
    }
  };