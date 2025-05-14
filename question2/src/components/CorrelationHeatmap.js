import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CorrelationHeatmap.css';

const CorrelationHeatmap = ({ stocks }) => {
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [timeInterval, setTimeInterval] = useState(30);
  const [correlationData, setCorrelationData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maxStocksReached, setMaxStocksReached] = useState(false);

  const MAX_STOCKS = 5;

  useEffect(() => {
    if (stocks?.length > 0 && selectedStocks.length === 0) {
      // Default to first two stocks
      const initialStocks = stocks.slice(0, 2).map(stock => stock.ticker);
      setSelectedStocks(initialStocks);
    }
  }, [stocks, selectedStocks]);

  useEffect(() => {
    setMaxStocksReached(selectedStocks.length >= MAX_STOCKS);
  }, [selectedStocks]);

  useEffect(() => {
    const fetchCorrelationData = async () => {
      if (selectedStocks.length < 2) return;
      
      setLoading(true);
      setError(null);
      setCorrelationData({});
      
      // Create a map to store correlation data
      const correlations = {};
      
      // For each pair of stocks, fetch correlation
      for (let i = 0; i < selectedStocks.length; i++) {
        for (let j = i + 1; j < selectedStocks.length; j++) {
          const stock1 = selectedStocks[i];
          const stock2 = selectedStocks[j];
          
          try {
            const response = await axios.get(
              `http://localhost:5000/stockcorrelation?minutes=${timeInterval}&ticker=${stock1}&ticker=${stock2}`
            );
            
            if (!correlations[stock1]) correlations[stock1] = {};
            if (!correlations[stock2]) correlations[stock2] = {};
            
            // Store correlation in both directions
            correlations[stock1][stock2] = response.data.correlation;
            correlations[stock2][stock1] = response.data.correlation;
            
            // Store a correlation of 1 for the same stock
            correlations[stock1][stock1] = 1;
            correlations[stock2][stock2] = 1;
          } catch (err) {
            console.error(`Error fetching correlation for ${stock1} and ${stock2}:`, err);
            setError(`Failed to fetch correlation data for ${stock1} and ${stock2}`);
          }
        }
      }
      
      setCorrelationData(correlations);
      setLoading(false);
    };
    
    fetchCorrelationData();
  }, [selectedStocks, timeInterval]);

  const handleStockSelection = (e) => {
    const ticker = e.target.value;
    
    if (selectedStocks.includes(ticker)) {
      setSelectedStocks(selectedStocks.filter(s => s !== ticker));
    } else if (selectedStocks.length < MAX_STOCKS) {
      setSelectedStocks([...selectedStocks, ticker]);
    }
  };

  const handleTimeIntervalChange = (e) => {
    setTimeInterval(parseInt(e.target.value));
  };

  const getStockName = (ticker) => {
    const stock = stocks?.find(s => s.ticker === ticker);
    return stock ? stock.name : ticker;
  };

  const getCorrelationColor = (correlation) => {
    if (correlation === null || correlation === undefined) return '#eee';
    
    if (correlation >= 0.8) return '#d81b60';  // Strong positive - dark pink
    if (correlation >= 0.5) return '#f06292';  // Moderate positive - pink
    if (correlation >= 0.2) return '#f8bbd0';  // Weak positive - light pink
    if (correlation > -0.2) return '#e0e0e0';  // No correlation - gray
    if (correlation > -0.5) return '#bbdefb';  // Weak negative - light blue
    if (correlation > -0.8) return '#64b5f6';  // Moderate negative - blue
    return '#1976d2';  // Strong negative - dark blue
  };

  const getCorrelationDescription = (correlation) => {
    if (correlation === null || correlation === undefined) return 'No data';
    if (correlation === 1) return 'Perfect correlation';
    
    if (correlation >= 0.8) return 'Strong positive';
    if (correlation >= 0.5) return 'Moderate positive';
    if (correlation >= 0.2) return 'Weak positive';
    if (correlation > -0.2) return 'No correlation';
    if (correlation > -0.5) return 'Weak negative';
    if (correlation > -0.8) return 'Moderate negative';
    return 'Strong negative';
  };

  return (
    <div className="content">
      <div className="section controls">
        <div className="control-group stock-selector">
          <label>Select Stocks (up to {MAX_STOCKS}):</label>
          <div className="stock-checkbox-container">
            {stocks?.map(stock => (
              <div key={stock.ticker} className="stock-checkbox">
                <input
                  type="checkbox"
                  id={`stock-${stock.ticker}`}
                  value={stock.ticker}
                  checked={selectedStocks.includes(stock.ticker)}
                  onChange={handleStockSelection}
                  disabled={maxStocksReached && !selectedStocks.includes(stock.ticker)}
                />
                <label htmlFor={`stock-${stock.ticker}`}>
                  {stock.name} ({stock.ticker})
                </label>
              </div>
            ))}
          </div>
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
        <h2 className="section-title">Stock Price Correlation Heatmap</h2>
        
        {selectedStocks.length < 2 ? (
          <div className="info-message">Please select at least 2 stocks to generate a correlation heatmap</div>
        ) : loading ? (
          <div className="loading">Calculating correlations...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="correlation-info">
              <p>The heatmap shows the Pearson correlation coefficient between stock prices:</p>
              <ul>
                <li><span className="color-sample" style={{backgroundColor: '#d81b60'}}></span> +0.8 to +1.0: Strong positive correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#f06292'}}></span> +0.5 to +0.8: Moderate positive correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#f8bbd0'}}></span> +0.2 to +0.5: Weak positive correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#e0e0e0'}}></span> -0.2 to +0.2: No significant correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#bbdefb'}}></span> -0.5 to -0.2: Weak negative correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#64b5f6'}}></span> -0.8 to -0.5: Moderate negative correlation</li>
                <li><span className="color-sample" style={{backgroundColor: '#1976d2'}}></span> -1.0 to -0.8: Strong negative correlation</li>
              </ul>
            </div>
            
            <div className="heatmap-container">
              <table className="heatmap">
                <thead>
                  <tr>
                    <th></th>
                    {selectedStocks.map(ticker => (
                      <th key={ticker}>{ticker}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStocks.map(ticker1 => (
                    <tr key={ticker1}>
                      <th>{ticker1}</th>
                      {selectedStocks.map(ticker2 => {
                        const correlation = correlationData[ticker1]?.[ticker2] ?? null;
                        return (
                          <td 
                            key={ticker2} 
                            style={{backgroundColor: getCorrelationColor(correlation)}}
                            title={`${ticker1} vs ${ticker2}: ${correlation?.toFixed(4) || 'N/A'} (${getCorrelationDescription(correlation)})`}
                          >
                            {correlation !== null ? correlation.toFixed(4) : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="correlation-details">
              <h3>Correlation Details</h3>
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Stock Pair</th>
                    <th>Correlation</th>
                    <th>Relationship</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStocks.flatMap((ticker1, index) => 
                    selectedStocks.slice(index + 1).map(ticker2 => {
                      const correlation = correlationData[ticker1]?.[ticker2];
                      return (
                        <tr key={`${ticker1}-${ticker2}`}>
                          <td>{getStockName(ticker1)} ({ticker1}) vs {getStockName(ticker2)} ({ticker2})</td>
                          <td>{correlation !== null && correlation !== undefined ? correlation.toFixed(4) : 'N/A'}</td>
                          <td>{getCorrelationDescription(correlation)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CorrelationHeatmap;
