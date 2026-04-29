// components/Hero.jsx
import { Star, Users, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4')] bg-cover bg-center"></div>

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

      {/* CONTENT CONTAINER */}
      <div className="relative max-w-7xl mx-auto px-6 w-full">

        {/* GLASS CARD */}
        <div className="max-w-2xl p-8 rounded-3xl 
  bg-white/5 backdrop-blur-3xl 
  border border-white/20 
  shadow-[0_8px_40px_rgba(0,0,0,0.4)]
  relative overflow-hidden">

          {/* GLASS SHINE */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>

          {/* CONTENT */}
          <div className="relative z-10">

            {/* BADGE */}
            <div className="flex items-center gap-2 mb-4 text-teal-400 text-sm font-semibold uppercase tracking-wide">
              <Star size={16} />
              Award-Winning Cuisine
            </div>

            {/* HEADING */}
            <h1 className="text-white text-5xl md:text-6xl font-extrabold leading-tight mb-5">
              Welcome to{" "}
              <span className="text-teal-400">Savory Bites</span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-gray-200 mb-6 leading-relaxed">
              Experience culinary excellence with fresh ingredients and authentic
              flavors. Where tradition meets innovation.
            </p>

            {/* STATS */}
            <div className="flex items-center gap-6 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400" />
                <span>4.9 Rating</span>
              </div>

              <div className="flex items-center gap-1">
                <Users size={16} />
                <span>1200+ Customers</span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-xl font-semibold transition hover:scale-105">
                View Menu <ArrowRight size={16} />
              </button>

              <button className="border border-white/40 text-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition">
                Reserve Table
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}