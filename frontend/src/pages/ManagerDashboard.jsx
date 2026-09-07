import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  UserCircle,
  LogOut,
  Menu as MenuIcon,
  X,
  Briefcase,
  ChefHat,
  CalendarCheck,
  UtensilsCrossed,
} from "lucide-react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ManagerOverview from "../components/manager/ManagerOverview";
import ReservationManagement from "../components/manager/ReservationManagement";
import TeamManagement from "../components/manager/TeamManagement";
import ReportsAnalytics from "../components/manager/ReportsAnalytics";
import ManagerProfile from "../components/manager/ManagerProfile";
import ManagerMenuManagement from "../components/manager/ManagerMenuManagement";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const managerLinks = [
    { name: "Overview", path: "", icon: LayoutDashboard },
    { name: "Menu Availability", path: "menu", icon: UtensilsCrossed },
    { name: "Table Reservations", path: "reservations", icon: CalendarCheck },
    { name: "Team Management", path: "team", icon: Users },
    { name: "Reports & Stats", path: "reports", icon: FileBarChart },
    { name: "Profile Details", path: "profile", icon: UserCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#141414] flex text-[#FAF7F2]">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-20 z-40 w-64 flex-shrink-0 border-r border-[#3A2E24] bg-[#1E1E1E]/95 md:bg-[#1E1E1E]/50 backdrop-blur-xl flex flex-col h-[calc(100vh-80px)] transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          {/* Header Role Pill */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#D4A373]">
              <Briefcase size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">Manager Portal</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-[#C2B59B] hover:text-[#FAF7F2]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {managerLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={`/manager/${link.path}`}
                  end={link.path === ""}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#D4A373] text-[#141414] shadow-lg shadow-[#D4A373]/20 font-bold"
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

        {/* Bottom Sidebar Info & Logout */}
        <div className="mt-auto p-6 border-t border-[#3A2E24] space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <ChefHat size={16} />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-[#FAF7F2]">TasteHub</p>
              <p className="text-[10px] text-[#8B7E6A]">Store Operations</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile top trigger */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-[#3A2E24] bg-[#1E1E1E]">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[#D4A373]"
          >
            <MenuIcon size={18} />
            Manager Menu
          </button>
          <span className="text-xs font-bold text-[#FAF7F2]">Manager Portal</span>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto max-w-7xl w-full">
          <Routes>
            <Route path="/" element={<ManagerOverview />} />
            <Route path="/menu" element={<ManagerMenuManagement />} />
            <Route path="/reservations" element={<ReservationManagement />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/profile" element={<ManagerProfile />} />
            <Route path="*" element={<Navigate to="" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
