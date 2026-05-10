// src/pages/Dashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Utensils,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api";

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value }) {
  return (
    <div
      className="
      bg-[#1E1E1E]
      rounded-2xl
      shadow-xl
      border border-[#3A2E24]
      p-6
      flex flex-col
      gap-4
      relative
      overflow-hidden
      before:absolute
      before:top-0
      before:left-0
      before:right-0
      before:h-1
      before:bg-gradient-to-r
      before:from-[#D4A373]
      before:to-[#8B5E3C]
    "
    >
      <div
        className="
        w-12
        h-12
        rounded-xl
        flex
        items-center
        justify-center
        bg-[#2A2A2A]
      "
      >
        <Icon size={22} className="text-[#D4A373]" />
      </div>

      <div>
        <p className="text-sm text-[#C2B59B] mb-1">{label}</p>

        <p className="text-3xl font-bold text-[#FAF7F2]">
          {value}
        </p>
      </div>
    </div>
  );
}

// ── Menu Item Card ───────────────────────────────────────────────────────────
function MenuItemCard({ item, onEdit, onDelete }) {
  return (
    <div className="border border-[#3A2E24] rounded-2xl p-5 flex flex-col justify-between gap-3 hover:shadow-2xl hover:-translate-y-1 transition duration-300 bg-[#1E1E1E]">
      
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-[#FAF7F2] text-base leading-snug">
          {item.name}
        </p>

        <p className="text-[#D4A373] font-bold text-base whitespace-nowrap shrink-0">
          ₹{Number(item.price).toLocaleString("en-IN")}
        </p>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-[#C2B59B] leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-xs bg-[#2A2A2A] text-[#D4A373] px-3 py-1 rounded-full border border-[#3A2E24]">
          {item.category}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="text-[#D4A373] hover:text-[#FAF7F2] transition"
            title="Edit"
          >
            <Pencil size={15} />
          </button>

          <button
            onClick={() => onDelete(item._id)}
            className="text-red-400 hover:text-red-500 transition"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ─────────────────────────────────────────────────────────
function ItemModal({ onClose, onSubmit, initial }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      category: "Main Course",
      price: "",
      description: "",
    }
  );

  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim())
      return setError("Item name is required.");

    if (!form.price || Number(form.price) <= 0)
      return setError("Enter a valid price.");

    onSubmit({
      ...form,
      price: Number(form.price),
    });

    onClose();
  };

  const INPUT =
    "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24]">

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">
            {initial ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>

          <button
            onClick={onClose}
            className="text-[#C2B59B] hover:text-[#FAF7F2] transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">

          <div>
            <label className="text-sm font-medium text-[#D4A373] mb-1.5 block">
              Item Name
            </label>

            <input
              className={INPUT}
              placeholder="e.g., Grilled Salmon"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#D4A373] mb-1.5 block">
              Category
            </label>

            <select
              className={INPUT}
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
            >
              <option>Main Course</option>
              <option>Starters</option>
              <option>Appetizers</option>
              <option>Desserts</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#D4A373] mb-1.5 block">
              Price
            </label>

            <input
              type="number"
              className={INPUT}
              placeholder="0.00"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#D4A373] mb-1.5 block">
              Description
            </label>

            <textarea
              className={`${INPUT} resize-none h-24`}
              placeholder="Describe the dish..."
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] active:scale-[0.98] text-[#141414] font-semibold py-3 rounded-xl transition mt-1"
          >
            {initial ? "Save Changes" : "Add Menu Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [consumers, setConsumers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/consumers`),
      axios.get(`${API}/menu`),
    ])
      .then(([c, m]) => {
        setConsumers(c.data);
        setMenuItems(m.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (item) => {
    try {
      const res = await axios.post(`${API}/menu`, item);

      setMenuItems((prev) => [
        ...prev,
        res.data.item,
      ]);
    } catch {
      console.error("Failed to add item");
    }
  };

  const handleEdit = async (item) => {
    try {
      const res = await axios.put(
        `${API}/menu/${item._id}`,
        item
      );

      setMenuItems((prev) =>
        prev.map((i) =>
          i._id === item._id
            ? res.data.item ?? item
            : i
        )
      );
    } catch {
      console.error("Failed to edit item");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/menu/${id}`);

      setMenuItems((prev) =>
        prev.filter((i) => i._id !== id)
      );
    } catch {
      console.error("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] px-6 py-8 text-[#FAF7F2]">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold text-[#FAF7F2]">
            Admin Dashboard
          </h1>

          <p className="text-[#D4A373] mt-1 text-sm">
            Manage your restaurant operations
          </p>

          <div className="mt-3 w-20 h-1 rounded-full bg-gradient-to-r from-[#D4A373] to-[#8B5E3C]" />
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            icon={Utensils}
            label="Total Menu Items"
            value={loading ? "—" : menuItems.length}
          />

          <StatCard
            icon={Clock}
            label="Operating Hours"
            value="11 AM - 10 PM"
          />

          <StatCard
            icon={Users}
            label="Registered Consumers"
            value={loading ? "—" : consumers.length}
          />
        </div>

        {/* MENU ITEMS */}
        <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border border-[#3A2E24] p-6 relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#FAF7F2]">
              Menu Items
            </h2>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] active:scale-[0.98] text-[#141414] text-sm font-semibold px-4 py-2.5 rounded-xl transition"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#C2B59B] text-center py-10">
              Loading…
            </p>
          ) : menuItems.length === 0 ? (
            <p className="text-sm text-[#C2B59B] text-center py-10">
              No items yet — click Add Item to get started
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  onEdit={(i) => setEditItem(i)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* REGISTERED CONSUMERS */}
        <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border border-[#3A2E24] overflow-hidden relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">

          <div className="px-6 py-5 border-b border-[#3A2E24]">
            <h2 className="text-xl font-bold text-[#FAF7F2]">
              Registered Consumers
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-[#2A2A2A]">
                <tr>
                  {["Name", "Email", "Phone"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-[#D4A373] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#3A2E24]">

                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-[#C2B59B]"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : consumers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-[#C2B59B]"
                    >
                      No consumers registered
                    </td>
                  </tr>
                ) : (
                  consumers.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-[#2A2A2A] transition"
                    >
                      <td className="px-6 py-4 font-medium text-[#FAF7F2]">
                        {c.name}
                      </td>

                      <td className="px-6 py-4 text-[#C2B59B]">
                        {c.email}
                      </td>

                      <td className="px-6 py-4 text-[#FAF7F2]">
                        {c.phone}
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <ItemModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {/* EDIT MODAL */}
      {editItem && (
        <ItemModal
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={(updated) =>
            handleEdit({
              ...editItem,
              ...updated,
            })
          }
        />
      )}
    </div>
  );
}