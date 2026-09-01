import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";
const INPUT = "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

function RoleModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || { name: "", description: "" });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Role name is required");
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">{initial ? "Edit Role" : "Create Role"}</h2>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input className={INPUT} placeholder="Role Name (e.g. admin)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className={`${INPUT} resize-none h-24`} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold py-3 rounded-xl transition">
            {initial ? "Save Changes" : "Create Role"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    axios.get(`${API}/roles`, config)
      .then(res => setRoles(res.data))
      .catch(err => toast.error("Failed to fetch roles"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (data) => {
    try {
      const res = await axios.post(`${API}/roles`, data, config);
      setRoles(prev => [...prev, res.data]);
      toast.success("Role created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating role");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.put(`${API}/roles/${editRole._id}`, data, config);
      setRoles(prev => prev.map(r => r._id === editRole._id ? res.data : r));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await axios.delete(`${API}/roles/${id}`, config);
      setRoles(prev => prev.filter(r => r._id !== id));
      toast.success("Role deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Role Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A2E24]">
            {loading ? <tr><td colSpan={3} className="p-6 text-center text-[#C2B59B]">Loading...</td></tr> : roles.map((r) => (
              <tr key={r._id} className="hover:bg-[#2A2A2A]/50 transition">
                <td className="px-6 py-4 font-semibold capitalize">{r.name}</td>
                <td className="px-6 py-4 text-[#C2B59B]">{r.description || "—"}</td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => { setEditRole(r); setShowModal(true); }} className="text-[#D4A373] hover:text-white">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <RoleModal 
          initial={editRole}
          onClose={() => { setShowModal(false); setEditRole(null); }} 
          onSubmit={editRole ? handleUpdate : handleCreate} 
        />
      )}
    </div>
  );
}
