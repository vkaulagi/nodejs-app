const config = {
    jwtSecret: '',
    jwtIssuer: 'cmu.edu',
    jwtExpiration: '2h', // token expires in 2 hours
    mobileUserAgentSubstring: 'Mobile', // substring to identify mobile user agent
    port: 80,
    backendServiceUrl: 'http://localhost:3000'
  };
  
  module.exports = config;