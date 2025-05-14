// to fettch the data 
const axios = require('axios');
const { getAuthToken } = require('./src/services/authService');

async function testStockFetch() {
  try {
    // Get auth token safety 
    console.log('token');
    const authResult = await getAuthToken();
    
    if (!authResult.success) {
      console.error('auth failed:', authResult.error);
      return;
    }
    
    console.log('Authentication successful');
    const token = authResult.token;
    
    
    const apiClient = axios.create({
      baseURL: 'http://20.244.56.144/evaluation-service', //this base url is there 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    
    console.log('\n getting all stocks...');
    const allStocksResponse = await apiClient.get('/stocks');
    console.log('Available tickers:', Object.values(allStocksResponse.data.stocks));
    
    
    console.log('\nFetching NVDA stock data for testing only');
    try {
      const nvdaResponse = await apiClient.get('/stocks/NVDA');
      console.log('NVDA current price:', nvdaResponse.data);
    } catch (error) {
      console.error('error fetchingg NVDA :', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    
    
    console.log('\nFetching NVDA stock data with minutes parameter...');
    try {
      const nvdaHistoryResponse = await apiClient.get('/stocks/NVDA?minutes=30');
      
      console.log('NVDA price history:', nvdaHistoryResponse.data);
    } catch (error) {
      
      
        console.error('Error fetching NVDA stock history:', error.message);
      if (error.response) {
    console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }












    console.log('\nTrying to fetch another stock from the list...');


    const stocks = Object.values(allStocksResponse.data.stocks);
    const anotherTicker = stocks[0] !== 'NVDA' ? stocks[0] : stocks[1];
    
    try {
      const anotherStockResponse = await apiClient.get(`/stocks/${anotherTicker}?minutes=30`);



      console.log(`${anotherTicker} price history:`, anotherStockResponse.data);
    } catch (error) {
  console.error(`Error fetching ${anotherTicker} stock history:`, error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testStockFetch();
