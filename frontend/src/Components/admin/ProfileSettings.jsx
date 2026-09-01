import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { UserCircle, Save } from "lucide-react";

const API = "http://localhost:5000/api";
const INPUT = "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";
const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

export default function ProfileSettings() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // We could fetch the current user profile here, but we might not have a dedicated endpoint for just "me" other than stats/auth.
    // Assuming the JWT payload has the name and email, we can pre-fill, or just let them update what they want.
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setForm(prev => ({ ...prev, name: payload.name || "", email: payload.email || "" }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Only send fields that have values
    const data = {};
    if (form.name) data.name = form.name;
    if (form.email) data.email = form.email;
    if (form.password) data.password = form.password;

    try {
      await axios.put(`${API}/admin/profile`, data, config);
      toast.success("Profile updated successfully. You may need to log in again for changes to take effect.");
      setForm(prev => ({ ...prev, password: "" })); // clear password field
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#D4A373] rounded-2xl flex items-center justify-center text-[#141414] shadow-lg">
          <UserCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-[#C2B59B] text-sm">Update your account information</p>
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block uppercase tracking-wider font-semibold">Full Name</label>
            <input 
              className={INPUT} 
              placeholder="Your Name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block uppercase tracking-wider font-semibold">Email Address</label>
            <input 
              type="email" 
              className={INPUT} 
              placeholder="admin@example.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
          </div>

          <div className="pt-4 border-t border-[#3A2E24]">
            <label className="text-xs text-[#C2B59B] ml-1 mb-1 block uppercase tracking-wider font-semibold">New Password</label>
            <p className="text-xs text-[#8B7E6A] ml-1 mb-3">Leave blank if you do not wish to change your password.</p>
            <input 
              type="password" 
              className={INPUT} 
              placeholder="Enter new password" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] disabled:opacity-50 text-[#141414] font-semibold px-8 py-3 rounded-xl transition mt-4"
          >
            <Save size={18} /> {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
