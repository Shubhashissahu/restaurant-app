// components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { Home, Menu, UserPlus, LayoutDashboard, ChefHat } from "lucide-react";

export default function Navbar() {

  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Menu", path: "/menu", icon: Menu },
    { name: "Register", path: "/register", icon: UserPlus },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <ChefHat size={20} />
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-gray-900">
              Savory Bites
            </h1>
            <p className="text-xs text-teal-500 font-medium">
              Fresh & Delicious
            </p>
          </div>
        </div>

        {/* NAV LINKS */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full shadow-inner">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-gray-600 hover:text-teal-600"
                  }`
                }
              >
                <Icon size={16} />
                {link.name}
              </NavLink>
            );
          })}
        </div>

      </div>
    </nav>
  );
}