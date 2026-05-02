import { Link } from "wouter";
import { motion } from "framer-motion";
import { Monitor, Check, Zap, Globe, Shield } from "lucide-react";

const STEPS = [
  { n: "1", title: "Add to Chrome", desc: "Click the button below and add TruthLens to your browser in one click." },
  { n: "2", title: "Pin the Extension", desc: "Click the puzzle icon in Chrome and pin TruthLens for quick access." },
  { n: "3", title: "Start Scanning", desc: "Right-click any content on any webpage and select 'Scan with TruthLens'." },
];

const FEATURES = [
  { icon: Globe, title: "Right-click any content", desc: "Select text, images, or right-click a page to instantly scan it." },
  { icon: Zap, title: "Instant popup verdict", desc: "Get a verdict and confidence score without leaving the page." },
  { icon: Shield, title: "Auto-scan mode", desc: "Optional: automatically flag suspicious AI-generated content as you browse." },
  { icon: Check, title: "Sync with dashboard", desc: "All extension scans are saved to your TruthLens history." },
];

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/5">
        <Link href="/" className="font-bold text-lg">TruthLens</Link>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-[#A0A0B8] hover:text-white px-4 py-2 transition-colors">Sign In</Link>
          <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>Get Started</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20 space-y-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6" style={{ background: "rgba(123,47,255,0.1)", border: "1px solid rgba(123,47,255,0.2)", color: "#7B2FFF" }}>
            Desktop and Laptop Only
          </span>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", boxShadow: "0 0 40px rgba(123,47,255,0.4)" }}>
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold mb-4">TruthLens for Chrome</h1>
          <p className="text-[#A0A0B8] text-xl mb-8 max-w-2xl mx-auto">Detect AI-generated content anywhere on the web with a single right-click. Available for Chrome, Brave, and Edge.</p>
          <button className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", boxShadow: "0 0 30px rgba(123,47,255,0.45)" }}>
            <Monitor className="w-5 h-5" />
            Add to Chrome — It's Free
          </button>
          <p className="mt-3 text-sm text-[#A0A0B8]">Works on Chrome 88+, Brave, and Microsoft Edge</p>
        </motion.div>

        {/* Steps */}
        <div>
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-10">Up and Running in 60 Seconds</motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map(({ n, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-panel rounded-xl p-6">
                <div className="text-4xl font-black text-gradient-primary font-mono mb-4">{n}</div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-[#A0A0B8] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl font-bold text-center mb-10">Everything You Need</motion.h2>
          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="glass-panel rounded-xl p-5 flex gap-4 hover:scale-[1.01] transition-transform">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)" }}>
                  <Icon className="w-5 h-5 text-[#7B2FFF]" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{title}</div>
                  <div className="text-sm text-[#A0A0B8]">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center glass-panel rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-3">Ready to Scan the Web?</h2>
          <p className="text-[#A0A0B8] mb-6">Join thousands of journalists, educators, and researchers already using TruthLens.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", boxShadow: "0 0 24px rgba(123,47,255,0.4)" }}>
              <Monitor className="w-5 h-5" />
              Add to Chrome
            </button>
            <Link href="/signup" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[#00D4FF] transition-all hover:scale-105" style={{ border: "1px solid rgba(0,212,255,0.3)", background: "rgba(0,212,255,0.05)" }}>
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
