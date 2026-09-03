import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { UserCircle, Save, Lock, Mail, User } from "lucide-react";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 transition duration-200";

export default function ProfileSettings() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setForm((prev) => ({
          ...prev,
          name: payload.name || "",
          email: payload.email || "",
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {};
    if (form.name) data.name = form.name;
    if (form.email) data.email = form.email;
    if (form.password) data.password = form.password;

    try {
      await api.put("/admin/profile", data);
      toast.success("Profile updated successfully");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
      <div className="flex items-center gap-3 pb-4 border-b border-[#3A2E24]">
        <div className="w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] rounded-2xl flex items-center justify-center text-[#141414] shadow-lg">
          <UserCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#FAF7F2]">Profile Settings</h1>
          <p className="text-xs text-[#C2B59B]">Update your account information and credentials</p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] p-7 md:p-9 shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <User size={13} className="text-[#D4A373]" />
              Full Name
            </label>
            <input
              className={INPUT_STYLE}
              placeholder="Your Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#C2B59B] mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail size={13} className="text-[#D4A373]" />
              Email Address
            </label>
            <input
              type="email"
              className={INPUT_STYLE}
              placeholder="admin@tastehub.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-[#3A2E24] space-y-2">
            <label className="text-xs font-semibold text-[#C2B59B] flex items-center gap-1.5 uppercase tracking-wider">
              <Lock size={13} className="text-[#D4A373]" />
              New Password
            </label>
            <p className="text-xs text-[#8B7E6A]">Leave blank if you do not wish to change your password.</p>
            <input
              type="password"
              className={INPUT_STYLE}
              placeholder="Enter new password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-semibold px-8 py-3 rounded-xl transition shadow-md shadow-[#D4A373]/20 disabled:opacity-50 mt-4 text-sm"
          >
            <Save size={16} /> {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
