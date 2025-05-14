// File: src/config.js
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  stockApiBaseUrl: process.env.STOCK_API_BASE_URL || 'http://20.244.56.144/evaluation-service',
  authToken: process.env.AUTH_TOKEN,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Derived settings
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};
