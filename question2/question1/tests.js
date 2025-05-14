const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';

// Test functions
async function testAverageStockPrice() {
  try {
    console.log('Testing Average Stock Price API...');
    // Test with NVDA and 50 minutes
    const response = await axios.get(`${API_URL}/stocks/NVDA?minutes=50&aggregation=average`);
    console.log('Response status:', response.status);
    console.log('Average price:', response.data.averageStockPrice);
    console.log('Price history entries:', response.data.priceHistory.length);
    console.log('First price entry:', response.data.priceHistory[0]);
    console.log('Average Stock Price API test completed successfully!\n');
    return response.data;
  } catch (error) {
    console.error('Error testing Average Stock Price API:', error.response?.data || error.message);
    return null;
  }
}

async function testStockCorrelation() {
  try {
    console.log('Testing Stock Correlation API...');
    // Test with NVDA and PYPL for 50 minutes
    const response = await axios.get(`${API_URL}/stockcorrelation?minutes=50&ticker=NVDA&ticker=PYPL`);
    console.log('Response status:', response.status);
    console.log('Correlation:', response.data.correlation);
    console.log('NVDA average price:', response.data.stocks.NVDA.averagePrice);
    console.log('PYPL average price:', response.data.stocks.PYPL.averagePrice);
    console.log('NVDA price history entries:', response.data.stocks.NVDA.priceHistory.length);
    console.log('PYPL price history entries:', response.data.stocks.PYPL.priceHistory.length);
    console.log('Stock Correlation API test completed successfully!');
    return response.data;
  } catch (error) {
    console.error('Error testing Stock Correlation API:', error.response?.data || error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  await testAverageStockPrice();
  console.log('-'.repeat(50));
  await testStockCorrelation();
  console.log('\nAll tests completed!');
}

runTests();
