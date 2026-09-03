import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  UserCircle,
  Save,
  Lock,
  Mail,
  Phone,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Key,
  Clock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

export default function ManagerProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/manager/profile");
      setProfile(res.data);
      setForm((prev) => ({
        ...prev,
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      }));
    } catch (err) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      return setError("Name and email are required");
    }

    if (form.newPassword) {
      if (!form.currentPassword) {
        return setError("Please provide your current password to set a new password");
      }
      if (form.newPassword.length < 6) {
        return setError("New password must be at least 6 characters");
      }
      if (form.newPassword !== form.confirmPassword) {
        return setError("New password and confirm password do not match");
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await api.put("/manager/profile", payload);
      setProfile(res.data.profile);
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      toast.success("Manager profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#C2B59B]">Loading profile details...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] mb-2">
          <Sparkles size={13} />
          Account & Security
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#FAF7F2]">Manager Profile</h1>
        <p className="text-xs md:text-sm text-[#C2B59B] mt-1">
          Manage your personal details, staff contact channels, and account security credentials.
        </p>
      </div>

      {/* Profile Identity Card */}
      <div className="bg-[#1E1E1E] rounded-3xl border border-[#3A2E24] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4A373]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] flex items-center justify-center text-[#141414] font-bold text-3xl shadow-xl">
            {profile?.name?.charAt(0).toUpperCase() || "M"}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAF7F2]">{profile?.name}</h2>
              <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-500/10 text-[#D4A373] border border-amber-500/20 uppercase tracking-wider">
                Store Manager
              </span>
            </div>
            <p className="text-xs text-[#C2B59B]">{profile?.email}</p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#8B7E6A]">
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-[#D4A373]" />
                Department: {profile?.department || "Operations Management"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#D4A373]" />
                Primary Shift: {profile?.shift || "Morning"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-400" />
                Account Status: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Contact Details */}
        <div className="bg-[#1E1E1E] rounded-3xl border border-[#3A2E24] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#3A2E24] pb-4">
            <UserCircle size={20} className="text-[#D4A373]" />
            <h3 className="text-base font-bold text-[#FAF7F2]">Manager Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                className={INPUT_STYLE}
                placeholder="Manager Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                className={INPUT_STYLE}
                placeholder="manager@tastehub.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Contact Phone
              </label>
              <input
                type="tel"
                className={INPUT_STYLE}
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Assigned Responsibilities
              </label>
              <input
                type="text"
                disabled
                className={`${INPUT_STYLE} opacity-60 cursor-not-allowed`}
                value="Team Oversight, Operations & Reporting"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#1E1E1E] rounded-3xl border border-[#3A2E24] p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-[#3A2E24] pb-4">
            <Lock size={20} className="text-[#D4A373]" />
            <div>
              <h3 className="text-base font-bold text-[#FAF7F2]">Change Account Password</h3>
              <p className="text-xs text-[#8B7E6A]">Leave blank if you do not want to alter your password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                className={INPUT_STYLE}
                placeholder="Enter current password to verify"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  className={INPUT_STYLE}
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={INPUT_STYLE}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-[#D4A373]/20 text-sm disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving Changes..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
