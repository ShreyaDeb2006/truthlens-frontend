import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    desc: "Perfect for individual use and occasional checks",
    features: ["5 scans per day", "Text analysis only", "Basic confidence score", "7-day scan history", "Community support"],
    notIncluded: ["Image / video / audio scans", "PDF document scanner", "PDF report export", "API access", "Priority processing"],
    highlight: false,
    cta: "Get Started Free",
    href: "/signup",
    color: "#A0A0B8",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For power users, journalists, and researchers",
    features: ["Unlimited scans", "All content types", "Document OCR scanner", "PDF report export", "API access (10k req/mo)", "Priority processing", "90-day history", "Email support"],
    notIncluded: ["White-label solution", "Custom SLA"],
    highlight: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
    href: "/signup",
    color: "#00D4FF",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For universities, newsrooms, and large organizations",
    features: ["Everything in Pro", "White-label solution", "Custom API limits", "SSO / SAML auth", "Dedicated SLA", "Compliance reports", "Bulk scanning API", "24/7 priority support", "Custom model training"],
    notIncluded: [],
    highlight: false,
    cta: "Contact Sales",
    href: "/login",
    color: "#7B2FFF",
  },
];

const COMPARE = [
  { feature: "Daily scan limit", free: "5/day", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Text analysis", free: true, pro: true, enterprise: true },
  { feature: "Image detection", free: false, pro: true, enterprise: true },
  { feature: "Video deepfake", free: false, pro: true, enterprise: true },
  { feature: "Audio analysis", free: false, pro: true, enterprise: true },
  { feature: "News URL check", free: false, pro: true, enterprise: true },
  { feature: "Document OCR", free: false, pro: true, enterprise: true },
  { feature: "PDF report export", free: false, pro: true, enterprise: true },
  { feature: "API access", free: false, pro: "10k req/mo", enterprise: "Custom" },
  { feature: "History retention", free: "7 days", pro: "90 days", enterprise: "Unlimited" },
  { feature: "White-label", free: false, pro: false, enterprise: true },
  { feature: "Custom SLA", free: false, pro: false, enterprise: true },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Nav */}
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/5">
        <Link href="/" className="font-bold text-lg">TruthLens</Link>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-[#A0A0B8] hover:text-white px-4 py-2 transition-colors">Sign In</Link>
          <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>Get Started</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-[#A0A0B8] text-xl max-w-2xl mx-auto">No hidden fees. Start free, upgrade when you need more power.</p>
        </motion.div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(({ name, price, period, desc, features, notIncluded, highlight, badge, cta, href, color }, i) => (
            <motion.div key={name} custom={i} variants={fadeUp} initial="hidden" animate="visible"
              className="glass-panel rounded-2xl p-8 flex flex-col relative"
              style={highlight ? { border: `1px solid ${color}40`, boxShadow: `0 0 50px ${color}20` } : {}}>
              {badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>
                  {badge}
                </span>
              )}
              <div className="mb-6">
                <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color }}>{name}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-black">{price}</span>
                  <span className="text-[#A0A0B8] mb-1.5 text-lg">{period}</span>
                </div>
                <p className="text-sm text-[#A0A0B8]">{desc}</p>
              </div>

              <div className="space-y-2.5 mb-6 flex-1">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color }} />
                    <span className="text-white">{f}</span>
                  </div>
                ))}
                {notIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <X className="w-4 h-4 flex-shrink-0 text-white/20" />
                    <span className="text-[#A0A0B8] line-through">{f}</span>
                  </div>
                ))}
              </div>

              <Link href={href} className="block text-center py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={highlight ? { background: `linear-gradient(135deg, ${color}, #7B2FFF)`, color: "#000", boxShadow: `0 0 24px ${color}40` } : { border: `1px solid ${color}30`, color, background: `${color}10` }}>
                {cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-xl font-bold">Full Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-[#A0A0B8] font-medium">Feature</th>
                  {["Free", "Pro", "Enterprise"].map((p) => (
                    <th key={p} className="px-6 py-4 text-center font-semibold">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {COMPARE.map(({ feature, free, pro, enterprise }) => (
                  <tr key={feature} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-3.5 text-[#A0A0B8]">{feature}</td>
                    {[free, pro, enterprise].map((val, i) => (
                      <td key={i} className="px-6 py-3.5 text-center">
                        {typeof val === "boolean" ? (
                          val ? <Check className="w-4 h-4 mx-auto text-[#00FF88]" /> : <X className="w-4 h-4 mx-auto text-white/20" />
                        ) : (
                          <span className="font-medium text-white">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ CTA */}
        <div className="mt-16 text-center">
          <p className="text-[#A0A0B8] mb-4">Questions? We're happy to help.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/docs" className="px-6 py-3 rounded-lg text-sm border border-white/15 text-[#A0A0B8] hover:text-white transition-colors">View API Docs</Link>
            <Link href="/signup" className="px-6 py-3 rounded-lg text-sm font-semibold text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>Start for Free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
