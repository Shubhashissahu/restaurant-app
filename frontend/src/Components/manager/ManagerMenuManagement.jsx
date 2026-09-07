
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
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [togglingId, setTogglingId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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
    return { total, available, unavailable, rate };
  }, [items]);

  // Filtered & Searched Dishes
  const filteredDishes = useMemo(() => {
    return items.filter((item) => {
      const isAvailable = item.isAvailable !== false && item.status !== "Unavailable" && item.status !== "Sold Out";

      // Category filter
      const matchesCategory =
        selectedCategory === "All" ||
        (item.category || "").toLowerCase() === selectedCategory.toLowerCase();

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "available") matchesStatus = isAvailable;
      if (statusFilter === "unavailable" || statusFilter === "soldout") matchesStatus = !isAvailable;

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [items, selectedCategory, statusFilter, searchQuery]);

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
      });

      const updated = res.data?.item || editingItem;
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      toast.success(`Updated "${updated.name}"`);
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

        <button
          type="button"
          onClick={fetchMenu}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#FAF7F2] border border-[#3A2E24] text-xs font-bold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:outline-none cursor-pointer"
        >
          <RotateCw size={14} className={loading ? "animate-spin text-[#D4A373]" : "text-[#D4A373]"} />
          <span>Refresh Menu</span>
        </button>
      </div>

      {/* ── METRICS OVERVIEW CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">Available Today</p>
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

        {/* Availability Rate */}
        <div className="bg-[#1E1E1E]/90 border border-[#3A2E24] rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5E3C]/15 border border-[#8B5E3C]/30 flex items-center justify-center text-[#D4A373]">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B7E6A]">In-Stock Rate</p>
            <p className="text-2xl font-extrabold text-[#FAF7F2]">{stats.rate}%</p>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, CATEGORIES & VIEW MODE ── */}
      <div className="bg-[#1C1815] border border-[#44362A] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4A373]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by dish name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border-2 border-[#544336] hover:border-[#D4A373]/70 focus:border-[#D4A373] rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#C2B59B] focus:outline-none focus:ring-4 focus:ring-[#D4A373]/20 transition-all"
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

          {/* Status Pills & View Mode */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
            {/* Quick Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#141414] border border-[#3E3125] p-1 rounded-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === "all"
                    ? "bg-[#D4A373] text-[#141414] shadow-sm"
                    : "text-[#C2B59B] hover:text-[#FAF7F2]"
                  }`}
              >
                All ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("available")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === "available"
                    ? "bg-emerald-500 text-[#141414] shadow-sm"
                    : "text-emerald-400 hover:text-emerald-300"
                  }`}
              >
                Available ({stats.available})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unavailable")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${statusFilter === "unavailable"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-rose-400 hover:text-rose-300"
                  }`}
              >
                Unavailable ({stats.unavailable})
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[#141414] border border-[#3E3125] p-1 rounded-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${viewMode === "grid"
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
                className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${viewMode === "table"
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

                  <p className="text-[#C2B59B] text-xs line-clamp-2 mb-4 leading-relaxed flex-1">
                    {dish.description || "Freshly curated artisanal dish."}
                  </p>

                  {/* Bottom Action / Toggle Bar */}
                  <div className="pt-3 border-t border-[#3A2E24]/60 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(dish)}
                      className="p-2 rounded-xl bg-[#28221D] hover:bg-[#382E27] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] text-xs transition"
                      title="Quick Edit Details"
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
                      <td className="py-3 px-4 font-bold text-[#D4A373] text-sm">
                        ₹{Number(dish.price).toLocaleString("en-IN")}
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
                            onClick={() => setEditingItem(dish)}
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#D4A373] mb-1.5">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="w-full bg-[#141414] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-sm text-[#FAF7F2] focus:border-[#D4A373] focus:outline-none"
                  required
                />
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414] font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
