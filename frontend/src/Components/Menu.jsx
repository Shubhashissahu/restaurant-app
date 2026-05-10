// src/components/Menu.jsx

import {
  Plus,
  Star,
} from "lucide-react";

const menuItems = [
  {
    id: 1,
    emoji: "🍔",
    name: "Classic Burger",
    price: "$12.99",
    badge: "Popular",
    desc: "Juicy grilled beef with signature sauce",
    rating: "4.9",
  },

  {
    id: 2,
    emoji: "🍕",
    name: "Italian Pizza",
    price: "$16.99",
    badge: "Chef's Pick",
    desc: "Wood-fired pizza with premium cheese",
    rating: "4.8",
  },

  {
    id: 3,
    emoji: "🍱",
    name: "Premium Sushi",
    price: "$24.99",
    badge: "New",
    desc: "Fresh handcrafted sushi selection",
    rating: "5.0",
  },

  {
    id: 4,
    emoji: "🍰",
    name: "Chocolate Cake",
    price: "$8.99",
    desc: "Rich layered chocolate dessert",
    rating: "4.7",
  },

  {
    id: 5,
    emoji: "☕",
    name: "Signature Coffee",
    price: "$4.99",
    desc: "Freshly brewed artisan coffee",
    rating: "4.8",
  },
];

export default function Menu() {
  return (
    <section className="relative py-32 bg-[#141414] overflow-hidden">

      {/* AMBIENT LIGHTS */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#D4A373]/10 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#8B5E3C]/10 blur-3xl rounded-full"></div>

      {/* TOP LINE */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* HEADER */}
        <div className="text-center mb-20">

          {/* MINI BADGE */}
          <div className="inline-flex items-center gap-2 bg-[#1E1E1E]/90 backdrop-blur-xl border border-[#3A2E24] px-5 py-2.5 rounded-full text-[#D4A373] text-xs font-bold uppercase tracking-[0.25em] shadow-xl mb-6">

            Signature Collection

          </div>

          {/* TITLE */}
          <h2 className="text-5xl md:text-6xl font-extrabold text-[#FAF7F2] leading-tight mb-5 tracking-tight">

            Featured
            <span className="block text-[#D4A373]">
              Delicacies
            </span>

          </h2>

          {/* SUBTEXT */}
          <p className="text-[#C2B59B] max-w-2xl mx-auto text-base md:text-lg leading-relaxed">

            Discover our finest handcrafted dishes curated by
            master chefs using premium ingredients and timeless
            culinary artistry.

          </p>

        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {menuItems.map((item) => (

            <div
              key={item.id}
              className="group relative bg-[#1A1A1A]/95 backdrop-blur-xl border border-[#3A2E24] rounded-[28px] p-6 shadow-2xl overflow-hidden hover:-translate-y-3 hover:border-[#D4A373]/40 transition-all duration-500"
            >

              {/* GOLD HOVER OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/5 via-transparent to-[#8B5E3C]/10 opacity-0 group-hover:opacity-100 transition duration-500"></div>

              {/* TOP SHINE */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373]/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

              {/* BADGE */}
              {item.badge && (
                <span className="absolute top-4 right-4 bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414] text-[10px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full shadow-xl">

                  {item.badge}

                </span>
              )}

              {/* EMOJI */}
              <div className="relative flex justify-center mb-6">

                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#3A2E24] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">

                  <span className="text-5xl drop-shadow-xl">
                    {item.emoji}
                  </span>

                </div>

              </div>

              {/* RATING */}
              <div className="relative flex items-center justify-center gap-1 mb-3">

                <Star
                  size={14}
                  className="fill-[#D4A373] text-[#D4A373]"
                />

                <span className="text-xs font-semibold text-[#FAF7F2]">

                  {item.rating}

                </span>

              </div>

              {/* TITLE */}
              <h3 className="relative text-[#FAF7F2] font-bold text-xl text-center mb-3">

                {item.name}

              </h3>

              {/* DESCRIPTION */}
              <p className="relative text-[#C2B59B] text-sm text-center leading-relaxed min-h-[48px]">

                {item.desc}

              </p>

              {/* PRICE + BUTTON */}
              <div className="relative flex items-center justify-between mt-8">

                <div>

                  <p className="text-xs uppercase tracking-widest text-[#8B7E6A] mb-1">

                    Price

                  </p>

                  <span className="text-[#D4A373] font-bold text-2xl">

                    {item.price}

                  </span>

                </div>

                {/* BUTTON */}
                <button className="group/btn relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#141414] shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 overflow-hidden">

                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition duration-300"></div>

                  <Plus
                    size={18}
                    className="relative z-10"
                  />

                </button>

              </div>

              {/* BOTTOM GOLD LINE */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}