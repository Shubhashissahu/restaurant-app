// src/pages/Dashboard.js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

const API = 'http://localhost:5000/api';

export default function Dashboard() {
  const [consumers, setConsumers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course'
  });
  const [addMsg, setAddMsg] = useState('');

  useEffect(() => {
    axios.get(`${API}/consumers`).then(r => setConsumers(r.data));
    axios.get(`${API}/menu`).then(r => setMenuItems(r.data));
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/menu`, {
        ...newItem,
        price: Number(newItem.price)
      });

      setMenuItems([...menuItems, res.data.item]);
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'Main Course'
      });

      setAddMsg('Item added successfully!');
      setTimeout(() => setAddMsg(''), 3000);
    } catch (err) {
      setAddMsg(err.response?.data?.message || 'Failed to add item');
    }
  };

  const workingHours = [
    { day: 'Mon – Fri', hours: '9:00 AM – 10:00 PM' },
    { day: 'Saturday', hours: '10:00 AM – 11:00 PM' },
    { day: 'Sunday', hours: '11:00 AM – 9:00 PM' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard — RestaurantApp</title>
      </Helmet>

      <div className="page-container">
        <h1>Dashboard</h1>

        <div className="dashboard-grid">

          {/* Working Hours */}
          <section className="dashboard-card">
            <h2>Working Hours</h2>
            {workingHours.map((wh) => (
              <div key={wh.day} className="hours-row">
                <strong>{wh.day}</strong>
                <span>{wh.hours}</span>
              </div>
            ))}
          </section>

          {/* Add Menu Item */}
          <section className="dashboard-card">
            <h2>Add Menu Item</h2>

            {addMsg && (
              <div className="alert alert-success">{addMsg}</div>
            )}

            <form onSubmit={handleAddItem}>
              <input
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                required
              />

              <input
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                required
              />

              <input
                placeholder="Price (₹)"
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                required
                min="0"
              />

              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option>Main Course</option>
                <option>Starters</option>
                <option>Beverages</option>
                <option>Desserts</option>
              </select>

              <button type="submit" className="btn btn-primary">
                Add Item
              </button>
            </form>
          </section>

          {/* Menu Items Table */}
          <section className="dashboard-card full-width">
            <h2>Menu Items ({menuItems.length})</h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Description</th>
                </tr>
              </thead>

              <tbody>
                {menuItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>₹{item.price}</td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Registered Consumers */}
          <section className="dashboard-card full-width">
            <h2>Registered Consumers ({consumers.length})</h2>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                </tr>
              </thead>

              <tbody>
                {consumers.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </>
  );
}