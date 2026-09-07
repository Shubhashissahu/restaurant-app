import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  TrendingUp,
  Utensils,
  Clock,
  UserCheck,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  FileBarChart,
  UserCircle,
  Sparkles,
  ChefHat,
  CalendarCheck,
  MapPin,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";

export default function ManagerOverview() {
  const [data, setData] = useState(null);
  const [team, setTeam] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [resStats, setResStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/manager/reports/stats?range=today"),
      api.get("/manager/team"),
      api.get("/manager/profile"),
      api.get("/manager/reservations"),
    ])
      .then(([statsRes, teamRes, profileRes, resRes]) => {
        setData(statsRes.data);
        setTeam(teamRes.data);
        setProfile(profileRes.data);
        setReservations(resRes.data.reservations || []);
        setResStats(resRes.data.stats || null);
      })
      .catch((err) => console.error("Error loading manager overview:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeStaffCount = team.filter((m) => m.isActive).length;
  const totalPeopleReserved = resStats?.totalGuests || reservations.reduce((acc, r) => acc + (Number(r.guests) || 1), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1E1E] via-[#241F1A] to-[#1A1A1A] border border-[#3A2E24] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] uppercase tracking-wider">
              <Sparkles size={13} />
              Store Manager Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#FAF7F2]">
              Welcome back, {profile?.name || "Manager"}
            </h1>
            <p className="text-[#C2B59B] text-sm max-w-xl leading-relaxed">
              Here is your restaurant operations summary for today. Oversee table reservations, see how many people have booked tables, manage your staff, and review store reports.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/manager/menu"
              className="inline-flex items-center gap-2 bg-[#D4A373] hover:bg-[#8B5E3C] text-[#141414] hover:text-[#FAF7F2] font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-[#D4A373]/20 text-sm"
            >
              <UtensilsCrossed size={16} />
              Menu Availability
            </Link>
            <Link
              to="/manager/reservations"
              className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#FAF7F2] border border-[#3A2E24] font-semibold px-5 py-2.5 rounded-xl transition text-sm"
            >
              <CalendarCheck size={16} className="text-[#D4A373]" />
              Manage Reservations
            </Link>
            <Link
              to="/manager/team"
              className="inline-flex items-center gap-2 bg-[#2A2A2A] hover:bg-[#333333] text-[#FAF7F2] border border-[#3A2E24] font-semibold px-5 py-2.5 rounded-xl transition text-sm"
            >
              <Plus size={16} />
              Add Team Member
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total People Reserved - Highlighted Card */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#D4A373]/50 shadow-xl relative overflow-hidden group hover:border-[#D4A373] transition duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4A373]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4A373]">
              <CalendarCheck size={22} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30">
              {resStats?.totalReservations || reservations.length} Bookings
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-medium">People Reserved</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FAF7F2]">
              {loading ? "..." : totalPeopleReserved}
            </p>
            <span className="text-xs text-[#D4A373] font-bold">guests total</span>
          </div>
          <Link
            to="/manager/reservations"
            className="text-xs text-[#D4A373] hover:underline mt-2 flex items-center gap-1 font-semibold"
          >
            Manage table bookings <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Active Staff */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4A373]">
              <Users size={22} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              {team.length > 0 ? `${Math.round((activeStaffCount / team.length) * 100)}% On Duty` : "Ready"}
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-medium">Team On Duty</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-[#FAF7F2]">
              {loading ? "..." : `${activeStaffCount} / ${team.length}`}
            </p>
            <span className="text-xs text-[#8B7E6A]">members</span>
          </div>
          <p className="text-xs text-[#C2B59B] mt-2 flex items-center gap-1">
            <UserCheck size={14} className="text-green-400" />
            Active across shifts
          </p>
        </div>

        {/* Estimated Sales */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={22} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data?.kpi?.revenueGrowth || "+14.8%"}
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-medium">Today's Sales</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-[#FAF7F2]">
              {loading ? "..." : `₹${(data?.kpi?.totalRevenue || 45200).toLocaleString("en-IN")}`}
            </p>
          </div>
          <p className="text-xs text-[#C2B59B] mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} className="text-emerald-400" />
            {data?.kpi?.totalOrders || 68} orders completed
          </p>
        </div>

        {/* Active Menu Items */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl relative overflow-hidden group hover:border-[#D4A373]/50 transition duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Utensils size={22} />
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Live
            </span>
          </div>
          <p className="text-xs text-[#C2B59B] uppercase tracking-wider font-medium">Menu Offerings</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-[#FAF7F2]">
              {loading ? "..." : data?.inventoryOverview?.totalMenuItems ?? 8}
            </p>
            <span className="text-xs text-[#8B7E6A]">dishes</span>
          </div>
          <p className="text-xs text-[#C2B59B] mt-2 flex items-center gap-1">
            <ChefHat size={14} className="text-purple-400" />
            {data?.inventoryOverview?.categoriesCount || 4} categories active
          </p>
        </div>
      </div>

      {/* SECTION: Recent Table Reservations Preview */}
      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#3A2E24] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#FAF7F2]">Recent Table Reservations</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4A373]/10 text-[#D4A373] border border-[#D4A373]/30 font-semibold">
                {totalPeopleReserved} Diners Reserved
              </span>
            </div>
            <p className="text-xs text-[#C2B59B]">Latest table bookings and requested party sizes</p>
          </div>
          <Link
            to="/manager/reservations"
            className="text-xs font-semibold text-[#D4A373] hover:underline flex items-center gap-1"
          >
            View & Manage All ({reservations.length}) <ArrowUpRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-[#C2B59B] text-sm">Loading reservations...</div>
        ) : reservations.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm text-[#C2B59B]">No table reservations placed yet.</p>
            <Link
              to="/manager/reservations"
              className="inline-block text-xs font-semibold text-[#D4A373] hover:underline"
            >
              + Reserve a table now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reservations.slice(0, 4).map((res) => {
              const guestCount = Number(res.guests) || 1;
              return (
                <div
                  key={res._id}
                  className="bg-[#241F1A] border border-[#3A2E24] rounded-xl p-4 space-y-3 hover:border-[#D4A373]/50 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-[#FAF7F2] text-sm leading-tight">{res.name}</p>
                      <p className="text-[11px] text-[#8B7E6A]">{res.phone}</p>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/10 text-[#D4A373] border border-amber-500/30 whitespace-nowrap">
                      {guestCount} {guestCount === 1 ? "Person" : "People"}
                    </span>
                  </div>

                  <div className="text-xs text-[#C2B59B] space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#D4A373]" />
                      {res.reservationDate || "Date TBD"}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-[#8B7E6A]">
                      <Clock size={12} />
                      {res.reservationTime || "Time TBD"} • {res.seatingPreference || "Indoor"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#3A2E24]/60">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {res.status || "Confirmed"}
                    </span>
                    <Link
                      to="/manager/reservations"
                      className="text-[11px] font-bold text-[#D4A373] hover:underline"
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two Column Layout: Team Overview & Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team Roster Preview */}
        <div className="lg:col-span-2 bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#3A2E24] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">Team Roster Preview</h2>
              <p className="text-xs text-[#C2B59B]">Users under your direct managerial responsibility</p>
            </div>
            <Link
              to="/manager/team"
              className="text-xs font-semibold text-[#D4A373] hover:underline flex items-center gap-1"
            >
              Manage All ({team.length}) <ArrowUpRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-[#C2B59B] text-sm">Loading team data...</div>
          ) : team.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-[#C2B59B]">No team members registered yet.</p>
              <Link
                to="/manager/team"
                className="inline-block text-xs font-semibold text-[#D4A373] hover:underline"
              >
                + Add your first team member
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#3A2E24]">
              {team.slice(0, 4).map((member) => (
                <div key={member._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2A2A2A] border border-[#3A2E24] flex items-center justify-center font-bold text-sm text-[#D4A373]">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#FAF7F2]">{member.name}</p>
                      <p className="text-xs text-[#8B7E6A]">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-lg bg-[#2A2A2A] text-[#C2B59B] border border-[#3A2E24]">
                      {member.department || "Service"}
                    </span>
                    <span className="hidden md:inline-block text-xs px-2.5 py-1 rounded-lg bg-[#2A2A2A] text-[#C2B59B] border border-[#3A2E24]">
                      {member.shift || "Morning"}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        member.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Department Distribution & Shifts */}
        <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[#FAF7F2]">Staff Shift Allocation</h2>
            <p className="text-xs text-[#C2B59B]">Daily shift coverage across departments</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#C2B59B]">Kitchen & Culinary</span>
                <span className="text-[#FAF7F2]">
                  {team.filter((m) => m.department === "Kitchen").length} staff
                </span>
              </div>
              <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${team.length > 0 ? (team.filter((m) => m.department === "Kitchen").length / team.length) * 100 : 35}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#C2B59B]">Service & Waitstaff</span>
                <span className="text-[#FAF7F2]">
                  {team.filter((m) => m.department === "Service").length} staff
                </span>
              </div>
              <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#D4A373] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${team.length > 0 ? (team.filter((m) => m.department === "Service").length / team.length) * 100 : 45}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#C2B59B]">Bar & Floor</span>
                <span className="text-[#FAF7F2]">
                  {team.filter((m) => m.department === "Bar" || m.department === "Floor").length} staff
                </span>
              </div>
              <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${team.length > 0 ? (team.filter((m) => m.department === "Bar" || m.department === "Floor").length / team.length) * 100 : 20}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#3A2E24] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#C2B59B] flex items-center gap-2">
                <Clock size={14} className="text-[#D4A373]" /> Current Shift
              </span>
              <span className="font-semibold text-[#FAF7F2] bg-[#2A2A2A] px-2.5 py-1 rounded-lg border border-[#3A2E24]">
                Morning (08:00 - 16:00)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#C2B59B] flex items-center gap-2">
                <UserCircle size={14} className="text-[#D4A373]" /> Shift Supervisor
              </span>
              <span className="font-semibold text-[#FAF7F2]">
                {profile?.name || "Store Manager"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
