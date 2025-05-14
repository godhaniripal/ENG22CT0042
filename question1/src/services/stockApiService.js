const axios = require('axios');
const NodeCache = require('node-cache');
const moment = require('moment');
const config = require('../config');
const { getAuthToken } = require('./authService');


const CACHE_TTL = {
  DEFAULT: 60,          
  STOCK_LIST: 3600,     
  PRICE_HISTORY: 30     
};

const stockCache = new NodeCache({ 
  stdTTL: CACHE_TTL.DEFAULT,
  checkperiod: Math.min(CACHE_TTL.DEFAULT, CACHE_TTL.PRICE_HISTORY) / 2 
});

const BASE_URL = config.stockApiBaseUrl;


let authTokenCache = {
  token: null,
  expiresAt: null
};


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


async function getValidAuthToken() {
  const now = Date.now();
  

  if (authTokenCache.token && authTokenCache.expiresAt && now < authTokenCache.expiresAt) {
    console.log('Using cached auth token');
    return authTokenCache.token;
  }
  
  try {
  
    console.log('Getting new auth token from auth service...');
    const authService = require('./authService');
    const authResult = await authService.getAuthToken();
    
    if (authResult.success) {
      // Cache the token with expiry
      const expiresIn = authResult.expiresIn * 1000; // convertion because getting errror here
      authTokenCache = {
        token: authResult.token,
        expiresAt: now + expiresIn - 60000 // Expire 1 minute early to be safe
      };
      console.log('Successfully got new auth token');
      return authResult.token;
    } else {
      throw new Error(`Failed to get auth token: ${authResult.error}`);
    }
  } catch (error) {
    console.error('Error getting auth token:', error.message);
    throw error;
  }
}


apiClient.interceptors.request.use(async (request) => {
  try {
    
    const token = await getValidAuthToken();
    request.headers['Authorization'] = `Bearer ${token}`;
    
    console.log('API Request:', {
      url: `${request.baseURL}${request.url}`,
      method: request.method
    });
    
    return request;
  } catch (error) {
    console.error('Error adding auth token to request:', error.message);
    return Promise.reject(error);
  }
});




apiClient.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    console.error('API Error Response:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    }
    return Promise.reject(error);
  }
);

class StockApiService {  async getAllStocks() {
    const cacheKey = 'all_stocks';
    
   
    const cachedData = stockCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    
    try {      console.log('Fetching all stocks from API');
      const response = await apiClient.get('/stocks');
      const stockData = response.data;
      
      
      stockCache.set(cacheKey, stockData, CACHE_TTL.STOCK_LIST);
      console.log(`Cached stock list with ${Object.keys(stockData.stocks || {}).length} stocks for ${CACHE_TTL.STOCK_LIST}s`);
      
      return stockData;
    } catch (error) {
      console.error('Error fetching all stocks:', error.message);
      console.error('Full error:', error.response ? error.response.data : error);
      throw new Error('Failed to fetch stocks from the stock exchange');
    }
  }
  async getStockPriceHistory(ticker, minutes) {
    const cacheKey = `${ticker}_history_${minutes}`;
    
   
    const cachedData = stockCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    

    try {
      console.log(`Fetching price history for ${ticker}${minutes ? ` for the last ${minutes} minutes` : ''}`);
      
      const url = minutes 
        ? `/stocks/${ticker}?minutes=${minutes}` 
        : `/stocks/${ticker}`;
      
      const response = await apiClient.get(url);
      

      const stockData = minutes ? response.data : [response.data.stock]; 
       
      stockCache.set(cacheKey, stockData, CACHE_TTL.PRICE_HISTORY);
      
      console.log(`Successfully retrieved ${stockData.length} data points for ${ticker}, cached for ${CACHE_TTL.PRICE_HISTORY}s`);
      
      return stockData;
    } catch (error) {
      console.error(`Error fetching stock price history for ${ticker}:`, error.message);
      console.error('Full error:', error.response ? error.response.data : error);
      throw new Error(`Failed to fetch price history for ${ticker}`);
    }
  }

  clearCache(ticker) {
    if (ticker) {
   
      const keys = stockCache.keys();
      const tickerKeys = keys.filter(key => key.startsWith(ticker));
      tickerKeys.forEach(key => stockCache.del(key));
    } else {
   
      stockCache.flushAll();
    }
  }
  

  async testConnection() {
    try {
      console.log('Testing connection to stock API...');
      const response = await apiClient.get('/stocks');
      console.log('Connection successful');
      return { 
        success: true, 
        message: 'Connection to stock API successful',
        stockCount: Object.keys(response.data.stocks || {}).length
      };
    } catch (error) {
      console.error('Connection test failed:', error.message);
      console.error('Full error:', error.response ? error.response.data : error);
      return { 
        success: false, 
        message: `Failed to connect to stock API: ${error.message}`,
        error: error.response ? error.response.data : error.message
      };
    }
  }
}

module.exports = new StockApiService();
