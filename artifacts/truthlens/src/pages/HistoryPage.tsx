import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListScans, useListDocumentScans, useDeleteScan, useDeleteDocumentScan } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Trash2, Eye, Search, FileText, Scan } from "lucide-react";

type TabId = "scans" | "documents";

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    AI: { label: "Likely AI", color: "#FF4444", bg: "rgba(255,68,68,0.12)" },
    HUMAN: { label: "Likely Human", color: "#00FF88", bg: "rgba(0,255,136,0.12)" },
    UNCERTAIN: { label: "Uncertain", color: "#FFB800", bg: "rgba(255,184,0,0.12)" },
  };
  const v = map[verdict] || map.UNCERTAIN;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: v.color, background: v.bg }}>
      {v.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = { text: "T", image: "IMG", video: "VID", audio: "AUD", news: "URL", document: "DOC" };
  return (
    <span className="inline-flex items-center justify-center w-9 h-9 rounded-md text-xs font-bold text-[#00D4FF]" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
      {icons[type] || "?"}
    </span>
  );
}

export default function HistoryPage() {
  const [tab, setTab] = useState<TabId>("scans");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: scansData, isLoading: scansLoading, refetch: refetchScans } = useListScans({ page, limit: 15 });
  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useListDocumentScans({ page, limit: 15 });
  const deleteScan = useDeleteScan();
  const deleteDoc = useDeleteDocumentScan();

  const scans = scansData?.scans || [];
  const docs = docsData?.documentScans || [];
  const totalPages = tab === "scans" ? (scansData?.totalPages || 1) : (docsData?.totalPages || 1);

  const filteredScans = scans.filter((s: any) =>
    !filter || s.verdict === filter || (s.fileName || "").toLowerCase().includes(filter.toLowerCase())
  );
  const filteredDocs = docs.filter((d: any) =>
    !filter || d.verdict === filter || (d.fileName || "").toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (tab === "scans") {
      deleteScan.mutate({ id }, { onSuccess: () => { refetchScans(); setConfirmDelete(null); } });
    } else {
      deleteDoc.mutate({ id }, { onSuccess: () => { refetchDocs(); setConfirmDelete(null); } });
    }
  };

  const isEmpty = tab === "scans" ? filteredScans.length === 0 : filteredDocs.length === 0;
  const isLoading = tab === "scans" ? scansLoading : docsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Scan History</h1>
          <p className="text-[#A0A0B8]">All your past scans and detection results</p>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="glass-panel rounded-xl p-1 flex gap-1">
            {[{ id: "scans" as TabId, label: "AI Scans" }, { id: "documents" as TabId, label: "Document Scans" }].map(({ id, label }) => (
              <button key={id} onClick={() => { setTab(id); setPage(1); setFilter(""); }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={tab === id ? { background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.2))", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)" } : { color: "#A0A0B8" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0B8]" />
              <input
                type="text"
                placeholder="Search by filename..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-lg text-sm text-[#A0A0B8] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <option value="">All verdicts</option>
              <option value="AI">Likely AI</option>
              <option value="HUMAN">Likely Human</option>
              <option value="UNCERTAIN">Uncertain</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : isEmpty ? (
            <div className="p-16 text-center text-[#A0A0B8]">
              {tab === "scans" ? <Scan className="w-12 h-12 mx-auto mb-4 opacity-20" /> : <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />}
              <p className="font-semibold mb-2">No scans yet</p>
              <p className="text-sm mb-6">Start scanning to see your history here</p>
              <Link href={tab === "scans" ? "/scan" : "/document-scan"}
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-black"
                style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>
                {tab === "scans" ? "New Scan" : "Scan Document"}
              </Link>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-3 text-left text-xs text-[#A0A0B8] uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-[#A0A0B8] uppercase tracking-wider">File / Content</th>
                    <th className="px-4 py-3 text-left text-xs text-[#A0A0B8] uppercase tracking-wider hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 text-left text-xs text-[#A0A0B8] uppercase tracking-wider">Verdict</th>
                    <th className="px-4 py-3 text-left text-xs text-[#A0A0B8] uppercase tracking-wider hidden lg:table-cell">Confidence</th>
                    <th className="px-4 py-3 text-right text-xs text-[#A0A0B8] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(tab === "scans" ? filteredScans : filteredDocs).map((item: any, i: number) => (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <TypeBadge type={item.contentType || "document"} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium truncate max-w-[180px]">{item.fileName || `${item.contentType} scan`}</div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-sm text-[#A0A0B8]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4"><VerdictChip verdict={item.verdict} /></td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full" style={{
                              width: `${item.confidence || 0}%`,
                              background: item.verdict === "AI" ? "#FF4444" : item.verdict === "HUMAN" ? "#00FF88" : "#FFB800"
                            }} />
                          </div>
                          <span className="text-xs font-mono text-[#00D4FF]">{item.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={tab === "scans" ? `/results/${item.id}` : `/document-results/${item.id}`}
                            className="p-1.5 rounded-md text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {confirmDelete === item.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 rounded text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors border border-[#FF4444]/30">Yes</button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1 rounded text-[#A0A0B8] hover:bg-white/5 transition-colors border border-white/10">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(item.id)} className="p-1.5 rounded-md text-[#A0A0B8] hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                  <span className="text-sm text-[#A0A0B8]">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 rounded-md text-sm disabled:opacity-40 transition-colors hover:bg-white/5 border border-white/10 text-[#A0A0B8]">
                      Prev
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-md text-sm disabled:opacity-40 transition-colors hover:bg-white/5 border border-white/10 text-[#A0A0B8]">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
