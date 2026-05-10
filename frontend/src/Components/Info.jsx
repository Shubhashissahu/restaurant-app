// src/components/Info.jsx
import { Clock, MapPin, Star, ChevronRight } from "lucide-react";

const data = [
  {
    icon: Clock,
    title: "Open Daily",
    detail: "11:00 AM – 10:00 PM",
    sub: "7 days a week, including holidays",
    stat: "365",
    statLabel: "days a year",
  },
  {
    icon: MapPin,
    title: "Prime Location",
    detail: "123 Flavor Street, Mumbai",
    sub: "5 min walk from Central Station",
    stat: "5★",
    statLabel: "ambiance rating",
  },
  {
    icon: Star,
    title: "Top Rated",
    detail: "4.9 / 5 Customer Rating",
    sub: "Based on 2,400+ verified reviews",
    stat: "2.4k",
    statLabel: "happy guests",
  },
];

export default function Info() {
  return (
    <section className="relative py-28 bg-[#0F0F0F] overflow-hidden">

      {/* ── BACKGROUND TEXTURE ── */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle, #D4A373 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* ── AMBIENT GLOWS ── */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#D4A373]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#8B5E3C]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* ── TOP BORDER ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A373]/60 to-transparent" />
      {/* ── BOTTOM BORDER ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5E3C]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ── SECTION HEADER ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#1A1A1A] border border-[#D4A373]/30 px-5 py-2 rounded-full text-[#D4A373] text-[11px] font-bold uppercase tracking-[0.25em] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] animate-pulse" />
            Why Choose Us
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-[#FAF7F2] leading-tight mb-5">
            Exceptional Dining
            <span className="block bg-gradient-to-r from-[#D4A373] to-[#C17F3A] bg-clip-text text-transparent mt-1">
              Experience
            </span>
          </h2>

          <p className="text-[#A89880] max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            We blend premium ingredients, elegant ambiance, and unforgettable
            hospitality to create moments worth savoring.
          </p>
        </div>

        {/* ── INFO CARDS ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {data.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="group relative bg-[#181818] border border-[#2A2218] rounded-3xl p-8 overflow-hidden
                  hover:-translate-y-2 hover:border-[#D4A373]/40 transition-all duration-500 cursor-default"
              >
                {/* Card inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373]/5 via-transparent to-[#8B5E3C]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

                {/* Corner number watermark */}
                <span className="absolute top-5 right-6 text-6xl font-black text-white/[0.03] select-none leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* ── TOP ROW: icon + stat ── */}
                <div className="relative flex items-start justify-between mb-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#0F0F0F] shadow-lg group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(212,163,115,0.35)] transition-all duration-500">
                    <Icon size={24} strokeWidth={2} />
                  </div>

                  {/* Stat pill */}
                  <div className="text-right">
                    <p className="text-[#D4A373] text-2xl font-extrabold leading-none">{item.stat}</p>
                    <p className="text-[#6B5A48] text-[11px] uppercase tracking-wider mt-0.5">{item.statLabel}</p>
                  </div>
                </div>

                {/* ── TITLE ── */}
                <h3 className="relative text-[#FAF7F2] font-bold text-xl mb-2">
                  {item.title}
                </h3>

                {/* ── DETAIL ── */}
                <p className="relative text-[#D4A373] text-sm font-medium mb-1.5">
                  {item.detail}
                </p>

                {/* ── SUB ── */}
                <p className="relative text-[#7A6A58] text-xs leading-relaxed mb-6">
                  {item.sub}
                </p>

                {/* ── LEARN MORE LINK ── */}
                <div className="relative flex items-center gap-1 text-[#D4A373]/60 text-xs font-semibold uppercase tracking-wider group-hover:text-[#D4A373] transition-colors duration-300">
                  Learn more
                  <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>

                {/* ── BOTTOM ACCENT LINE ── */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4A373] to-[#8B5E3C] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl" />
              </div>
            );
          })}
        </div>

        {/* ── BOTTOM TRUST BAR ── */}
        <div className="mt-16 border border-[#2A2218] rounded-2xl bg-[#181818] px-8 py-5 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { value: "12+", label: "Years of Excellence" },
            { value: "50k+", label: "Meals Served" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "15+", label: "Signature Dishes" },
          ].map((t) => (
            <div key={t.label} className="text-center">
              <p className="text-2xl font-extrabold bg-gradient-to-r from-[#D4A373] to-[#C17F3A] bg-clip-text text-transparent">
                {t.value}
              </p>
              <p className="text-[#6B5A48] text-xs uppercase tracking-wider mt-0.5">{t.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}