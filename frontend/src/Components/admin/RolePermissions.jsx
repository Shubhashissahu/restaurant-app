import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Check, X, Shield } from "lucide-react";

const API = "http://localhost:5000/api";
const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissions, setPermissions] = useState({}); // { menuId: { canView, canEdit } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/roles`, config),
      axios.get(`${API}/nav-menu`, config)
    ]).then(([rRes, mRes]) => {
      setRoles(rRes.data);
      setMenus(mRes.data);
      if (rRes.data.length > 0) {
        setSelectedRoleId(rRes.data[0]._id);
      }
    }).catch(err => toast.error("Failed to fetch initial data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;
    
    // Reset permissions
    const defaultPerms = {};
    menus.forEach(m => {
      defaultPerms[m._id] = { canView: false, canEdit: false };
    });
    setPermissions(defaultPerms);

    // Fetch active permissions for role
    axios.get(`${API}/roles/${selectedRoleId}/permissions`, config)
      .then(res => {
        const newPerms = { ...defaultPerms };
        res.data.forEach(mapping => {
          if (mapping.navMenu) {
            newPerms[mapping.navMenu._id] = {
              canView: mapping.canView,
              canEdit: mapping.canEdit
            };
          }
        });
        setPermissions(newPerms);
      })
      .catch(err => toast.error("Failed to fetch role permissions"));
  }, [selectedRoleId, menus]);

  const handleToggle = (menuId, field) => {
    setPermissions(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [field]: !prev[menuId][field]
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Convert object to array for API
    const payload = Object.keys(permissions)
      .filter(menuId => permissions[menuId].canView || permissions[menuId].canEdit)
      .map(menuId => ({
        navMenuId: menuId,
        canView: permissions[menuId].canView,
        canEdit: permissions[menuId].canEdit
      }));

    try {
      await axios.put(`${API}/roles/${selectedRoleId}/permissions`, { permissions: payload }, config);
      toast.success("Permissions updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  // Build hierarchy tree for display
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
            <span className="font-semibold text-[#FAF7F2]">{node.name}</span>
          </div>
          
          <div className="flex items-center gap-8 mr-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#D4A373] bg-[#2A2A2A] border-[#3A2E24] rounded focus:ring-[#D4A373]" 
                checked={permissions[node._id]?.canView || false}
                onChange={() => handleToggle(node._id, 'canView')}
              />
              <span className="text-sm text-[#C2B59B]">Can View</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#D4A373] bg-[#2A2A2A] border-[#3A2E24] rounded focus:ring-[#D4A373]" 
                checked={permissions[node._id]?.canEdit || false}
                onChange={() => handleToggle(node._id, 'canEdit')}
              />
              <span className="text-sm text-[#C2B59B]">Can Edit</span>
            </label>
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

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Role Permissions</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] disabled:opacity-50 text-[#141414] text-sm font-semibold px-6 py-2 rounded-xl transition"
        >
          <Shield size={16} /> {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Roles Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-2">
          <h2 className="text-sm font-bold text-[#C2B59B] uppercase mb-4">Select Role</h2>
          {roles.map(r => (
            <button
              key={r._id}
              onClick={() => setSelectedRoleId(r._id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all capitalize ${
                selectedRoleId === r._id
                  ? "bg-[#D4A373] text-[#141414]"
                  : "bg-[#1E1E1E] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] border border-[#3A2E24]"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        {/* Permissions Matrix */}
        <div className="flex-1 bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#3A2E24] bg-[#2A2A2A]">
            <h2 className="text-sm font-bold text-[#D4A373] uppercase tracking-wider">
              Menu Access Configuration
            </h2>
          </div>
          {tree.length === 0 ? (
            <div className="p-6 text-center text-[#C2B59B]">No menus available</div>
          ) : (
            <div className="flex flex-col">
              {renderTree(tree)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
