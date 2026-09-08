import { useState, useEffect, useRef } from "react";
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
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { NavLink, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import ManagerOverview from "../components/manager/ManagerOverview";
import ReservationManagement from "../components/manager/ReservationManagement";
import TeamManagement from "../components/manager/TeamManagement";
import ReportsAnalytics from "../components/manager/ReportsAnalytics";
import ManagerProfile from "../components/manager/ManagerProfile";
import ManagerMenuManagement from "../components/manager/ManagerMenuManagement";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifiedSetRef = useRef(new Set());
  const dropdownRef = useRef(null);

  const managerLinks = [
    { name: "Overview", path: "", icon: LayoutDashboard },
    { name: "Menu Availability", path: "menu", icon: UtensilsCrossed },
    { name: "Table Reservations", path: "reservations", icon: CalendarCheck },
    { name: "Team Management", path: "team", icon: Users },
    { name: "Reports & Stats", path: "reports", icon: FileBarChart },
    { name: "Profile Details", path: "profile", icon: UserCircle },
  ];

  // Helper for human-readable relative time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  // Fetch notifications and toast on newly approved price requests
  const fetchNotifications = async (quiet = false) => {
    try {
      const res = await api.get("/manager/notifications");
      const list = res.data?.notifications || [];
      const count = res.data?.unreadCount || 0;

      // Celebrate any unread approved price requests
      list.forEach((notif) => {
        if (
          notif.status === "unread" &&
          notif.type === "PRICE_CHANGE_APPROVED" &&
          !notifiedSetRef.current.has(notif._id)
        ) {
          notifiedSetRef.current.add(notif._id);
          toast.success(
            () => (
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🎉</span>
                <div>
                  <p className="font-bold text-emerald-400 text-sm">Your Request Approved!</p>
                  <p className="text-xs text-[#FAF7F2] mt-0.5">
                    Admin approved price for{" "}
                    <strong className="text-[#D4A373]">{notif.dishName || "dish"}</strong> to{" "}
                    <strong className="text-emerald-400">₹{notif.newPrice}</strong>. Live on menu!
                  </p>
                </div>
              </div>
            ),
            {
              duration: 7000,
              style: {
                background: "#1E1E1E",
                color: "#FAF7F2",
                border: "1px solid #10B981",
                boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.25)",
              },
            }
          );
        }
      });

      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      if (!quiet) console.error("Error fetching notifications:", err);
    }
  };

  // Poll notifications periodically and on focus
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 12000);

    const onFocus = () => fetchNotifications(true);
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifDropdown]);

  // Mark single notification as read
  const handleMarkRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/manager/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, status: "read" } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  // Mark all notifications read
  const handleMarkAllRead = async () => {
    try {
      await api.patch("/manager/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with Notifications */}
        <header className="sticky top-20 z-30 flex items-center justify-between px-6 py-4 border-b border-[#3A2E24] bg-[#1E1E1E]/80 backdrop-blur-xl">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center gap-2 text-xs font-semibold text-[#D4A373] cursor-pointer"
            >
              <MenuIcon size={18} />
              <span>Menu</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#C2B59B]">
              <span className="font-bold text-[#FAF7F2]">Manager Workspace</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Store Operations
              </span>
            </div>
          </div>

          {/* Right side - Quick link & Notifications dropdown */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/manager/menu"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A2A2A] hover:bg-[#343434] border border-[#3A2E24] text-xs font-semibold text-[#FAF7F2] transition"
            >
              <UtensilsCrossed size={14} className="text-[#D4A373]" />
              <span>Menu Management</span>
            </NavLink>

            {/* NOTIFICATION BELL & DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showNotifDropdown
                    ? "bg-[#D4A373]/20 border-[#D4A373] text-[#FAF7F2]"
                    : "bg-[#242424] hover:bg-[#2E2E2E] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
                title="Notifications"
              >
                <Bell size={18} className={unreadCount > 0 ? "text-[#D4A373]" : ""} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[#141414] text-[10px] font-black flex items-center justify-center shadow-lg shadow-amber-500/40 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN MENU */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 max-w-[90vw] bg-[#1A1614] border border-[#44362A] rounded-2xl shadow-2xl overflow-hidden z-50 animate-pop-in">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 border-b border-[#3A2E24] flex items-center justify-between bg-[#221B17]">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-[#D4A373]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#D4A373] hover:text-[#e4b98d] transition cursor-pointer"
                      >
                        <CheckCheck size={13} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2E241C]">
                    {notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center text-[#8B7E6A] text-xs">
                        <Bell size={24} className="mx-auto mb-2 text-[#3A2E24]" />
                        <p className="font-semibold">No notifications yet</p>
                        <p className="text-[10px] text-[#6E6457] mt-0.5">
                          Price approvals and store updates will show here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isApproved = notif.type === "PRICE_CHANGE_APPROVED";
                        const isRejected = notif.type === "PRICE_CHANGE_REJECTED";
                        const isUnread = notif.status === "unread";

                        return (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (isUnread) handleMarkRead(notif._id);
                              if (isApproved || isRejected) {
                                navigate("/manager/menu");
                                setShowNotifDropdown(false);
                              }
                            }}
                            className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 relative ${
                              isUnread
                                ? isApproved
                                  ? "bg-emerald-950/20 hover:bg-emerald-950/30"
                                  : "bg-[#251E19] hover:bg-[#2D241E]"
                                : "hover:bg-[#221D19]"
                            }`}
                          >
                            {/* Unread indicator */}
                            {isUnread && (
                              <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-emerald-400" />
                            )}

                            {/* Icon */}
                            <div
                              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border mt-0.5 ${
                                isApproved
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                  : isRejected
                                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                              }`}
                            >
                              {isApproved ? (
                                <CheckCircle2 size={16} />
                              ) : isRejected ? (
                                <XCircle size={16} />
                              ) : (
                                <Bell size={16} />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4
                                  className={`text-xs font-bold ${
                                    isApproved
                                      ? "text-emerald-400"
                                      : isRejected
                                      ? "text-rose-400"
                                      : "text-[#FAF7F2]"
                                  }`}
                                >
                                  {notif.title || (isApproved ? "Your Request Approved! 🎉" : "Notification")}
                                </h4>
                              </div>

                              <p className="text-[11px] text-[#D8CFBF] mt-1 leading-snug break-words">
                                {notif.message}
                              </p>

                              {/* Price tags if approved */}
                              {isApproved && notif.newPrice && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-bold">
                                  <span>Live on Menu:</span>
                                  <span className="text-emerald-400 font-black">₹{notif.newPrice}</span>
                                </div>
                              )}

                              <div className="mt-2 flex items-center justify-between text-[10px] text-[#8B7E6A]">
                                <span>{formatTime(notif.createdAt)}</span>
                                {isUnread && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkRead(notif._id, e)}
                                    className="text-[#D4A373] hover:underline"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 bg-[#171310] border-t border-[#3A2E24] text-center">
                    <button
                      type="button"
                      onClick={() => {
                        navigate("/manager/menu");
                        setShowNotifDropdown(false);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-[#2A221C] hover:bg-[#342B23] text-[#D4A373] hover:text-[#FAF7F2] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Go to Menu & Price Requests</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

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
