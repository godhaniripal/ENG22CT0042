const express = require('express');
const cors = require('cors');
const config = require('./src/config');

// Import routes
const stockRoutes = require('./src/routes/stockRoutes');
const stockApiService = require('./src/services/stockApiService');

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/', stockRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`API Base URL: ${config.stockApiBaseUrl}`);
  
  // Test connection on startup
  try {
    const connStatus = await stockApiService.testConnection();
    if (connStatus.success) {
      console.log(`Connected to stock API - found ${connStatus.stockCount} stocks`);
    } else {
      console.error(`Failed to connect to stock API: ${connStatus.message}`);
    }
  } catch (error) {
    console.error('Error testing connection:', error.message);
  }
});
