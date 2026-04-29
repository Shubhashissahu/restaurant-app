// src/pages/Menu.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API = 'http://localhost:5000/api';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [orderMsg, setOrderMsg] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API}/menu`;
        if (filter === 'below100') url += '?maxPrice=100';
        if (filter === 'range') url += '?minPrice=100&maxPrice=500';

        const res = await axios.get(url, {
          signal: controller.signal,
        });

        setItems(res.data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Failed to fetch menu:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort(); // cleanup to prevent memory leaks
    };
  }, [filter]);

  const handleOrder = (itemName) => {
    setOrderMsg(
      `✅ Order placed for "${itemName}"! We'll prepare it right away.`
    );
    setTimeout(() => setOrderMsg(''), 4000);
  };

  return (
    <>
      <Helmet>
        <title>Menu — RestaurantApp</title>
      </Helmet>

      <div className="page-container">
        <h1>Our Menu</h1>

        {/* Filter Buttons */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>

          <button
            className={`filter-btn ${filter === 'below100' ? 'active' : ''}`}
            onClick={() => setFilter('below100')}
          >
            Below ₹100
          </button>

          <button
            className={`filter-btn ${filter === 'range' ? 'active' : ''}`}
            onClick={() => setFilter('range')}
          >
            ₹100 – ₹500
          </button>
        </div>

        {/* Order Message */}
        {orderMsg && (
          <div className="order-confirmation">{orderMsg}</div>
        )}

        {/* Content */}
        {loading ? (
          <p className="loading">Loading menu items...</p>
        ) : items.length === 0 ? (
          <p className="empty">No items found for this filter.</p>
        ) : (
          <div className="menu-grid">
            {items.map((item) => (
              <div key={item._id} className="menu-card">
                <div className="menu-card-header">
                  <span className="category-badge">
                    {item.category}
                  </span>
                </div>

                <h3>{item.name}</h3>
                <p className="description">{item.description}</p>

                <div className="card-footer">
                  <span className="price">₹{item.price}</span>

                  <button
                    className="btn btn-order"
                    onClick={() => handleOrder(item.name)}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}