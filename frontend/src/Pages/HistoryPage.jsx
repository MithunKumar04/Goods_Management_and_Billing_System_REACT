import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HistoryPage.css';

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('https://goods-management-and-billing-system.onrender.com/api/history');
        setHistoryItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  
  // Filter history items based on selected filters
  const filteredItems = historyItems.filter(item => {
    const matchesType = filter === 'all' || item.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = item.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = userFilter === 'all' || item.user === userFilter;
    return matchesType && matchesSearch && matchesUser;
  });

  // Group by date
  const groupedHistory = filteredItems.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  const getTypeBadge = (type) => {
    switch (type.toLowerCase()) {
      case 'added':
        return <span className="badge badge-added">Product Added</span>;
      case 'updated':
        return <span className="badge badge-updated">Product Updated</span>;
      case 'order':
        return <span className="badge badge-order">New Order</span>;
      case 'status change':
        return <span className="badge badge-status">Status Change</span>;
      default:
        return <span className="badge badge-default">{type}</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <h1>System History</h1>

      <div className="history-controls">
        <div className="filter-controls">
          <label>Filter by type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Activities</option>
            <option value="added">Product Additions</option>
            <option value="updated">Product Updates</option>
            <option value="order">Orders</option>
            <option value="status change">Status Change</option>
          </select>
        </div>

      

        <div className="search-controls">
          <input
            type="text"
            placeholder="Search history details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {Object.entries(groupedHistory).length === 0 ? (
        <div className="no-results">No history items found</div>
      ) : (
        Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} className="history-day-group">
            <h2 className="history-date">{date}</h2>
            <div className="history-items">
              {items.map((item) => (
                <div key={item._id} className="history-item">
                  <div className="history-item-header">
                    {getTypeBadge(item.type)}
                    <span className="history-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="history-detail">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryPage;
