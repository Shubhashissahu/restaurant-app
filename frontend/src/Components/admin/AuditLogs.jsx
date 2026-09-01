import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { History, Search } from "lucide-react";

const API = "http://localhost:5000/api";
const config = { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${API}/admin/audit-logs`, config)
      .then(res => setLogs(res.data))
      .catch(err => toast.error("Failed to fetch audit logs"))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    (log.user?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#D4A373] rounded-2xl flex items-center justify-center text-[#141414] shadow-lg">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-[#C2B59B] text-sm">Track system changes</p>
          </div>
        </div>

        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A2E24] rounded-xl pl-10 pr-4 py-2 text-sm text-[#FAF7F2] placeholder:text-[#8B7E6A] focus:outline-none focus:ring-2 focus:ring-[#D4A373] transition"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-[#8B7E6A]" />
        </div>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl border border-[#3A2E24] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2A2A2A] text-[#D4A373] uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target ID</th>
              <th className="px-6 py-4">Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3A2E24]">
            {loading ? <tr><td colSpan={5} className="p-6 text-center text-[#C2B59B]">Loading...</td></tr> : filteredLogs.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-[#C2B59B]">No logs found</td></tr> : (
              filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-[#2A2A2A]/50 transition">
                  <td className="px-6 py-4 text-[#C2B59B] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {log.user?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-[#2A2A2A] border border-[#3A2E24] rounded-md text-xs font-mono text-[#D4A373]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#8B7E6A]">
                    {log.targetId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#8B7E6A]" title={JSON.stringify(log.after || log.before)}>
                      {JSON.stringify(log.after || log.before)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
