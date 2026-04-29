// components/Navbar.jsx
import { useState } from "react";
import { Home, Menu, UserPlus, LayoutDashboard, ChefHat } from "lucide-react";

export default function Navbar() {
  const [active, setActive] = useState("Home");

  const links = [
    { name: "Home", icon: Home },
    { name: "Menu", icon: Menu },
    { name: "Register", icon: UserPlus },
    { name: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT - LOGO */}
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

        {/* RIGHT - NAVIGATION */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full shadow-inner">

          {links.map((link) => {
            const Icon = link.icon;

            return (
              <button
                key={link.name}
                onClick={() => setActive(link.name)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  active === link.name
                    ? "bg-teal-500 text-white shadow-md"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                <Icon size={16} />
                {link.name}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
}