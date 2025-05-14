const stockApiService = require('../services/stockApiService');
const {
  calculateAverage,
  calculateCorrelation,
  formatCorrelation,
  extractPrices,
  parseMinutes,
  validateTicker,
  timeAlignPriceHistories
} = require('../utils/calculationUtils');


exports.getAverageStockPrice = async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const { minutes, aggregation } = req.query;

    validateTicker(ticker);
    const validMinutes = minutes ? parseMinutes(minutes) : 60; // Default to 60 minutes if not specified
    

    if (aggregation && aggregation !== 'average') {
      return res.status(400).json({ error: 'Only "average" aggregation is currently supported' });
    }
    

    const priceHistory = await stockApiService.getStockPriceHistory(ticker, validMinutes);
    

    const prices = extractPrices(priceHistory);
    const averageStockPrice = calculateAverage(prices);

    res.json({
      averageStockPrice,
      priceHistory
    });
  } catch (error) {
    console.error('Error in getAverageStockPrice:', error.message);
    next(error);
  }
};


exports.getStockCorrelation = async (req, res, next) => {
  try {
    const { minutes, ticker } = req.query;

    const validMinutes = parseMinutes(minutes || '60'); // only 60 sec if now said
    

    if (!ticker || !Array.isArray(ticker) || ticker.length !== 2) {
      return res.status(400).json({ 
        error: 'Exactly two stock tickers must be provided using ticker[] or ticker query parameters' 
      });
    }
    
    const [ticker1, ticker2] = ticker;
    validateTicker(ticker1);
    validateTicker(ticker2);

    const [history1, history2] = await Promise.all([
      stockApiService.getStockPriceHistory(ticker1, validMinutes),
      stockApiService.getStockPriceHistory(ticker2, validMinutes)
    ]);

    const { aligned1, aligned2, filteredHistory1, filteredHistory2 } = 
      timeAlignPriceHistories(history1, history2);
    

    const correlation = calculateCorrelation(aligned1, aligned2);
    

    const average1 = calculateAverage(extractPrices(history1));
    const average2 = calculateAverage(extractPrices(history2));
    
    
    res.json({
      correlation: formatCorrelation(correlation),
      stocks: {
        [ticker1]: {
          averagePrice: average1,
          priceHistory: history1
        },
        [ticker2]: {
          averagePrice: average2,
          priceHistory: history2
        }
      }
    });
  } catch (error) {
    console.error('Error in getStockCorrelationss:', error.message);
    next(error);
  }
};
