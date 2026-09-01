import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  MenuSquare, 
  KeySquare, 
  History, 
  UserCircle,
  LogOut
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
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-[#3A2E24] bg-[#1E1E1E]/50 flex flex-col h-[calc(100vh-80px)] sticky top-20">
        <div className="p-6">
          <h2 className="text-[#D4A373] text-xs font-bold uppercase tracking-[0.2em] mb-4">
            Admin Panel
          </h2>
          <nav className="space-y-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={`/dashboard/${link.path}`}
                  end={link.path === ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#D4A373] text-[#141414] shadow-md shadow-[#D4A373]/20"
                        : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
                    }`
                  }
                >
                  <Icon size={18} />
                  {link.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-[#3A2E24]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
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
      </main>

    </div>
  );
}