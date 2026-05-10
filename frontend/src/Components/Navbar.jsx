// src/components/Navbar.jsx

import { NavLink } from "react-router-dom";

import {
  Home,
  Menu,
  UserPlus,
  LayoutDashboard,
  ChefHat,
} from "lucide-react";

export default function Navbar() {

  const links = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },

    {
      name: "Menu",
      path: "/menu",
      icon: Menu,
    },

    {
      name: "Register",
      path: "/register",
      icon: UserPlus,
    },

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#141414]/90 border-b border-[#3A2E24] shadow-lg">

      {/* GOLD TOP LINE */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-4 group cursor-pointer">

          {/* ICON */}
          <div className="relative">

            <div className="absolute inset-0 bg-[#D4A373]/30 blur-xl rounded-full group-hover:scale-125 transition duration-500"></div>

            <div className="relative w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] rounded-2xl flex items-center justify-center text-[#141414] shadow-xl">

              <ChefHat size={22} />

            </div>
          </div>

          {/* TEXT */}
          <div className="leading-tight">

            <h1 className="text-xl font-bold tracking-wide text-[#FAF7F2]">
              Savory Bites
            </h1>

            <p className="text-xs text-[#D4A373] font-medium tracking-widest uppercase">
              Fresh & Delicious
            </p>

          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-2 bg-[#1E1E1E] border border-[#3A2E24] p-1.5 rounded-full shadow-inner">

          {links.map((link) => {

            const Icon = link.icon;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  
                  ${
                    isActive
                      ? "bg-[#D4A373] text-[#141414] shadow-lg"
                      : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
                  }`
                }
              >

                <Icon
                  size={16}
                  className="transition-transform duration-300 group-hover:scale-110"
                />

                {link.name}

              </NavLink>
            );
          })}

        </div>

      </div>
    </nav>
  );
}