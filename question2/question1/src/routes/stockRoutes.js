const express = require('express');
const stockController = require('../controllers/stockController');
const stockApiService = require('../services/stockApiService');

const router = express.Router();


router.get('/health', async (req, res) => {
  const healthStatus = await stockApiService.testConnection();
  res.status(healthStatus.success ? 200 : 500).json(healthStatus);
});

// Get all available stocks
router.get('/stocks', async (req, res, next) => {
  try {
    const stockData = await stockApiService.getAllStocks();
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching all stocks:', error.message);
    next(error);
  }
});

router.get('/stocks/:ticker', stockController.getAverageStockPrice);


router.get('/stockcorrelation', stockController.getStockCorrelation);

module.exports = router;
