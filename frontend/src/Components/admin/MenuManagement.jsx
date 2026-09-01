import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, Trash2, X, Power, PowerOff, ChevronRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const API = "http://localhost:5000/api";
const INPUT = "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

function NavMenuModal({ initial, menus, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || { name: "", path: "", icon: "", parentId: "", order: 0 });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.name.trim()) return setError("Name is required");
    onSubmit({ ...form, parentId: form.parentId || null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 border border-[#3A2E24] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#FAF7F2]">{initial ? "Edit Menu" : "Create Menu"}</h2>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block">Menu Name</label>
            <input className={INPUT} placeholder="e.g. Dashboard" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block">Path</label>
            <input className={INPUT} placeholder="e.g. /dashboard" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block">Icon (Lucide name)</label>
            <input className={INPUT} placeholder="e.g. LayoutDashboard" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block">Parent Menu</label>
            <select className={INPUT} value={form.parentId || ""} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
              <option value="">None (Top Level)</option>
              {menus.filter(m => m._id !== initial?._id).map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block">Sort Order</label>
            <input type="number" className={INPUT} placeholder="0" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
          </div>
          
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleSubmit} className="w-full bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold py-3 rounded-xl transition mt-4">
            {initial ? "Save Changes" : "Create Menu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMenu, setEditMenu] = useState(null);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = () => {
    axios.get(`${API}/nav-menu`, config)
      .then(res => setMenus(res.data))
      .catch(err => toast.error("Failed to fetch menus"))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (data) => {
    try {
      const res = await axios.post(`${API}/nav-menu`, data, config);
      setMenus(prev => [...prev, res.data]);
      toast.success("Menu created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating menu");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.put(`${API}/nav-menu/${editMenu._id}`, data, config);
      setMenus(prev => prev.map(m => m._id === editMenu._id ? res.data : m));
      toast.success("Menu updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating menu");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API}/nav-menu/${id}`, { isActive: !currentStatus }, config);
      setMenus(prev => prev.map(m => m._id === id ? res.data : m));
      toast.success("Menu status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    try {
      await axios.delete(`${API}/nav-menu/${id}`, config);
      setMenus(prev => prev.filter(m => m._id !== id));
      toast.success("Menu deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting menu");
    }
  };

  // Build hierarchy tree
  const buildTree = (menusList, parentId = null) => {
    return menusList
      .filter(m => m.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(m => ({ ...m, children: buildTree(menusList, m._id) }));
  };

  const tree = buildTree(menus);

  const renderTree = (nodes, depth = 0) => {
    return nodes.map(node => (
      <div key={node._id} className="w-full">
        <div className={`flex items-center justify-between py-3 px-4 hover:bg-[#2A2A2A]/50 transition border-b border-[#3A2E24]/50 ${depth === 0 ? 'bg-[#1E1E1E]' : ''}`}>
          <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
            {node.children.length > 0 ? <ChevronDown size={16} className="text-[#D4A373]" /> : <ChevronRight size={16} className="text-transparent" />}
            <span className="font-semibold text-[#FAF7F2]">{node.name}</span>
            <span className="text-xs text-[#8B7E6A]">{node.path}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${node.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {node.isActive ? 'Active' : 'Hidden'}
            </span>
            <div className="flex gap-2">
              <button onClick={() => handleToggleStatus(node._id, node.isActive)} className={`${node.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                {node.isActive ? <PowerOff size={15} /> : <Power size={15} />}
              </button>
              <button onClick={() => { setEditMenu(node); setShowModal(true); }} className="text-[#D4A373] hover:text-white">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(node._id)} className="text-red-400 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
        {node.children.length > 0 && (
          <div className="w-full">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> Add Menu
        </button>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-[#C2B59B]">Loading...</div>
        ) : tree.length === 0 ? (
          <div className="p-6 text-center text-[#C2B59B]">No menus found</div>
        ) : (
          <div className="flex flex-col">
            {renderTree(tree)}
          </div>
        )}
      </div>

      {showModal && (
        <NavMenuModal 
          initial={editMenu}
          menus={menus} // pass flat list to select parent
          onClose={() => { setShowModal(false); setEditMenu(null); }} 
          onSubmit={editMenu ? handleUpdate : handleCreate} 
        />
      )}
    </div>
  );
}
