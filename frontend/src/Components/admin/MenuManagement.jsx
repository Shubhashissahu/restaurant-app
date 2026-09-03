import { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Pencil, Trash2, X, Power, PowerOff, ChevronRight, ChevronDown, MenuSquare, RotateCw } from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

function NavMenuModal({ initial, menus, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || { name: "", path: "", icon: "", parentId: "", order: 0 }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Menu name is required");
    setSubmitting(true);
    try {
      await onSubmit({ ...form, parentId: form.parentId || null });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl shadow-2xl w-full max-w-md p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#3A2E24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <MenuSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">{initial ? "Edit Menu" : "Create Menu"}</h2>
              <p className="text-xs text-[#C2B59B]">Configure navigation routes and hierarchy</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-[#FAF7F2] p-1 rounded-lg hover:bg-[#2A2A2A]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Menu Name *</label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. Dashboard, Menus, Settings"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Route Path</label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. /dashboard/menus"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Icon Name (Lucide)</label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. LayoutDashboard, MenuSquare"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Parent Menu</label>
            <select
              className={INPUT_STYLE}
              value={form.parentId || ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value })}
            >
              <option value="">None (Top Level)</option>
              {menus
                .filter((m) => m._id !== initial?._id)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Sort Order</label>
            <input
              type="number"
              className={INPUT_STYLE}
              placeholder="0"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
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
              {submitting ? "Saving..." : initial ? "Save Changes" : "Create Menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = () => {
    api
      .get("/nav-menu")
      .then((res) => setMenus(res.data || []))
      .catch(() => toast.error("Failed to fetch menus"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (data) => {
    try {
      const res = await api.post("/nav-menu", data);
      setMenus((prev) => [...prev, res.data]);
      toast.success("Navigation menu created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating menu");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await api.put(`/nav-menu/${editMenu._id}`, data);
      setMenus((prev) => prev.map((m) => (m._id === editMenu._id ? res.data : m)));
      toast.success("Navigation menu updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating menu");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await api.put(`/nav-menu/${id}`, { isActive: !currentStatus });
      setMenus((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      toast.success("Menu status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    try {
      await api.delete(`/nav-menu/${id}`);
      setMenus((prev) => prev.filter((m) => m._id !== id));
      toast.success("Menu deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting menu");
    }
  };

  const buildTree = (menusList, parentId = null) => {
    return menusList
      .filter((m) => m.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((m) => ({ ...m, children: buildTree(menusList, m._id) }));
  };

  const tree = buildTree(menus);

  const renderTree = (nodes, depth = 0) => {
    return nodes.map((node) => (
      <div key={node._id} className="w-full">
        <div
          className={`flex items-center justify-between py-3.5 px-6 hover:bg-[#2A2A2A]/50 transition border-b border-[#3A2E24]/60 ${
            depth === 0 ? "bg-[#1E1E1E]" : ""
          }`}
        >
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {node.children.length > 0 ? (
              <ChevronDown size={15} className="text-[#D4A373]" />
            ) : (
              <ChevronRight size={15} className="text-[#8B7E6A]" />
            )}
            <span className="font-semibold text-[#FAF7F2] text-sm">{node.name}</span>
            <span className="text-xs text-[#8B7E6A] font-mono bg-[#2A2A2A] px-2 py-0.5 rounded border border-[#3A2E24]">
              {node.path || "/"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                node.isActive !== false
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {node.isActive !== false ? "Active" : "Hidden"}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleToggleStatus(node._id, node.isActive !== false)}
                className={`p-1.5 rounded-lg border transition ${
                  node.isActive !== false
                    ? "text-red-400 border-red-500/20 hover:bg-red-500/10"
                    : "text-green-400 border-green-500/20 hover:bg-green-500/10"
                }`}
                title="Toggle Status"
              >
                {node.isActive !== false ? <PowerOff size={14} /> : <Power size={14} />}
              </button>
              <button
                onClick={() => {
                  setEditMenu(node);
                  setShowModal(true);
                }}
                className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                title="Edit Menu"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(node._id)}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                title="Delete Menu"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {node.children.length > 0 && <div className="w-full">{renderTree(node.children, depth + 1)}</div>}
      </div>
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2E24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#FAF7F2]">Menu Management</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
              {menus.length} Menus
            </span>
          </div>
          <p className="text-xs text-[#C2B59B]">Organize app routing hierarchies and portal links</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-[#D4A373]/20"
        >
          <Plus size={15} /> Add Menu
        </button>
      </div>

      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        {loading ? (
          <div className="p-12 text-center text-[#C2B59B]">
            <RotateCw size={20} className="animate-spin mx-auto text-[#D4A373] mb-2" />
            Loading navigation structure...
          </div>
        ) : tree.length === 0 ? (
          <div className="p-12 text-center text-[#C2B59B]">No menus found.</div>
        ) : (
          <div className="flex flex-col divide-y divide-[#3A2E24]/60">{renderTree(tree)}</div>
        )}
      </div>

      {showModal && (
        <NavMenuModal
          initial={editMenu}
          menus={menus}
          onClose={() => {
            setShowModal(false);
            setEditMenu(null);
          }}
          onSubmit={editMenu ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
