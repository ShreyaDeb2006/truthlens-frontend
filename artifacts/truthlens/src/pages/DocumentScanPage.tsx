import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useScanDocument } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Upload, FileText, Zap, CheckCircle } from "lucide-react";

type Stage = "upload" | "ocr" | "ready" | "analyzing";

export default function DocumentScanPage() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("upload");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanDocument = useScanDocument();

  const handleFileSelect = (f: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(f.type)) { setError("Please select a PDF, JPG, or PNG file"); return; }
    if (f.size > 50 * 1024 * 1024) { setError("File too large. Max size: 50MB"); return; }
    setError("");
    setFile(f);
    setStage("ocr");
    simulateOcr();
  };

  const simulateOcr = () => {
    setOcrProgress(0);
    const interval = setInterval(() => {
      setOcrProgress((p) => {
        if (p >= 100) { clearInterval(interval); setStage("ready"); return 100; }
        return p + 2;
      });
    }, 60);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setStage("analyzing");
    const fd = new FormData();
    fd.append("file", file);
    scanDocument.mutate(
      { data: fd as any },
      {
        onSuccess: (result: any) => navigate(`/document-results/${result.id}`),
        onError: () => { setStage("ready"); setError("Scan failed. Please try again."); },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Document Scanner</h1>
          <p className="text-[#A0A0B8]">OCR-powered AI detection for PDFs and document images</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 space-y-6">
          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs">
            {[
              { id: "upload", label: "Upload" },
              { id: "ocr", label: "OCR Extraction" },
              { id: "ready", label: "AI Analysis" },
              { id: "done", label: "Report" },
            ].map((step, i, arr) => {
              const stages = ["upload", "ocr", "ready", "analyzing"];
              const current = stages.indexOf(stage);
              const stepIdx = stages.indexOf(step.id === "done" ? "analyzing" : step.id);
              const done = step.id === "done" ? false : current > stepIdx;
              const active = current === stepIdx || (step.id === "done" && stage === "analyzing");
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                      style={done ? { background: "#00FF88", color: "#000" } : active ? { background: "#00D4FF", color: "#000", boxShadow: "0 0 12px rgba(0,212,255,0.5)" } : { background: "rgba(255,255,255,0.08)", color: "#A0A0B8" }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={active ? { color: "#00D4FF" } : done ? { color: "#00FF88" } : { color: "#A0A0B8" }}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="flex-1 h-px w-8" style={{ background: done ? "#00FF88" : "rgba(255,255,255,0.08)" }} />}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {stage === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <input ref={fileInputRef} type="file" accept=".pdf,image/jpeg,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl p-12 flex flex-col items-center gap-5 cursor-pointer transition-all"
                  style={{ border: `2px dashed ${isDragging ? "#7B2FFF" : "rgba(255,255,255,0.12)"}`, background: isDragging ? "rgba(123,47,255,0.04)" : "rgba(255,255,255,0.02)" }}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)", boxShadow: "0 0 30px rgba(123,47,255,0.2)" }}
                  >
                    <FileText className="w-8 h-8 text-[#7B2FFF]" />
                  </motion.div>
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1">Drop your document here</div>
                    <div className="text-sm text-[#A0A0B8] mb-3">or click to browse files</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {["PDF", "JPG", "PNG"].map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded font-mono" style={{ background: "rgba(123,47,255,0.15)", color: "#7B2FFF", border: "1px solid rgba(123,47,255,0.3)" }}>{f}</span>
                      ))}
                    </div>
                    <div className="text-xs text-[#A0A0B8] mt-2">Max 50MB</div>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm text-[#FF4444] text-center">{error}</p>}
              </motion.div>
            )}

            {stage === "ocr" && (
              <motion.div key="ocr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(123,47,255,0.08)", border: "1px solid rgba(123,47,255,0.2)" }}>
                  <FileText className="w-8 h-8 text-[#7B2FFF] flex-shrink-0" />
                  <div>
                    <div className="font-medium">{file?.name}</div>
                    <div className="text-sm text-[#A0A0B8]">{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#A0A0B8]">Extracting text via OCR...</span>
                    <span className="font-mono text-[#00D4FF]">{ocrProgress}%</span>
                  </div>
                  {/* Animated document with scan line */}
                  <div className="relative rounded-lg overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", height: 120 }}>
                    <div className="p-4 space-y-2 opacity-30">
                      {[80, 60, 90, 40, 70].map((w, i) => (
                        <div key={i} className="h-2 rounded" style={{ width: `${w}%`, background: "rgba(255,255,255,0.3)" }} />
                      ))}
                    </div>
                    <motion.div
                      className="absolute left-0 right-0 h-0.5"
                      style={{ background: "linear-gradient(90deg, transparent, #00D4FF, transparent)", boxShadow: "0 0 12px #00D4FF" }}
                      animate={{ top: ["0%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #00D4FF, #7B2FFF)", width: `${ocrProgress}%` }} />
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "ready" && (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)" }}>
                  <CheckCircle className="w-8 h-8 text-[#00FF88] flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[#00FF88]">OCR Complete</div>
                    <div className="text-sm text-[#A0A0B8]">Text extracted successfully — ready for AI analysis</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl glass-panel">
                  <FileText className="w-6 h-6 text-[#7B2FFF]" />
                  <div>
                    <div className="font-medium">{file?.name}</div>
                    <div className="text-xs text-[#A0A0B8]">{file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}</div>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", color: "#fff", boxShadow: "0 0 30px rgba(123,47,255,0.4)" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start AI Analysis
                  </div>
                </button>
              </motion.div>
            )}

            {stage === "analyzing" && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-8">
                <div className="relative">
                  <motion.div
                    className="w-20 h-20 rounded-full border-2 border-[#7B2FFF]/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-t-[#7B2FFF]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <FileText className="absolute inset-0 m-auto w-6 h-6 text-[#7B2FFF]" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg mb-1">Analyzing document...</div>
                  <div className="text-sm text-[#A0A0B8]">Running sentence-level AI probability scoring</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
