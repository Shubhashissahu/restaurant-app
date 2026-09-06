// src/pages/Menu.jsx

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import {
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Star,
  Filter,
  X,
} from "lucide-react";
import { resolveDishImage } from "../utils/imageUtils";

const API = "http://localhost:5000/api";

// ── Category Normalizer ──────────────────────────────────────────────────────
function normalizeCategory(category = "", name = "") {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase().trim();

  // If dish is explicitly a drink / beverage
  if (
    n.includes("chai") ||
    n.includes("lassi") ||
    n.includes("tea") ||
    n.includes("shake") ||
    n.includes("coffee") ||
    n.includes("juice")
  ) {
    return "Drinks";
  }

  if (c === "mains" || c === "main course" || c === "main-course" || c === "maincourse") {
    return "Main Course";
  }
  if (c === "starters" || c === "starter" || c === "appetizers" || c === "appetizer") {
    return "Starters";
  }
  if (c === "drinks" || c === "drink" || c === "beverages" || c === "beverage") {
    return "Drinks";
  }
  if (c === "desserts" || c === "dessert" || c === "sweets" || c === "sweet") {
    return "Desserts";
  }
  if (c === "specials" || c === "special") {
    return "Specials";
  }
  return category || "General";
}

// ── Photos ───────────────────────────────────────────────────────────────────
const CATEGORY_PHOTOS = {
  Burgers:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",

  Pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",

  Sushi:
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",

  Pasta:
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",

  Salads:
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",

  Desserts:
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",

  Drinks:
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80",

  Seafood:
    "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&q=80",

  Steaks:
    "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",

  Chicken:
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c1?w=600&q=80",

  "Main Course":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",

  Starters:
    "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80",

  Appetizers:
    "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&q=80",

  default:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
};

// ── Filters ──────────────────────────────────────────────────────────────────
const PRICE_FILTERS = [
  { label: "All", value: "all" },

  { label: "Below ₹100", value: "below100" },

  { label: "₹100–₹500", value: "range" },

  { label: "Above ₹500", value: "above500" },
];

// ── Rating ───────────────────────────────────────────────────────────────────
function getRating(id) {
  if (!id) return "4.2";

  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);

  return (3.5 + (seed % 15) / 10).toFixed(1);
}

function getReviews(id) {
  const seed = id ? id.charCodeAt(2) ?? 10 : 10;

  return 20 + (seed % 80);
}

function MenuCard({ item, ordered, onOrder, index = 0 }) {
  const normCategory = normalizeCategory(item.category, item.name);
  const photo = resolveDishImage(item.image || item.imageUrl, item.name, normCategory);

  const rating = getRating(item._id);
  const reviews = getReviews(item._id);

  return (
    <div
      style={{ animationDelay: `${Math.min(index * 60, 500)}ms` }}
      className="group relative bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#3A2E24] rounded-[28px] overflow-hidden shadow-2xl hover:-translate-y-3 hover:border-[#D4A373]/50 hover:shadow-[0_15px_35px_rgba(212,163,115,0.15)] transition-all duration-500 flex flex-col animate-slide-up"
    >
      {/* GOLD HOVER OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/5 via-transparent to-[#8B5E3C]/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none z-10"></div>

      {/* TOP SHINE */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 z-10"></div>

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={photo}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const fallback =
              CATEGORY_PHOTOS[normCategory] ||
              CATEGORY_PHOTOS[item.category] ||
              CATEGORY_PHOTOS["default"];
            if (e.target.src !== fallback) {
              e.target.src = fallback;
            }
          }}
        />

        <div className="absolute inset-0 bg-black/30"></div>

        {/* CATEGORY BADGE */}
        <span className="absolute top-4 left-4 bg-[#1A1A1A]/90 backdrop-blur-md text-[#D4A373] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-xl border border-[#3A2E24]">
          {normCategory}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col flex-1 relative z-20">
        {/* RATING */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Star size={14} className="fill-[#D4A373] text-[#D4A373]" />
            <span className="text-sm font-bold text-[#FAF7F2]">{rating}</span>
            <span className="text-xs text-[#8B7E6A]">({reviews})</span>
          </div>
        </div>

        {/* TITLE */}
        <h3 className="font-bold text-[#FAF7F2] text-xl leading-snug mb-2 group-hover:text-[#D4A373] transition-colors">
          {item.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-[#C2B59B] text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
          {item.description || "A delicious dish crafted with fresh ingredients."}
        </p>

        {/* PRICE + CTA */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8B7E6A] mb-1">
              Price
            </p>
            <span className="text-[#D4A373] font-bold text-2xl">
              ₹{Number(item.price).toLocaleString("en-IN")}
            </span>
          </div>

          {ordered ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#D4A373] text-sm font-semibold">
              <CheckCircle size={16} />
              Added
            </div>
          ) : (
            <button
              onClick={() => onOrder(item)}
              className="group/btn relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#141414] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>
              <ShoppingCart size={18} className="relative z-10" />
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM GOLD LINE */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#1E1E1E] rounded-3xl overflow-hidden animate-pulse border border-[#3A2E24]">
      <div className="h-56 bg-[#2A2A2A]" />

      <div className="p-5 space-y-3">
        <div className="h-3 bg-[#2A2A2A] rounded w-1/3" />
        <div className="h-4 bg-[#2A2A2A] rounded w-2/3" />
        <div className="h-3 bg-[#2A2A2A] rounded w-full" />
        <div className="h-3 bg-[#2A2A2A] rounded w-4/5" />
        <div className="h-10 bg-[#2A2A2A] rounded-2xl mt-4" />
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Menu() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderMsg, setOrderMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderedItems, setOrderedItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${API}/menu?_t=${Date.now()}`;
        if (filter === "below100") url += "&maxPrice=100";
        if (filter === "range") url += "&minPrice=100&maxPrice=500";
        if (filter === "above500") url += "&minPrice=500";

        const res = await axios.get(url);
        setItems(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load menu. Please make sure the server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  // Filter items by category & search term
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemNorm = normalizeCategory(item.category, item.name);
      let matchCategory = activeCategory === "All";

      if (!matchCategory) {
        if (activeCategory === "Main Course") {
          matchCategory = itemNorm === "Main Course";
        } else if (activeCategory === "Starters") {
          matchCategory = itemNorm === "Starters";
        } else if (activeCategory === "Appetizers") {
          matchCategory = itemNorm === "Starters" || itemNorm === "Appetizers";
        } else if (activeCategory === "Drinks") {
          matchCategory = itemNorm === "Drinks";
        } else {
          matchCategory =
            itemNorm === activeCategory ||
            item.category?.toLowerCase() === activeCategory.toLowerCase();
        }
      }

      const matchSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [items, activeCategory, searchQuery]);

  // Sort items according to culinary hierarchy
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    const order = {
      "Starters": 1,
      "Main Course": 2,
      "Drinks": 3,
      "Desserts": 4,
      "Specials": 5,
    };
    list.sort((a, b) => {
      const aRank = order[normalizeCategory(a.category, a.name)] || 99;
      const bRank = order[normalizeCategory(b.category, b.name)] || 99;
      if (aRank !== bRank) return aRank - bRank;
      return Number(a.price) - Number(b.price);
    });

    return list;
  }, [filteredItems]);

  const handleOrder = (item) => {
    setOrderedItems((prev) => [...prev, item._id]);
    setOrderMsg(`"${item.name}" added to your order!`);
    setTimeout(() => setOrderMsg(null), 3000);
  };

  return (
    <>
      <Helmet>
        <title>Menu | TasteHub</title>

        <meta
          name="description"
          content="Browse our premium restaurant menu."
        />
      </Helmet>

      <div className="min-h-screen bg-[#141414] text-[#FAF7F2]">

        {/* HERO */}
        <div className="relative h-72 overflow-hidden">

          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80"
            alt="Restaurant hero"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#141414] flex flex-col items-center justify-center text-center px-6">

            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-3 tracking-wide">
              Our Menu
            </h1>

            <p className="text-[#E5D3BE] text-base max-w-md leading-relaxed">
              Discover carefully crafted dishes made with passion
              and premium ingredients
            </p>

            <div className="mt-5 w-20 h-1 bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] rounded-full" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* CONTROLS BAR (MATCHING SCREENSHOT 1) */}
          <div className="rounded-2xl bg-[#1E1E1E]/95 backdrop-blur-xl border border-[#3A2E24] p-6 shadow-2xl space-y-5 -mt-16 relative z-20 mb-10 overflow-hidden">
            {/* Ambient Animated Glows */}
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
            <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-[#8B5E3C]/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

            {/* Row 1: Header, Counter & Search */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#FAF7F2] tracking-wide">
                    Food Menu Items
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold inline-flex items-center gap-1.5 transition-transform duration-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A373] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A373]"></span>
                    </span>
                    {sortedItems.length} of {items.length} Dishes
                  </span>
                </div>
                <p className="text-xs text-[#C2B59B] mt-1 font-medium">
                  Manage culinary dishes, prices, and categorizations
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 group">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A] transition-colors group-focus-within:text-[#D4A373]"
                />
                <input
                  type="text"
                  placeholder="Search dishes or ingredients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-8 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B7E6A] hover:text-[#FAF7F2] active:scale-90 transition-transform"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2: Filters Toolbar (Category & Price) */}
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-3 border-t border-[#3A2E24]/60">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <Filter size={14} className="text-[#8B7E6A] mr-1 flex-shrink-0 transition-transform duration-300 hover:rotate-12" />
                {["All", "Starters", "Main Course", "Appetizers", "Desserts", "Drinks"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer ${
                      activeCategory === cat
                        ? "bg-[#D4A373] text-[#141414] shadow-lg shadow-[#D4A373]/25 font-bold scale-[1.02]"
                        : "bg-[#2A2A2A] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] hover:border-[#D4A373]/40 border border-[#3A2E24]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Price Filter Pills & Reset */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
                <span className="flex items-center gap-1.5 text-[#8B7E6A] text-xs font-medium mr-1">
                  <SlidersHorizontal size={13} className="text-[#D4A373]" />
                  Price:
                </span>
                {PRICE_FILTERS.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer ${
                      filter === btn.value
                        ? "bg-[#D4A373] text-[#141414] font-bold shadow-lg shadow-[#D4A373]/25 scale-[1.02]"
                        : "bg-[#2A2A2A] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] hover:border-[#D4A373]/40 border border-[#3A2E24]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
                {(activeCategory !== "All" || filter !== "all" || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-[#D4A373] hover:text-white hover:underline font-semibold ml-2 whitespace-nowrap active:scale-90 transition-all duration-200 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex items-center justify-center gap-3 text-red-300 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
              <AlertCircle size={22} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* LOADING */}
          {loading && !error && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            sortedItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-[#C2B59B]">
                <p className="text-2xl font-semibold text-[#FAF7F2]">
                  No dishes found
                </p>

                <p className="text-sm mt-2 text-center max-w-xs">
                  Try selecting another category, changing price filters, or clearing search.
                </p>

                <button
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 px-6 py-3 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold rounded-full text-sm transition shadow-lg shadow-[#D4A373]/20"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          {/* DISHES GRID */}
          {!loading &&
            !error &&
            sortedItems.length > 0 && (
              <div
                key={`${activeCategory}-${filter}-${searchQuery}`}
                className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20"
              >
                {sortedItems.map((item, idx) => (
                  <MenuCard
                    key={item._id}
                    item={item}
                    index={idx}
                    ordered={orderedItems.includes(item._id)}
                    onOrder={handleOrder}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* TOAST */}
      {orderMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#D4A373] text-[#141414] px-6 py-3.5 rounded-2xl shadow-2xl text-sm font-bold animate-pop-in border border-[#141414]/20">
          <CheckCircle size={18} />
          {orderMsg}
        </div>
      )}
    </>
  );
}