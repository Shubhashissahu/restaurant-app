import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChefHat,
  Loader2,
  Crown,
  Briefcase,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Award,
  X
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "User",
    title: "User Login",
    badge: "User",
    icon: User,
    subtitle: "Sign in to access your table reservations & profile",
    placeholderEmail: "user@tastehub.com"
  },
  {
    value: "manager",
    label: "Manager",
    title: "Manager Login",
    badge: "Operations",
    icon: Briefcase,
    subtitle: "Manage dining floor, menu & team shifts",
    placeholderEmail: "manager@tastehub.com"
  },
  {
    value: "admin",
    label: "Admin",
    title: "Admin Login",
    badge: "System",
    icon: Crown,
    subtitle: "System administration & restaurant analytics",
    placeholderEmail: "admin@tastehub.com"
  },
];

export default function Login({ setToken, initialRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleFromPath = () => {
    if (initialRole) return initialRole.toLowerCase();
    if (location.pathname.includes("admin")) return "admin";
    if (location.pathname.includes("manager")) return "manager";
    if (location.pathname.includes("user")) return "user";
    return "user";
  };

  const [form, setForm] = useState({ email: "", password: "" });
  const [loginAs, setLoginAs] = useState(getRoleFromPath);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const detected = getRoleFromPath();
    setLoginAs(detected);
  }, [location.pathname, initialRole]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If already logged in with a valid token, redirect directly
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (!payload.exp || Date.now() < payload.exp * 1000) {
            const role = (payload.role || localStorage.getItem("role") || "").toLowerCase();
            if (location.state?.from) {
              navigate(location.state.from, { replace: true });
            } else if (role === "admin") {
              navigate("/dashboard", { replace: true });
            } else if (role === "manager") {
              navigate("/manager", { replace: true });
            } else {
              navigate("/", { replace: true });
            }
            return;
          }
        }
      } catch (e) {
        console.error("Invalid token found in Login", e);
      }
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      if (setToken) setToken(null);
    }
  }, [navigate, setToken, location.state]);

  const handleClose = () => {
    navigate("/");
  };

  const handleQuickFill = (roleKey) => {
    const option = ROLE_OPTIONS.find((r) => r.value === roleKey);
    if (option) {
      setLoginAs(roleKey);
      setForm({
        email: option.placeholderEmail,
        password: "password123"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      const actualRole = res.data.admin?.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", actualRole || "");
      if (res.data.admin?.name) {
        localStorage.setItem("userName", res.data.admin.name);
      }
      if (res.data.admin?.email) {
        localStorage.setItem("userEmail", res.data.admin.email);
      }

      if (setToken) setToken(res.data.token);

      if (actualRole && actualRole.toLowerCase() !== loginAs.toLowerCase()) {
        toast(`Signed in as ${actualRole}`, { icon: "ℹ️" });
      } else {
        toast.success(`Welcome back, ${res.data.admin?.name || "User"}!`);
      }

      const redirectPath = location.state?.from;
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (actualRole?.toLowerCase() === "manager") {
        navigate("/manager");
      } else if (actualRole?.toLowerCase() === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const currentOption = ROLE_OPTIONS.find((opt) => opt.value === loginAs) || ROLE_OPTIONS[0];
  const CurrentIcon = currentOption.icon;
  const isFromReservation = location.state?.from === "/register";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-6 sm:py-10 relative overflow-hidden bg-[#111111]/90 backdrop-blur-md"
    >
      {/* ── BACKGROUND AMBIENT GLOW ── */}
      <div className="absolute top-1/4 left-1/4 w-[520px] h-[520px] bg-[#D4A373]/10 blur-[150px] rounded-full pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] bg-[#8B5E3C]/10 blur-[150px] rounded-full pointer-events-none animate-float-reverse"></div>

      {/* Subtle Restaurant Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] pointer-events-none" />

      {/* ── TWO-COLUMN AUTHENTICATION MODAL (850-980px) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        className="relative w-full max-w-[880px] bg-[#181818]/95 border border-[#3A2E24] hover:border-[#D4A373]/40 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_45px_rgba(212,163,115,0.08)] backdrop-blur-2xl overflow-hidden z-10 mx-auto animate-slide-up"
      >
        {/* Top Luxury Gold Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#FAF7F2] to-[#8B5E3C] z-30"></div>

        {/* ── CLOSE BUTTON (×) ── */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-[#242424] hover:bg-[#2F2F2F] text-[#C2B59B] hover:text-[#FAF7F2] border border-[#3A2E24] hover:border-[#D4A373] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-110 active:scale-95 group"
        >
          <X size={20} className="transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* ── TWO-COLUMN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* ========================================================= */}
          {/* LEFT COLUMN: AUTHENTICATION FORM (7 COLUMNS)             */}
          {/* ========================================================= */}
          <div className="md:col-span-7 p-6 sm:p-7 md:p-8 flex flex-col justify-center">
            <div>
              {/* TASTEHUB BRANDING */}
              <div className="flex items-center gap-3.5 mb-5">
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#141414] shadow-xl shadow-[#D4A373]/25 ring-2 ring-[#D4A373]/30 cursor-pointer hover:scale-105 transition-transform shrink-0"
                  onClick={() => navigate("/")}
                >
                  <ChefHat size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1
                      id="login-dialog-title"
                      className="font-serif text-2xl sm:text-[26px] font-extrabold text-[#FAF7F2] tracking-tight leading-tight"
                    >
                      {currentOption.title}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4A373]/15 text-[#D4A373] border border-[#D4A373]/30 text-[10px] font-bold uppercase tracking-wider">
                      <CurrentIcon size={11} />
                      {currentOption.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#C2B59B] mt-0.5 font-normal tracking-wide">
                    {currentOption.subtitle}
                  </p>
                </div>
              </div>

              {/* RESERVATION NOTICE BANNER (IF NAVIGATING FROM TABLE RESERVATION) */}
              {isFromReservation && (
                <div className="mb-4 p-3 rounded-2xl bg-[#221C16] border border-[#D4A373]/50 text-[#FAF7F2] text-xs flex items-center gap-3 animate-pop-in shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] flex items-center justify-center shrink-0 shadow-md">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div>
                    <strong className="text-[#D4A373] block text-xs font-bold tracking-wide">
                      Table Reservation Sign In
                    </strong>
                    <span className="text-[11px] text-[#C2B59B] leading-tight block mt-0.5">
                      Sign in to confirm your booking and link it directly to your profile.
                    </span>
                  </div>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email Address */}
                <div>
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] block mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3.5 py-2.5 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-200">
                    <Mail size={15} className="text-[#D4A373] shrink-0" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={currentOption.placeholderEmail}
                      required
                      className="w-full bg-transparent pl-3 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[#C2B59B] hover:text-[#D4A373] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff size={13} /> <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye size={13} /> <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3.5 py-2.5 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-200">
                    <Lock size={15} className="text-[#D4A373] shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full bg-transparent pl-3 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                    />
                  </div>
                </div>

                {/* Quick Auto-Fill Demo Shortcut */}
                <div className="flex items-center justify-between text-[11px] text-[#8B7E6A] pt-0.5">
                  <span>Sample credentials:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(loginAs)}
                    className="text-[#D4A373] hover:text-[#FAF7F2] underline underline-offset-2 transition-colors cursor-pointer font-medium"
                  >
                    Auto-fill {currentOption.label} Demo
                  </button>
                </div>

                {/* PRIMARY SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1.5 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E2B788] via-[#D4A373] to-[#B88755] hover:from-[#FAF7F2] hover:to-[#D4A373] text-[#141414] font-bold text-sm shadow-xl shadow-[#D4A373]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In as {currentOption.label}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: REGISTRATION CTA & RESTAURANT INFO (5 COLS)  */}
          {/* ========================================================= */}
          <div className="md:col-span-5 bg-[#141414]/90 md:border-l border-[#3A2E24] p-6 sm:p-7 md:p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Subtle background glow circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4A373]/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              {/* Decorative Restaurant Badge */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/25 text-[#D4A373] text-[11px] font-semibold mb-3">
                <Sparkles size={12} />
                <span>Fine Dining Hospitality</span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#FAF7F2] tracking-tight leading-snug mb-2">
                New to TasteHub?
              </h2>

              {/* Supporting Text */}
              <p className="text-xs text-[#C2B59B] leading-relaxed mb-4 font-normal">
                Create an account to reserve tables, access curated culinary menus, and manage your profile.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]">
                  <div className="w-5 h-5 rounded-md bg-[#202020] border border-[#3A2E24] text-[#D4A373] flex items-center justify-center shrink-0">
                    <CalendarCheck size={12} />
                  </div>
                  <span>Instant table reservation & booking code</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]">
                  <div className="w-5 h-5 rounded-md bg-[#202020] border border-[#3A2E24] text-[#D4A373] flex items-center justify-center shrink-0">
                    <UtensilsCrossed size={12} />
                  </div>
                  <span>Exclusive culinary specials & curated menus</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-[#FAF7F2]">
                  <div className="w-5 h-5 rounded-md bg-[#202020] border border-[#3A2E24] text-[#D4A373] flex items-center justify-center shrink-0">
                    <Award size={12} />
                  </div>
                  <span>VIP perks, party booking & priority seating</span>
                </div>
              </div>

              {/* Large Outline Secondary CTA Button */}
              <Link
                to="/signup"
                state={location.state}
                className="w-full py-3 px-5 rounded-xl border-2 border-[#D4A373] hover:border-[#FAF7F2] text-[#D4A373] hover:text-[#FAF7F2] hover:bg-[#D4A373]/10 font-bold text-sm text-center transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 group"
              >
                <span>Create Account</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Bottom Security Note */}
              <div className="pt-3 border-t border-[#3A2E24]/60 text-center md:text-left mt-4">
                <p className="text-[11px] text-[#8B7E6A] flex items-center justify-center md:justify-start gap-1.5">
                  <ShieldCheck size={12} className="text-[#D4A373]" />
                  <span>Verified TasteHub Account Security</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}