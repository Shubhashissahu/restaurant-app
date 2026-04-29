// src/pages/Menu.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import { ShoppingCart } from "lucide-react";

const API = "http://localhost:5000/api";

const categories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Sushi", emoji: "🍱" },
  { name: "Pasta", emoji: "🍝" },
  { name: "Salads", emoji: "🥗" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Seafood", emoji: "🦞" },
  { name: "Steaks", emoji: "🥩" },
  { name: "Chicken", emoji: "🍗" },
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `${API}/menu`;
        if (filter === "below100") url += "?maxPrice=100";
        if (filter === "range") url += "?minPrice=100&maxPrice=500";

        const res = await axios.get(url);
        setItems(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  return (
    <>
      <Helmet>
        <title>Menu</title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">
              Our Menu
            </h1>
            <p className="text-gray-500">
              Discover our carefully crafted dishes made with love and passion
            </p>
            <div className="w-16 h-1 bg-teal-500 mx-auto mt-4 rounded-full"></div>
          </div>

          {/* CATEGORY */}
          <h2 className="text-xl font-semibold mb-4">
            Browse by Category
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 mb-10">
            {categories.map((cat, i) => (
              <div
                key={i}
                className={`min-w-[110px] flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm cursor-pointer transition ${
                  i === 0
                    ? "bg-teal-500 text-white"
                    : "bg-white hover:shadow-md"
                }`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <p className="text-sm mt-2">{cat.name}</p>
              </div>
            ))}
          </div>

          {/* FILTER */}
          <div className="flex justify-center gap-4 mb-12">
            {[
              { label: "All", value: "all" },
              { label: "Below ₹100", value: "below100" },
              { label: "₹100–₹500", value: "range" },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-6 py-2 rounded-full shadow-sm transition ${
                  filter === btn.value
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-700 hover:shadow-md"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          {loading ? (
            <p className="text-center text-gray-500">
              Loading menu...
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 pb-20">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition overflow-hidden"
                >
                  {/* IMAGE / ICON */}
                  <div className="bg-gray-100 h-40 flex items-center justify-center text-5xl">
                    🍽️
                  </div>

                  {/* BODY */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">
                        {item.name}
                      </h3>
                      <span className="text-teal-600 font-bold">
                        ₹{item.price}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm mb-4">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                        {item.category}
                      </span>

                      <button className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition">
                        <ShoppingCart size={16} />
                        Add
                      </button>
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