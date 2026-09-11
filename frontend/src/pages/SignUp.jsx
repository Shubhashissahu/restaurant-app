import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ChefHat,
  Loader2,
  ChevronDown,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Crown
} from "lucide-react";

export default function SignUp({ setToken }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If already logged in, redirect directly to dashboard or target
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
        console.error("Invalid token found in SignUp", e);
      }
    }

    // Fetch available roles from the backend
    api.get("/roles")
      .then((res) => {
        setRoles(res.data);
        if (res.data.length > 0) {
          // Default to user role if available, otherwise first role
          const userRole = res.data.find((r) => r.name.toLowerCase() === "user");
          setForm((prev) => ({ ...prev, roleId: userRole ? userRole._id : res.data[0]._id }));
        }
      })
      .catch((err) => {
        toast.error("Failed to load roles");
      });
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("Account created successfully! Please sign in.");
      navigate("/user/login", { state: location.state });
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign up failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* ── MAIN SIGN UP CONTAINER ── */}
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
              Create Account
            </h1>
            <p className="text-xs text-[#C2B59B] mt-1 leading-relaxed">
              {isFromReservation
                ? "Join TasteHub to reserve tables & manage your bookings"
                : "Sign up for a TasteHub dining or hospitality account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] block mb-1">
                Full Name
              </label>
              <div className="flex items-center bg-[#202020] border border-[#3A2E24] rounded-xl px-3.5 py-2.5 focus-within:border-[#D4A373] focus-within:ring-2 focus-within:ring-[#D4A373]/25 transition-all duration-200">
                <User size={16} className="text-[#D4A373] shrink-0" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full bg-transparent pl-3 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  placeholder="your.email@example.com"
                  required
                  className="w-full bg-transparent pl-3 text-xs sm:text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] outline-none"
                />
              </div>
            </div>

            {/* Password with Toggle */}
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

            {/* Select Role */}
            <div>
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] block mb-1">
                Account Type
              </label>
              <div className="relative">
                <select
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  required
                  className="w-full bg-[#202020] border border-[#3A2E24] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#FAF7F2] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 outline-none transition appearance-none cursor-pointer"
                >
                  {roles.length === 0 && <option value="">Loading roles...</option>}
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name === "user"
                        ? "Diner (Reservations & Orders)"
                        : role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C2B59B] pointer-events-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || roles.length === 0}
              className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E2B788] via-[#D4A373] to-[#B88755] hover:from-[#FAF7F2] hover:to-[#D4A373] text-[#141414] font-bold text-sm shadow-xl shadow-[#D4A373]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={17} />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* ── FOOTER: LOGIN LINK ── */}
          <div className="mt-5 pt-3.5 border-t border-[#3A2E24]/60 text-center">
            <p className="text-xs text-[#C2B59B]">
              Already have an account?{" "}
              <Link
                to="/user/login"
                state={location.state}
                className="text-[#D4A373] font-bold hover:text-[#FAF7F2] hover:underline ml-1 transition-colors"
              >
                Sign in
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
