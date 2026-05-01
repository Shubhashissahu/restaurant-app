// src/pages/Menu.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { ShoppingCart, CheckCircle, AlertCircle, Search, SlidersHorizontal } from "lucide-react";

const API = "http://localhost:5000/api";

const categories = [
  { name: "All",      emoji: "🍽️" },
  { name: "Burgers",  emoji: "🍔" },
  { name: "Pizza",    emoji: "🍕" },
  { name: "Sushi",    emoji: "🍱" },
  { name: "Pasta",    emoji: "🍝" },
  { name: "Salads",   emoji: "🥗" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks",   emoji: "🥤" },
  { name: "Seafood",  emoji: "🦞" },
  { name: "Steaks",   emoji: "🥩" },
  { name: "Chicken",  emoji: "🍗" },
];

const PRICE_FILTERS = [
  { label: "All",         value: "all"      },
  { label: "Below ₹100", value: "below100" },
  { label: "₹100–₹500",  value: "range"    },
  { label: "Above ₹500", value: "above500" },
];

export default function Menu() {
  const [items,         setItems]         = useState([]);
  const [filter,        setFilter]        = useState("all");
  const [activeCategory,setActiveCategory]= useState("All");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [orderMsg,      setOrderMsg]      = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [orderedItems,  setOrderedItems]  = useState([]);

  // ─── Fetch from backend whenever price filter changes ────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API}/menu`;
        if (filter === "below100") url += "?maxPrice=100";
        if (filter === "range")    url += "?minPrice=100&maxPrice=500";
        if (filter === "above500") url += "?minPrice=500";

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

  // ─── Client-side category + search filter ────────────────────────────────
  const visibleItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ─── Order handler ────────────────────────────────────────────────────────
  const handleOrder = (item) => {
    setOrderedItems((prev) => [...prev, item._id]);
    setOrderMsg(`"${item.name}" has been added to your order!`);
    setTimeout(() => setOrderMsg(null), 3000);
  };

  // ─── Price badge color ────────────────────────────────────────────────────
  const priceBadge = (price) => {
    if (price < 100)  return "bg-emerald-50 text-emerald-700";
    if (price <= 500) return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Menu | Our Restaurant</title>
        <meta
          name="description"
          content="Browse our full menu with fresh burgers, pizza, sushi, pasta, salads, desserts and more. Filter by price range."
        />
      </Helmet>

      <div className="bg-gray-50 min-h-screen pt-8 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── PAGE HEADER ── */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
              Our Menu
            </h1>
            <p className="text-gray-500">
              Discover our carefully crafted dishes made with love and passion
            </p>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full" />
          </div>

          {/* ── SEARCH BAR ── */}
          <div className="relative max-w-md mx-auto mb-10">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>

          {/* ── CATEGORY STRIP ── */}
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-10 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`min-w-[110px] flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm cursor-pointer transition
                  ${activeCategory === cat.name
                    ? "bg-teal-500 text-white"
                    : "bg-white hover:shadow-md text-gray-700"
                  }`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <p className="text-sm mt-2 font-medium">{cat.name}</p>
              </button>
            ))}
          </div>

          {/* ── PRICE FILTER BUTTONS ── */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <span className="flex items-center gap-1 text-gray-500 text-sm self-center">
              <SlidersHorizontal size={15} /> Price:
            </span>
            {PRICE_FILTERS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-6 py-2 rounded-full shadow-sm transition font-medium text-sm
                  ${filter === btn.value
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-white text-gray-700 hover:shadow-md"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* ── RESULT COUNT ── */}
          {!loading && !error && (
            <p className="text-center text-xs text-gray-400 mb-8">
              {visibleItems.length === 0
                ? "No items found"
                : `Showing ${visibleItems.length} item${visibleItems.length !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* ── ORDER CONFIRMATION TOAST ── */}
          {orderMsg && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-bounce">
              <CheckCircle size={18} />
              {orderMsg}
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {error && (
            <div className="flex items-center justify-center gap-3 text-red-500 bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <AlertCircle size={22} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* ── LOADING STATE ── */}
          {loading && !error && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 pb-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="bg-gray-200 h-40" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                    <div className="h-8 bg-gray-200 rounded-xl w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── EMPTY STATE ── */}
          {!loading && !error && visibleItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <span className="text-6xl mb-4">🍽️</span>
              <p className="text-xl font-semibold text-gray-500">No items found</p>
              <p className="text-sm mt-1">
                Try a different price range or search term.
              </p>
              <button
                onClick={() => { setFilter("all"); setSearchQuery(""); setActiveCategory("All"); }}
                className="mt-6 px-5 py-2 bg-teal-500 text-white rounded-full text-sm hover:bg-teal-600 transition"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* ── MENU CARDS ── */}
          {!loading && !error && visibleItems.length > 0 && (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 pb-20">
              {visibleItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card image / icon area */}
                  <div className="bg-gradient-to-br from-teal-50 to-gray-100 h-40 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                    🍽️
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    {/* Name + price */}
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                        {item.name}
                      </h3>
                      <span
                        className={`text-sm font-bold px-2 py-1 rounded-lg whitespace-nowrap ${priceBadge(item.price)}`}
                      >
                        ₹{item.price}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {item.description || "A delicious item crafted with fresh ingredients."}
                    </p>

                    {/* Footer row */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {item.category || "General"}
                      </span>

                      {orderedItems.includes(item._id) ? (
                        <span className="flex items-center gap-1 text-teal-600 text-sm font-medium">
                          <CheckCircle size={16} />
                          Added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOrder(item)}
                          className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 active:scale-95 transition-all text-sm font-medium"
                        >
                          <ShoppingCart size={15} />
                          Order Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}