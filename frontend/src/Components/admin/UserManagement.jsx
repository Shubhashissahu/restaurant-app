import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { Plus, Pencil, Trash2, X, Power, PowerOff, Users, Search, ShieldCheck, Mail, CheckCircle2, RotateCw } from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

function UserModal({ initial, roles, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", password: "", roleId: roles[0]?._id || "" }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || (!initial && !form.password)) {
      return setError("Please fill all required fields");
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl shadow-2xl w-full max-w-md p-7 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#3A2E24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">{initial ? "Edit System User" : "Create System User"}</h2>
              <p className="text-xs text-[#C2B59B]">Manage restaurant staff credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-[#FAF7F2] p-1 rounded-lg hover:bg-[#2A2A2A]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Full Name *</label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Email Address *</label>
            <input
              type="email"
              className={INPUT_STYLE}
              placeholder="e.g. john@tastehub.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {!initial && (
            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Password *</label>
              <input
                type="password"
                className={INPUT_STYLE}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Assigned Role</label>
            <select
              className={INPUT_STYLE}
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name.toUpperCase()} ({r.description || "System Role"})
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-400 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : initial ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    Promise.allSettled([api.get("/users"), api.get("/roles")])
      .then(([uRes, rRes]) => {
        if (uRes.status === "fulfilled") setUsers(uRes.value.data || []);
        if (rRes.status === "fulfilled") setRoles(rRes.value.data || []);
      })
      .catch(() => toast.error("Failed to fetch users"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data) => {
    try {
      const res = await api.post("/users", data);
      setUsers((prev) => [...prev, res.data]);
      toast.success("User created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating user");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await api.put(`/users/${editUser._id}`, data);
      setUsers((prev) => prev.map((u) => (u._id === editUser._id ? res.data : u)));
      toast.success("User updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/status`, {});
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
      toast.success(res.data.isActive ? "User account activated" : "User account deactivated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.role?.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2E24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#FAF7F2]">User Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
              {users.length} Users
            </span>
          </div>
          <p className="text-xs text-[#C2B59B]">Control dashboard access, roles, and administrative permissions</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#D4A373]/20 whitespace-nowrap"
          >
            <Plus size={15} /> Add User
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs border-b border-[#3A2E24]">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#C2B59B]">
                    <RotateCw size={20} className="animate-spin mx-auto text-[#D4A373] mb-2" />
                    Loading system users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#C2B59B]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#2A2A2A] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold text-xs flex items-center justify-center shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#FAF7F2]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#C2B59B] text-xs">
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} className="text-[#8B7E6A]" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2A2A2A] text-[#D4A373] border border-[#3A2E24] capitalize">
                        <ShieldCheck size={12} />
                        {u.role?.name || "No Role"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                          className={`p-1.5 rounded-lg border transition ${
                            u.isActive
                              ? "text-red-400 border-red-500/20 hover:bg-red-500/10"
                              : "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                          }`}
                        >
                          {u.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            setEditUser(u);
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                          title="Edit User"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UserModal
          initial={editUser ? { ...editUser, roleId: editUser.role?._id } : null}
          roles={roles}
          onClose={() => {
            setShowModal(false);
            setEditUser(null);
          }}
          onSubmit={editUser ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
