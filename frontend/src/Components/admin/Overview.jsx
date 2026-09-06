import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { FoodMenuCard as MenuItemCard, FoodItemModal as ItemModal } from "./FoodMenuManagement";
import {
  Utensils,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Activity,
  Search,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Award,
  CalendarCheck,
  Calendar,
  MapPin,
  UtensilsCrossed,
  Tag,
  MessageSquare,
  Check
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Starters", "Main Course", "Appetizers", "Desserts"];

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

// --- Website Matched Stat Card ---
function StatCard({ icon: Icon, label, value, subtext, badge }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A373]/40 group before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
      {/* Ambient gold glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-[#D4A373]/10 blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#2A2A2A] border border-[#3A2E24] flex items-center justify-center text-[#D4A373] shadow-inner">
          <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30">
            {badge}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-[#C2B59B] uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-[#FAF7F2] mt-1 tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-[#8B7E6A] mt-2 font-medium">{subtext}</p>}
      </div>
    </div>
  );
}

// MenuItemCard and ItemModal are imported from FoodMenuManagement with full photo upload capabilities


// --- Table Reservation Modal (Create/Edit) ---
function ConsumerModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      email: "",
      phone: "",
      partyType: "Couple",
      customOccasion: "",
      guests: 2,
      reservationDate: new Date().toISOString().split("T")[0],
      reservationTime: "08:00 PM",
      seatingPreference: "Indoor Dining",
      status: "Confirmed",
      specialRequests: ""
    }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setGuestCount = (count) => {
    setForm((prev) => ({ ...prev, guests: Math.max(1, Math.min(50, count)) }));
  };

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setForm((prev) => ({ ...prev, reservationDate: d.toISOString().split("T")[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.phone?.trim()) {
      return setError("Full Name and Phone Number are required");
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save table reservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl shadow-2xl w-full max-w-xl p-6 md:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#3A2E24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">
                {initial ? "Edit Table Reservation" : "Reserve a Table"}
              </h2>
              <p className="text-xs text-[#C2B59B]">Admin table booking & guest allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#C2B59B] hover:text-[#FAF7F2] p-1 rounded-lg hover:bg-[#2A2A2A]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Full Name *</label>
              <input
                className={INPUT_STYLE}
                placeholder="e.g. Aarav Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Phone Number *</label>
              <input
                type="tel"
                className={INPUT_STYLE}
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email Address (Optional) & Party Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
                Email Address <span className="text-[#8B7E6A] font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                className={INPUT_STYLE}
                placeholder="e.g. aarav@example.com (Optional)"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Party Type</label>
              <select
                className={INPUT_STYLE}
                value={form.partyType || "Couple"}
                onChange={(e) => setForm({ ...form, partyType: e.target.value })}
              >
                <option value="Couple" className="bg-[#1E1E1E]">Couple</option>
                <option value="Family" className="bg-[#1E1E1E]">Family</option>
                <option value="Friends" className="bg-[#1E1E1E]">Friends</option>
                <option value="Office Colleagues" className="bg-[#1E1E1E]">Office Colleagues</option>
                <option value="Other" className="bg-[#1E1E1E]">Other / Custom</option>
              </select>
            </div>
          </div>

          {/* Number of Guests & Stepper */}
          <div className="bg-[#241F1A] border border-[#3A2E24] p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#FAF7F2]">Number of Guests</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuestCount((form.guests || 2) - 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#3A2E24] text-[#FAF7F2] font-bold text-sm flex items-center justify-center border border-[#3A2E24]"
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-[#D4A373] text-sm">{form.guests || 2}</span>
                <button
                  type="button"
                  onClick={() => setGuestCount((form.guests || 2) + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A2A2A] hover:bg-[#3A2E24] text-[#FAF7F2] font-bold text-sm flex items-center justify-center border border-[#3A2E24]"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[2, 4, 6, 8, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setGuestCount(cnt)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                    (form.guests || 2) === cnt
                      ? "bg-[#D4A373] text-[#141414] font-bold"
                      : "bg-[#2A2A2A] text-[#C2B59B] hover:text-[#FAF7F2]"
                  }`}
                >
                  {cnt} Guests
                </button>
              ))}
            </div>
          </div>

          {/* Seating Preference & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Seating Preference</label>
              <select
                className={INPUT_STYLE}
                value={form.seatingPreference || "Indoor Dining"}
                onChange={(e) => setForm({ ...form, seatingPreference: e.target.value })}
              >
                <option value="Indoor Dining" className="bg-[#1E1E1E]">Indoor Dining</option>
                <option value="Outdoor Terrace" className="bg-[#1E1E1E]">Outdoor Terrace</option>
                <option value="VIP Booth" className="bg-[#1E1E1E]">VIP Booth</option>
                <option value="Candlelight Corner" className="bg-[#1E1E1E]">Candlelight Corner</option>
                <option value="Window View" className="bg-[#1E1E1E]">Window View</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Reservation Status</label>
              <select
                className={INPUT_STYLE}
                value={form.status || "Confirmed"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Confirmed" className="bg-[#1E1E1E]">Confirmed</option>
                <option value="Seated" className="bg-[#1E1E1E]">Seated</option>
                <option value="Pending" className="bg-[#1E1E1E]">Pending</option>
                <option value="Completed" className="bg-[#1E1E1E]">Completed</option>
                <option value="Cancelled" className="bg-[#1E1E1E]">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Reservation Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#C2B59B]">Date</label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="text-[10px] text-[#D4A373] hover:underline"
                  >
                    Today
                  </button>
                  <span className="text-[#8B7E6A] text-[10px]">•</span>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="text-[10px] text-[#D4A373] hover:underline"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="date"
                className={INPUT_STYLE}
                value={form.reservationDate || ""}
                onChange={(e) => setForm({ ...form, reservationDate: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">Time Slot</label>
              <select
                className={INPUT_STYLE}
                value={form.reservationTime || "08:00 PM"}
                onChange={(e) => setForm({ ...form, reservationTime: e.target.value })}
              >
                {[
                  "12:30 PM",
                  "01:15 PM",
                  "02:00 PM",
                  "02:45 PM",
                  "07:00 PM",
                  "07:45 PM",
                  "08:00 PM",
                  "08:30 PM",
                  "09:15 PM",
                  "10:00 PM"
                ].map((slot) => (
                  <option key={slot} value={slot} className="bg-[#1E1E1E]">
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special Requests / Notes */}
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 block">
              Special Requests / Notes <span className="text-[#8B7E6A] font-normal">(Optional)</span>
            </label>
            <input
              className={INPUT_STYLE}
              placeholder="e.g. Window table preferred, anniversary celebration"
              value={form.specialRequests || ""}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A2E24]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] transition disabled:opacity-50 shadow-md shadow-[#D4A373]/20"
            >
              {submitting ? "Saving..." : initial ? "Update Reservation" : "Confirm Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// MAIN OVERVIEW COMPONENT
// ==========================================
export default function Overview() {
  const [menuItems, setMenuItems] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [consumerSearch, setConsumerSearch] = useState("");

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showConsumerModal, setShowConsumerModal] = useState(false);
  const [editConsumer, setEditConsumer] = useState(null);
  const [userName, setUserName] = useState(() => {
    try {
      const saved = localStorage.getItem("userName");
      if (saved) return saved;
      const token = localStorage.getItem("token");
      if (token && token.includes(".")) {
        const parts = token.split(".");
        if (parts.length > 1) {
          const payload = JSON.parse(atob(parts[1]));
          return payload.name || payload.email?.split("@")[0] || "shubhashis";
        }
      }
    } catch (e) {
      console.warn("Could not parse token in Overview:", e);
    }
    return "shubhashis";
  });

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [menuRes, consumersRes, statsRes, profileRes] = await Promise.allSettled([
        api.get("/menu"),
        api.get("/consumers"),
        api.get("/admin/stats"),
        api.get("/admin/profile"),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value.data?.name) {
        setUserName(profileRes.value.data.name);
        localStorage.setItem("userName", profileRes.value.data.name);
      }

      if (menuRes.status === "fulfilled") {
        setMenuItems(Array.isArray(menuRes.value.data) ? menuRes.value.data : []);
      }

      if (consumersRes.status === "fulfilled") {
        setConsumers(Array.isArray(consumersRes.value.data) ? consumersRes.value.data : []);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data);
      }

      if (isRefresh) {
        toast.success("Dashboard data refreshed");
      }
    } catch (err) {
      console.error("Error loading overview:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers: Menu Items ---
  const handleAddItem = async (item) => {
    const res = await api.post("/menu", item);
    const created = res.data.item || res.data;
    setMenuItems((prev) => [...prev, created]);
    toast.success("Menu item added successfully");
  };

  const handleEditItem = async (item) => {
    const res = await api.put(`/menu/${item._id}`, item);
    const updated = res.data.item || res.data;
    setMenuItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
    toast.success("Menu item updated");
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu dish?")) return;
    try {
      await api.delete(`/menu/${id}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== id));
      toast.success("Menu item deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  // --- Handlers: Table Reservations (Consumers) ---
  const handleAddConsumer = async (consumer) => {
    const res = await api.post("/consumers", consumer);
    const created = res.data.consumer || res.data;
    setConsumers((prev) => [created, ...prev]);
    toast.success("Table reserved successfully");
  };

  const handleEditConsumer = async (consumer) => {
    const res = await api.put(`/consumers/${consumer._id}`, consumer);
    const updated = res.data.consumer || res.data;
    setConsumers((prev) => prev.map((c) => (c._id === consumer._id ? updated : c)));
    toast.success("Table reservation updated");
  };

  const handleDeleteConsumer = async (id) => {
    if (!window.confirm("Are you sure you want to cancel / remove this table reservation?")) return;
    try {
      await api.delete(`/consumers/${id}`);
      setConsumers((prev) => prev.filter((c) => c._id !== id));
      toast.success("Table reservation removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete table reservation");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.put(`/consumers/${id}`, { status: newStatus });
      const updated = res.data.consumer || res.data;
      setConsumers((prev) => prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
      toast.success(`Table status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update reservation status");
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(menuSearch.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [menuItems, menuSearch, selectedCategory]);

  // Filtered Reserved Tables
  const filteredConsumers = useMemo(() => {
    return consumers.filter((c) => {
      const q = consumerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.partyType || "").toLowerCase().includes(q) ||
        (c.seatingPreference || "").toLowerCase().includes(q) ||
        (c.status || "").toLowerCase().includes(q) ||
        (c.bookingCode || "").toLowerCase().includes(q)
      );
    });
  }, [consumers, consumerSearch]);

  const totalGuests = useMemo(() => {
    return consumers.reduce((acc, c) => acc + (Number(c.guests) || 2), 0);
  }, [consumers]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#241F1A] to-[#1A1A1A] border border-[#3A2E24] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
              <Sparkles size={13} />
              ADMINISTRATOR PORTAL
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#FAF7F2] tracking-tight">
              Welcome back, {userName || "shubhashis"}
            </h1>
            <p className="text-[#C2B59B] text-sm md:text-base max-w-2xl leading-relaxed">
              Here is your restaurant operations summary for today. Oversee table reservations, manage live food catalog, track key metrics, and control system users.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowItemModal(true)}
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#D4A373]/20 text-sm"
            >
              <Plus size={16} />
              Add Menu Item
            </button>
            <button
              onClick={() => setShowConsumerModal(true)}
              className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#FAF7F2] border border-[#3A2E24] font-semibold px-5 py-2.5 rounded-xl transition text-sm"
            >
              <CalendarCheck size={16} className="text-[#D4A373]" />
              Reserve Table
            </button>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] font-semibold px-4 py-2.5 rounded-xl transition text-sm disabled:opacity-50"
              title="Refresh dashboard metrics"
            >
              <RotateCw size={15} className={refreshing ? "animate-spin text-[#D4A373]" : ""} />
              {refreshing ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Utensils}
          label="Menu Items"
          value={loading ? "—" : menuItems.length}
          subtext="Active in live menu catalogue"
          badge="Live Catalogue"
        />
        <StatCard
          icon={CalendarCheck}
          label="Reserved Tables"
          value={loading ? "—" : (stats?.totalReservedTables ?? consumers.length)}
          subtext={`${stats?.totalGuestsReserved ?? totalGuests} diners booked across tables`}
          badge="Table Bookings"
        />
        <StatCard
          icon={ShieldCheck}
          label="System Users"
          value={loading ? "—" : stats?.totalUsers ?? "—"}
          subtext={`${stats?.activeUsers ?? 0} active administrators`}
          badge="Access Control"
        />
        <StatCard
          icon={Clock}
          label="Active Menus"
          value={loading ? "—" : stats?.activeMenus ?? 1}
          subtext={`${stats?.totalMenus ?? 1} total portal modules`}
          badge="Portal Nav"
        />
      </div>

      {/* SECTION 1: FOOD MENU ITEMS */}
      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] p-6 shadow-xl relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#FAF7F2]">Food Menu Items</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
                {menuItems.length} Items
              </span>
              <Link
                to="/dashboard/food-menu"
                className="text-xs text-[#D4A373] hover:underline font-semibold ml-2 hidden sm:inline"
              >
                Manage Full Catalogue →
              </Link>
            </div>
            <p className="text-xs text-[#C2B59B] mt-0.5">Manage culinary dishes, prices, and categorizations</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
              <input
                type="text"
                placeholder="Search food items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
              />
            </div>

            <button
              onClick={() => setShowItemModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] transition shadow-sm"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-[#8B7E6A] mr-1 flex-shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-[#D4A373] text-[#141414] shadow-md shadow-[#D4A373]/20"
                  : "bg-[#2A2A2A] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] border border-[#3A2E24]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-16 text-center text-[#C2B59B] text-sm">
            <RotateCw size={24} className="animate-spin mx-auto text-[#D4A373] mb-2" />
            Loading menu items...
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="py-14 text-center rounded-2xl border border-dashed border-[#3A2E24] p-8 space-y-3">
            <ChefHat size={36} className="mx-auto text-[#8B7E6A]" />
            <p className="text-sm font-semibold text-[#FAF7F2]">
              {menuSearch || selectedCategory !== "All"
                ? "No dishes match your filter."
                : "No menu items found."}
            </p>
            <p className="text-xs text-[#C2B59B] max-w-sm mx-auto">
              {menuSearch || selectedCategory !== "All"
                ? "Try clearing the search query or selecting another category."
                : "Click '+ Add Item' above to introduce your first delicious recipe."}
            </p>
            {(menuSearch || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setMenuSearch("");
                  setSelectedCategory("All");
                }}
                className="text-xs font-semibold text-[#D4A373] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenuItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onEdit={setEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: RESERVED TABLES */}
      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <div className="px-6 py-5 border-b border-[#3A2E24] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
              <CalendarCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#FAF7F2]">Reserved Tables</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
                  {consumers.length} Tables Reserved
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#2A2A2A] text-[#C2B59B] border border-[#3A2E24]">
                  {totalGuests} Guests Total
                </span>
              </div>
              <p className="text-xs text-[#C2B59B] mt-0.5">
                Live table bookings, seating allocations, and diner reservations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
              <input
                type="text"
                placeholder="Search table reservations..."
                value={consumerSearch}
                onChange={(e) => setConsumerSearch(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
              />
            </div>

            <button
              onClick={() => setShowConsumerModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] transition shadow-sm whitespace-nowrap"
            >
              <Plus size={14} /> Reserve Table
            </button>
          </div>
        </div>

        {/* Reserved Tables Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2A2A2A]">
              <tr>
                {["Guest / Booker", "Party & Seating", "Reserved Table & Time", "Contact", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3.5 text-xs font-semibold text-[#D4A373] uppercase tracking-wider ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#C2B59B]">
                    <RotateCw size={20} className="animate-spin mx-auto text-[#D4A373] mb-2" />
                    Loading reserved tables...
                  </td>
                </tr>
              ) : filteredConsumers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#C2B59B]">
                    {consumerSearch
                      ? "No reserved tables found matching your search query."
                      : "No tables currently reserved. Click '+ Reserve Table' to book one."}
                  </td>
                </tr>
              ) : (
                filteredConsumers.map((c) => (
                  <tr key={c._id} className="hover:bg-[#2A2A2A] transition">
                    {/* Guest / Booker */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold text-xs flex items-center justify-center shadow-sm">
                          {(c.name || "Guest").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#FAF7F2]">{c.name}</p>
                            {c.bookingCode && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#201C18] text-[#D4A373] border border-[#3A2E24]">
                                {c.bookingCode}
                              </span>
                            )}
                          </div>
                          {c.email ? (
                            <p className="text-[11px] text-[#8B7E6A] flex items-center gap-1 mt-0.5">
                              <Mail size={11} className="text-[#8B7E6A]" /> {c.email}
                            </p>
                          ) : (
                            <p className="text-[11px] text-[#8B7E6A] italic mt-0.5">
                              Walk-in (No email)
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Party & Seating */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30">
                            {c.partyType || "Couple"}
                          </span>
                          {c.seatingPreference && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#2A2A2A] text-[#C2B59B] border border-[#3A2E24]">
                              {c.seatingPreference}
                            </span>
                          )}
                        </div>
                        {c.specialRequests && (
                          <p className="text-[11px] text-[#C2B59B] italic truncate max-w-[170px] flex items-center gap-1">
                            <MessageSquare size={10} className="text-[#D4A373] flex-shrink-0" />
                            {c.specialRequests}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Reserved Table & Time */}
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4A373]/15 text-[#D4A373] font-bold text-xs border border-[#D4A373]/30">
                          <Users size={12} /> {c.guests || 2} People
                        </span>
                        <p className="text-[#C2B59B] text-[11px] flex items-center gap-1 mt-1">
                          <Calendar size={11} className="text-[#8B7E6A]" />
                          {c.reservationDate || "Today"}
                          {c.reservationTime ? ` @ ${c.reservationTime}` : ""}
                        </p>
                      </div>
                    </td>

                    {/* Contact Phone */}
                    <td className="px-6 py-4 text-[#FAF7F2] text-xs">
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} className="text-[#8B7E6A]" />
                        {c.phone}
                      </span>
                    </td>

                    {/* Status Dropdown / Pill */}
                    <td className="px-6 py-4">
                      <select
                        value={c.status || "Confirmed"}
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition focus:outline-none ${
                          (c.status || "Confirmed") === "Confirmed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : (c.status || "") === "Seated"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : (c.status || "") === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : (c.status || "") === "Completed"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        <option value="Confirmed" className="bg-[#1E1E1E] text-emerald-400">Confirmed</option>
                        <option value="Seated" className="bg-[#1E1E1E] text-blue-400">Seated</option>
                        <option value="Pending" className="bg-[#1E1E1E] text-amber-400">Pending</option>
                        <option value="Completed" className="bg-[#1E1E1E] text-purple-400">Completed</option>
                        <option value="Cancelled" className="bg-[#1E1E1E] text-red-400">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditConsumer(c)}
                          className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                          title="Edit table reservation"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteConsumer(c._id)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                          title="Cancel table reservation"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showItemModal && (
        <ItemModal
          onClose={() => setShowItemModal(false)}
          onSubmit={handleAddItem}
        />
      )}

      {editItem && (
        <ItemModal
          initial={editItem}
          onClose={() => setEditItem(null)}
          onSubmit={handleEditItem}
        />
      )}

      {showConsumerModal && (
        <ConsumerModal
          onClose={() => setShowConsumerModal(false)}
          onSubmit={handleAddConsumer}
        />
      )}

      {editConsumer && (
        <ConsumerModal
          initial={editConsumer}
          onClose={() => setEditConsumer(null)}
          onSubmit={handleEditConsumer}
        />
      )}
    </div>
  );
}
