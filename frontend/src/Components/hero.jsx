// src/components/Hero.jsx

import { ArrowRight, Award } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative h-[92vh] min-h-[620px] flex items-center overflow-hidden bg-[#141414]">

      {/* ── BACKGROUND IMAGE ── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80')",
        }}
      />

      {/* ── CINEMATIC OVERLAY ── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

      {/* ── GOLD AMBIENT GLOW ── */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#D4A373]/10 blur-3xl rounded-full"></div>

      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B5E3C]/10 blur-3xl rounded-full"></div>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">

        <div className="max-w-2xl">

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 bg-[#1E1E1E]/80 backdrop-blur-md border border-[#3A2E24] px-4 py-2 rounded-full text-[#D4A373] text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-xl">

            <Award size={15} strokeWidth={2.2} />

            Award-Winning Cuisine

          </div>

          {/* HEADING */}
          <h1 className="text-[#FAF7F2] text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">

            Taste the Art of
            <span className="block text-[#D4A373]">
              Fine Dining
            </span>

          </h1>

          {/* SUBTEXT */}
          <p className="text-[#C2B59B] text-base md:text-lg leading-relaxed mb-10 max-w-xl">

            Experience culinary excellence crafted with premium
            ingredients, authentic flavors, and unforgettable
            hospitality — where every dish tells a story.

          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-5">

            {/* PRIMARY BUTTON */}
            <button className="group flex items-center gap-3 bg-[#D4A373] hover:bg-[#8B5E3C] active:scale-95 text-[#141414] font-semibold px-8 py-4 rounded-2xl shadow-2xl transition-all duration-300">

              View Menu

              <ArrowRight
                size={17}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />

            </button>

            {/* SECONDARY BUTTON */}
            <button className="border border-[#D4A373]/50 hover:border-[#D4A373] text-[#FAF7F2] font-semibold px-8 py-4 rounded-2xl hover:bg-[#D4A373]/10 active:scale-95 backdrop-blur-sm transition-all duration-300">

              Reserve Table

            </button>

          </div>

          {/* STATS */}
          <div className="flex flex-wrap gap-10 mt-14">

            <div>
              <h3 className="text-3xl font-bold text-[#FAF7F2]">
                15+
              </h3>

              <p className="text-sm text-[#C2B59B] mt-1">
                Years Experience
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#FAF7F2]">
                50K+
              </h3>

              <p className="text-sm text-[#C2B59B] mt-1">
                Happy Customers
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-[#FAF7F2]">
                4.9★
              </h3>

              <p className="text-sm text-[#C2B59B] mt-1">
                Customer Rating
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* ── BOTTOM FADE ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent"></div>

    </section>
  );
}