import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Menu,
  UserPlus,
  LayoutDashboard,
  ChefHat,
  LogIn,
  LogOut,
  Settings,
  User,
  ShieldAlert,
  Briefcase
} from "lucide-react";

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const location = useLocation();

  let role = null;

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userName");
          setToken(null);
        } else {
          role = (payload.role || localStorage.getItem("role") || "").toLowerCase();
          if (payload.role) {
            localStorage.setItem("role", payload.role);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse token for role", e);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      setToken(null);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setToken(null);
    navigate("/login");
  };

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Menu", path: "/menu", icon: Menu },
    { 
      name: "Reserve Table", 
      path: "/register", 
      icon: UserPlus,
      hideForRoles: ["admin", "manager"] 
    },
    {
      name: "Admin Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin"], 
    },
    {
      name: "Manager Dashboard",
      path: "/manager",
      icon: Briefcase,
      roles: ["manager"],
    },
  ];

  const staticFiltered = links.filter((link) => {
    if (link.hideForRoles && role && link.hideForRoles.includes(role)) {
      return false;
    }
    if (link.roles) {
      return link.roles.includes(role);
    }
    return true;
  });

  const getRoleIcon = () => {
    if (role === "admin") return <ShieldAlert size={16} className="text-red-400" />;
    if (role === "manager") return <Briefcase size={16} className="text-yellow-400" />;
    return <User size={16} className="text-blue-400" />;
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#141414]/90 border-b border-[#3A2E24] shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A373]/30 blur-xl rounded-full group-hover:scale-125 transition duration-500" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] rounded-2xl flex items-center justify-center text-[#141414] shadow-xl">
              <ChefHat size={22} />
            </div>
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-[#FAF7F2]">TasteHub</h1>
            <p className="text-xs text-[#D4A373] uppercase tracking-widest">
              Fresh & Delicious
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#3A2E24] p-1.5 rounded-full">
          {staticFiltered.map((link) => {
            const Icon = link.icon;
            // For dashboard & manager, handle active sub-routes
            const isActive =
              location.pathname === link.path ||
              (link.path === "/dashboard" && location.pathname.startsWith("/dashboard")) ||
              (link.path === "/manager" && location.pathname.startsWith("/manager"));
            
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#D4A373] text-[#141414]"
                    : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
                }`}
              >
                <Icon size={16} />
                {link.name}
              </NavLink>
            );
          })}

          {token ? (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-[#3A2E24]">
              {/* Profile Icon with Role */}
              <div className="flex items-center gap-2 bg-[#2A2A2A] px-3 py-1.5 rounded-full border border-[#3A2E24]">
                {getRoleIcon()}
                <span className="text-sm font-semibold text-[#C2B59B] capitalize">
                  {role || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[#D4A373] text-[#141414] hover:opacity-90 ml-4"
            >
              <LogIn size={16} />
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}