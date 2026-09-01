import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X, Power, PowerOff } from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";
const INPUT = "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

function UserModal({ initial, roles, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", password: "", roleId: roles[0]?._id || "" }
  );
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || (!initial && !form.password)) {
      return setError("Please fill all required fields");
    }
    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">{initial ? "Edit User" : "Create User"}</h2>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input className={INPUT} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="email" className={INPUT} placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {!initial && (
            <input type="password" className={INPUT} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          )}
          <select className={INPUT} value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
            {roles.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold py-3 rounded-xl transition">
            {initial ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/users`, config),
      axios.get(`${API}/roles`, config)
    ])
    .then(([uRes, rRes]) => {
      setUsers(uRes.data);
      setRoles(rRes.data);
    })
    .catch(err => toast.error("Failed to fetch users"))
    .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data) => {
    try {
      const res = await axios.post(`${API}/users`, data, config);
      setUsers(prev => [...prev, res.data]);
      toast.success("User created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating user");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.put(`${API}/users/${editUser._id}`, data, config);
      setUsers(prev => prev.map(u => u._id === editUser._id ? res.data : u));
      toast.success("User updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(`${API}/users/${id}/status`, {}, config);
      setUsers(prev => prev.map(u => u._id === id ? res.data : u));
      toast.success(res.data.isActive ? "User activated" : "User deactivated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A2E24]">
            {loading ? <tr><td colSpan={5} className="p-6 text-center text-[#C2B59B]">Loading...</td></tr> : users.map((u) => (
              <tr key={u._id} className="hover:bg-[#2A2A2A]/50 transition">
                <td className="px-6 py-4 font-semibold">{u.name}</td>
                <td className="px-6 py-4 text-[#C2B59B]">{u.email}</td>
                <td className="px-6 py-4 capitalize">{u.role?.name || "None"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-3">
                  <button onClick={() => handleToggleStatus(u._id)} title="Toggle Status" className={`${u.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                    {u.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  <button onClick={() => { setEditUser(u); setShowModal(true); }} className="text-[#D4A373] hover:text-white">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UserModal 
          initial={editUser ? { ...editUser, roleId: editUser.role?._id } : null}
          roles={roles}
          onClose={() => { setShowModal(false); setEditUser(null); }} 
          onSubmit={editUser ? handleUpdate : handleCreate} 
        />
      )}
    </div>
  );
}
