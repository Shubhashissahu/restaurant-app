
// frontend/src/components/manager/ManagerMenuManagement.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../services/api";
import {
  UtensilsCrossed,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCw,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  AlertCircle,
  Eye,
  Check,
  Flame,
  Clock,
  Pencil,
  X,
  Sparkles,
  History,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveDishImage, CATEGORY_FALLBACK_IMAGES, DEFAULT_FOOD_IMAGE } from "../../utils/imageUtils";

export default function ManagerMenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'available' | 'unavailable'
  const [priceApprovalFilter, setPriceApprovalFilter] = useState("all"); // 'all' | 'approved' | 'not_approved'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [togglingId, setTogglingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showPriceRequestsModal, setShowPriceRequestsModal] = useState(false);
  const [priceRequests, setPriceRequests] = useState([]);
  const [modalPriceFilter, setModalPriceFilter] = useState("all"); // 'all' | 'approved' | 'not_approved'
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch Menu Items from Manager API
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/manager/menu");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching menu items for manager:", err);
      setError("Failed to load menu items. Please ensure your backend is running.");
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Derived Category List
  const categories = useMemo(() => {
    const list = Array.from(new Set(items.map((i) => i.category || "General"))).filter(Boolean);
    return ["All", ...list];
  }, [items]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.isAvailable !== false && i.status !== "Unavailable" && i.status !== "Sold Out").length;
    const unavailable = total - available;
    const rate = total > 0 ? Math.round((available / total) * 100) : 0;
    
    // Not Approved includes both Pending and Rejected price change requests
    const notApprovedCount = items.filter((i) =>
      Boolean(i.pendingPriceChange) ||
      i.priceApprovalStatus === "Pending" ||
      i.priceApprovalStatus === "Rejected" ||
      i.latestPriceRequest?.status === "Rejected"
    ).length;
    const approvedPriceCount = total - notApprovedCount;

    return { total, available, unavailable, rate, notApprovedCount, approvedPriceCount };
  }, [items]);

  // Fetch Price Change Requests (for tracking modal)
  const fetchPriceRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get("/manager/price-requests");
      setPriceRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching price requests for manager:", err);
      toast.error("Failed to load price requests history");
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  // Filtered & Searched Dishes
  const filteredDishes = useMemo(() => {
    return items.filter((item) => {
      const isAvailable = item.isAvailable !== false && item.status !== "Unavailable" && item.status !== "Sold Out";

      // Category filter
      const matchesCategory =
        selectedCategory === "All" ||
        (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      // Availability Status filter
      let matchesStatus = true;
      if (statusFilter === "available") matchesStatus = isAvailable;
      if (statusFilter === "unavailable" || statusFilter === "soldout") matchesStatus = !isAvailable;

      // Price Approval filter: Not Approved includes Pending or Rejected requests
      let matchesPriceApproval = true;
      const isNotApproved =
        Boolean(item.pendingPriceChange) ||
        item.priceApprovalStatus === "Pending" ||
        item.priceApprovalStatus === "Rejected" ||
        item.latestPriceRequest?.status === "Rejected";

      if (priceApprovalFilter === "approved") matchesPriceApproval = !isNotApproved;
      if (priceApprovalFilter === "not_approved") matchesPriceApproval = isNotApproved;

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesPriceApproval && matchesSearch;
    });
  }, [items, selectedCategory, statusFilter, priceApprovalFilter, searchQuery]);

  // One-Click Toggle Dish Availability
  const handleToggleAvailability = async (item) => {
    const currentIsAvailable = item.isAvailable !== false && item.status !== "Unavailable" && item.status !== "Sold Out";
    const nextIsAvailable = !currentIsAvailable;
    const nextStatus = nextIsAvailable ? "Available" : "Unavailable";

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, isAvailable: nextIsAvailable, status: nextStatus } : i
      )
    );
    setTogglingId(item._id);

    try {
      const res = await api.patch(`/manager/menu/${item._id}/availability`, {
        isAvailable: nextIsAvailable,
        status: nextStatus,
      });

      const updated = res.data?.item;
      if (updated) {
        setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
      }

      toast.success(
        nextIsAvailable
          ? `"${item.name}" is now Available on menu`
          : `"${item.name}" marked as Unavailable`,
        {
          icon: nextIsAvailable ? "✅" : "🚫",
          style: {
            background: "#1E1E1E",
            color: "#FAF7F2",
            border: "1px solid #3A2E24",
          },
        }
      );
    } catch (err) {
      console.error("Error toggling dish availability:", err);
      // Revert optimistic update on failure
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, isAvailable: currentIsAvailable, status: item.status } : i
        )
      );
      toast.error(`Failed to update status for "${item.name}"`);
    } finally {
      setTogglingId(null);
    }
  };

  // Quick Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    try {
      const res = await api.put(`/manager/menu/${editingItem._id}`, {
        price: editingItem.price,
        description: editingItem.description,
        isAvailable: editingItem.isAvailable,
        status: editingItem.isAvailable ? "Available" : "Unavailable",
        reason: editingItem.priceReason || "",
      });

      const updated = res.data?.item || editingItem;
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));

      if (res.data?.priceChangePending) {
        toast.success(
          `Price change to ₹${res.data.pendingPrice} submitted for Admin approval!`,
          {
            icon: "⏳",
            duration: 4500,
            style: {
              background: "#1E1E1E",
              color: "#FAF7F2",
              border: "1px solid #D4A373",
            },
          }
        );
      } else {
        toast.success(`Updated "${updated.name}"`);
      }
      setEditingItem(null);
    } catch (err) {
      console.error("Error saving dish edit:", err);
      toast.error("Failed to update dish details");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
              Menu & Availability Management
            </h1>
            <span className="text-xs px-3 py-1 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/40 font-bold flex items-center gap-1.5">
              <Sparkles size={12} />
              Live Sync to Public Menu
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#C2B59B]">
            Turn dishes on/off in real time. Unavailable dishes immediately reflect as &ldquo;Unavailable&rdquo; with disabled ordering on the guest menu.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              fetchPriceRequests();
              setShowPriceRequestsModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#D4A373]/10 hover:bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Track price change requests submitted for Admin approval"
          >
            <Clock size={14} />
            <span>Price Requests</span>
            {stats.pendingPriceCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-[#141414] text-[10px] font-extrabold shadow-sm animate-pulse">
                {stats.pendingPriceCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={fetchMenu}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#FAF7F2] border border-[#3A2E24] text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none cursor-pointer"
          >
            <RotateCw size={14} className={loading ? "animate-spin text-[#D4A373]" : "text-[#D4A373]"} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── METRICS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Dishes */}
        <div className="bg-[#1E1E1E]/90 border border-[#3A2E24] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373]">
            <UtensilsCrossed size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Total Dishes</p>
            <p className="text-2xl font-extrabold text-[#FAF7F2]">{stats.total}</p>
          </div>
        </div>

        {/* Available Today */}
        <div className="bg-[#1E1E1E]/90 border border-[#3A2E24] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Available Live</p>
            <p className="text-2xl font-extrabold text-emerald-400">{stats.available}</p>
          </div>
        </div>

        {/* Unavailable Dishes */}
        <div className="bg-[#1E1E1E]/90 border border-[#3A2E24] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Unavailable</p>
            <p className="text-2xl font-extrabold text-rose-400">{stats.unavailable}</p>
          </div>
        </div>

        {/* Approved Prices Card */}
        <div
          onClick={() => setPriceApprovalFilter((prev) => (prev === "approved" ? "all" : "approved"))}
          className={`border rounded-3xl p-5 shadow-xl flex items-center gap-4 cursor-pointer transition ${
            priceApprovalFilter === "approved"
              ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30"
              : "bg-[#1E1E1E]/90 border-[#3A2E24] hover:border-emerald-500/40"
          }`}
          title="Click to filter approved dishes"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Approved Prices</p>
            <p className="text-2xl font-extrabold text-emerald-400">{stats.approvedPriceCount}</p>
          </div>
        </div>

        {/* Not Approved Card */}
        <div
          onClick={() => setPriceApprovalFilter((prev) => (prev === "not_approved" ? "all" : "not_approved"))}
          className={`border rounded-3xl p-5 shadow-xl flex items-center gap-4 cursor-pointer transition ${
            priceApprovalFilter === "not_approved"
              ? "bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30"
              : "bg-[#1E1E1E]/90 border-[#3A2E24] hover:border-amber-500/40"
          }`}
          title="Click to filter dishes with unapproved or rejected price requests"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={22} className={stats.notApprovedCount > 0 ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Not Approved</p>
            <p className="text-2xl font-extrabold text-amber-300">{stats.notApprovedCount}</p>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, CATEGORIES & VIEW MODE ── */}
      <div className="bg-[#1C1815] border border-[#44362A] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full xl:w-80 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A373]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border-2 border-[#544336] hover:border-[#D4A373]/70 focus:border-[#D4A373] rounded-2xl pl-10 pr-9 py-2 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#C2B59B] focus:outline-none focus:ring-4 focus:ring-[#D4A373]/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7E6A] hover:text-[#FAF7F2]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters & View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Price Approval Filter */}
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#3E3125] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setPriceApprovalFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  priceApprovalFilter === "all"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                All Prices
              </button>
              <button
                type="button"
                onClick={() => setPriceApprovalFilter("approved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  priceApprovalFilter === "approved"
                    ? "bg-emerald-500 text-[#141414] shadow-sm"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Approved ({stats.approvedPriceCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setPriceApprovalFilter("not_approved")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  priceApprovalFilter === "not_approved"
                    ? "bg-amber-500 text-[#141414] shadow-sm"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Clock size={12} />
                <span>Not Approved ({stats.notApprovedCount})</span>
              </button>
            </div>

            {/* Quick Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#3E3125] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("available")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "available"
                    ? "bg-emerald-500 text-[#141414] shadow-sm"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                Available ({stats.available})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unavailable")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === "unavailable"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-400 hover:text-rose-300"
                }`}
              >
                Unavailable ({stats.unavailable})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#141414] border border-[#3E3125] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#D4A373] text-[#141414]"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table view"
                className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-[#D4A373] text-[#141414]"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                <TableIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#3D3228]/80 no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider mr-1 flex-shrink-0">
            <Filter size={13} />
            <span>Category:</span>
          </div>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-gradient-to-r from-[#D4A373] to-[#B88755] text-[#141414] shadow-md shadow-[#D4A373]/25 scale-[1.02]"
                    : "bg-[#171310] hover:bg-[#251E19] text-[#DFD3C3] hover:text-[#FAF7F2] border border-[#3E3125] hover:border-[#D4A373]/50"
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DISHES LIST / GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1E1E1E] rounded-3xl h-72 animate-pulse border border-[#3A2E24]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-red-950/40 border border-red-500/30 text-center space-y-4">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-red-200 font-semibold">{error}</p>
          <button
            type="button"
            onClick={fetchMenu}
            className="px-5 py-2.5 rounded-2xl bg-red-500 text-white font-bold text-xs shadow-lg hover:bg-red-600 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-16 px-6 text-center bg-[#1E1E1E]/60 border border-[#3A2E24] rounded-3xl">
          <UtensilsCrossed size={36} className="text-[#D4A373] mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#FAF7F2]">No dishes match your filter</h3>
          <p className="text-xs text-[#C2B59B] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status tab, or category selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setStatusFilter("all");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#D4A373] text-[#141414] text-xs font-bold hover:bg-[#8B5E3C] hover:text-white transition"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => {
            const isAvailable = dish.isAvailable !== false && dish.status !== "Unavailable" && dish.status !== "Sold Out";
            const photo = resolveDishImage(dish.image || dish.imageUrl, dish.name, dish.category);
            const isToggling = togglingId === dish._id;

            return (
              <div
                key={dish._id}
                className={`group relative bg-[#1E1E1E] border rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col ${isAvailable
                    ? "border-[#3A2E24] hover:border-[#D4A373]/50"
                    : "border-rose-900/40 bg-[#1A1414]/90 opacity-90"
                  }`}
              >
                {/* Photo & Category */}
                <div className="relative h-48 overflow-hidden bg-[#141414]">
                  <img
                    src={photo}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src =
                        CATEGORY_FALLBACK_IMAGES[dish.category] || DEFAULT_FOOD_IMAGE;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-black/30" />

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 bg-[#141414]/90 backdrop-blur-md text-[#D4A373] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#3A2E24]">
                    {dish.category || "General"}
                  </span>

                  {/* Status Indicator */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-md flex items-center gap-1.5 ${isAvailable
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-950/80 text-rose-400 border-rose-500/30"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                        }`}
                    />
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#FAF7F2] text-lg leading-snug line-clamp-1">
                      {dish.name}
                    </h3>
                    <span className="text-[#D4A373] font-extrabold text-lg flex-shrink-0">
                      ₹{Number(dish.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Price Approval Status Banner */}
                  {dish.pendingPriceChange || dish.priceApprovalStatus === "Pending" ? (
                    <div className="mb-3 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-extrabold text-amber-300">
                          <Clock size={13} className="text-amber-400 animate-pulse shrink-0" />
                          <span>Not Approved (Pending)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-[#141414] font-black text-xs">
                          ₹{dish.pendingPriceChange?.requestedPrice}
                        </span>
                      </div>
                      {dish.pendingPriceChange?.reason && (
                        <p className="text-[11px] text-[#C2B59B] italic leading-tight">
                          Reason: &ldquo;{dish.pendingPriceChange.reason}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-[#C2B59B] pt-1 border-t border-amber-500/20">
                        <span>Current Live Menu Price:</span>
                        <span className="font-bold text-[#FAF7F2]">₹{Number(dish.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (dish.priceApprovalStatus === "Rejected" || dish.latestPriceRequest?.status === "Rejected") ? (
                    <div className="mb-3 p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                        <span className="flex items-center gap-1.5">
                          <XCircle size={13} className="shrink-0" />
                          <span>Not Approved (Rejected)</span>
                        </span>
                        <span className="line-through text-rose-300 text-xs font-black">
                          ₹{dish.latestPriceRequest?.requestedPrice}
                        </span>
                      </div>
                      {dish.latestPriceRequest?.reviewNote && (
                        <p className="text-[11px] text-[#C2B59B] italic leading-tight">
                          Admin note: &ldquo;{dish.latestPriceRequest.reviewNote}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-[#C2B59B] pt-1 border-t border-rose-500/20">
                        <span>Current Live Menu Price:</span>
                        <span className="font-bold text-[#FAF7F2]">₹{Number(dish.price).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <CheckCircle2 size={13} className="shrink-0" />
                        <span>Price Approved</span>
                      </div>
                      <span className="text-emerald-300 font-extrabold text-xs">
                        ₹{Number(dish.price).toLocaleString("en-IN")} Live
                      </span>
                    </div>
                  )}

                  <p className="text-[#C2B59B] text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                    {dish.description || "Freshly curated artisanal dish."}
                  </p>

                  {/* Bottom Action / Toggle Bar */}
                  <div className="pt-3 border-t border-[#3A2E24]/60 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...dish,
                          originalPrice: dish.price,
                          priceReason: "",
                        })
                      }
                      className="p-2 rounded-xl bg-[#28221D] hover:bg-[#382E27] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] text-xs transition"
                      title="Quick Edit Details (Price changes require Admin approval)"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Big Interactive Availability Toggle Switch */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleAvailability(dish)}
                      className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer border ${isAvailable
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                        }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isAvailable ? <Check size={14} /> : <X size={14} />}
                        <span>{isAvailable ? "Mark as Unavailable" : "Mark Available"}</span>
                      </span>

                      {/* Slider Pill Indicator */}
                      <div
                        className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${isAvailable ? "bg-emerald-500 justify-end" : "bg-rose-500 justify-start"
                          }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3A2E24] bg-[#141414] text-[11px] uppercase font-bold text-[#8B7E6A] tracking-wider">
                  <th className="py-4 px-6">Dish</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Current Status</th>
                  <th className="py-4 px-6 text-right">Availability Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A2E24]/60 text-xs">
                {filteredDishes.map((dish) => {
                  const isAvailable = dish.isAvailable !== false && dish.status !== "Unavailable" && dish.status !== "Sold Out";
                  const photo = resolveDishImage(dish.image || dish.imageUrl, dish.name, dish.category);
                  const isToggling = togglingId === dish._id;

                  return (
                    <tr
                      key={dish._id}
                      className="hover:bg-[#25201C] transition-colors"
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt={dish.name}
                            className="w-12 h-12 rounded-xl object-cover bg-[#141414] border border-[#3A2E24]"
                            onError={(e) => {
                              e.target.src =
                                CATEGORY_FALLBACK_IMAGES[dish.category] || DEFAULT_FOOD_IMAGE;
                            }}
                          />
                          <div>
                            <p className="font-bold text-[#FAF7F2] text-sm">{dish.name}</p>
                            <p className="text-[#8B7E6A] text-[11px] line-clamp-1 max-w-xs">
                              {dish.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#3A2E24] text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">
                          {dish.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-[#FAF7F2] text-sm">
                            ₹{Number(dish.price).toLocaleString("en-IN")}
                          </span>
                          {dish.pendingPriceChange || dish.priceApprovalStatus === "Pending" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold animate-pulse w-fit">
                              <Clock size={10} /> Not Approved: ₹{dish.pendingPriceChange?.requestedPrice} (Pending)
                            </span>
                          ) : (dish.priceApprovalStatus === "Rejected" || dish.latestPriceRequest?.status === "Rejected") ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold w-fit">
                              <XCircle size={10} /> Not Approved: ₹{dish.latestPriceRequest?.requestedPrice} (Rejected)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold w-fit">
                              <CheckCircle2 size={10} /> Price Approved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${isAvailable
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                              }`}
                          />
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingItem({
                                ...dish,
                                originalPrice: dish.price,
                                priceReason: "",
                              })
                            }
                            className="p-2 rounded-xl bg-[#28221D] hover:bg-[#382E27] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] text-xs transition"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            disabled={isToggling}
                            onClick={() => handleToggleAvailability(dish)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer flex items-center gap-2 ${isAvailable
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              }`}
                          >
                            <span>{isAvailable ? "Set Unavailable" : "Set Available"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QUICK EDIT MODAL ── */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="w-full max-w-md bg-[#1C1815] border border-[#44362A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3A2E24] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#FAF7F2]">Quick Edit Dish</h3>
                <p className="text-xs text-[#8B7E6A]">{editingItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-[#141414] text-[#C2B59B] hover:text-[#FAF7F2] flex items-center justify-center border border-[#3A2E24]"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Availability Status Radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A373] mb-2">
                  Availability Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem((prev) => ({ ...prev, isAvailable: true }))}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${editingItem.isAvailable
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-sm"
                        : "bg-[#141414] text-[#8B7E6A] border-[#3A2E24]"
                      }`}
                  >
                    <CheckCircle2 size={15} />
                    Available Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem((prev) => ({ ...prev, isAvailable: false }))}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${!editingItem.isAvailable
                        ? "bg-rose-500/20 text-rose-400 border-rose-500 shadow-sm"
                        : "bg-[#141414] text-[#8B7E6A] border-[#3A2E24]"
                      }`}
                  >
                    <XCircle size={15} />
                    Unavailable
                  </button>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A373]">
                    Price (₹)
                  </label>
                  {editingItem.originalPrice !== undefined && (
                    <span className="text-[11px] text-[#8B7E6A]">
                      Current Menu Price: ₹{editingItem.originalPrice}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full bg-[#141414] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#D4A373] focus:outline-none font-semibold"
                  required
                />
              </div>

              {/* Price Change Approval Notice */}
              {Number(editingItem.price) !== Number(editingItem.originalPrice) && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#D4A373]/10 to-amber-500/5 border border-[#D4A373]/40 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-[#D4A373] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#D4A373]">
                        Price Change Requires Admin Approval
                      </p>
                      <p className="text-[11px] text-[#C2B59B] mt-0.5 leading-relaxed">
                        Dish price will remain <span className="text-[#FAF7F2] font-semibold">₹{editingItem.originalPrice}</span> until the Administrator reviews and approves this request to <span className="text-[#FAF7F2] font-semibold">₹{editingItem.price}</span>.
                      </p>
                    </div>
                  </div>

                  {/* Optional Reason Input for Admin */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#C2B59B] mb-1">
                      Reason for Price Change (Optional for Admin)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Raw ingredient cost inflation, portion update"
                      value={editingItem.priceReason || ""}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, priceReason: e.target.value }))
                      }
                      className="w-full bg-[#141414] border border-[#3A2E24] rounded-xl px-3 py-1.5 text-xs text-[#FAF7F2] focus:border-[#D4A373] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Pending Request Alert if exists */}
              {editingItem.pendingPriceChange && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs">
                  <Clock size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">
                      Previous Request Pending: ₹{editingItem.pendingPriceChange.requestedPrice}
                    </p>
                    <p className="text-[11px] text-[#C2B59B] mt-0.5">
                      Submitting a new price will update the pending approval request.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A373] mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full bg-[#141414] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] focus:border-[#D4A373] focus:outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#3A2E24]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#C2B59B] hover:text-[#FAF7F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  {savingEdit ? (
                    <span>Saving...</span>
                  ) : Number(editingItem.price) !== Number(editingItem.originalPrice) ? (
                    <>
                      <Clock size={13} />
                      <span>Save & Request Approval (₹{editingItem.price})</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PRICE REQUESTS TRACKING MODAL FOR MANAGERS ── */}
      {showPriceRequestsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in"
          onClick={() => setShowPriceRequestsModal(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#1C1815] border border-[#44362A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#3A2E24] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D4A373]/10 border border-[#3A2E24] flex items-center justify-center text-[#D4A373]">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FAF7F2]">Price Change Requests</h3>
                  <p className="text-xs text-[#8B7E6A]">
                    Track status of dish price changes submitted for Admin approval
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchPriceRequests}
                  disabled={loadingRequests}
                  className="p-2 rounded-xl bg-[#28221D] hover:bg-[#382E27] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] text-xs transition"
                  title="Refresh status"
                >
                  <RotateCw size={14} className={loadingRequests ? "animate-spin text-[#D4A373]" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPriceRequestsModal(false)}
                  className="w-8 h-8 rounded-full bg-[#141414] text-[#C2B59B] hover:text-[#FAF7F2] flex items-center justify-center border border-[#3A2E24]"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Filter Tabs in Price Requests Modal */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#3A2E24] pb-3 text-xs">
              <button
                type="button"
                onClick={() => setModalPriceFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  modalPriceFilter === "all"
                    ? "bg-[#D4A373] text-[#141414]"
                    : "bg-[#251F1A] text-[#C2B59B] hover:text-[#FAF7F2]"
                }`}
              >
                All Requests ({priceRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setModalPriceFilter("approved")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  modalPriceFilter === "approved"
                    ? "bg-emerald-500 text-[#141414]"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                <CheckCircle2 size={12} />
                <span>Approved ({priceRequests.filter((r) => r.status === "Approved").length})</span>
              </button>
              <button
                type="button"
                onClick={() => setModalPriceFilter("not_approved")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  modalPriceFilter === "not_approved"
                    ? "bg-amber-500 text-[#141414]"
                    : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                }`}
              >
                <Clock size={12} />
                <span>Not Approved ({priceRequests.filter((r) => r.status !== "Approved").length})</span>
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {loadingRequests ? (
                <div className="py-12 text-center text-[#8B7E6A] text-xs flex items-center justify-center gap-2">
                  <RotateCw size={16} className="animate-spin text-[#D4A373]" />
                  <span>Loading price requests...</span>
                </div>
              ) : priceRequests.filter((req) => {
                  if (modalPriceFilter === "approved") return req.status === "Approved";
                  if (modalPriceFilter === "not_approved") return req.status !== "Approved";
                  return true;
                }).length === 0 ? (
                <div className="py-12 text-center text-[#8B7E6A] text-xs">
                  <FileText size={28} className="mx-auto mb-2 text-[#3A2E24]" />
                  <p className="font-semibold">No matching price change requests found.</p>
                  <p className="text-[11px] mt-1">Try switching filter tabs above.</p>
                </div>
              ) : (
                priceRequests
                  .filter((req) => {
                    if (modalPriceFilter === "approved") return req.status === "Approved";
                    if (modalPriceFilter === "not_approved") return req.status !== "Approved";
                    return true;
                  })
                  .map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-2xl bg-[#141414] border border-[#3A2E24] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#FAF7F2] text-sm">{req.dishName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2A2A] border border-[#3A2E24] text-[#8B7E6A] uppercase font-bold">
                            {req.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#C2B59B]">
                          <span>Current: <strong className="text-[#FAF7F2]">₹{req.currentPrice}</strong></span>
                          <span>&rarr;</span>
                          <span>Requested: <strong className="text-[#D4A373]">₹{req.requestedPrice}</strong></span>
                        </div>
                        {req.reason && (
                          <p className="text-[11px] text-[#8B7E6A] italic">Reason: {req.reason}</p>
                        )}
                        {req.reviewNote && (
                          <p className="text-[11px] text-[#C2B59B]">Admin note: {req.reviewNote}</p>
                        )}
                        {req.status === "Approved" && (
                          <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                            <span>🎉 Your request approved! The new price of ₹{req.requestedPrice} is now live on the public menu.</span>
                          </div>
                        )}
                        {req.status === "Pending" && (
                          <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 font-semibold">
                            <Clock size={15} className="text-amber-400 shrink-0 animate-pulse" />
                            <span>⏳ Price Not Approved Yet. Awaiting Administrator review and approval.</span>
                          </div>
                        )}
                        {req.status === "Rejected" && (
                          <div className="mt-2.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <XCircle size={15} className="text-rose-400 shrink-0" />
                            <span>Price request was rejected. The dish remains ₹{req.currentPrice}.</span>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                            req.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : req.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              req.status === "Approved"
                                ? "bg-emerald-400"
                                : req.status === "Rejected"
                                ? "bg-rose-400"
                                : "bg-amber-400"
                            }`}
                          />
                          {req.status === "Approved"
                            ? "Approved"
                            : req.status === "Rejected"
                            ? "Not Approved (Rejected)"
                            : "Not Approved (Pending)"}
                        </span>
                        <span className="text-[10px] text-[#8B7E6A]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
