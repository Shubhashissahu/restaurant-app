// src/components/Menu.jsx

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  ArrowRight,
  Sparkles,
  Flame,
  Leaf,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { resolveDishImage } from "../utils/imageUtils";

const CHEF_DELICACIES = [
  {
    id: "delicacy-1",
    name: "Butter Chicken",
    category: "MAINS",
    price: 280,
    badge: "POPULAR",
    badgeType: "popular",
    desc: "Rich creamy tomato gravy with tender clay-oven roasted chicken",
    rating: 4.9,
    reviews: 148,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
    spice: "Mild",
  },
  {
    id: "delicacy-2",
    name: "Biryani Thali",
    category: "SPECIALS",
    price: 320,
    badge: "CHEF'S PICK",
    badgeType: "chef",
    desc: "Royal basmati thali with saffron dum biryani, raita & salan",
    rating: 5.0,
    reviews: 214,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80",
    spice: "Medium",
  },
  {
    id: "delicacy-3",
    name: "Paneer Tikka Masala",
    category: "MAINS",
    price: 240,
    badge: "VEGETARIAN",
    badgeType: "veg",
    desc: "Smoky grilled cottage cheese cubes in rich aromatic onion gravy",
    rating: 4.8,
    reviews: 112,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
    isVeg: true,
  },
  {
    id: "delicacy-4",
    name: "Dal Makhani",
    category: "MAINS",
    price: 180,
    badge: "CLASSIC",
    badgeType: "classic",
    desc: "Slow-cooked black lentils simmered overnight with butter & cream",
    rating: 4.9,
    reviews: 176,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
    isVeg: true,
  },
  {
    id: "delicacy-5",
    name: "Hara Bhara Kabab",
    category: "STARTERS",
    price: 160,
    badge: "HEALTHY",
    badgeType: "veg",
    desc: "Crispy pan-seared spinach & green pea patties with fresh mint dip",
    rating: 4.7,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&q=80",
    isVeg: true,
  },
  {
    id: "delicacy-6",
    name: "Samosa Chaat Platter",
    category: "STARTERS",
    price: 120,
    badge: "STREET SPECIAL",
    badgeType: "popular",
    desc: "Crushed golden potato samosas drizzled with sweet yogurt & tamarind",
    rating: 4.8,
    reviews: 130,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    isVeg: true,
  },
  {
    id: "delicacy-7",
    name: "Mango Saffron Lassi",
    category: "BEVERAGES",
    price: 90,
    badge: "BESTSELLER",
    badgeType: "chef",
    desc: "Velvety Alphonso mango yogurt beverage infused with royal saffron",
    rating: 4.9,
    reviews: 165,
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",
    isVeg: true,
  },
  {
    id: "delicacy-8",
    name: "Royal Gulab Jamun",
    category: "DESSERTS",
    price: 140,
    badge: "SWEET PICK",
    badgeType: "classic",
    desc: "Warm rose-scented milk dumplings served with rich cardamom rabdi",
    rating: 5.0,
    reviews: 198,
    image:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    isVeg: true,
  },
];

export default function Menu() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [items, setItems] = useState(CHEF_DELICACIES);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [addedItems, setAddedItems] = useState({});

  // Fetch backend menu items if available to augment items
  useEffect(() => {
    api
      .get(`/menu?_t=${Date.now()}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Merge with fallback to ensure high quality images & descriptions
          const backendItems = res.data.slice(0, 8).map((bItem, idx) => ({
            id: bItem._id || `backend-${idx}`,
            name: bItem.name,
            category: (bItem.category || "MAINS").toUpperCase(),
            price: Number(bItem.price) || 250,
            badge: idx === 0 ? "POPULAR" : idx === 1 ? "CHEF'S PICK" : "SPECIAL",
            badgeType: idx === 0 ? "popular" : idx === 1 ? "chef" : "classic",
            desc: bItem.description || "Crafted with finest authentic ingredients and spices.",
            rating: (4.7 + (idx % 4) * 0.1).toFixed(1),
            reviews: 80 + idx * 25,
            image:
              resolveDishImage(
                bItem.image || bItem.imageUrl,
                bItem.name,
                bItem.category
              ) || CHEF_DELICACIES[idx % CHEF_DELICACIES.length].image,
          }));
          if (backendItems.length >= 4) {
            setItems(backendItems);
          }
        }
      })
      .catch(() => {
        // Fallback to static curated list
      });
  }, []);

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", updateScrollButtons, { passive: true });
      window.addEventListener("resize", updateScrollButtons);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", updateScrollButtons);
      }
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [items]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = 340; // width + gap
      const offset = direction === "left" ? -cardWidth * 1.5 : cardWidth * 1.5;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleAddDish = (dish) => {
    setAddedItems((prev) => ({ ...prev, [dish.id]: true }));
    toast.success(`Added ${dish.name} (₹${dish.price}) to order!`, {
      icon: "🍽️",
      style: {
        background: "#1E1E1E",
        color: "#FAF7F2",
        border: "1px solid #D4A373",
      },
    });

    // Reset button checkmark animation after 1.5s
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [dish.id]: false }));
    }, 1500);
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "popular":
        return "bg-gradient-to-r from-[#D4A373] to-[#B3804D] text-[#141414]";
      case "chef":
        return "bg-gradient-to-r from-[#E67E22] to-[#D35400] text-white";
      case "veg":
        return "bg-emerald-600 text-white";
      default:
        return "bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] text-[#141414]";
    }
  };

  return (
    <section
      id="featured-menu"
      className="relative py-28 md:py-36 bg-[#141414] overflow-hidden select-none"
    >
      <div id="menu" className="absolute -top-20 pointer-events-none" />

      {/* AMBIENT LUXURY GLOWS */}
      <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-[#D4A373]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-[#8B5E3C]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* TOP LINE ACCENT */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* HEADER SECTION (Matching User Screenshot 2 + TasteHub Aesthetic) */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#1E1E1E]/90 backdrop-blur-xl border border-[#3A2E24] px-4 py-2 rounded-full text-[#D4A373] text-xs font-bold uppercase tracking-[0.25em] shadow-xl mb-4">
            <Sparkles size={14} />
            Signature Collection
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#FAF7F2] leading-tight mb-4 tracking-tight">
            Featured <span className="text-[#D4A373]">Chef Delicacies</span>
          </h2>

          <p className="text-[#C2B59B] max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Prepared with authentic Indian spice blends and century-old royal recipes
          </p>

          {/* DECORATIVE GLOW UNDERLINE (From Screenshot 2) */}
          <div className="relative flex justify-center mt-5">
            <div className="w-28 h-1 bg-gradient-to-r from-transparent via-[#D4A373] to-transparent rounded-full" />
            <div className="absolute -top-1 w-12 h-3 bg-[#D4A373]/30 blur-sm rounded-full" />
          </div>
        </div>

        {/* CAROUSEL SLIDER WRAPPER */}
        <div className="relative group/carousel">
          {/* FLOATING PREVIOUS BUTTON (Left Arrow) */}
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous dishes"
            className={`absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1E1E1E]/95 border border-[#3A2E24] hover:border-[#D4A373] text-[#FAF7F2] hover:text-[#141414] hover:bg-[#D4A373] shadow-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              !canScrollLeft
                ? "opacity-0 pointer-events-none scale-90"
                : "opacity-100 hover:scale-110 active:scale-95"
            }`}
          >
            <ChevronLeft size={22} />
          </button>

          {/* FLOATING NEXT BUTTON (Right Arrow) */}
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next dishes"
            className={`absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-[#1E1E1E]/95 border border-[#3A2E24] hover:border-[#D4A373] text-[#FAF7F2] hover:text-[#141414] hover:bg-[#D4A373] shadow-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              !canScrollRight
                ? "opacity-0 pointer-events-none scale-90"
                : "opacity-100 hover:scale-110 active:scale-95"
            }`}
          >
            <ChevronRight size={22} />
          </button>

          {/* HORIZONTAL CAROUSEL CONTAINER */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => {
              const isAdded = addedItems[item.id];
              return (
                <div
                  key={item.id}
                  className="snap-start min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 bg-[#1A1A1A]/95 backdrop-blur-2xl border border-[#3A2E24] rounded-[26px] overflow-hidden shadow-2xl hover:-translate-y-2.5 hover:border-[#D4A373]/60 transition-all duration-500 flex flex-col group relative"
                >
                  {/* TOP SHINE GLOW */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none" />

                  {/* DISH PHOTO HEADER */}
                  <div className="relative h-52 sm:h-56 overflow-hidden bg-[#242424]">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80";
                      }}
                    />

                    {/* SUBTLE GRADIENT OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-black/40 pointer-events-none" />

                    {/* TOP-RIGHT BADGE (Matching Image 2) */}
                    {item.badge && (
                      <span
                        className={`absolute top-3.5 right-3.5 ${getBadgeStyle(
                          item.badgeType
                        )} text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1`}
                      >
                        {item.badgeType === "veg" && <Leaf size={10} />}
                        {item.badgeType === "popular" && <Flame size={10} />}
                        {item.badge}
                      </span>
                    )}

                    {/* TOP-LEFT RATING BADGE */}
                    <div className="absolute top-3.5 left-3.5 bg-[#141414]/85 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-[#3A2E24] text-[11px] font-bold text-[#FAF7F2]">
                      <Star size={12} className="fill-[#D4A373] text-[#D4A373]" />
                      <span>{item.rating}</span>
                      <span className="text-[#8B7E6A] font-normal text-[10px]">
                        ({item.reviews})
                      </span>
                    </div>
                  </div>

                  {/* CARD BODY (Matching Image 2 Layout) */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10">
                    {/* CATEGORY PILL */}
                    <div className="mb-2">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-[0.15em] px-2.5 py-1 rounded-md bg-[#242424] text-[#D4A373] border border-[#3A2E24]">
                        {item.category}
                      </span>
                    </div>

                    {/* DISH TITLE */}
                    <h3 className="font-bold text-[#FAF7F2] text-lg sm:text-xl leading-snug mb-1.5 group-hover:text-[#D4A373] transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    {/* DISH DESCRIPTION */}
                    <p className="text-[#C2B59B] text-xs sm:text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                      {item.desc}
                    </p>

                    {/* BOTTOM ROW: PRICE + "ADD DISH" BUTTON */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#3A2E24]/60 mt-auto">
                      <div>
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#D4A373] tracking-tight">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* ADD DISH BUTTON (TasteHub Luxury Styled) */}
                      <button
                        onClick={() => handleAddDish(item)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                          isAdded
                            ? "bg-emerald-600 text-white border border-emerald-500 scale-95"
                            : "bg-gradient-to-r from-[#D4A373] to-[#B3804D] hover:from-[#E5B586] hover:to-[#C6925E] text-[#141414] shadow-[#D4A373]/15 hover:shadow-[#D4A373]/30 hover:scale-105"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} strokeWidth={2.5} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} strokeWidth={2.2} />
                            <span>Add Dish</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA TO EXPLORE FULL MENU */}
        <div className="text-center mt-14 sm:mt-16">
          <button
            onClick={() => navigate("/menu")}
            className="inline-flex items-center gap-3 bg-[#1E1E1E] hover:bg-[#D4A373] text-[#FAF7F2] hover:text-[#141414] border border-[#3A2E24] hover:border-[#D4A373] font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-xl cursor-pointer group hover:scale-105 active:scale-95"
          >
            <span>Explore Complete Menu & Specials</span>
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </section>
  );
}