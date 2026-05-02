import { Link } from "wouter";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
            <Shield className="w-10 h-10 text-[#00D4FF]" />
          </div>
          <div className="text-8xl font-black text-gradient-primary font-mono mb-4">404</div>
          <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
          <p className="text-[#A0A0B8] mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/" className="inline-block px-6 py-3 rounded-xl font-semibold text-black transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", boxShadow: "0 0 24px rgba(0,212,255,0.3)" }}>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
