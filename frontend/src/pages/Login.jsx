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
  CheckCircle2
} from "lucide-react";

const ROLE_OPTIONS = [
  {
    value: "user",
    label: "Diner",
    badge: "Guest",
    icon: User,
    subtitle: "Reserve tables & manage your bookings",
    placeholderEmail: "user@tastehub.com"
  },
  {
    value: "manager",
    label: "Manager",
    badge: "Operations",
    icon: Briefcase,
    subtitle: "Manage dining floor, menu & team shifts",
    placeholderEmail: "manager@tastehub.com"
  },
  {
    value: "admin",
    label: "Admin",
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
      // If token is invalid or expired, clear it
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      if (setToken) setToken(null);
    }
  }, [navigate, setToken, location.state]);

  const handleRoleChange = (newRole) => {
    setLoginAs(newRole);
    navigate(`/${newRole}/login`, { replace: true, state: location.state });
  };

  const handleQuickFill = (roleKey) => {
    const option = ROLE_OPTIONS.find((r) => r.value === roleKey);
    if (option) {
      setLoginAs(roleKey);
      setForm({
        email: option.placeholderEmail,
        password: "password123"
      });
      navigate(`/${roleKey}/login`, { replace: true, state: location.state });
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
        toast.success(`Welcome back, ${res.data.admin?.name || "Diner"}!`);
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
  const isFromReservation = location.state?.from === "/register";

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#111111] px-4 py-6 sm:py-8 relative overflow-hidden select-none">
      {/* ── AMBIENT GLOW BACKGROUND ── */}
      <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-[#D4A373]/12 blur-[140px] rounded-full pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-[#8B5E3C]/12 blur-[140px] rounded-full pointer-events-none animate-float-reverse"></div>

      {/* Subtle Background Pattern Mesh */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* ── MAIN LOGIN CONTAINER ── */}
      <div className="w-full max-w-[460px] relative z-10 mx-auto">
        <div className="bg-[#181818]/95 border border-[#3A2E24] hover:border-[#D4A373]/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_35px_rgba(212,163,115,0.08)] backdrop-blur-2xl relative overflow-hidden transition-all duration-300 animate-slide-up">
          {/* Top Luxury Gold Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4A373] via-[#FAF7F2] to-[#8B5E3C]"></div>

          {/* BRAND HEADER */}
          <div className="text-center mb-5 relative">
            <div className="flex justify-center mb-2.5">
              <div className="relative group cursor-pointer" onClick={() => navigate("/")}>
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#141414] shadow-xl shadow-[#D4A373]/25 ring-2 ring-[#D4A373]/30 transition-transform duration-300 group-hover:scale-105">
                  <ChefHat size={26} />
                </div>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
              {loginAs === "user" ? "TasteHub Diner Portal" : `${currentOption.label} Portal`}
            </h1>
            <p className="text-xs text-[#C2B59B] mt-1 leading-relaxed">
              {currentOption.subtitle}
            </p>
          </div>

          {/* ── ROLE SELECTOR TABS ── */}
          <div className="mb-4 bg-[#202020] p-1 rounded-2xl border border-[#3A2E24] grid grid-cols-3 gap-1">
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = loginAs === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleRoleChange(opt.value)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#E2B788] via-[#D4A373] to-[#B88755] text-[#141414] shadow-md shadow-[#D4A373]/20 scale-[1.02]"
                      : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#282828]"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-[#141414]" : "text-[#D4A373]"} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── RESERVATION NOTICE BANNER (IF FROM /register) ── */}
          {isFromReservation && (
            <div className="mb-4 p-3 rounded-2xl bg-[#221C16] border border-[#D4A373]/50 text-[#FAF7F2] text-xs flex items-center gap-3 animate-pop-in shadow-inner">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] text-[#141414] flex items-center justify-center shrink-0 shadow-md">
                <UtensilsCrossed size={17} />
              </div>
              <div>
                <strong className="text-[#D4A373] block text-xs font-bold tracking-wide">
                  Table Reservation Sign In
                </strong>
                <span className="text-[11px] text-[#C2B59B] leading-tight block mt-0.5">
                  Sign in to confirm your booking and link it directly to your diner profile.
                </span>
              </div>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] block mb-1">
                Email Address
              </label>
              <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3.5 py-2.5 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-200">
                <Mail size={16} className="text-[#D4A373] shrink-0" />
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

            {/* Password Field with Show/Hide Toggle */}
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
                <Lock size={16} className="text-[#D4A373] shrink-0" />
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

            {/* Quick Demo Pill Fillers */}
            <div className="pt-0.5 flex items-center justify-between text-[11px] text-[#8B7E6A]">
              <span>Demo credentials:</span>
              <button
                type="button"
                onClick={() => handleQuickFill(loginAs)}
                className="text-[#D4A373] hover:text-[#FAF7F2] underline underline-offset-2 transition-colors cursor-pointer"
              >
                Auto-fill {currentOption.label} demo
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E2B788] via-[#D4A373] to-[#B88755] hover:from-[#FAF7F2] hover:to-[#D4A373] text-[#141414] font-bold text-sm shadow-xl shadow-[#D4A373]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to {currentOption.label}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* ── FOOTER: SIGN UP & RECOVERY ── */}
          <div className="mt-5 pt-3.5 border-t border-[#3A2E24]/60 text-center">
            <p className="text-xs text-[#C2B59B]">
              New to TasteHub?{" "}
              <Link
                to="/signup"
                state={location.state}
                className="text-[#D4A373] font-bold hover:text-[#FAF7F2] hover:underline ml-1 transition-colors"
              >
                Create an account
              </Link>
            </p>

            <p className="text-[10px] text-[#8B7E6A] mt-1.5">
              Encrypted 256-bit security • TasteHub Fine Dining Hospitality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}