import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChefHat, Loader2, ChevronDown, Crown, Briefcase, User } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", icon: Crown, subtitle: "Administrator Portal" },
  { value: "manager", label: "Manager", icon: Briefcase, subtitle: "Branch Manager Portal" },
  { value: "user", label: "User", icon: User, subtitle: "Customer / Staff Portal" },
];

export default function Login({ setToken, initialRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleFromPath = () => {
    if (initialRole) return initialRole.toLowerCase();
    if (location.pathname.includes("admin")) return "admin";
    if (location.pathname.includes("manager")) return "manager";
    if (location.pathname.includes("user")) return "user";
    return "admin";
  };

  const [form, setForm] = useState({ email: "", password: "" });
  const [loginAs, setLoginAs] = useState(getRoleFromPath);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = getRoleFromPath();
    setLoginAs(detected);
  }, [location.pathname, initialRole]);

  // If already logged in with a valid token, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (!payload.exp || Date.now() < payload.exp * 1000) {
            const role = (payload.role || localStorage.getItem("role") || "").toLowerCase();
            if (role === "admin") {
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
      if (setToken) setToken(null);
    }
  }, [navigate, setToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      // real role, from the server — this is what actually governs access
      const actualRole = res.data.admin?.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", actualRole || "");
      if (res.data.admin?.name) {
        localStorage.setItem("userName", res.data.admin.name);
      }

      if (setToken) setToken(res.data.token);

      if (actualRole && actualRole.toLowerCase() !== loginAs.toLowerCase()) {
        toast(`You're signed in as ${actualRole}, not ${loginAs}.`, {
          icon: "ℹ️",
        });
      } else {
        toast.success("Welcome back");
      }
      if (actualRole?.toLowerCase() === "manager") {
        navigate("/manager");
      } else if (actualRole?.toLowerCase() === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const currentOption = ROLE_OPTIONS.find((opt) => opt.value === loginAs) || ROLE_OPTIONS[0];
  const CurrentRoleIcon = currentOption.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 pt-16">
      <div className="w-full max-w-md bg-[#1D1D1D] border border-[#3A2E24] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#D4A373]/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#D4A373]/10 blur-3xl rounded-full"></div>

        <div className="text-center mb-8 relative">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center shadow-lg">
                <ChefHat className="text-[#141414]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#3A2E24] flex items-center justify-center text-[#D4A373] shadow">
                <CurrentRoleIcon size={12} />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/20 text-[#D4A373] text-xs font-medium mb-2">
            <CurrentRoleIcon size={13} />
            <span>{currentOption.subtitle}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#FAF7F2]">
            {currentOption.label} Login
          </h1>
          <p className="text-sm text-[#C2B59B] mt-1">
            {loginAs === "admin"
              ? "Sign in to access system administration & analytics"
              : loginAs === "manager"
              ? "Sign in to manage menus, orders & branch operations"
              : "Sign in to access your table reservations & profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="text-xs text-[#C2B59B]">Login as</label>
            <div className="relative mt-1">
              <select
                value={loginAs}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setLoginAs(newRole);
                  navigate(`/${newRole}/login`, { replace: true });
                }}
                className="w-full p-3 rounded-lg bg-[#141414] border border-[#3A2E24] text-[#FAF7F2] focus:border-[#D4A373] outline-none transition appearance-none cursor-pointer"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C2B59B] pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#C2B59B]">Email</label>
            <input
              type="email"
              value={form.email}
              placeholder={`${loginAs}@tastehub.com`}
              required
              className="w-full mt-1 p-3 rounded-lg bg-[#141414] border border-[#3A2E24] text-[#FAF7F2] focus:border-[#D4A373] outline-none transition"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-[#C2B59B]">Password</label>
            <input
              type="password"
              value={form.password}
              placeholder="••••••••"
              required
              className="w-full mt-1 p-3 rounded-lg bg-[#141414] border border-[#3A2E24] text-[#FAF7F2] focus:border-[#D4A373] outline-none transition"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            disabled={loading}
            className="w-full mt-4 bg-[#D4A373] text-[#141414] font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#C2B59B] mt-6 relative">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#D4A373] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}