// src/pages/Menu.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import {
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

const API = "http://localhost:5000/api";

// ── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { name: "All", emoji: "🍽️", img: null },

  {
    name: "Burgers",
    emoji: "🍔",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },

  {
    name: "Pizza",
    emoji: "🍕",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80",
  },

  {
    name: "Sushi",
    emoji: "🍱",
    img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80",
  },

  {
    name: "Pasta",
    emoji: "🍝",
    img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80",
  },

  {
    name: "Salads",
    emoji: "🥗",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  },

  {
    name: "Desserts",
    emoji: "🍰",
    img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
  },

  {
    name: "Drinks",
    emoji: "🥤",
    img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80",
  },

  {
    name: "Seafood",
    emoji: "🦞",
    img: "https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80",
  },

  {
    name: "Steaks",
    emoji: "🥩",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80",
  },

  {
    name: "Chicken",
    emoji: "🍗",
    img: "https://images.unsplash.com/photo-1598103442097-8b74394b95c1?w=400&q=80",
  },
];
const FOOD_IMAGES = {
  "Butter Chicken":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",

  "Paneer Tikka Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",

  "Dal Makhani":
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",

  "Samosa (2 pcs)":
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",

  "Hara Bhara Kabab":
    "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&q=80",

  "Masala Chai":
    "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",

  "Mango Lassi":
    "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",

  "mix curry":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",

  "Biryani Thali":
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80",

  default:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
};

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

// ── Menu Card ────────────────────────────────────────────────────────────────
function MenuCard({ item, ordered, onOrder }) {
 const photo =
  FOOD_IMAGES[item.name] ||
  item.imageUrl ||
  FOOD_IMAGES.default;

  const rating = getRating(item._id);

  const reviews = getReviews(item._id);

  return (
    <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">

      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">

        <img
          src={photo}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = CATEGORY_PHOTOS["default"];
          }}
        />

        <div className="absolute inset-0 bg-black/20"></div>

        {/* PRICE */}
        <span className="absolute top-4 right-4 bg-[#D4A373] text-[#141414] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          ₹{Number(item.price).toLocaleString("en-IN")}
        </span>

        {/* CATEGORY */}
        <span className="absolute bottom-4 left-4 bg-[#141414]/90 backdrop-blur-sm text-[#FAF7F2] text-xs font-medium px-3 py-1 rounded-full border border-[#3A2E24]">
          {item.category || "General"}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1">

        {/* RATING */}
        <div className="flex items-center gap-1 mb-3">
          <Star
            size={13}
            className="fill-[#D4A373] text-[#D4A373]"
          />

          <span className="text-xs font-semibold text-[#FAF7F2]">
            {rating}
          </span>

          <span className="text-xs text-[#8B7E6A]">
            ({reviews} reviews)
          </span>
        </div>

        {/* TITLE */}
        <h3 className="font-bold text-[#FAF7F2] text-lg leading-snug mb-2">
          {item.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="text-[#C2B59B] text-sm line-clamp-2 mb-5 flex-1 leading-relaxed">
          {item.description ||
            "A delicious dish crafted with fresh ingredients."}
        </p>

        {/* CTA */}
        {ordered ? (
          <div className="flex items-center gap-2 justify-center py-3 rounded-2xl bg-[#2A2A2A] text-[#D4A373] text-sm font-semibold border border-[#3A2E24]">
            <CheckCircle size={16} />
            Added to Order
          </div>
        ) : (
          <button
            onClick={() => onOrder(item)}
            className="flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] active:scale-95 text-[#141414] text-sm font-semibold py-3 rounded-2xl transition-all duration-300"
          >
            <ShoppingCart size={15} />
            Order Now
          </button>
        )}
      </div>
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
        let url = `${API}/menu`;

        if (filter === "below100") url += "?maxPrice=100";

        if (filter === "range")
          url += "?minPrice=100&maxPrice=500";

        if (filter === "above500")
          url += "?minPrice=500";

        const res = await axios.get(url);

        setItems(res.data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load menu. Please make sure the server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const visibleItems = items.filter((item) => {
    const matchCategory =
      activeCategory === "All" ||
      item.category === activeCategory;

    const matchSearch =
      searchQuery === "" ||
      item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const handleOrder = (item) => {
    setOrderedItems((prev) => [...prev, item._id]);

    setOrderMsg(`"${item.name}" added to your order!`);

    setTimeout(() => setOrderMsg(null), 3000);
  };

  return (
    <>
      <Helmet>
        <title>Menu | Our Restaurant</title>

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

          {/* SEARCH */}
          <div className="relative max-w-lg mx-auto mb-10 -mt-8 z-10">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7E6A]"
            />

            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-[#3A2E24] bg-[#1E1E1E] shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A]"
            />
          </div>

          {/* CATEGORY */}
          <h2 className="text-xl font-bold text-[#FAF7F2] mb-5">
            Browse by Category
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 mb-10 scrollbar-hide">

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() =>
                  setActiveCategory(cat.name)
                }
                className={`relative min-w-[110px] h-24 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 shadow-lg
                ${
                  activeCategory === cat.name
                    ? "ring-2 ring-[#D4A373] ring-offset-2 ring-offset-[#141414] scale-105"
                    : "hover:scale-105"
                }`}
              >
                {cat.img ? (
                  <>
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />

                    <div
                      className={`absolute inset-0 flex flex-col items-center justify-center
                      ${
                        activeCategory === cat.name
                          ? "bg-[#D4A373]/70"
                          : "bg-black/50 hover:bg-black/40"
                      }`}
                    >
                      <span className="text-2xl">
                        {cat.emoji}
                      </span>

                      <p className="text-white text-xs font-semibold mt-1">
                        {cat.name}
                      </p>
                    </div>
                  </>
                ) : (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center
                    ${
                      activeCategory === cat.name
                        ? "bg-[#D4A373] text-[#141414]"
                        : "bg-[#1E1E1E] text-[#FAF7F2]"
                    }`}
                  >
                    <span className="text-2xl">
                      {cat.emoji}
                    </span>

                    <p className="text-xs font-semibold mt-1">
                      {cat.name}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">

            <span className="flex items-center gap-1.5 text-[#C2B59B] text-sm self-center">
              <SlidersHorizontal size={15} />
              Price:
            </span>

            {PRICE_FILTERS.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition shadow-sm
                ${
                  filter === btn.value
                    ? "bg-[#D4A373] text-[#141414]"
                    : "bg-[#1E1E1E] text-[#FAF7F2] hover:shadow-xl border border-[#3A2E24]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* RESULT */}
          {!loading && !error && (
            <p className="text-center text-xs text-[#8B7E6A] mb-8">
              {visibleItems.length === 0
                ? "No items found"
                : `Showing ${visibleItems.length} item${
                    visibleItems.length !== 1
                      ? "s"
                      : ""
                  }`}
            </p>
          )}

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
            visibleItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-[#C2B59B]">

                <p className="text-2xl font-semibold text-[#FAF7F2]">
                  No items found
                </p>

                <p className="text-sm mt-2 text-center max-w-xs">
                  Try a different category or search term.
                </p>

                <button
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 px-6 py-3 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] rounded-full text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </div>
            )}

          {/* GRID */}
          {!loading &&
            !error &&
            visibleItems.length > 0 && (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 pb-20">
                {visibleItems.map((item) => (
                  <MenuCard
                    key={item._id}
                    item={item}
                    ordered={orderedItems.includes(
                      item._id
                    )}
                    onOrder={handleOrder}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      {/* TOAST */}
      {orderMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#D4A373] text-[#141414] px-6 py-3 rounded-2xl shadow-2xl text-sm font-semibold">
          <CheckCircle size={18} />
          {orderMsg}
        </div>
      )}
    </>
  );
}