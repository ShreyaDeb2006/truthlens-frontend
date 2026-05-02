import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetDocumentScan } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Download, ArrowLeft, AlertTriangle } from "lucide-react";

function AnimatedGauge({ value, verdict }: { value: number; verdict: string }) {
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = verdict === "AI" ? "#FF4444" : verdict === "HUMAN" ? "#00FF88" : "#FFB800";
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
      <motion.circle
        cx="90" cy="90" r={radius} fill="none"
        stroke={color} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        transform="rotate(-90 90 90)"
        style={{ filter: `drop-shadow(0 0 10px ${color})` }}
      />
      <text x="90" y="84" textAnchor="middle" fill={color} fontSize="28" fontWeight="800" fontFamily="JetBrains Mono, monospace">{value}%</text>
      <text x="90" y="102" textAnchor="middle" fill="#A0A0B8" fontSize="11" fontFamily="Inter, sans-serif">AI Confidence</text>
    </svg>
  );
}

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    AI: { label: "Likely AI Generated", color: "#FF4444", bg: "rgba(255,68,68,0.12)" },
    HUMAN: { label: "Likely Human", color: "#00FF88", bg: "rgba(0,255,136,0.12)" },
    UNCERTAIN: { label: "Uncertain", color: "#FFB800", bg: "rgba(255,184,0,0.12)" },
  };
  const v = map[verdict] || map.UNCERTAIN;
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold" style={{ color: v.color, background: v.bg }}>
      {v.label}
    </span>
  );
}

export default function DocumentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: scan, isLoading } = useGetDocumentScan(id!, {
    query: {
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
            <motion.div className="w-24 h-24 rounded-full border-2 border-[#7B2FFF]/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="absolute inset-3 rounded-full border-2 border-t-[#7B2FFF]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 m-auto w-6 h-6 flex items-center justify-center">
              <span className="text-[#7B2FFF] font-mono text-xs font-bold">OCR</span>
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-xl mb-2">Processing Document...</div>
            <div className="text-[#A0A0B8]">OCR extraction and AI analysis in progress</div>
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
          <p className="text-[#A0A0B8]">There was an error processing this document.</p>
          <Link href="/document-scan" className="px-6 py-3 rounded-lg font-semibold" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", color: "#fff" }}>Try Again</Link>
        </div>
      </DashboardLayout>
    );
  }

  const sections = (scan.sections as any[]) || [];
  const keywords = (scan.keywords as string[]) || [];
  const confidence = Number(scan.confidence) || 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm text-[#A0A0B8] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: Text Viewer */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-bold mb-3">Analyzed Content</h3>
            <div className="flex gap-3 mb-4 flex-wrap text-xs">
              {[{ c: "rgba(255,68,68,0.35)", l: "AI (>70%)" }, { c: "rgba(255,184,0,0.3)", l: "Uncertain" }, { c: "transparent", l: "Human", b: "rgba(255,255,255,0.1)" }].map(({ c, l, b }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: c, border: b ? `1px solid ${b}` : "none" }} />
                  <span className="text-[#A0A0B8]">{l}</span>
                </div>
              ))}
            </div>
            <div className="max-h-[500px] overflow-y-auto rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              {sections.length > 0 ? sections.map((seg: any, i: number) => {
                const p = seg.aiProbability ?? 0;
                const bg = p >= 0.7 ? "rgba(255,68,68,0.2)" : p >= 0.4 ? "rgba(255,184,0,0.15)" : "transparent";
                const border = p >= 0.7 ? "1px solid rgba(255,68,68,0.25)" : p >= 0.4 ? "1px solid rgba(255,184,0,0.2)" : "1px solid transparent";
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg text-sm leading-relaxed transition-colors" style={{ background: bg, border }}>
                    <span className="text-[#ddd]">{seg.text}</span>
                    <span className="ml-2 text-xs font-mono" style={{ color: p >= 0.7 ? "#FF4444" : p >= 0.4 ? "#FFB800" : "#00FF88" }}>
                      {(p * 100).toFixed(0)}%
                    </span>
                  </motion.div>
                );
              }) : (
                <p className="text-sm text-[#A0A0B8]">{scan.ocrText || "No text extracted."}</p>
              )}
            </div>
          </div>

          {/* Right: Stats */}
          <div className="space-y-5">
            {/* Gauge */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center gap-4">
              <AnimatedGauge value={confidence} verdict={scan.verdict} />
              <VerdictChip verdict={scan.verdict} />
              {scan.verdictLabel && <p className="text-sm text-[#A0A0B8] text-center">{scan.verdictLabel}</p>}
            </div>

            {/* Summary */}
            {scan.summary && (
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-bold mb-3">AI Summary</h3>
                <p className="text-sm text-[#A0A0B8] leading-relaxed">{scan.summary}</p>
              </div>
            )}

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-bold mb-3">Key Topics Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw, i) => (
                    <motion.span key={kw} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                      className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" }}>
                      {kw}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Section breakdown */}
            {sections.length > 0 && (
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="font-bold mb-3">Section Breakdown</h3>
                <div className="space-y-2">
                  {sections.map((seg: any, i: number) => {
                    const p = seg.aiProbability ?? 0;
                    const color = p >= 0.7 ? "#FF4444" : p >= 0.4 ? "#FFB800" : "#00FF88";
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[#A0A0B8] w-14 flex-shrink-0">Section {i + 1}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${p * 100}%` }} transition={{ duration: 0.7, delay: i * 0.08 }} style={{ background: color }} />
                        </div>
                        <span className="text-xs font-mono w-10 text-right" style={{ color }}>{(p * 100).toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", color: "#fff", boxShadow: "0 0 20px rgba(123,47,255,0.3)" }}>
              <Download className="w-4 h-4" /> Download Annotated Report
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
