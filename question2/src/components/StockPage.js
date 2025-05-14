import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './StockPage.css';

const StockPage = ({ stocks }) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [timeInterval, setTimeInterval] = useState(30);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (stocks?.length > 0 && !selectedStock) {
      setSelectedStock(stocks[0].ticker);
    }
  }, [stocks, selectedStock]);

  useEffect(() => {
    const fetchStockData = async () => {
      if (!selectedStock) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/stocks/${selectedStock}?minutes=${timeInterval}`);
        setStockData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [selectedStock, timeInterval]);

  const formatData = (data) => {
    if (!data || !data.priceHistory) return [];
    
    return data.priceHistory.map(item => ({
      time: new Date(item.lastUpdatedAt).toLocaleTimeString(),
      price: item.price,
      volume: item.quantity,
      date: new Date(item.lastUpdatedAt).toLocaleDateString(),
    }));
  };

  const handleStockChange = (e) => {
    setSelectedStock(e.target.value);
  };

  const handleTimeIntervalChange = (e) => {
    setTimeInterval(parseInt(e.target.value));
  };

  const getStockName = (ticker) => {
    const stock = stocks?.find(s => s.ticker === ticker);
    return stock ? stock.name : ticker;
  };

  const formattedData = formatData(stockData);

  return (
    <div className="content">
      <div className="section controls">
        <div className="control-group">
          <label htmlFor="stock-select">Select Stock:</label>
          <select 
            id="stock-select" 
            value={selectedStock} 
            onChange={handleStockChange}
            disabled={loading}
          >
            {stocks?.map(stock => (
              <option key={stock.ticker} value={stock.ticker}>
                {stock.name} ({stock.ticker})
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label htmlFor="time-interval">Time Interval (minutes):</label>
          <select 
            id="time-interval" 
            value={timeInterval} 
            onChange={handleTimeIntervalChange}
            disabled={loading}
          >
            <option value="10">10 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="120">2 hours</option>
          </select>
        </div>
      </div>
      
      <div className="section">
        <h2 className="section-title">
          {selectedStock ? `${getStockName(selectedStock)} (${selectedStock}) Price Chart` : 'Select a stock'}
        </h2>
        
        {loading ? (
          <div className="loading">Loading stock data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : stockData ? (
          <>
            <div className="chart-info">
              <div className="info-item">
                <span className="info-label">Average Price:</span>
                <span className="info-value">${stockData.averageStockPrice?.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Data Points:</span>
                <span className="info-value">{stockData.priceHistory?.length || 0}</span>
              </div>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={formattedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    padding={{ left: 10, right: 10 }} 
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Price']}
                    labelFormatter={(label) => `Time: ${label}`}
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#ddd' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3949ab" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }} 
                    dot={{ r: 2 }}
                    name="Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="price-data-table">
              <h3>Price History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Price</th>
                    <th>Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {formattedData.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{item.date} {item.time}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.volume}</td>
                    </tr>
                  ))}
                  {formattedData.length > 10 && (
                    <tr>
                      <td colSpan="3" className="table-more">
                        ... {formattedData.length - 10} more data points
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default StockPage;
