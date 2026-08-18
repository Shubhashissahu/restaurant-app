import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChefHat, Loader2, ChevronDown } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "user", label: "User" },
];

export default function Login({ setToken }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loginAs, setLoginAs] = useState("admin");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      // real role, from the server — this is what actually governs access
      const actualRole = res.data.admin?.role;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", actualRole || "");

      if (setToken) setToken(res.data.token);

      if (actualRole && actualRole.toLowerCase() !== loginAs.toLowerCase()) {
        toast(`You're signed in as ${actualRole}, not ${loginAs}.`, {
          icon: "ℹ️",
        });
      } else {
        toast.success("Welcome back");
      }

      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141414] px-4 pt-16">
      <div className="w-full max-w-md bg-[#1D1D1D] border border-[#3A2E24] rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#D4A373]/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#D4A373]/10 blur-3xl rounded-full"></div>

        <div className="text-center mb-8 relative">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center shadow-lg">
              <ChefHat className="text-[#141414]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#FAF7F2]">Welcome Back</h1>
          <p className="text-sm text-[#C2B59B] mt-1">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="text-xs text-[#C2B59B]">Login as</label>
            <div className="relative mt-1">
              <select
                value={loginAs}
                onChange={(e) => setLoginAs(e.target.value)}
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
              placeholder="admin@savorybites.com"
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