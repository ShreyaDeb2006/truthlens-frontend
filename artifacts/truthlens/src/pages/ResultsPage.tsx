import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetScan, getGetScanQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AlertTriangle, RefreshCw, Download, Copy, ArrowLeft } from "lucide-react";

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; color: string; bg: string; glow: string }> = {
    AI: { label: "Likely AI Generated", color: "#FF4444", bg: "rgba(255,68,68,0.12)", glow: "0 0 20px rgba(255,68,68,0.4)" },
    HUMAN: { label: "Likely Human", color: "#00FF88", bg: "rgba(0,255,136,0.12)", glow: "0 0 20px rgba(0,255,136,0.4)" },
    UNCERTAIN: { label: "Uncertain — Mixed Signals", color: "#FFB800", bg: "rgba(255,184,0,0.12)", glow: "0 0 20px rgba(255,184,0,0.4)" },
  };
  const v = map[verdict] || map.UNCERTAIN;
  return (
    <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold" style={{ color: v.color, background: v.bg, boxShadow: v.glow, border: `1px solid ${v.color}40` }}>
      {v.label}
    </span>
  );
}

function AnimatedGauge({ value, verdict }: { value: number; verdict: string }) {
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = verdict === "AI" ? "#FF4444" : verdict === "HUMAN" ? "#00FF88" : "#FFB800";
  return (
    <svg width="220" height="220" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
      <motion.circle
        cx="110" cy="110" r={radius} fill="none"
        stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        transform="rotate(-90 110 110)"
        style={{ filter: `drop-shadow(0 0 12px ${color})` }}
      />
      <text x="110" y="100" textAnchor="middle" fill={color} fontSize="36" fontWeight="800" fontFamily="JetBrains Mono, monospace">{value}%</text>
      <text x="110" y="122" textAnchor="middle" fill="#A0A0B8" fontSize="13" fontFamily="Inter, sans-serif">AI Confidence</text>
    </svg>
  );
}

function TextHighlighter({ segments }: { segments: any[] }) {
  if (!segments || segments.length === 0) return null;
  return (
    <div className="leading-8 text-sm font-sans" style={{ color: "#ddd" }}>
      {segments.map((seg: any, i: number) => {
        const p = seg.aiProbability ?? 0;
        const bg = p >= 0.7 ? "rgba(255,68,68,0.2)" : p >= 0.4 ? "rgba(255,184,0,0.15)" : "transparent";
        const border = p >= 0.7 ? "rgba(255,68,68,0.3)" : p >= 0.4 ? "rgba(255,184,0,0.2)" : "transparent";
        return (
          <span key={i} className="rounded px-0.5 transition-colors" style={{ background: bg, borderBottom: `1px solid ${border}` }} title={`AI probability: ${(p * 100).toFixed(0)}%`}>
            {seg.text}{" "}
          </span>
        );
      })}
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: scan, isLoading } = useGetScan(id!, {
    query: {
      queryKey: getGetScanQueryKey(id!),
      enabled: !!id,
      refetchInterval: (query) => {
        const data = query.state.data as any;
        return data?.status === "complete" || data?.status === "failed" ? false : 2000;
      },
    },
  });

  const isProcessing = !scan || scan.status === "pending" || scan.status === "processing";

  if (isLoading || isProcessing) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <motion.div className="w-24 h-24 rounded-full border-2 border-[#00D4FF]/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="absolute inset-3 rounded-full border-2 border-t-[#00D4FF]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
          <div className="text-center">
            <div className="font-semibold text-xl mb-2">Analyzing Content...</div>
            <div className="text-[#A0A0B8]">Running multi-model AI ensemble detection</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (scan.status === "failed") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="w-12 h-12 text-[#FF4444]" />
          <h2 className="text-2xl font-bold">Analysis Failed</h2>
          <p className="text-[#A0A0B8]">There was an error processing this scan.</p>
          <Link href="/scan" className="px-6 py-3 rounded-lg font-semibold" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", color: "#000" }}>Try Again</Link>
        </div>
      </DashboardLayout>
    );
  }

  const models = (scan.models as any[]) || [];
  const radarData = models.map((m: any) => ({ subject: m.name, score: Math.round(m.score || 0), fullMark: 100 }));
  const segments = (scan as any).segments || [];
  const confidence = Number(scan.confidence) || 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-[#A0A0B8] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        {/* Warnings */}
        {scan.failedModels && scan.failedModels > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,184,0,0.08)", border: "1px solid rgba(255,184,0,0.2)" }}>
            <AlertTriangle className="w-5 h-5 text-[#FFB800] flex-shrink-0" />
            <p className="text-sm text-[#FFB800]">Note: {scan.failedModels} detection model(s) were unavailable. Results based on {models.length} model(s).</p>
          </div>
        )}

        {/* Hero Result */}
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <AnimatedGauge value={confidence} verdict={scan.verdict ?? "UNCERTAIN"} />
            </motion.div>
            <div className="flex-1 space-y-4">
              <VerdictChip verdict={scan.verdict ?? "UNCERTAIN"} />
              <div className="text-[#A0A0B8] text-sm">{scan.verdictLabel}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#A0A0B8] text-xs uppercase tracking-wider mb-1">Content Type</div>
                  <div className="font-semibold capitalize">{scan.contentType}</div>
                </div>
                {scan.fileName && (
                  <div>
                    <div className="text-[#A0A0B8] text-xs uppercase tracking-wider mb-1">File</div>
                    <div className="font-semibold truncate">{scan.fileName}</div>
                  </div>
                )}
                <div>
                  <div className="text-[#A0A0B8] text-xs uppercase tracking-wider mb-1">Scanned</div>
                  <div className="font-semibold">{new Date(scan.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[#A0A0B8] text-xs uppercase tracking-wider mb-1">Models Used</div>
                  <div className="font-semibold font-mono text-[#00D4FF]">{models.length}</div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#A0A0B8] hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Copy className="w-4 h-4" /> Copy Link
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#A0A0B8] hover:text-white transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Download className="w-4 h-4" /> Download Report
                </button>
                <Link href="/scan" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors" style={{ border: "1px solid rgba(0,212,255,0.3)" }}>
                  <RefreshCw className="w-4 h-4" /> Re-scan
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Model Breakdown */}
        {models.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Radar */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold mb-4">Model Score Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#A0A0B8", fontSize: 11 }} />
                  <Radar name="AI Score" dataKey="score" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "#0D0D1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-model table */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="font-bold mb-4">Model Breakdown</h3>
              <div className="space-y-3">
                {models.map((model: any, i: number) => {
                  const score = Math.round(model.score || 0);
                  const color = model.verdict === "AI" ? "#FF4444" : model.verdict === "HUMAN" ? "#00FF88" : "#FFB800";
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-[#A0A0B8] truncate">{model.name}</div>
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: i * 0.08 }} style={{ background: color }} />
                      </div>
                      <span className="w-10 text-right text-xs font-mono" style={{ color }}>{score}%</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}15`, color }}>{model.verdict}</span>
                      <span className="text-xs text-[#00FF88]">{model.status === "success" ? "OK" : "ERR"}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Text Highlighting */}
        {segments.length > 0 && (
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-bold mb-2">Content Analysis</h3>
            <div className="flex gap-4 mb-4 text-xs">
              {[{ color: "rgba(255,68,68,0.4)", label: "AI Generated (>70%)" }, { color: "rgba(255,184,0,0.3)", label: "Uncertain (40-70%)" }, { color: "transparent", label: "Human (<40%)", border: "rgba(255,255,255,0.1)" }].map(({ color, label, border }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: color, border: border ? `1px solid ${border}` : "none" }} />
                  <span className="text-[#A0A0B8]">{label}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <TextHighlighter segments={segments} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
