//components/Navbar
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Menu,
  UserPlus,
  LayoutDashboard,
  ChefHat,
  LogIn,
  LogOut,
} from "lucide-react";

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    navigate("/login");
  };

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Menu", path: "/menu", icon: Menu },
    { name: "Register", path: "/register", icon: UserPlus },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "user"], 
    },
  ];

  const filteredLinks = links.filter(
    (link) => !link.roles || link.roles.includes(role)
  );

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#141414]/90 border-b border-[#3A2E24] shadow-lg">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A373]/30 blur-xl rounded-full group-hover:scale-125 transition duration-500" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] rounded-2xl flex items-center justify-center text-[#141414] shadow-xl">
              <ChefHat size={22} />
            </div>
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-[#FAF7F2]">Savory Bites</h1>
            <p className="text-xs text-[#D4A373] uppercase tracking-widest">
              Fresh & Delicious
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#3A2E24] p-1.5 rounded-full">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#D4A373] text-[#141414]"
                      : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
                  }`
                }
              >
                <Icon size={16} />
                {link.name}
              </NavLink>
            );
          })}

          {token ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-[#D4A373] text-[#141414] hover:opacity-90"
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