import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetDashboardStats, useGetRecentActivity } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Scan, FileSearch, BarChart3, TrendingUp, Clock, Activity } from "lucide-react";

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; color: string; bg: string; glow: string }> = {
    AI: { label: "Likely AI", color: "#FF4444", bg: "rgba(255,68,68,0.12)", glow: "0 0 12px rgba(255,68,68,0.3)" },
    HUMAN: { label: "Likely Human", color: "#00FF88", bg: "rgba(0,255,136,0.12)", glow: "0 0 12px rgba(0,255,136,0.3)" },
    UNCERTAIN: { label: "Uncertain", color: "#FFB800", bg: "rgba(255,184,0,0.12)", glow: "0 0 12px rgba(255,184,0,0.3)" },
  };
  const v = map[verdict] || map.UNCERTAIN;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: v.color, background: v.bg, boxShadow: v.glow }}>
      {v.label}
    </span>
  );
}

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = { text: "T", image: "IMG", video: "VID", audio: "AUD", news: "URL", document: "DOC" };
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold text-[#00D4FF]" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
      {icons[type] || "?"}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({ limit: 10 });

  const statCards = [
    { label: "Total Scans", value: stats?.totalScans ?? "—", icon: Scan, color: "#00D4FF" },
    { label: "AI Detected", value: stats?.aiDetectedPercent != null ? `${stats.aiDetectedPercent}%` : "—", icon: BarChart3, color: "#FF4444" },
    { label: "This Week", value: stats?.scansThisWeek ?? "—", icon: TrendingUp, color: "#7B2FFF" },
    { label: "Avg Confidence", value: stats?.avgConfidence != null ? `${stats.avgConfidence}%` : "—", icon: Activity, color: "#00FF88" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-[#A0A0B8]">Monitor your scan activity and detection results</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { href: "/scan", icon: Scan, title: "New AI Scan", desc: "Analyze text, images, video, audio, or URLs for AI-generated content", color: "#00D4FF", grad: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(123,47,255,0.08))" },
            { href: "/document-scan", icon: FileSearch, title: "Document Scan", desc: "OCR-powered AI detection for PDFs and document images", color: "#7B2FFF", grad: "linear-gradient(135deg, rgba(123,47,255,0.15), rgba(255,45,135,0.08))" },
          ].map(({ href, icon: Icon, title, desc, color, grad }) => (
            <Link key={href} href={href}>
              <div className="glass-panel rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer group" style={{ background: grad }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}30`, boxShadow: `0 0 20px ${color}20` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#00D4FF] transition-colors">{title}</h3>
                    <p className="text-sm text-[#A0A0B8]">{desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="glass-panel rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#A0A0B8] font-medium uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
              {statsLoading ? (
                <div className="h-8 w-20 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
              ) : (
                <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#A0A0B8]" />
              <h2 className="font-semibold">Recent Activity</h2>
            </div>
            <Link href="/history" className="text-sm text-[#00D4FF] hover:underline">View all</Link>
          </div>

          {activityLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : !activity?.activity?.length ? (
            <div className="p-12 text-center text-[#A0A0B8]">
              <Scan className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium mb-1">No scans yet</p>
              <p className="text-sm">Start by scanning your first piece of content</p>
              <Link href="/scan" className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>
                Scan Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {activity.activity.map((scan: any, i: number) => (
                <motion.div key={scan.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <TypeIcon type={scan.contentType} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{scan.fileName || `${scan.contentType} scan`}</div>
                    <div className="text-xs text-[#A0A0B8]">{new Date(scan.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end gap-1">
                      <div className="text-xs text-[#A0A0B8]">Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${scan.confidence || 0}%`,
                            background: scan.verdict === "AI" ? "#FF4444" : scan.verdict === "HUMAN" ? "#00FF88" : "#FFB800"
                          }} />
                        </div>
                        <span className="text-xs font-mono text-[#00D4FF]">{scan.confidence}%</span>
                      </div>
                    </div>
                    <VerdictChip verdict={scan.verdict} />
                    <Link href={`/results/${scan.id}`} className="text-xs px-3 py-1.5 rounded-md text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors border border-[#00D4FF]/20">
                      View
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
