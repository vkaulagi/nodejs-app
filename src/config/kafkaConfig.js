export const kafkaConfig = {
    brokers: ['44.214.218.139:9092', '44.214.213.141:9092'],
    clientId: 'bookstore-app',
    consumerGroupId: 'bookstore-app-group',
    topics: {
      customerEvent: {
        topicName: `vkaulagi.customer.evt`,
        numPartitions: 1,
        replicationFactor: 1,
      },
    },
  };
  
//  export default kafkaConfig;
//export { kafkaConfig };