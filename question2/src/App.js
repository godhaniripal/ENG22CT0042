import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import StockPage from './components/StockPage';
import CorrelationHeatmap from './components/CorrelationHeatmap';
import axios from 'axios';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/stocks');
        if (response.data && response.data.stocks) {
          const stockList = Object.entries(response.data.stocks).map(([name, ticker]) => ({
            name,
            ticker
          }));
          setStocks(stockList);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch stocks. Make sure backend server is running.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStocks();
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <h1 className="navbar-title">Stock Price Aggregation</h1>
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : 'nav-link'}>Stock Page</NavLink>
            <NavLink to="/correlation" className={({ isActive }) => isActive ? 'active-link' : 'nav-link'}>Correlation Heatmap</NavLink>
          </div>
        </nav>

        {loading ? (
          <div className="loading">Loading stocks data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <Routes>
            <Route path="/" element={<StockPage stocks={stocks} />} />
            <Route path="/correlation" element={<CorrelationHeatmap stocks={stocks} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
