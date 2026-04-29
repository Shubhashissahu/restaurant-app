// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Utensils, Clock, Plus } from "lucide-react";

const API = "http://localhost:5000/api";

export default function Dashboard() {
  const [consumers, setConsumers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
  });

  useEffect(() => {
    axios.get(`${API}/consumers`).then((r) => setConsumers(r.data));
    axios.get(`${API}/menu`).then((r) => setMenuItems(r.data));
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const res = await axios.post(`${API}/menu`, {
      ...newItem,
      price: Number(newItem.price),
    });
    setMenuItems([...menuItems, res.data.item]);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-2 px-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard Overview
        </h1>

        {/* 🔥 STATS CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <Users className="text-teal-500" />
            <div>
              <p className="text-gray-500 text-sm">Consumers</p>
              <h2 className="text-2xl font-bold">{consumers.length}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <Utensils className="text-teal-500" />
            <div>
              <p className="text-gray-500 text-sm">Menu Items</p>
              <h2 className="text-2xl font-bold">{menuItems.length}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow flex items-center gap-4">
            <Clock className="text-teal-500" />
            <div>
              <p className="text-gray-500 text-sm">Status</p>
              <h2 className="text-2xl font-bold">Open</h2>
            </div>
          </div>

        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ADD ITEM */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} /> Add Menu Item
            </h2>

            <form onSubmit={handleAddItem} className="space-y-4">

              <input
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none"
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />

              <input
                className="w-full border p-3 rounded-xl"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />

              <input
                type="number"
                className="w-full border p-3 rounded-xl"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />

              <select
                className="w-full border p-3 rounded-xl"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option>Main Course</option>
                <option>Starters</option>
                <option>Desserts</option>
              </select>

              <button className="w-full bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 transition">
                Add Item
              </button>
            </form>
          </div>

          {/* WORKING HOURS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Working Hours</h2>

            <div className="space-y-3">
              {[
                { day: "Mon–Fri", time: "9 AM - 10 PM" },
                { day: "Saturday", time: "10 AM - 11 PM" },
                { day: "Sunday", time: "11 AM - 9 PM" },
              ].map((item) => (
                <div className="flex justify-between border-b pb-2">
                  <span>{item.day}</span>
                  <span className="text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 🔥 TABLES */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Menu Items ({menuItems.length})
          </h2>

          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">₹{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Consumers ({consumers.length})
          </h2>

          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {consumers.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}