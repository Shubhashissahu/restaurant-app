import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  Award,
  Users,
  Flame,
  Printer,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ReportsAnalytics() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchStats = async (selectedRange) => {
    try {
      setLoading(true);
      const res = await api.get(`/manager/reports/stats?range=${selectedRange}`);
      setData(res.data);
    } catch (err) {
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ["TASTEHUB - MANAGER OPERATIONS & REVENUE REPORT"],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Timeframe: ${range}`],
      [],
      ["--- KEY PERFORMANCE INDICATORS ---"],
      ["Metric", "Value", "Growth"],
      ["Total Gross Revenue", `Rs. ${data.kpi.totalRevenue}`, data.kpi.revenueGrowth],
      ["Total Orders", data.kpi.totalOrders, data.kpi.ordersGrowth],
      ["Average Order Value", `Rs. ${data.kpi.averageOrderValue}`, data.kpi.aovGrowth],
      ["Customer Satisfaction", `${data.kpi.customerRating} / 5.0`, "N/A"],
      ["Active Staff On Duty", `${data.kpi.activeStaff} / ${data.kpi.totalStaff}`, "N/A"],
      ["Registered Consumers", data.kpi.registeredConsumers, data.kpi.consumerGrowth],
      [],
      ["--- CATEGORY SALES DISTRIBUTION ---"],
      ["Category", "Share %", "Revenue (Rs.)"],
      ...data.categorySales.map((c) => [c.name, `${c.percentage}%`, c.revenue]),
      [],
      ["--- TOP PERFORMING DISHES ---"],
      ["Rank", "Dish Name", "Category", "Price", "Orders Sold", "Revenue Generated", "Rating"],
      ...data.topDishes.map((d, i) => [
        i + 1,
        `"${d.name}"`,
        d.category,
        d.price,
        d.orders,
        d.revenue,
        d.rating,
      ]),
      [],
      ["--- PEAK RUSH HOURS ---"],
      ["Time Window", "Orders Handled", "Table Occupancy"],
      ...data.peakHours.map((p) => [p.hour, p.orders, p.occupancy]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tastehub_report_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report CSV downloaded successfully");
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max revenue for chart scaling
  const maxRevenue = data?.trend?.reduce((max, pt) => Math.max(max, pt.revenue), 1) || 1;

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/10 border border-[#D4A373]/30 text-xs font-semibold text-[#D4A373] mb-2">
            <Sparkles size={13} />
            Analytics & Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FAF7F2]">
            Reports & Statistics
          </h1>
          <p className="text-xs md:text-sm text-[#C2B59B] mt-1">
            Real-time operational metrics, revenue performance, category share, and peak rush insights.
          </p>
        </div>

        {/* Action Buttons & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe pills */}
          <div className="flex items-center bg-[#1E1E1E] p-1 rounded-2xl border border-[#3A2E24]">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_month", label: "This Month" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  range === t.id
                    ? "bg-[#D4A373] text-[#141414] shadow"
                    : "text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#2A2A2A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="inline-flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333] border border-[#3A2E24] text-xs font-semibold text-[#FAF7F2] px-4 py-2.5 rounded-xl transition"
          >
            <Download size={14} className="text-[#D4A373]" />
            Export CSV
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-[#2A2A2A] hover:bg-[#333] border border-[#3A2E24] text-xs font-semibold text-[#FAF7F2] px-3 py-2.5 rounded-xl transition"
            title="Print Report"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#C2B59B]">Gross Revenue</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {data?.kpi?.revenueGrowth || "+14.8%"}
            </span>
          </div>
          <p className="text-3xl font-bold text-[#FAF7F2]">
            {loading ? "..." : `₹${(data?.kpi?.totalRevenue || 0).toLocaleString("en-IN")}`}
          </p>
          <p className="text-xs text-[#8B7E6A] mt-2">Aggregated over {range}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#C2B59B]">Orders Handled</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {data?.kpi?.ordersGrowth || "+9.2%"}
            </span>
          </div>
          <p className="text-3xl font-bold text-[#FAF7F2]">
            {loading ? "..." : data?.kpi?.totalOrders || 0}
          </p>
          <p className="text-xs text-[#8B7E6A] mt-2">Dine-in and takeaway</p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#C2B59B]">Average Ticket (AOV)</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {data?.kpi?.aovGrowth || "+4.1%"}
            </span>
          </div>
          <p className="text-3xl font-bold text-[#FAF7F2]">
            {loading ? "..." : `₹${data?.kpi?.averageOrderValue || 0}`}
          </p>
          <p className="text-xs text-[#8B7E6A] mt-2">Per dining party ticket</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-[#1E1E1E] rounded-2xl p-5 border border-[#3A2E24] shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[#C2B59B]">Guest CSAT Rating</span>
            <div className="flex items-center text-amber-400">
              <Star size={14} className="fill-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#FAF7F2]">
            {loading ? "..." : `${data?.kpi?.customerRating || 4.86}`} <span className="text-sm font-normal text-[#8B7E6A]">/ 5.0</span>
          </p>
          <p className="text-xs text-[#8B7E6A] mt-2">Based on verified diners</p>
        </div>
      </div>

      {/* Revenue Trend Visual Chart */}
      <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#3A2E24] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#FAF7F2]">Revenue & Orders Progression</h2>
            <p className="text-xs text-[#C2B59B]">Interactive day-by-day sales trajectory</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#FAF7F2]">
              <span className="w-3 h-3 rounded-md bg-gradient-to-t from-[#8B5E3C] to-[#D4A373]" />
              Revenue (₹)
            </div>
            <div className="flex items-center gap-1.5 text-[#C2B59B]">
              <span className="w-3 h-1 rounded-full bg-[#FAF7F2]" />
              Orders Volume
            </div>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs text-[#C2B59B]">
            Calculating chart projections...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Area */}
            <div className="h-60 flex items-end gap-2 sm:gap-4 pt-8 pb-2 px-2">
              {data?.trend?.map((pt, idx) => {
                const barHeight = Math.max(15, Math.round((pt.revenue / maxRevenue) * 100));
                const isHovered = hoveredBar === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-14 z-20 bg-[#2A2A2A] border border-[#3A2E24] rounded-xl p-2 shadow-2xl text-center min-w-[110px] pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <p className="text-[10px] text-[#C2B59B]">{pt.label}</p>
                        <p className="text-xs font-bold text-[#D4A373]">₹{pt.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-[#FAF7F2]">{pt.orders} orders</p>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isHovered
                          ? "bg-gradient-to-t from-[#8B5E3C] to-[#FAF7F2] shadow-lg shadow-[#D4A373]/30 scale-105"
                          : "bg-gradient-to-t from-[#8B5E3C] to-[#D4A373] opacity-85 group-hover:opacity-100"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Labels Axis */}
            <div className="flex justify-between text-[11px] text-[#8B7E6A] px-2 border-t border-[#3A2E24] pt-2">
              {data?.trend?.map((pt, idx) => (
                <span key={idx} className="truncate max-w-[50px] text-center">
                  {pt.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Grid: Category Breakdown & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl space-y-6">
          <div className="border-b border-[#3A2E24] pb-4">
            <h2 className="text-lg font-bold text-[#FAF7F2]">Sales by Menu Category</h2>
            <p className="text-xs text-[#C2B59B]">Revenue contribution by dining department</p>
          </div>

          <div className="space-y-4">
            {data?.categorySales?.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#FAF7F2]">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4A373]">₹{cat.revenue.toLocaleString()}</span>
                    <span className="text-[#8B7E6A]">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#2A2A2A] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color || "#D4A373",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Rush Hours */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 border border-[#3A2E24] shadow-xl space-y-6">
          <div className="border-b border-[#3A2E24] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2]">Peak Rush Hours</h2>
              <p className="text-xs text-[#C2B59B]">Dining room table occupancy & volume</p>
            </div>
            <Flame size={18} className="text-amber-500" />
          </div>

          <div className="divide-y divide-[#3A2E24]">
            {data?.peakHours?.map((slot) => (
              <div key={slot.hour} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-[#D4A373]" />
                  <span className="text-[#FAF7F2] font-medium">{slot.hour}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#C2B59B]">{slot.orders} orders</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {slot.occupancy} table occupancy
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Dishes Table */}
      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#3A2E24] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#FAF7F2]">Top Performing Dishes</h2>
            <p className="text-xs text-[#C2B59B]">Ranked by order volume and customer revenue</p>
          </div>
          <Award size={18} className="text-[#D4A373]" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2A2A2A] text-[#D4A373] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Menu Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Menu Price</th>
                <th className="px-6 py-4">Orders Sold</th>
                <th className="px-6 py-4">Gross Revenue</th>
                <th className="px-6 py-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#C2B59B]">
                    Loading dish rankings...
                  </td>
                </tr>
              ) : (
                data?.topDishes?.map((dish, index) => (
                  <tr key={dish._id} className="hover:bg-[#2A2A2A]/40 transition">
                    <td className="px-6 py-4 font-bold text-[#D4A373]">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#FAF7F2]">
                      {dish.name}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#C2B59B]">
                      {dish.category}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#FAF7F2]">
                      ₹{dish.price}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#FAF7F2]">
                      {dish.orders}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      ₹{dish.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Star size={12} className="fill-amber-400" />
                        {dish.rating}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
