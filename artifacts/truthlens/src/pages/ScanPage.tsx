import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useScanText, useScanImage, useScanAudio, useScanVideo, useScanNews } from "@workspace/api-client-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Upload, FileText, Globe, Zap } from "lucide-react";

type Tab = "text" | "image" | "video" | "audio" | "news";

const TABS: { id: Tab; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "news", label: "News URL" },
];

const FILE_ACCEPT: Record<string, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

const FILE_LIMITS: Record<string, number> = {
  image: 20,
  video: 500,
  audio: 100,
};

function ScanProgress({ step }: { step: number }) {
  const steps = ["Uploading", "Analyzing", "Fetching Results"];
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative">
        <motion.div
          className="w-20 h-20 rounded-full border-2 border-[#00D4FF]/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-t-[#00D4FF]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <Zap className="absolute inset-0 m-auto w-6 h-6 text-[#00D4FF]" />
      </div>
      <div className="text-center">
        <div className="font-semibold text-lg mb-1">{steps[step] || steps[0]}...</div>
        <div className="text-sm text-[#A0A0B8]">Using multi-model AI ensemble</div>
      </div>
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full transition-colors ${i <= step ? "bg-[#00D4FF]" : "bg-white/20"}`} style={i <= step ? { boxShadow: "0 0 8px #00D4FF" } : {}} />
              <span className={`text-xs ${i <= step ? "text-[#00D4FF]" : "text-[#A0A0B8]"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-[#00D4FF]/50" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScanPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [newsText, setNewsText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scanText = useScanText();
  const scanImage = useScanImage();
  const scanAudio = useScanAudio();
  const scanVideo = useScanVideo();
  const scanNews = useScanNews();

  const validateFile = (f: File) => {
    if (tab === "image" && !f.type.startsWith("image/")) return "Please select an image file";
    if (tab === "video" && !f.type.startsWith("video/")) return "Please select a video file";
    if (tab === "audio" && !f.type.startsWith("audio/")) return "Please select an audio file";
    const limitMb = FILE_LIMITS[tab] || 100;
    if (f.size > limitMb * 1024 * 1024) return `File too large. Max size: ${limitMb}MB`;
    return null;
  };

  const handleFileSelect = (f: File) => {
    const err = validateFile(f);
    if (err) { setFileError(err); setFile(null); return; }
    setFileError("");
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [tab]);

  const canScan = () => {
    if (tab === "text") return text.trim().length >= 50;
    if (tab === "news") return url.trim().length > 5;
    return !!file;
  };

  const progressStep = () => {
    setScanStep(0);
    const t1 = setTimeout(() => setScanStep(1), 800);
    const t2 = setTimeout(() => setScanStep(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  };

  const handleScan = async () => {
    if (!canScan()) return;
    setScanning(true);
    const cleanup = progressStep();
    try {
      if (tab === "text") {
        const result = await new Promise<any>((resolve, reject) => {
          scanText.mutate({ data: { content: text } }, { onSuccess: resolve, onError: reject });
        });
        navigate(`/results/${result.id}`);
      } else if (tab === "news") {
        const result = await new Promise<any>((resolve, reject) => {
          scanNews.mutate({ data: { url, text: newsText || undefined } }, { onSuccess: resolve, onError: reject });
        });
        navigate(`/results/${result.id}`);
      } else if (file) {
        const fd = new FormData();
        fd.append("file", file);
        let result: any;
        if (tab === "image") result = await new Promise<any>((resolve, reject) => { scanImage.mutate({ data: fd as any }, { onSuccess: resolve, onError: reject }); });
        else if (tab === "audio") result = await new Promise<any>((resolve, reject) => { scanAudio.mutate({ data: fd as any }, { onSuccess: resolve, onError: reject }); });
        else if (tab === "video") result = await new Promise<any>((resolve, reject) => { scanVideo.mutate({ data: fd as any }, { onSuccess: resolve, onError: reject }); });
        navigate(`/results/${result.id}`);
      }
    } catch {
      setScanning(false);
    } finally {
      cleanup();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">New AI Scan</h1>
          <p className="text-[#A0A0B8]">Select your content type and upload content to analyze</p>
        </div>

        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div key="progress" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-panel rounded-2xl">
              <ScanProgress step={scanStep} />
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Tabs */}
              <div className="glass-panel rounded-xl p-1 flex gap-1">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => { setTab(id); setFile(null); setFileError(""); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={tab === id ? { background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.2))", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)" } : { color: "#A0A0B8" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="glass-panel rounded-xl p-6">
                {tab === "text" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[#A0A0B8]">Paste your text below</label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste the text you want to analyze for AI-generated content (minimum 50 characters)..."
                      rows={12}
                      className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none resize-none transition-all font-sans"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                    />
                    <div className="flex justify-between text-xs text-[#A0A0B8]">
                      <span className={text.length < 50 ? "text-[#FFB800]" : "text-[#00FF88]"}>
                        {text.length < 50 ? `${50 - text.length} more characters needed` : "Ready to scan"}
                      </span>
                      <span className="font-mono">{text.length.toLocaleString()} / 50,000</span>
                    </div>
                  </div>
                )}

                {tab === "news" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0B8] mb-2">Article URL</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0B8]" />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0B8] mb-2">Article text (optional)</label>
                      <textarea
                        value={newsText}
                        onChange={(e) => setNewsText(e.target.value)}
                        placeholder="Paste article content for more accurate analysis..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none resize-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                  </div>
                )}

                {(tab === "image" || tab === "video" || tab === "audio") && (
                  <div className="space-y-3">
                    <input ref={fileInputRef} type="file" accept={FILE_ACCEPT[tab]} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
                      style={{
                        border: `2px dashed ${isDragging ? "#00D4FF" : file ? "#00FF88" : "rgba(255,255,255,0.12)"}`,
                        background: isDragging ? "rgba(0,212,255,0.04)" : "rgba(255,255,255,0.02)",
                        boxShadow: isDragging ? "0 0 30px rgba(0,212,255,0.15)" : "none",
                      }}
                    >
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: file ? "rgba(0,255,136,0.1)" : "rgba(0,212,255,0.1)", border: `1px solid ${file ? "#00FF88" : "#00D4FF"}30` }}>
                        <Upload className="w-7 h-7" style={{ color: file ? "#00FF88" : "#00D4FF" }} />
                      </div>
                      {file ? (
                        <div className="text-center">
                          <div className="font-semibold text-[#00FF88]">{file.name}</div>
                          <div className="text-sm text-[#A0A0B8]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="font-semibold">Drop your {tab} file here</div>
                          <div className="text-sm text-[#A0A0B8]">or click to browse</div>
                          <div className="text-xs text-[#A0A0B8] mt-2">Max size: {FILE_LIMITS[tab]}MB</div>
                        </div>
                      )}
                    </div>
                    {fileError && <p className="text-sm text-[#FF4444]">{fileError}</p>}
                    {file && (
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-sm text-[#A0A0B8] hover:text-white underline">
                        Remove file
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={!canScan()}
                className="w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01]"
                style={canScan() ? { background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", color: "#000", boxShadow: "0 0 30px rgba(0,212,255,0.35)" } : { background: "rgba(255,255,255,0.05)", color: "#A0A0B8", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Scan Now
                </div>
              </button>

              {tab === "text" && text.length < 50 && (
                <p className="text-center text-xs text-[#A0A0B8]">Minimum 50 characters required for accurate analysis</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
