import { Kafka } from 'kafkajs';
import AWS from 'aws-sdk';
import { kafkaConfig } from './config/kafkaConfig.js';

const ses = new AWS.SES();

const sendEmail = (emailAddress, customerName) => {
  const params = {
    Destination: {
      ToAddresses: [emailAddress],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Dear ${customerName},\n\nWelcome to the Book store created by <your andrew ID>.\nExceptionally this time we won’t ask you to click a link to activate your account.`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Activate your book store account',
      },
    },
    Source: 'bookstore@example.com', // replace with your email address
  };
  return ses.sendEmail(params).promise();
};

const kafka = new Kafka(kafkaConfig);
const consumer = kafka.consumer({ groupId: 'crm' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'customer', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const customer = JSON.parse(message.value.toString());
      await sendEmail(customer.email, `${customer.firstName} ${customer.lastName}`);
    },
  });
};

export default consumer;

//run().catch(console.error);
