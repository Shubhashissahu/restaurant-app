import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { History, Search, RotateCw, Calendar } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = () => {
    setLoading(true);
    api
      .get("/admin/audit-logs")
      .then((res) => setLogs(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to fetch audit logs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (log.targetId || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3A2E24]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#8B5E3C] rounded-2xl flex items-center justify-center text-[#141414] shadow-lg">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FAF7F2]">Audit Logs</h1>
            <p className="text-[#C2B59B] text-sm">Track system changes and administrative operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7E6A]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-9 pr-4 py-2 text-xs text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:border-[#D4A373] transition"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-[#2A2A2A] border border-[#3A2E24] text-[#C2B59B] hover:text-[#FAF7F2] hover:bg-[#333333] transition"
            title="Refresh logs"
          >
            <RotateCw size={15} className={loading ? "animate-spin text-[#D4A373]" : ""} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1E1E1E] border border-[#3A2E24] overflow-hidden shadow-xl relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#D4A373] before:to-[#8B5E3C]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs border-b border-[#3A2E24]">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Target ID</th>
                <th className="px-6 py-4 font-semibold">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A2E24]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#C2B59B]">
                    <RotateCw size={20} className="animate-spin mx-auto text-[#D4A373] mb-2" />
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#C2B59B]">
                    {search ? "No logs match your search query." : "No logs found."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#2A2A2A] transition">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-[#C2B59B]">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar size={12} className="text-[#8B7E6A]" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#2A2A2A] border border-[#3A2E24] flex items-center justify-center text-[#D4A373] text-[10px] font-bold">
                          {(log.user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-[#FAF7F2] text-xs">{log.user?.name || "System"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#2A2A2A] text-[#D4A373] border border-[#3A2E24]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-[#8B7E6A]">
                      {log.targetId || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="max-w-xs truncate text-xs font-mono text-[#8B7E6A] bg-[#2A2A2A] px-2.5 py-1 rounded border border-[#3A2E24]"
                        title={JSON.stringify(log.after || log.before || {})}
                      >
                        {JSON.stringify(log.after || log.before || {})}
                      </div>
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
