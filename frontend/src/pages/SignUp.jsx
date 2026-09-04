import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChefHat, Loader2, ChevronDown } from "lucide-react";

export default function SignUp({ setToken }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: "" });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
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
        console.error("Invalid token found in SignUp", e);
      }
    }

    // Fetch available roles from the backend
    api.get("/roles")
      .then((res) => {
        setRoles(res.data);
        if (res.data.length > 0) {
          // Default to the first role, usually admin or user
          setForm((prev) => ({ ...prev, roleId: res.data[0]._id }));
        }
      })
      .catch((err) => {
        toast.error("Failed to load roles");
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register the user
      const res = await api.post("/auth/register", form);
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign up failed");
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

          <h1 className="text-2xl font-bold text-[#FAF7F2]">Create Account</h1>
          <p className="text-sm text-[#C2B59B] mt-1">
            Sign up for a new staff account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="text-xs text-[#C2B59B]">Full Name</label>
            <input
              type="text"
              value={form.name}
              placeholder="John Doe"
              required
              className="w-full mt-1 p-3 rounded-lg bg-[#141414] border border-[#3A2E24] text-[#FAF7F2] focus:border-[#D4A373] outline-none transition"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-[#C2B59B]">Email</label>
            <input
              type="email"
              value={form.email}
              placeholder="admin@tastehub.com"
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

          <div>
            <label className="text-xs text-[#C2B59B]">Select Role</label>
            <div className="relative mt-1">
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                required
                className="w-full p-3 rounded-lg bg-[#141414] border border-[#3A2E24] text-[#FAF7F2] focus:border-[#D4A373] outline-none transition appearance-none cursor-pointer"
              >
                {roles.length === 0 && <option value="">Loading roles...</option>}
                {roles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C2B59B] pointer-events-none"
              />
            </div>
          </div>

          <button
            disabled={loading || roles.length === 0}
            className="w-full mt-4 bg-[#D4A373] text-[#141414] font-semibold py-3 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#C2B59B] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#D4A373] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
