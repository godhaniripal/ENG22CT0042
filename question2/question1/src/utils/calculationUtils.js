const moment = require('moment');

/**
 * Calculate the average of an array of numbers
 * @param {Array<number>} numbers - Array of numbers to calculate average
 * @returns {number} - The average value
 */
const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
};

/**
 * Calculate Pearson correlation coefficient between two arrays of numbers
 * @param {Array<number>} xValues - First array of numbers
 * @param {Array<number>} yValues - Second array of numbers
 * @returns {number} - The correlation coefficient between -1 and 1
 */
const calculateCorrelation = (xValues, yValues) => {
  if (!xValues || !yValues || xValues.length < 2 || yValues.length < 2) {
    return null;
  }

  // Calculate means
  const xMean = calculateAverage(xValues);
  const yMean = calculateAverage(yValues);
  
  // Calculate covariance and standard deviations
  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;
  
  const n = Math.min(xValues.length, yValues.length);
  
  for (let i = 0; i < n; i++) {
    const xDiff = xValues[i] - xMean;
    const yDiff = yValues[i] - yMean;
    
    covariance += xDiff * yDiff;
    xVariance += xDiff * xDiff;
    yVariance += yDiff * yDiff;
  }
  
  // Calculate correlation using Pearson formula
  covariance /= (n - 1);
  const xStdDev = Math.sqrt(xVariance / (n - 1));
  const yStdDev = Math.sqrt(yVariance / (n - 1));
  
  // Avoid division by zero
  if (xStdDev === 0 || yStdDev === 0) {
    return null;
  }
  
  return covariance / (xStdDev * yStdDev);
};

/**
 * Format a correlation coefficient to 4 decimal places
 * @param {number} correlation - The correlation coefficient
 * @returns {number} - Formatted correlation coefficient
 */
const formatCorrelation = (correlation) => {
  if (correlation === null) return null;
  return parseFloat(correlation.toFixed(4));
};

/**
 * Extract prices from price history data
 * @param {Array<Object>} priceHistory - Array of price history objects
 * @returns {Array<number>} - Array of prices
 */
const extractPrices = (priceHistory) => {
  return priceHistory.map(item => item.price);
};

/**
 * Parse and validate minutes parameter
 * @param {string} minutesParam - The minutes parameter from request
 * @returns {number} - Validated minutes value
 */
const parseMinutes = (minutesParam) => {
  const minutes = parseInt(minutesParam);
  if (isNaN(minutes) || minutes <= 0) {
    throw new Error('Minutes parameter must be a positive number');
  }
  return minutes;
};

/**
 * Validate ticker parameter
 * @param {string} ticker - The ticker parameter from request
 */
const validateTicker = (ticker) => {
  if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
    throw new Error('Invalid ticker parameter');
  }
};

/**
 * Time-align price histories for correlation calculation
 * @param {Array<Object>} history1 - Price history for first ticker
 * @param {Array<Object>} history2 - Price history for second ticker
 * @returns {Object} - Object containing time-aligned price arrays
 */
const timeAlignPriceHistories = (history1, history2) => {

  const sortedHistory1 = [...history1].sort((a, b) => 
    new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt));
  const sortedHistory2 = [...history2].sort((a, b) => 
    new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt));
 
  const startTime1 = new Date(sortedHistory1[0].lastUpdatedAt).getTime();
  const startTime2 = new Date(sortedHistory2[0].lastUpdatedAt).getTime();
  const endTime1 = new Date(sortedHistory1[sortedHistory1.length - 1].lastUpdatedAt).getTime();
  const endTime2 = new Date(sortedHistory2[sortedHistory2.length - 1].lastUpdatedAt).getTime();
  
  const startTime = Math.max(startTime1, startTime2);
  const endTime = Math.min(endTime1, endTime2);

  if (startTime > endTime) {
    return { aligned1: [], aligned2: [] };
  }
  

  const filteredHistory1 = sortedHistory1.filter(item => 
    new Date(item.lastUpdatedAt).getTime() >= startTime && 
    new Date(item.lastUpdatedAt).getTime() <= endTime
  );
  
  const filteredHistory2 = sortedHistory2.filter(item => 
    new Date(item.lastUpdatedAt).getTime() >= startTime && 
    new Date(item.lastUpdatedAt).getTime() <= endTime
  );
  

  const prices1 = filteredHistory1.map(item => item.price);
  const prices2 = filteredHistory2.map(item => item.price);
  
  return { 
    aligned1: prices1, 
    aligned2: prices2,
    filteredHistory1,
    filteredHistory2
  };
};

module.exports = {
  calculateAverage,
  calculateCorrelation,
  formatCorrelation,
  extractPrices,
  parseMinutes,
  validateTicker,
  timeAlignPriceHistories
};
