// src/pages/ConsumerForm.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import api from "../services/api";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  Heart,
  Sparkles,
  Briefcase,
  UtensilsCrossed,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wine,
  AlertCircle,
  RotateCw,
  Sparkle,
  Check,
  Plus,
  Minus,
  PartyPopper,
  Gift,
  Flower2,
  Baby,
  Leaf,
  Sun,
  Moon
} from "lucide-react";

// Dining occasion options (5 clean options for desktop row)
const PARTY_TYPES = [
  { id: "Couple", title: "Couple", icon: Heart, defaultGuests: 2, badge: "Romantic" },
  { id: "Family", title: "Family", icon: Users, defaultGuests: 4, badge: "Warm" },
  { id: "Friends", title: "Friends", icon: Sparkles, defaultGuests: 4, badge: "Lively" },
  { id: "Office Colleagues", title: "Colleagues", icon: Briefcase, defaultGuests: 6, badge: "Executive" },
  { id: "Other", title: "Other / Custom", icon: UtensilsCrossed, defaultGuests: 2, badge: "Custom" }
];

// Quick occasion chips when 'Other' is selected
const OTHER_OCCASIONS = [
  "🎂 Birthday Surprise",
  "💍 Anniversary Toast",
  "🎓 Milestone Celebration",
  "🤝 Client Business Dinner",
  "🧘 Solo Gastronomy Tour",
  "🥂 Family Reunion"
];

// Guest count options
const GUEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

// Curated lunch & dinner slots
const LUNCH_SLOTS = ["12:30 PM", "01:15 PM", "02:00 PM", "02:45 PM", "03:30 PM"];
const DINNER_SLOTS = ["07:00 PM", "07:45 PM", "08:30 PM", "09:15 PM", "10:00 PM"];

// Quick special request tags
const SPECIAL_TAGS = [
  { label: "Birthday Cake & Sparkler", icon: Gift },
  { label: "Candlelight & Flowers", icon: Flower2 },
  { label: "High Chair for Toddler", icon: Baby },
  { label: "Vegetarian / Jain Food", icon: Leaf }
];

export default function ConsumerForm() {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(
    () => new Date(Date.now() + 86400000).toISOString().split("T")[0],
    []
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    partyType: "Couple",
    customOccasion: "",
    guests: 2,
    reservationDate: todayStr,
    reservationTime: "08:30 PM",
    specialRequests: ""
  });

  const [timePeriod, setTimePeriod] = useState("dinner"); // "lunch" | "dinner"
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [apiError, setApiError] = useState("");

  // Select Party Type
  const handlePartySelect = (party) => {
    setForm((prev) => ({
      ...prev,
      partyType: party.id,
      guests: party.defaultGuests,
      customOccasion: party.id !== "Other" ? "" : prev.customOccasion
    }));
    setErrors((prev) => ({ ...prev, partyType: "" }));
  };

  // Adjust guests
  const handleGuestStep = (delta) => {
    setForm((prev) => ({
      ...prev,
      guests: Math.max(1, Math.min(30, (parseInt(prev.guests, 10) || 1) + delta))
    }));
    setErrors((prev) => ({ ...prev, guests: "" }));
  };

  // Toggle special request
  const handleToggleTag = (tagLabel) => {
    setForm((prev) => {
      const current = prev.specialRequests;
      if (current.includes(tagLabel)) {
        const cleaned = current
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s !== tagLabel)
          .join(", ");
        return { ...prev, specialRequests: cleaned };
      }
      return { ...prev, specialRequests: current ? `${current}, ${tagLabel}` : tagLabel };
    });
  };

  // Change input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      e.name = "Full Name must be at least 2 characters";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      e.email = "Please enter a valid email";
    }
    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      e.phone = "Phone must be exactly 10 digits";
    }
    if (!form.reservationDate) {
      e.reservationDate = "Please choose a reservation date";
    }
    if (!form.reservationTime) {
      e.reservationTime = "Please select a dining time slot";
    }
    if (form.partyType === "Other" && !form.customOccasion.trim()) {
      e.customOccasion = "Please describe your occasion";
    }
    if (Number(form.guests) < 1) {
      e.guests = "At least 1 guest required";
    }
    return e;
  };

  // Submit reservation
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setApiError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        partyType: form.partyType,
        customOccasion: form.partyType === "Other" ? form.customOccasion.trim() : "",
        guests: Number(form.guests),
        reservationDate: form.reservationDate,
        reservationTime: form.reservationTime,
        specialRequests: form.specialRequests.trim()
      };

      const res = await api.post("/consumers", payload);

      setConfirmedBooking({
        ...payload,
        bookingCode: res.data.bookingCode || `TH-${Math.floor(100000 + Math.random() * 900000)}`
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || "Failed to secure reservation. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset
  const handleReset = () => {
    setConfirmedBooking(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      partyType: "Couple",
      customOccasion: "",
      guests: 2,
      reservationDate: todayStr,
      reservationTime: "08:30 PM",
      specialRequests: ""
    });
    setErrors({});
    setApiError("");
  };

  // Table setup recommendation
  const tableRecommendation = useMemo(() => {
    const g = Number(form.guests);
    if (g === 1) return "Solo Dining: Quiet window alcove or bar counter";
    if (g === 2) return "Couple: Intimate candlelight 2-seater table setting";
    if (g <= 4) return "Standard Table: Cozy 4-top table with plush seating";
    if (g <= 6) return "Group Arrangement: Spacious round table or premium banquette";
    if (g <= 10) return "Large Gathering: Grand banquet table with dedicated server";
    return "VIP Banquet: Private Dining Suite arrangement recommended";
  }, [form.guests]);

  return (
    <>
      <Helmet>
        <title>Reserve a Table | TasteHub Fine Dining</title>
        <meta
          name="description"
          content="Reserve a table at TasteHub for couples, families, friends, office colleagues, or special occasions."
        />
      </Helmet>

      {/* Outer Viewport Container with tight vertical spacing */}
      <div className="min-h-[calc(100vh-80px)] bg-[#111111] text-[#FAF7F2] py-6 sm:py-8 md:py-10 px-4 relative flex flex-col justify-center items-center selection:bg-[#D4A373] selection:text-[#141414]">
        {/* Living Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-[#D4A373]/10 blur-[150px] rounded-full pointer-events-none animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] bg-[#8B5E3C]/10 blur-[150px] rounded-full pointer-events-none animate-float-reverse"></div>

        {/* 900–1000px Centered Container: width: min(950px, 92vw) */}
        <div
          className="w-full relative z-10 mx-auto"
          style={{ maxWidth: "950px", width: "min(950px, 92vw)" }}
        >
          {/* HEADER (prominent 38-42px font, elegant serif, closely connected to card) */}
          <div className="text-center mb-5 sm:mb-6 animate-slide-up">
            <h1 className="font-serif text-3xl sm:text-[40px] font-extrabold text-[#FAF7F2] tracking-tight leading-tight drop-shadow-sm">
              Reserve a Table
            </h1>
            <p className="text-[#C2B59B] text-sm sm:text-base mt-1.5 font-normal tracking-wide">
              Select your party, guests, date &amp; time
            </p>
          </div>

          {/* CONFIRMED BOOKING SCREEN */}
          {confirmedBooking ? (
            <div className="bg-[#181818]/95 border border-[#D4A373]/40 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-2xl relative overflow-hidden animate-pop-in text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#FAF7F2] to-[#8B5E3C]"></div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] flex items-center justify-center mx-auto mb-3.5 shadow-xl shadow-[#D4A373]/30 ring-4 ring-[#D4A373]/20 animate-bounce">
                <CheckCircle2 size={34} className="stroke-[2.5]" />
              </div>

              <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
                Booking is Confirmed!
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
                Your Table at TasteHub is Secured
              </h2>
              <p className="text-xs sm:text-sm text-[#C2B59B] mt-1 mb-6">
                A confirmation SMS and email have been dispatched with your reservation details.
              </p>

              {/* Pass Card */}
              <div className="bg-[#202020] border border-[#3A2E24] rounded-2xl p-5 sm:p-6 text-left space-y-4 mb-6 shadow-inner transition-all hover:border-[#D4A373]/40">
                <div className="flex flex-wrap items-center justify-between border-b border-[#3A2E24] pb-3.5 gap-2">
                  <div>
                    <span className="text-[11px] text-[#8B7E6A] uppercase font-bold tracking-wider">Booking Code</span>
                    <p className="text-2xl font-mono font-extrabold text-[#D4A373] tracking-wider">{confirmedBooking.bookingCode}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#8B7E6A] uppercase font-bold tracking-wider">Dining Purpose</span>
                    <p className="text-sm font-bold text-[#FAF7F2]">
                      {confirmedBooking.partyType}
                      {confirmedBooking.customOccasion && ` (${confirmedBooking.customOccasion})`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <span className="text-xs text-[#8B7E6A] block">Reservation Date</span>
                    <strong className="text-sm font-semibold text-[#FAF7F2]">{confirmedBooking.reservationDate}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#8B7E6A] block">Dining Slot</span>
                    <strong className="text-sm font-semibold text-[#D4A373]">{confirmedBooking.reservationTime}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-[#8B7E6A] block">Table Capacity</span>
                    <strong className="text-sm font-semibold text-[#FAF7F2]">{confirmedBooking.guests} Guests</strong>
                  </div>
                </div>

                <div className="border-t border-[#3A2E24] pt-3 flex flex-wrap justify-between gap-3 text-xs text-[#C2B59B]">
                  <span>Guest: <strong className="text-[#FAF7F2]">{confirmedBooking.name}</strong></span>
                  <span>Contact: <strong className="text-[#FAF7F2]">{confirmedBooking.phone}</strong></span>
                  <span>Email: <strong className="text-[#FAF7F2]">{confirmedBooking.email}</strong></span>
                </div>

                {confirmedBooking.specialRequests && (
                  <div className="bg-[#181818] p-3 rounded-xl border border-[#3A2E24] text-xs text-[#C2B59B]">
                    <span className="text-[#D4A373] font-semibold">Special Requests: </span>
                    {confirmedBooking.specialRequests}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#242424] hover:bg-[#2C2C2C] border border-[#3A2E24] text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Reserve Another Table
                </button>
                <Link
                  to="/"
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#B88755] hover:from-[#B88755] hover:to-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] text-xs font-bold text-center transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-[#D4A373]/20"
                >
                  Return to Home <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            /* ---------------- 950px MAIN LUXURY RESERVATION FORM ---------------- */
            <form
              onSubmit={handleSubmit}
              className="bg-[#181818]/95 border border-[#3A2E24] rounded-3xl p-6 sm:p-8 md:p-9 shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-6 animate-slide-up"
            >
              {/* Top Luxury Gradient Trim */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#FAF7F2] to-[#8B5E3C]"></div>

              {/* 1. OCCASION & GATHERING SELECTOR (5-Column Desktop Grid with Interactive Lift & Pop) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 text-[#D4A373] flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Who are you dining with?
                  </label>
                  <span className="text-[11px] text-[#C2B59B] hidden sm:inline">
                    Choose party setup
                  </span>
                </div>

                {/* 5-Column Grid on Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PARTY_TYPES.map((party) => {
                    const Icon = party.icon;
                    const isSelected = form.partyType === party.id;
                    return (
                      <button
                        key={party.id}
                        type="button"
                        onClick={() => handlePartySelect(party)}
                        className={`py-3 px-3 rounded-2xl border text-center transition-all duration-300 ease-out flex flex-col items-center justify-center gap-1.5 cursor-pointer relative group ${
                          isSelected
                            ? "bg-gradient-to-br from-[#E2B788] via-[#D4A373] to-[#B88755] text-[#141414] border-[#D4A373] shadow-[0_0_22px_rgba(212,163,115,0.35)] font-bold scale-[1.03]"
                            : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/60 hover:bg-[#262626] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(212,163,115,0.15)] active:scale-95"
                        }`}
                      >
                        <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <Icon
                            size={19}
                            className={isSelected ? "text-[#141414] animate-pulse" : "text-[#D4A373]"}
                          />
                        </div>
                        <span className="text-xs font-bold truncate max-w-full tracking-wide">
                          {party.title}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#141414] text-[#D4A373] flex items-center justify-center text-[10px] animate-pop-in">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Occasion Input (Shows if 'Other' selected) */}
                {form.partyType === "Other" && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-[#202020] border border-[#D4A373]/50 animate-pop-in">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#D4A373] flex items-center gap-1.5 uppercase tracking-wider">
                        <PartyPopper size={13} className="text-[#D4A373] animate-bounce" /> Specify Your Special Occasion *
                      </label>
                      <span className="text-[11px] text-[#C2B59B]">Tap suggestion or type below</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {OTHER_OCCASIONS.map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, customOccasion: occ.replace(/^[^\w]+/, "").trim() });
                            setErrors({ ...errors, customOccasion: "" });
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[#2A2A2A] border border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373] hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
                        >
                          {occ}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      name="customOccasion"
                      value={form.customOccasion}
                      onChange={handleChange}
                      placeholder="e.g. 25th Birthday Surprise, Milestone Promotion, Private Dining..."
                      className="w-full bg-[#181818] border border-[#3A2E24] rounded-xl px-3.5 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 transition-all"
                    />
                    {errors.customOccasion && (
                      <p className="text-red-400 text-xs mt-1">{errors.customOccasion}</p>
                    )}
                  </div>
                )}
              </div>

              {/* SEPARATOR */}
              <div className="border-t border-[#3A2E24]/60"></div>

              {/* 2. TABLE CAPACITY (GUEST TILES + STEPPER WITH TACTILE BOUNCE) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 text-[#D4A373] flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Number of Guests (Table Size)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#D4A373] tracking-wide">
                      {form.guests} {Number(form.guests) === 1 ? "Guest" : "Guests"} Selected
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Clean numbered tiles */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 flex-1">
                    {GUEST_COUNTS.map((num) => {
                      const isSelected = Number(form.guests) === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, guests: num });
                            setErrors({ ...errors, guests: "" });
                          }}
                          className={`h-11 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-br from-[#E2B788] via-[#D4A373] to-[#B88755] text-[#141414] border-[#D4A373] shadow-[0_0_18px_rgba(212,163,115,0.4)] font-extrabold scale-110"
                              : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:border-[#D4A373]/60 hover:text-[#FAF7F2] hover:-translate-y-0.5 active:scale-90"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Stepper for 1-30 with press effect */}
                  <div className="flex items-center justify-center gap-2 bg-[#202020] border border-[#3A2E24] rounded-xl px-3 py-1.5 shrink-0 self-center sm:self-auto shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleGuestStep(-1)}
                      disabled={Number(form.guests) <= 1}
                      className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A2E24] hover:border-[#D4A373] text-[#FAF7F2] flex items-center justify-center disabled:opacity-40 transition-transform active:scale-75 cursor-pointer"
                      title="Decrease"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold text-[#D4A373] transition-all">
                      {form.guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleGuestStep(1)}
                      disabled={Number(form.guests) >= 30}
                      className="w-8 h-8 rounded-lg bg-[#2A2A2A] border border-[#3A2E24] hover:border-[#D4A373] text-[#FAF7F2] flex items-center justify-center disabled:opacity-40 transition-transform active:scale-75 cursor-pointer"
                      title="Increase"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Setup Recommendation */}
                <p className="text-[11px] text-[#C2B59B] mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0 animate-ping"></span>
                  <span><strong>Arrangement: </strong>{tableRecommendation}</span>
                </p>
                {errors.guests && <p className="text-red-400 text-xs mt-1">{errors.guests}</p>}
              </div>

              {/* SEPARATOR */}
              <div className="border-t border-[#3A2E24]/60"></div>

              {/* 3. DATE & TIME (Side-by-Side 2-Column Grid on 950px Width) */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Left Column: Date */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 text-[#D4A373] flex items-center justify-center text-[10px]">
                          3
                        </span>
                        Select Date
                      </label>
                      <div className="flex items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, reservationDate: todayStr })}
                          className={`px-2.5 py-0.5 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer ${
                            form.reservationDate === todayStr
                              ? "bg-[#D4A373] text-[#141414] font-bold border-[#D4A373] shadow-[0_0_10px_rgba(212,163,115,0.3)] scale-105"
                              : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/50"
                          }`}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, reservationDate: tomorrowStr })}
                          className={`px-2.5 py-0.5 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer ${
                            form.reservationDate === tomorrowStr
                              ? "bg-[#D4A373] text-[#141414] font-bold border-[#D4A373] shadow-[0_0_10px_rgba(212,163,115,0.3)] scale-105"
                              : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/50"
                          }`}
                        >
                          Tomorrow
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="date"
                        name="reservationDate"
                        min={todayStr}
                        value={form.reservationDate}
                        onChange={handleChange}
                        className="w-full bg-[#202020] border border-[#3A2E24] rounded-2xl px-4 py-3 text-sm text-[#FAF7F2] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 transition-all [color-scheme:dark] cursor-pointer"
                      />
                    </div>
                    {errors.reservationDate && (
                      <p className="text-red-400 text-xs mt-1">{errors.reservationDate}</p>
                    )}
                  </div>

                  {/* Right Column: Time Slot */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] flex items-center gap-1.5">
                        <Clock size={13} /> Time Slot
                      </label>

                      {/* Lunch / Dinner Switch with Smooth Active Highlight */}
                      <div className="p-0.5 rounded-lg bg-[#202020] border border-[#3A2E24] flex items-center gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTimePeriod("lunch")}
                          className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                            timePeriod === "lunch"
                              ? "bg-[#D4A373] text-[#141414] font-bold shadow-sm"
                              : "text-[#C2B59B] hover:text-[#FAF7F2]"
                          }`}
                        >
                          <Sun size={11} /> Lunch
                        </button>
                        <button
                          type="button"
                          onClick={() => setTimePeriod("dinner")}
                          className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all duration-200 cursor-pointer ${
                            timePeriod === "dinner"
                              ? "bg-[#D4A373] text-[#141414] font-bold shadow-sm"
                              : "text-[#C2B59B] hover:text-[#FAF7F2]"
                          }`}
                        >
                          <Moon size={11} /> Dinner
                        </button>
                      </div>
                    </div>

                    {/* Time Slot Chips Grid with Hover Lift */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                      {(timePeriod === "lunch" ? LUNCH_SLOTS : DINNER_SLOTS).map((slot) => {
                        const isSelected = form.reservationTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, reservationTime: slot });
                              setErrors({ ...errors, reservationTime: "" });
                            }}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-gradient-to-br from-[#E2B788] via-[#D4A373] to-[#B88755] text-[#141414] border-[#D4A373] shadow-[0_0_15px_rgba(212,163,115,0.35)] font-bold scale-105"
                                : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/60 hover:-translate-y-0.5 active:scale-95"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.reservationTime && (
                      <p className="text-red-400 text-xs mt-1">{errors.reservationTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SEPARATOR */}
              <div className="border-t border-[#3A2E24]/60"></div>

              {/* 4. SPECIAL REQUESTS & DIETARY PREFERENCES */}
              <div>
                <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] block mb-2">
                  4. Special Requests &amp; Dietary Notes (Optional)
                </label>

                <div className="flex flex-wrap gap-2 mb-2.5">
                  {SPECIAL_TAGS.map((tag) => {
                    const Icon = tag.icon;
                    const isIncluded = form.specialRequests.includes(tag.label);
                    return (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => handleToggleTag(tag.label)}
                        className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                          isIncluded
                            ? "bg-[#D4A373] text-[#141414] font-bold border-[#D4A373] shadow-[0_0_12px_rgba(212,163,115,0.3)] scale-105"
                            : "bg-[#202020] border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:border-[#D4A373]/50 hover:-translate-y-0.5 active:scale-95"
                        }`}
                      >
                        <Icon size={13} />
                        {tag.label}
                      </button>
                    );
                  })}
                </div>

                <input
                  type="text"
                  name="specialRequests"
                  value={form.specialRequests}
                  onChange={handleChange}
                  placeholder="Other notes (e.g. quiet corner table, anniversary message, allergies)..."
                  className="w-full bg-[#202020] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 transition-all"
                />
              </div>

              {/* SEPARATOR */}
              <div className="border-t border-[#3A2E24]/60"></div>

              {/* 5. GUEST CONTACT (3 Equal Columns with Glow Aura on Focus) */}
              <div>
                <label className="text-xs font-bold text-[#D4A373] uppercase tracking-[0.18em] block mb-2">
                  5. Primary Diner Contact
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Name */}
                  <div>
                    <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-300">
                      <User size={15} className="text-[#D4A373] shrink-0" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Full Name *"
                        className="w-full bg-transparent py-2.5 pl-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-300">
                      <Mail size={15} className="text-[#D4A373] shrink-0" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email Address *"
                        className="w-full bg-transparent py-2.5 pl-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-300">
                      <Phone size={15} className="text-[#D4A373] shrink-0" />
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-Digit Phone *"
                        className="w-full bg-transparent py-2.5 pl-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                      />
                    </div>
                    {errors.phone && <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* API Error Notification */}
              {apiError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-pop-in">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Clean, Simple Submit Area */}
              <div className="pt-3 border-t border-[#3A2E24]/60">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-bold text-sm sm:text-base shadow-lg shadow-[#D4A373]/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {submitting ? (
                    <>
                      <RotateCw size={17} className="animate-spin" />
                      <span>Reserving Table...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Table Reservation</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-[#8B7E6A] mt-2.5">
                  Instant confirmation • Free cancellation
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}