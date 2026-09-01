import { useEffect, useState } from "react";
import axios from "axios";
import { Utensils, Clock, Users, Plus, Pencil, Trash2, X, Activity } from "lucide-react";

const API = "http://localhost:5000/api";

const INPUT =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border border-[#3A2E24] p-6 flex flex-col gap-4 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#2A2A2A]">
        <Icon size={22} className="text-[#D4A373]" />
      </div>
      <div>
        <p className="text-sm text-[#C2B59B] mb-1">{label}</p>
        <p className="text-3xl font-bold text-[#FAF7F2]">{value}</p>
      </div>
    </div>
  );
}

// Reusing ItemModal, ConsumerModal, MenuItemCard from original Dashboard
// We can just keep them in this file to avoid massive refactoring of existing features for now
function MenuItemCard({ item, onEdit, onDelete }) {
  return (
    <div className="border border-[#3A2E24] rounded-2xl p-5 flex flex-col gap-3 bg-[#1E1E1E] hover:shadow-2xl hover:-translate-y-1 transition">
      <div className="flex justify-between gap-2">
        <p className="font-bold text-[#FAF7F2]">{item.name}</p>
        <p className="text-[#D4A373] font-bold whitespace-nowrap">₹{Number(item.price).toLocaleString("en-IN")}</p>
      </div>
      {item.description && <p className="text-sm text-[#C2B59B]">{item.description}</p>}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs bg-[#2A2A2A] text-[#D4A373] px-3 py-1 rounded-full border border-[#3A2E24]">{item.category}</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="text-[#D4A373] hover:text-white"><Pencil size={15} /></button>
          <button onClick={() => onDelete(item._id)} className="text-red-400 hover:text-red-500"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function ItemModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || { name: "", category: "Main Course", price: "", description: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Item name is required");
    if (!form.price || Number(form.price) <= 0) return setError("Enter valid price");
    onSubmit({ ...form, price: Number(form.price) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">{initial ? "Edit Menu Item" : "Add Menu Item"}</h2>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input className={INPUT} placeholder="Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={INPUT} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option>Main Course</option>
            <option>Starters</option>
            <option>Appetizers</option>
            <option>Desserts</option>
          </select>
          <input type="number" className={INPUT} placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <textarea className={`${INPUT} resize-none h-24`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold py-3 rounded-xl transition">{initial ? "Save Changes" : "Add Menu Item"}</button>
        </div>
      </div>
    </div>
  );
}

function ConsumerModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return setError("All fields required");
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">Edit Consumer</h2>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input className={INPUT} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" className={INPUT} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="tel" className={INPUT} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold py-3 rounded-xl transition">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const [menuItems, setMenuItems] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editConsumer, setEditConsumer] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/menu`),
      axios.get(`${API}/consumers`, config),
      axios.get(`${API}/admin/stats`, config)
    ])
      .then(([m, c, s]) => {
        setMenuItems(m.data);
        setConsumers(c.data);
        setStats(s.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (item) => {
    try {
      const res = await axios.post(`${API}/menu`, item, config);
      setMenuItems((prev) => [...prev, res.data.item]);
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (item) => {
    try {
      const res = await axios.put(`${API}/menu/${item._id}`, item, config);
      setMenuItems((prev) => prev.map((i) => i._id === item._id ? res.data.item : i));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/menu/${id}`, config);
      setMenuItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) { console.error(err); }
  };

  const handleEditConsumer = async (consumer) => {
    try {
      const res = await axios.put(`${API}/consumers/${consumer._id}`, consumer, config);
      setConsumers((prev) => prev.map((c) => c._id === consumer._id ? res.data.consumer : c));
    } catch (err) { console.error(err); }
  };

  const handleDeleteConsumer = async (id) => {
    try {
      await axios.delete(`${API}/consumers/${id}`, config);
      setConsumers((prev) => prev.filter((c) => c._id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#D4A373] rounded-2xl flex items-center justify-center text-[#141414] shadow-lg">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#FAF7F2]">System Overview</h1>
            <p className="text-[#C2B59B] text-sm">A bird's-eye view of your restaurant's digital presence</p>
          </div>
        </div>
        <div className="mt-3 w-20 h-1 rounded-full bg-gradient-to-r from-[#D4A373] to-[#8B5E3C]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Utensils} label="Menu Items" value={loading ? "—" : menuItems.length} />
        <StatCard icon={Users} label="Consumers" value={loading ? "—" : stats?.totalConsumers || consumers.length} />
        <StatCard icon={Users} label="System Users" value={loading ? "—" : stats?.totalUsers || 0} />
        <StatCard icon={Clock} label="Active Menus" value={loading ? "—" : stats?.activeMenus || 0} />
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border border-[#3A2E24] p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Food Menu Items</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] text-sm font-semibold px-4 py-2.5 rounded-xl transition">
            <Plus size={16} /> Add Item
          </button>
        </div>
        {loading ? <p className="text-center text-[#C2B59B] py-10">Loading...</p> : menuItems.length === 0 ? <p className="text-center text-[#C2B59B] py-10">No items found</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => <MenuItemCard key={item._id} item={item} onEdit={setEditItem} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border border-[#3A2E24] overflow-hidden relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <div className="px-6 py-5 border-b border-[#3A2E24]">
          <h2 className="text-xl font-bold">Registered Consumers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#2A2A2A]">
              <tr>
                {["Name", "Email", "Phone", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#D4A373] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-[#C2B59B]">Loading...</td></tr> : consumers.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-[#C2B59B]">No consumers registered</td></tr> : (
                consumers.map((c) => (
                  <tr key={c._id} className="hover:bg-[#2A2A2A] transition">
                    <td className="px-6 py-4 font-medium">{c.name}</td>
                    <td className="px-6 py-4 text-[#C2B59B]">{c.email}</td>
                    <td className="px-6 py-4">{c.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setEditConsumer(c)} className="text-[#D4A373] hover:text-white"><Pencil size={16} /></button>
                        <button onClick={() => handleDeleteConsumer(c._id)} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ItemModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />}
      {editItem && <ItemModal initial={editItem} onClose={() => setEditItem(null)} onSubmit={(updated) => handleEdit({ ...editItem, ...updated })} />}
      {editConsumer && <ConsumerModal initial={editConsumer} onClose={() => setEditConsumer(null)} onSubmit={handleEditConsumer} />}
    </div>
  );
}
