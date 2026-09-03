import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Check, X, Shield, RotateCw, Save } from "lucide-react";

export default function RolePermissions() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissions, setPermissions] = useState({}); // { menuId: { canView, canEdit } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([api.get("/roles"), api.get("/nav-menu")])
      .then(([rRes, mRes]) => {
        if (rRes.status === "fulfilled" && Array.isArray(rRes.value.data)) {
          setRoles(rRes.value.data);
          if (rRes.value.data.length > 0) {
            setSelectedRoleId(rRes.value.data[0]._id);
          }
        }
        if (mRes.status === "fulfilled" && Array.isArray(mRes.value.data)) {
          setMenus(mRes.value.data);
        }
      })
      .catch(() => toast.error("Failed to fetch permission data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;

    const defaultPerms = {};
    menus.forEach((m) => {
      defaultPerms[m._id] = { canView: false, canEdit: false };
    });
    setPermissions(defaultPerms);

    api
      .get(`/roles/${selectedRoleId}/permissions`)
      .then((res) => {
        const newPerms = { ...defaultPerms };
        if (Array.isArray(res.data)) {
          res.data.forEach((mapping) => {
            if (mapping.navMenu) {
              newPerms[mapping.navMenu._id] = {
                canView: Boolean(mapping.canView),
                canEdit: Boolean(mapping.canEdit),
              };
            }
          });
        }
        setPermissions(newPerms);
      })
      .catch(() => toast.error("Failed to fetch role permissions"));
  }, [selectedRoleId, menus]);

  const handleToggle = (menuId, field) => {
    setPermissions((prev) => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [field]: !prev[menuId]?.[field],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = Object.keys(permissions)
      .filter((menuId) => permissions[menuId].canView || permissions[menuId].canEdit)
      .map((menuId) => ({
        navMenuId: menuId,
        canView: permissions[menuId].canView,
        canEdit: permissions[menuId].canEdit,
      }));

    try {
      await api.put(`/roles/${selectedRoleId}/permissions`, { permissions: payload });
      toast.success("Permissions updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
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
            <span className="font-semibold text-[#FAF7F2] text-sm">{node.name}</span>
            <span className="text-xs text-[#8B7E6A] font-mono">{node.path}</span>
          </div>

          <div className="flex items-center gap-6 mr-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#D4A373] bg-[#2A2A2A] border-[#3A2E24]"
                checked={Boolean(permissions[node._id]?.canView)}
                onChange={() => handleToggle(node._id, "canView")}
              />
              <span className="text-xs text-[#C2B59B]">Can View</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#D4A373] bg-[#2A2A2A] border-[#3A2E24]"
                checked={Boolean(permissions[node._id]?.canEdit)}
                onChange={() => handleToggle(node._id, "canEdit")}
              />
              <span className="text-xs text-[#C2B59B]">Can Edit</span>
            </label>
          </div>
        </div>

        {node.children.length > 0 && <div className="w-full">{renderTree(node.children, depth + 1)}</div>}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-[#C2B59B] text-sm">
        <RotateCw size={24} className="animate-spin mx-auto text-[#D4A373] mb-2" />
        Loading access matrix...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2E24]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#FAF7F2]">Role Permissions</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
              Matrix View
            </span>
          </div>
          <p className="text-xs text-[#C2B59B]">Configure route views and editing permissions per user role</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] text-xs font-semibold px-5 py-2 rounded-xl transition shadow-md shadow-[#D4A373]/20 disabled:opacity-50"
        >
          <Save size={15} /> {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Roles List */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
          <h2 className="text-xs font-bold text-[#C2B59B] uppercase tracking-wider mb-3">Select Role</h2>
          {roles.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelectedRoleId(r._id)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all capitalize flex items-center justify-between ${
                selectedRoleId === r._id
                  ? "bg-[#D4A373] text-[#141414] font-bold shadow-md shadow-[#D4A373]/20"
                  : "bg-[#1E1E1E] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] border border-[#3A2E24]"
              }`}
            >
              <span>{r.name}</span>
              <Shield size={14} className={selectedRoleId === r._id ? "text-[#141414]" : "text-[#8B7E6A]"} />
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="flex-1 rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
          <div className="px-6 py-4 border-b border-[#3A2E24] bg-[#2A2A2A] flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#D4A373] uppercase tracking-wider">
              Menu Access Configuration
            </h2>
            <span className="text-[11px] text-[#C2B59B]">Can View / Can Edit</span>
          </div>

          {tree.length === 0 ? (
            <div className="p-12 text-center text-[#C2B59B]">No menus available.</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#3A2E24]/60">{renderTree(tree)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
