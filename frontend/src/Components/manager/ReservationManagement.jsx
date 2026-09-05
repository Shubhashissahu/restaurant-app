import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Users,
  Calendar,
  Clock,
  Search,
  Filter,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  RotateCw,
  UtensilsCrossed,
  MapPin,
  CalendarCheck,
  Check,
  UserCheck,
  Tag,
  MessageSquare,
  Wine,
  UserPlus
} from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#201C18] border border-[#3A2E24] rounded-xl px-3.5 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition";

const PARTY_TYPES = [
  "Couple",
  "Family",
  "Friends",
  "Office Colleagues",
  "Other",
];

const SEATING_PREFERENCES = [
  "Indoor Dining",
  "Outdoor Terrace",
  "VIP Booth",
  "Candlelight Corner",
  "Window View",
];

const TIME_SLOTS = [
  "12:30 PM",
  "01:15 PM",
  "02:00 PM",
  "02:45 PM",
  "07:00 PM",
  "07:45 PM",
  "08:30 PM",
  "09:15 PM",
  "10:00 PM",
];

const STATUS_OPTIONS = ["Confirmed", "Seated", "Pending", "Completed", "Cancelled"];

// --- Stylish, Compact Reservation Modal (No Scrollbar, Fixed Footer) ---
function ReservationModal({ initial, onClose, onSubmit }) {
  const isEditing = Boolean(initial);

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
      specialRequests: "",
      status: "Confirmed",
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
    setError("");

    if (!form.name.trim()) return setError("Guest full name is required");
    if (!form.phone.trim()) return setError("Phone number is required");
    if (form.phone.trim().length < 3) return setError("Phone number must be at least 3 digits");
    // Email is optional: validate format only if provided
    if (form.email && form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      return setError("Please enter a valid email address or leave it blank");
    }
    if (!form.guests || form.guests < 1) return setError("At least 1 guest is required");
    if (!form.reservationDate) return setError("Reservation date is required");
    if (!form.reservationTime) return setError("Time slot is required");

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        email: form.email ? form.email.trim() : "",
        phone: form.phone.trim(),
        guests: Number(form.guests),
      });
      onClose();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || "Failed to save table reservation";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#221D17] via-[#1C1814] to-[#141414] border border-[#D4A373]/35 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-[#D4A373]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A2E24]/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] flex items-center justify-center font-bold shadow-md">
              {isEditing ? <Pencil size={18} /> : <CalendarCheck size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#FAF7F2]">
                  {isEditing ? "Edit Table Reservation" : "Reserve a Table"}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 tracking-wide uppercase">
                  Manager Portal
                </span>
              </div>
              <p className="text-[11px] text-[#C2B59B]">
                {isEditing
                  ? "Update guest count, schedule, seating, and status"
                  : "Instant table booking for diners & walk-ins"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#C2B59B] hover:text-[#FAF7F2] p-1.5 rounded-lg hover:bg-[#2A2A2A] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body - NO SCROLLBAR */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-5 sm:p-6 space-y-3.5 flex-1"
        >
          {/* PARTY SIZE & GUESTS COUNT CARD */}
          <div className="bg-[#241F1A]/90 border border-[#3A2E24] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#D4A373]" />
                <span className="text-xs font-bold text-[#FAF7F2]">
                  Party Size (People Reserved) *
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#D4A373] bg-[#1E1E1E] px-2.5 py-0.5 rounded-md border border-[#3A2E24]">
                {form.guests} {Number(form.guests) === 1 ? "Person" : "People"}
              </span>
            </div>

            {/* Stepper & Quick Select Chips in Single Sleek Row */}
            <div className="flex items-center justify-between gap-2">
              {/* Stepper */}
              <div className="flex items-center bg-[#191919] rounded-lg border border-[#3A2E24] p-0.5">
                <button
                  type="button"
                  onClick={() => setGuestCount((Number(form.guests) || 1) - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-extrabold text-[#FAF7F2]">
                  {form.guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount((Number(form.guests) || 1) + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm font-bold text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
                >
                  +
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {[2, 4, 6, 8, 10].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setGuestCount(num)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                      Number(form.guests) === num
                        ? "bg-[#D4A373] text-[#141414] font-bold shadow-sm"
                        : "bg-[#1E1E1E] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] border border-[#3A2E24]"
                    }`}
                  >
                    {num} {num === 2 ? "Couple" : num === 4 ? "Family" : `${num}P`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 1: Guest Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Guest Full Name *
              </label>
              <input
                type="text"
                className={INPUT_STYLE}
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Phone Number *
              </label>
              <input
                type="tel"
                className={INPUT_STYLE}
                placeholder="Mobile / Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* ROW 2: Email & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Email Address <span className="text-[#8B7E6A] font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                className={INPUT_STYLE}
                placeholder="guest@example.com (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Party Occasion
              </label>
              <select
                className={INPUT_STYLE}
                value={form.partyType}
                onChange={(e) => setForm({ ...form, partyType: e.target.value })}
              >
                {PARTY_TYPES.map((pt) => (
                  <option key={pt} value={pt} className="bg-[#1E1E1E]">
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 3: Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#C2B59B]">Date *</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#D4A373] hover:bg-[#333333]"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#C2B59B] hover:bg-[#333333]"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>
              <input
                type="date"
                className={INPUT_STYLE}
                value={form.reservationDate}
                onChange={(e) => setForm({ ...form, reservationDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Time Slot *
              </label>
              <select
                className={INPUT_STYLE}
                value={form.reservationTime}
                onChange={(e) => setForm({ ...form, reservationTime: e.target.value })}
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t} className="bg-[#1E1E1E]">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 4: Seating Preference & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Seating Area
              </label>
              <select
                className={INPUT_STYLE}
                value={form.seatingPreference}
                onChange={(e) => setForm({ ...form, seatingPreference: e.target.value })}
              >
                {SEATING_PREFERENCES.map((sp) => (
                  <option key={sp} value={sp} className="bg-[#1E1E1E]">
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
                Reservation Status
              </label>
              <select
                className={INPUT_STYLE}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-[#1E1E1E]">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ROW 5: Special Requests / Table Notes */}
          <div>
            <label className="text-[11px] font-semibold text-[#C2B59B] mb-1 block">
              Special Requests / Table Notes
            </label>
            <input
              type="text"
              className={INPUT_STYLE}
              placeholder="e.g. Window booth, birthday candles, quiet corner..."
              value={form.specialRequests}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* ALWAYS-VISIBLE FIXED FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#3A2E24]/80 bg-[#171411]/95 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4A373] to-[#B37E4D] hover:from-[#B37E4D] hover:to-[#8B5E3C] text-[#141414] hover:text-white transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#D4A373]/20"
          >
            {submitting ? (
              <>
                <RotateCw size={14} className="animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              <>
                <Check size={14} />
                Save Changes
              </>
            ) : (
              <>
                <UserPlus size={14} />
                Confirm Table
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main ReservationManagement Component ---
export default function ReservationManagement() {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All"); // All, Today, Upcoming

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editReservation, setEditReservation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/manager/reservations");
      setReservations(res.data.reservations || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error("Error loading reservations:", err);
      toast.error("Failed to load table reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Manager creates a reservation
  const handleCreate = async (formData) => {
    try {
      await api.post("/manager/reservations", formData);
      toast.success(
        `Table reserved for ${formData.guests} ${formData.guests === 1 ? "guest" : "guests"}!`
      );
      fetchReservations();
    } catch (err) {
      console.error("Error creating reservation:", err);
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || "Failed to create reservation";
      toast.error(errMsg);
      throw err;
    }
  };

  // Manager updates a reservation
  const handleUpdate = async (formData) => {
    try {
      await api.put(`/manager/reservations/${editReservation._id}`, formData);
      toast.success("Reservation updated successfully");
      fetchReservations();
    } catch (err) {
      console.error("Error updating reservation:", err);
      const errMsg =
        err.response?.data?.message || err.response?.data?.error || "Failed to update reservation";
      toast.error(errMsg);
      throw err;
    }
  };

  // Manager quick status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/manager/reservations/${id}`, { status: newStatus });
      toast.success(`Reservation marked as ${newStatus}`);
      setReservations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
      // Re-fetch stats in background
      api.get("/manager/reservations").then((res) => setStats(res.data.stats));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Manager deletes a reservation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this table reservation?")) {
      return;
    }
    try {
      setDeletingId(id);
      await api.delete(`/manager/reservations/${id}`);
      toast.success("Reservation removed");
      setReservations((prev) => prev.filter((r) => r._id !== id));
      api.get("/manager/reservations").then((res) => setStats(res.data.stats));
    } catch (err) {
      toast.error("Failed to delete reservation");
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered reservations
  const todayStr = new Date().toISOString().split("T")[0];

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.bookingCode && r.bookingCode.toLowerCase().includes(q));

      // Status
      const matchesStatus =
        statusFilter === "All" ||
        (r.status || "Confirmed").toLowerCase() === statusFilter.toLowerCase();

      // Date
      let matchesDate = true;
      if (dateFilter === "Today") {
        matchesDate = r.reservationDate === todayStr;
      } else if (dateFilter === "Upcoming") {
        matchesDate = r.reservationDate >= todayStr;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, search, statusFilter, dateFilter, todayStr]);

  // Derived counts
  const totalPeopleReserved = useMemo(() => {
    return reservations.reduce((acc, r) => acc + (Number(r.guests) || 1), 0);
  }, [reservations]);

  const getStatusBadge = (status) => {
    const s = (status || "Confirmed").toLowerCase();
    switch (s) {
      case "confirmed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "seated":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#241F1A] to-[#1A1A1A] border border-[#3A2E24] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
              <Sparkles size={13} />
              Manager Access • Reservations
            </div>
            <h1 className="text-3xl font-bold text-[#FAF7F2]">
              Table Bookings & Diners
            </h1>
            <p className="text-[#C2B59B] text-sm max-w-xl leading-relaxed">
              Track how many people have reserved tables, edit reservation details, adjust party sizes, and reserve tables directly for walk-in or booked guests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-bold px-5 py-3 rounded-2xl transition shadow-lg shadow-[#D4A373]/20 text-sm whitespace-nowrap"
            >
              <Plus size={18} />
              Reserve a Table
            </button>
          </div>
        </div>
      </div>

      {/* METRICS CARDS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL PEOPLE RESERVED (CRITICAL USER REQUEST) */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#D4A373]/40 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4A373]/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4A373]">
              <Users size={22} />
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/40">
              Active Diners
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-semibold">Total People Reserved</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FAF7F2]">
              {loading ? "..." : (stats?.totalGuests ?? totalPeopleReserved)}
            </p>
            <span className="text-xs text-[#D4A373] font-bold">people / guests</span>
          </div>
          <p className="text-xs text-[#8B7E6A] mt-2">
            Sum of all diner party sizes booked
          </p>
        </div>

        {/* TOTAL RESERVATIONS */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CalendarCheck size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Tables
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-semibold">Total Bookings</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FAF7F2]">
              {loading ? "..." : (stats?.totalReservations ?? reservations.length)}
            </p>
            <span className="text-xs text-[#8B7E6A]">reservations</span>
          </div>
          <p className="text-xs text-[#8B7E6A] mt-2">
            {stats?.confirmedCount || 0} Confirmed • {stats?.seatedCount || 0} Seated
          </p>
        </div>

        {/* TODAY'S RESERVED GUESTS */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Today
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-semibold">Today's Diners</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FAF7F2]">
              {loading ? "..." : (stats?.todayGuests || 0)}
            </p>
            <span className="text-xs text-[#8B7E6A]">people expected</span>
          </div>
          <p className="text-xs text-[#8B7E6A] mt-2">
            Across {stats?.todayReservations || 0} tables booked today
          </p>
        </div>

        {/* AVERAGE PARTY SIZE */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/30 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <UtensilsCrossed size={22} />
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Average
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-semibold">Avg Party Size</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FAF7F2]">
              {reservations.length > 0
                ? (totalPeopleReserved / reservations.length).toFixed(1)
                : "2.0"}
            </p>
            <span className="text-xs text-[#8B7E6A]">guests / table</span>
          </div>
          <p className="text-xs text-[#8B7E6A] mt-2">
            Most frequent: Couples & Groups
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
          <input
            type="text"
            placeholder="Search by diner name, email, phone, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-[#2A2A2A] p-1 rounded-xl border border-[#3A2E24]">
            {["All", "Confirmed", "Seated", "Pending", "Cancelled"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === st
                    ? "bg-[#D4A373] text-[#141414] font-bold"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-[#2A2A2A] p-1 rounded-xl border border-[#3A2E24]">
            {["All", "Today", "Upcoming"].map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  dateFilter === df
                    ? "bg-[#D4A373] text-[#141414] font-bold"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                {df}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#2A2A2A] border border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] transition"
            title="Refresh list"
          >
            <RotateCw size={15} className={loading ? "animate-spin text-[#D4A373]" : ""} />
          </button>
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#3A2E24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#FAF7F2]">Reservations Roster</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
              Showing {filteredReservations.length} of {reservations.length} Bookings
            </span>
          </div>
          <span className="text-xs text-[#8B7E6A] hidden sm:inline">
            Manager has full view, edit, and booking control
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2A2A2A] border-b border-[#3A2E24]">
              <tr>
                {[
                  "Diner Details",
                  "People Reserved",
                  "Reservation Schedule",
                  "Seating & Occasion",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-6 py-3.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider ${
                      idx === 6 ? "text-right" : ""
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
                  <td colSpan={7} className="py-14 text-center text-[#C2B59B]">
                    <RotateCw size={24} className="animate-spin mx-auto text-[#D4A373] mb-3" />
                    Loading table reservations...
                  </td>
                </tr>
              ) : filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center space-y-3">
                    <p className="text-[#C2B59B] text-sm">No reservations match your current filters.</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D4A373] text-[#141414] hover:bg-[#8B5E3C] hover:text-[#FAF7F2] transition"
                    >
                      <Plus size={14} /> Reserve a Table Now
                    </button>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((r) => {
                  const guestCount = Number(r.guests) || 1;
                  return (
                    <tr key={r._id} className="hover:bg-[#25221E] transition">
                      {/* Diner Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0">
                            {(r.name || "D").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#FAF7F2] text-sm leading-tight">{r.name}</p>
                            {r.email ? (
                              <p className="text-[11px] text-[#8B7E6A] flex items-center gap-1 mt-0.5">
                                <Mail size={11} className="text-[#8B7E6A]" /> {r.email}
                              </p>
                            ) : (
                              <p className="text-[11px] text-[#8B7E6A] italic mt-0.5">Walk-in (No email)</p>
                            )}
                            {r.bookingCode && (
                              <span className="inline-block text-[10px] font-mono text-[#D4A373] bg-[#2A2A2A] px-1.5 py-0.5 rounded border border-[#3A2E24] mt-1">
                                {r.bookingCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PEOPLE RESERVED (CRITICAL VISIBILITY) */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-extrabold text-xs bg-amber-500/10 text-[#D4A373] border border-amber-500/30">
                            <Users size={13} />
                            <span>
                              {guestCount} {guestCount === 1 ? "Person" : "People"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8B7E6A] block pl-0.5">
                            {guestCount === 1
                              ? "Solo diner"
                              : guestCount === 2
                              ? "Couple table"
                              : guestCount <= 4
                              ? "Standard 4-top"
                              : "Large group"}
                          </p>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#FAF7F2]">
                            <Calendar size={13} className="text-[#D4A373]" />
                            <span>{r.reservationDate || "Date TBD"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#C2B59B] text-[11px]">
                            <Clock size={12} className="text-[#8B7E6A]" />
                            <span>{r.reservationTime || "Time TBD"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Seating & Occasion */}
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-1">
                          <span className="inline-block text-[11px] font-semibold text-[#FAF7F2] bg-[#2A2A2A] px-2.5 py-0.5 rounded-lg border border-[#3A2E24]">
                            {r.partyType || "Couple"}
                          </span>
                          <p className="text-[11px] text-[#C2B59B] flex items-center gap-1">
                            <MapPin size={11} className="text-[#8B7E6A]" />
                            {r.seatingPreference || "Indoor Dining"}
                          </p>
                          {r.customOccasion && (
                            <p className="text-[10px] text-[#D4A373] italic">
                              🎉 {r.customOccasion}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Contact Phone */}
                      <td className="px-6 py-4 text-xs">
                        <span className="flex items-center gap-1.5 text-[#FAF7F2]">
                          <Phone size={13} className="text-[#8B7E6A]" />
                          {r.phone}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                              r.status
                            )}`}
                          >
                            <CheckCircle2 size={12} />
                            {r.status || "Confirmed"}
                          </span>

                          {/* Quick Status Dropdown / Cycle */}
                          <select
                            value={r.status || "Confirmed"}
                            onChange={(e) => handleStatusChange(r._id, e.target.value)}
                            className="bg-[#2A2A2A] border border-[#3A2E24] text-[11px] text-[#C2B59B] rounded-lg px-2 py-1 focus:outline-none focus:border-[#D4A373] cursor-pointer"
                            title="Quick Change Status"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-[#1E1E1E]">
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* EDIT BUTTON (CRITICAL USER REQUEST) */}
                          <button
                            onClick={() => setEditReservation(r)}
                            className="p-2 rounded-xl text-[#D4A373] hover:text-[#141414] hover:bg-[#D4A373] bg-[#2A2A2A] border border-[#3A2E24] transition shadow-sm"
                            title="Edit reservation / guests count"
                          >
                            <Pencil size={15} />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            onClick={() => handleDelete(r._id)}
                            disabled={deletingId === r._id}
                            className="p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500 bg-red-500/10 border border-red-500/20 transition disabled:opacity-50 shadow-sm"
                            title="Remove reservation"
                          >
                            {deletingId === r._id ? (
                              <RotateCw size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <ReservationModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editReservation && (
        <ReservationModal
          initial={editReservation}
          onClose={() => setEditReservation(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
