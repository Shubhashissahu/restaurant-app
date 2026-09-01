import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Pencil,
  Power,
  PowerOff,
  X,
  Phone,
  Mail,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const INPUT_STYLE =
  "w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition";

// Modal for Creating or Editing a Team Member
function MemberModal({ initial, onClose, onSubmit }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "Service",
      shift: "Morning",
    }
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      return setError("Name and email are required");
    }
    if (!initial && (!form.password || form.password.length < 6)) {
      return setError("Temporary password must be at least 6 characters");
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1E1E1E] rounded-3xl shadow-2xl w-full max-w-lg border border-[#3A2E24] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#3A2E24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373]">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">
                {initial ? "Edit Staff Member" : "Add New Team Member"}
              </h2>
              <p className="text-xs text-[#C2B59B]">
                {initial ? "Update staff role and shift details" : "Create credentials for restaurant team staff"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#C2B59B] hover:text-[#FAF7F2] p-1.5 rounded-lg hover:bg-[#2A2A2A] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              className={INPUT_STYLE}
              placeholder="e.g. Rahul Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                className={INPUT_STYLE}
                placeholder="staff@savorybites.com"
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
          </div>

          {!initial && (
            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Temporary Password * (min. 6 characters)
              </label>
              <input
                type="password"
                required
                className={INPUT_STYLE}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Department
              </label>
              <select
                className={INPUT_STYLE}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              >
                <option value="Service">Service & Waitstaff</option>
                <option value="Kitchen">Kitchen & Culinary</option>
                <option value="Bar">Bar & Beverage</option>
                <option value="Floor">Floor & Host</option>
                <option value="Cashier">Cashier & Billing</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#C2B59B] font-semibold uppercase tracking-wider block mb-1.5">
                Assigned Shift
              </label>
              <select
                className={INPUT_STYLE}
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
              >
                <option value="Morning">Morning (08:00 - 16:00)</option>
                <option value="Evening">Evening (16:00 - 00:00)</option>
                <option value="Night">Night (22:00 - 06:00)</option>
                <option value="Full Day">Full Day Flexible</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A2E24]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#3A2E24] text-sm text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A] transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold text-sm transition disabled:opacity-50"
            >
              {submitting ? "Saving..." : initial ? "Save Changes" : "Create Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamManagement() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedShift, setSelectedShift] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);

  // Fetch Team
  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get("/manager/team");
      setTeam(res.data);
    } catch (err) {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  // Create member
  const handleCreate = async (formData) => {
    const res = await api.post("/manager/team", formData);
    setTeam((prev) => [res.data, ...prev]);
    toast.success(`Added ${res.data.name} to your team`);
  };

  // Update member
  const handleUpdate = async (formData) => {
    const res = await api.put(`/manager/team/${editMember._id}`, formData);
    setTeam((prev) => prev.map((m) => (m._id === editMember._id ? res.data : m)));
    toast.success(`Updated ${res.data.name}'s details`);
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus, memberName) => {
    try {
      const res = await api.patch(`/manager/team/${id}/status`);
      setTeam((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      toast.success(
        res.data.isActive
          ? `${memberName} marked as Active`
          : `${memberName} marked as Inactive`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  // Filtered members list
  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.phone?.includes(search);

      const matchesDept = selectedDept === "all" || m.department === selectedDept;
      const matchesShift = selectedShift === "all" || m.shift === selectedShift;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && m.isActive) ||
        (selectedStatus === "inactive" && !m.isActive);

      return matchesSearch && matchesDept && matchesShift && matchesStatus;
    });
  }, [team, search, selectedDept, selectedShift, selectedStatus]);

  // Quick stats
  const activeCount = team.filter((m) => m.isActive).length;
  const kitchenCount = team.filter((m) => m.department === "Kitchen").length;
  const serviceCount = team.filter((m) => m.department === "Service").length;
  const barFloorCount = team.filter(
    (m) => m.department === "Bar" || m.department === "Floor"
  ).length;

  const getDeptColor = (dept) => {
    switch (dept) {
      case "Kitchen":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Service":
        return "bg-[#D4A373]/10 text-[#D4A373] border-[#D4A373]/30";
      case "Bar":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Floor":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Cashier":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-[#2A2A2A] text-[#C2B59B] border-[#3A2E24]";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] mb-2">
            <Sparkles size={13} />
            Staff & Responsibilities
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FAF7F2]">
            Team & User Management
          </h1>
          <p className="text-xs md:text-sm text-[#C2B59B] mt-1">
            View, schedule, and manage restaurant staff under your managerial responsibility.
          </p>
        </div>

        <button
          onClick={() => {
            setEditMember(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#D4A373]/20 text-sm whitespace-nowrap"
        >
          <UserPlus size={16} />
          Add Team Member
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-[#C2B59B] font-medium uppercase tracking-wider">Total Staff</p>
          <p className="text-2xl font-bold text-[#FAF7F2] mt-1">{team.length}</p>
          <span className="text-xs text-[#8B7E6A]">all team members</span>
        </div>
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-[#C2B59B] font-medium uppercase tracking-wider">Active On Duty</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{activeCount}</p>
          <span className="text-xs text-[#8B7E6A]">ready for shifts</span>
        </div>
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-[#C2B59B] font-medium uppercase tracking-wider">Kitchen & Chef</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{kitchenCount}</p>
          <span className="text-xs text-[#8B7E6A]">culinary crew</span>
        </div>
        <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-[#C2B59B] font-medium uppercase tracking-wider">Service & Bar</p>
          <p className="text-2xl font-bold text-[#D4A373] mt-1">{serviceCount + barFloorCount}</p>
          <span className="text-xs text-[#8B7E6A]">front-of-house</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#1E1E1E] border border-[#3A2E24] rounded-2xl p-4 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
          >
            <option value="all">All Departments</option>
            <option value="Kitchen">Kitchen & Culinary</option>
            <option value="Service">Service & Waitstaff</option>
            <option value="Bar">Bar & Beverage</option>
            <option value="Floor">Floor & Host</option>
            <option value="Cashier">Cashier & Billing</option>
          </select>

          {/* Shift Filter */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
          >
            <option value="all">All Shifts</option>
            <option value="Morning">Morning Shift</option>
            <option value="Evening">Evening Shift</option>
            <option value="Night">Night Shift</option>
            <option value="Full Day">Full Day</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl px-4 py-2.5 text-xs text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Team Roster Table */}
      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2A2A2A] text-[#D4A373] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Shift Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#C2B59B]">
                    Loading team members...
                  </td>
                </tr>
              ) : filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center space-y-2">
                    <p className="text-[#C2B59B] text-sm">No team members match your filter criteria.</p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setSelectedDept("all");
                        setSelectedShift("all");
                        setSelectedStatus("all");
                      }}
                      className="text-xs text-[#D4A373] hover:underline"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-[#2A2A2A]/40 transition group"
                  >
                    {/* Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E] border border-[#3A2E24] flex items-center justify-center font-bold text-sm text-[#D4A373] shadow-inner">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#FAF7F2]">{member.name}</p>
                          <span className="text-xs text-[#8B7E6A] flex items-center gap-1">
                            <Briefcase size={12} /> Staff Role
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-[#C2B59B]">
                        <Mail size={13} className="text-[#8B7E6A]" />
                        {member.email}
                      </div>
                      {member.phone ? (
                        <div className="flex items-center gap-1.5 text-[#8B7E6A]">
                          <Phone size={13} />
                          {member.phone}
                        </div>
                      ) : (
                        <span className="text-[#8B7E6A] italic">No phone listed</span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold border ${getDeptColor(
                          member.department
                        )}`}
                      >
                        {member.department || "Service"}
                      </span>
                    </td>

                    {/* Shift Schedule */}
                    <td className="px-6 py-4 text-xs text-[#C2B59B]">
                      <span className="inline-flex items-center gap-1.5 bg-[#2A2A2A] px-3 py-1 rounded-lg border border-[#3A2E24]">
                        <Clock size={13} className="text-[#D4A373]" />
                        {member.shift || "Morning"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold border ${
                          member.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.isActive ? "bg-green-400 animate-pulse" : "bg-red-400"
                          }`}
                        />
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() =>
                            handleToggleStatus(member._id, member.isActive, member.name)
                          }
                          title={member.isActive ? "Mark Inactive" : "Mark Active"}
                          className={`p-2 rounded-xl border transition ${
                            member.isActive
                              ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                              : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {member.isActive ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditMember(member);
                            setShowModal(true);
                          }}
                          title="Edit Details"
                          className="p-2 rounded-xl border border-[#3A2E24] text-[#D4A373] hover:bg-[#2A2A2A] hover:text-[#FAF7F2] transition"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {showModal && (
        <MemberModal
          initial={
            editMember
              ? {
                  name: editMember.name,
                  email: editMember.email,
                  phone: editMember.phone || "",
                  department: editMember.department || "Service",
                  shift: editMember.shift || "Morning",
                }
              : null
          }
          onClose={() => {
            setShowModal(false);
            setEditMember(null);
          }}
          onSubmit={editMember ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
}
