import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { Plus, Pencil, Trash2, X, ShieldAlert, Search, RotateCw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

function RoleModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || { name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Role name is required");
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
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">{initial ? "Edit Role" : "Create Role"}</h2>
              <p className="text-xs text-[#C2B59B]">Configure role scopes and access tiers</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-[#FAF7F2] p-1 rounded-lg hover:bg-[#2A2A2A]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Role Identifier *</label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. admin, manager, user"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Description</label>
            <textarea
              className={`${INPUT_STYLE} resize-none h-24`}
              placeholder="Detailed description of role scope..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
              {submitting ? "Saving..." : initial ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = () => {
    api
      .get("/roles")
      .then((res) => setRoles(res.data || []))
      .catch(() => toast.error("Failed to fetch roles"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (data) => {
    try {
      const res = await api.post("/roles", data);
      setRoles((prev) => [...prev, res.data]);
      toast.success("Role created successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating role");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await api.put(`/roles/${editRole._id}`, data);
      setRoles((prev) => prev.map((r) => (r._id === editRole._id ? res.data : r)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await api.delete(`/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r._id !== id));
      toast.success("Role deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting role");
    }
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2E24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#FAF7F2]">Role Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
              {roles.length} Roles
            </span>
          </div>
          <p className="text-xs text-[#C2B59B]">Manage access tiers, authorization scopes and staff titles</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#D4A373]/20 whitespace-nowrap"
          >
            <Plus size={15} /> Add Role
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs border-b border-[#3A2E24]">
            <tr>
              <th className="px-6 py-4 font-semibold">Role Name</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A2E24]">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#C2B59B]">
                  <RotateCw size={20} className="animate-spin mx-auto text-[#D4A373] mb-2" />
                  Loading roles...
                </td>
              </tr>
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#C2B59B]">
                  No roles match your query.
                </td>
              </tr>
            ) : (
              filteredRoles.map((r) => (
                <tr key={r._id} className="hover:bg-[#2A2A2A] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#D4A373]" />
                      <span className="font-semibold text-[#FAF7F2] capitalize">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#C2B59B] text-xs">
                    {r.description || <span className="text-[#8B7E6A] italic">No description</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditRole(r);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                        title="Edit Role"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                        title="Delete Role"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <RoleModal
          initial={editRole}
          onClose={() => {
            setShowModal(false);
            setEditRole(null);
          }}
          onSubmit={editRole ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
