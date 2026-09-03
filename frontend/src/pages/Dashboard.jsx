import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  MenuSquare, 
  KeySquare, 
  History, 
  UserCircle,
  LogOut,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";

import Overview from "../components/admin/Overview";
import UserManagement from "../components/admin/UserManagement";
import RoleManagement from "../components/admin/RoleManagement";
import MenuManagement from "../components/admin/MenuManagement";
import RolePermissions from "../components/admin/RolePermissions";
import AuditLogs from "../components/admin/AuditLogs";
import ProfileSettings from "../components/admin/ProfileSettings";

export default function Dashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState({ name: "Admin", role: "Super Admin" });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAdminUser({
          name: payload.name || payload.email?.split("@")[0] || "Administrator",
          email: payload.email || "admin@tastehub.com",
          role: payload.role ? payload.role.toUpperCase() : "ADMIN",
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sidebar Links
  const adminLinks = [
    { name: "Overview", path: "", icon: LayoutDashboard },
    { name: "Users", path: "users", icon: Users },
    { name: "Roles", path: "roles", icon: ShieldAlert },
    { name: "Menus", path: "menus", icon: MenuSquare },
    { name: "Permissions", path: "permissions", icon: KeySquare },
    { name: "Audit Logs", path: "audit", icon: History },
    { name: "Settings", path: "settings", icon: UserCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#141414] flex text-[#FAF7F2]">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-20 z-40 w-72 flex-shrink-0 border-r border-[#3A2E24] bg-[#1E1E1E]/95 lg:bg-[#1E1E1E]/80 backdrop-blur-2xl flex flex-col h-[calc(100vh-80px)] transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Header Title & Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3A2E24]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-xs font-bold text-[#D4A373] tracking-[0.2em] uppercase">
                  Admin Panel
                </h2>
                <p className="text-[11px] text-[#C2B59B]">TasteHub Management</p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-[#C2B59B] hover:text-[#FAF7F2] p-1 rounded-lg hover:bg-[#2A2A2A]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={`/dashboard/${link.path}`}
                  end={link.path === ""}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#D4A373] text-[#141414] shadow-md shadow-[#D4A373]/20 font-bold border border-[#D4A373]"
                        : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] border border-transparent"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="transition-transform group-hover:scale-110" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-5 border-t border-[#3A2E24] bg-[#1A1A1A]/80 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold flex items-center justify-center text-sm shadow-md shadow-[#D4A373]/20">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#FAF7F2] truncate">{adminUser.name}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#D4A373] font-medium">
                <ShieldCheck size={12} />
                <span>{adminUser.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition duration-200"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-80px)]">
        {/* Mobile Top Header Toggle */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[#3A2E24] bg-[#1E1E1E]">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[#D4A373] px-3 py-1.5 rounded-lg bg-[#D4A373]/10 border border-[#3A2E24]"
          >
            <MenuIcon size={16} />
            Navigation Menu
          </button>
          <span className="text-xs font-bold text-[#FAF7F2] uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/roles" element={<RoleManagement />} />
            <Route path="/menus" element={<MenuManagement />} />
            <Route path="/permissions" element={<RolePermissions />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/settings" element={<ProfileSettings />} /> 
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}