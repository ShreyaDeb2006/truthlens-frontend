import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { Shield, Zap, FileText, Image, Video, Music, Globe, FileSearch, Check, ChevronRight } from "lucide-react";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      bright: Math.random() > 0.85,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.bright) {
          ctx.fillStyle = "rgba(0,212,255,0.8)";
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#00D4FF";
        } else {
          ctx.fillStyle = "rgba(123,47,255,0.3)";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function AnimatedGauge({ value }: { value: number }) {
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color = value > 70 ? "#FF4444" : value > 40 ? "#FFB800" : "#00FF88";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          transform="rotate(-90 60 60)"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
        <text x="60" y="56" textAnchor="middle" fill={color} fontSize="18" fontWeight="700" fontFamily="JetBrains Mono, monospace">{value}%</text>
        <text x="60" y="72" textAnchor="middle" fill="#A0A0B8" fontSize="9" fontFamily="Inter, sans-serif">AI Confidence</text>
      </svg>
    </div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const DETECTION_TYPES = [
  { icon: FileText, label: "Text Analysis", color: "#00D4FF" },
  { icon: Image, label: "Image Detection", color: "#7B2FFF" },
  { icon: Video, label: "Video Forensics", color: "#FF2D87" },
  { icon: Music, label: "Audio Deepfake", color: "#00FF88" },
  { icon: Globe, label: "News Verification", color: "#FFB800" },
  { icon: FileSearch, label: "Document OCR", color: "#00D4FF" },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: ["5 scans per day", "Text analysis only", "Basic results", "7-day history"],
    highlight: false,
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: ["Unlimited scans", "All content types", "PDF reports", "API access", "Priority processing", "90-day history"],
    highlight: true,
    cta: "Start Free Trial",
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["White-label solution", "Dedicated SLA", "Custom API limits", "SSO / SAML", "Compliance reports", "24/7 support"],
    highlight: false,
    cta: "Contact Sales",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12" style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#00D4FF]/20 border border-[#00D4FF]/30 flex items-center justify-center" style={{ boxShadow: "0 0 16px rgba(0,212,255,0.3)" }}>
            <Shield className="w-4 h-4 text-[#00D4FF]" />
          </div>
          <span className="font-bold text-lg tracking-tight">TruthLens</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-[#A0A0B8]">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          <Link href="/extension" className="hover:text-white transition-colors">Extension</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[#A0A0B8] hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <ParticleCanvas />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 70% 60%, rgba(123,47,255,0.05) 0%, transparent 70%)" }} />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
              AI Content Detection Platform
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Detect AI.{" "}
            <span className="text-gradient-primary">Scan Documents.</span>
            <br />Verify Reality.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="text-lg md:text-xl text-[#A0A0B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Military-grade AI detection for text, images, video, audio, and documents. Used by educators, journalists, and enterprises to verify content authenticity in seconds.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/scan" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-black transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}>
              <Zap className="w-5 h-5" /> Scan Content
            </Link>
            <Link href="/document-scan" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-[#7B2FFF] transition-all hover:scale-105" style={{ border: "1px solid rgba(123,47,255,0.5)", background: "rgba(123,47,255,0.08)" }}>
              <FileSearch className="w-5 h-5" /> Scan Document
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.6 }} className="inline-block">
            <AnimatedGauge value={94} />
          </motion.div>
        </div>
      </section>

      {/* Detection Types */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Every Format. Every Threat.</h2>
            <p className="text-[#A0A0B8] text-lg max-w-2xl mx-auto">TruthLens runs multi-model ensemble detection across all content types simultaneously.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DETECTION_TYPES.map(({ icon: Icon, label, color }) => (
              <motion.div key={label} variants={fadeUp} className="glass-panel rounded-xl p-6 flex flex-col items-center gap-4 hover:scale-105 transition-transform cursor-default" style={{ boxShadow: `0 0 30px ${color}10` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <span className="font-semibold text-sm">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Precision in 3 Steps</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              { step: "01", title: "Upload Content", desc: "Drag and drop any file — image, video, audio, PDF, or paste text and URLs directly." },
              { step: "02", title: "Multi-Model Scan", desc: "Our ensemble of 6+ AI models analyzes your content in parallel for maximum accuracy." },
              { step: "03", title: "Instant Verdict", desc: "Get a confidence score, per-model breakdown, and highlighted evidence — in seconds." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-panel rounded-xl p-8 relative">
                <div className="text-5xl font-black mb-4 text-gradient-primary font-mono">{item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#A0A0B8] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: "10M+", label: "Scans Processed" },
              { value: "94.7%", label: "Detection Accuracy" },
              { value: "2,847", label: "Universities Trust Us" },
            ].map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="flex flex-col gap-2">
                <span className="text-5xl font-black text-[#00D4FF] font-mono" style={{ textShadow: "0 0 30px rgba(0,212,255,0.5)" }}>{value}</span>
                <span className="text-[#A0A0B8] font-medium">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {[
            {
              title: "AI Detection Engine",
              color: "#00D4FF",
              features: ["Text & writing style analysis", "Image GAN/diffusion detection", "Audio voice synthesis detection", "Video deepfake forensics", "Fake news URL verification"],
            },
            {
              title: "Document Scanner",
              color: "#7B2FFF",
              features: ["OCR text extraction from PDFs", "Sentence-level AI probability", "Keyword and topic analysis", "Annotated report download", "Batch document processing"],
            },
          ].map(({ title, color, features }) => (
            <motion.div key={title} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel rounded-2xl p-8 hover:scale-[1.02] transition-transform" style={{ boxShadow: `0 0 40px ${color}15` }}>
              <div className="w-10 h-10 rounded-lg mb-6 flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                <Shield className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color }}>{title}</h3>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[#A0A0B8]">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Chrome Extension */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-4 inline-block" style={{ background: "rgba(123,47,255,0.1)", border: "1px solid rgba(123,47,255,0.2)", color: "#7B2FFF" }}>Chrome Extension</span>
            <h2 className="text-4xl font-bold mb-4 mt-2">Scan Anywhere, Instantly</h2>
            <p className="text-[#A0A0B8] text-lg mb-8">Right-click any content on the web and get an AI verdict without leaving the page.</p>
            <Link href="/extension" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", boxShadow: "0 0 30px rgba(123,47,255,0.4)" }}>
              Download for Chrome <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map(({ name, price, period, features, highlight, cta, badge }) => (
              <motion.div key={name} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="glass-panel rounded-2xl p-8 flex flex-col relative" style={highlight ? { border: "1px solid rgba(0,212,255,0.4)", boxShadow: "0 0 40px rgba(0,212,255,0.15)" } : {}}>
                {badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>{badge}</span>}
                <div className="mb-6">
                  <div className="text-[#A0A0B8] text-sm font-semibold uppercase tracking-wider mb-2">{name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-[#A0A0B8] mb-1">{period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#A0A0B8]">
                      <Check className="w-4 h-4 text-[#00FF88] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="block text-center py-3 rounded-lg font-semibold transition-all hover:scale-105" style={highlight ? { background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", color: "#000" } : { border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}>
                  {cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#00D4FF]/20 border border-[#00D4FF]/30 flex items-center justify-center">
              <Shield className="w-3 h-3 text-[#00D4FF]" />
            </div>
            <span className="font-bold">TruthLens</span>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-[#A0A0B8]">
            <Link href="/docs" className="hover:text-white transition-colors">API Docs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/extension" className="hover:text-white transition-colors">Extension</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <div className="text-xs text-[#A0A0B8]">© 2025 TruthLens. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
