import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Copy, RefreshCw, Eye, EyeOff, Shield, Key, User, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const fakeKey = "sk-tl-a3f2b891-4c7d-11ef-9f2a-0242ac120003";

  const handleCopy = () => {
    navigator.clipboard.writeText(fakeKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePwSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return;
    setPwSuccess(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-[#A0A0B8]">Manage your account and API access</p>
        </div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-[#00D4FF]" />
            <h2 className="font-bold text-lg">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0B8] mb-1.5">Full Name</label>
              <input value={user?.name || ""} readOnly className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div>
              <label className="block text-sm text-[#A0A0B8] mb-1.5">Email Address</label>
              <input value={user?.email || ""} readOnly className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
            <div>
              <label className="block text-sm text-[#A0A0B8] mb-1.5">Plan</label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-lg text-sm font-medium" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00D4FF" }}>
                  {(user as any)?.tier || "free"} Plan
                </div>
                <span className="text-sm text-[#A0A0B8]">
                  {(user as any)?.scanCount || 0} scans made
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#7B2FFF]" />
            <h2 className="font-bold text-lg">Change Password</h2>
          </div>
          {pwSuccess && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", color: "#00FF88" }}>
              Password changed successfully.
            </div>
          )}
          <form onSubmit={handlePwSave} className="space-y-4">
            {[
              { label: "Current Password", key: "current" },
              { label: "New Password", key: "next" },
              { label: "Confirm New Password", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-[#A0A0B8] mb-1.5">{label}</label>
                <input
                  type="password"
                  value={(pwForm as any)[key]}
                  onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(123,47,255,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            ))}
            <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #7B2FFF, #FF2D87)", color: "#fff" }}>
              Update Password
            </button>
          </form>
        </motion.div>

        {/* API Key */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-5 h-5 text-[#FFB800]" />
            <h2 className="font-bold text-lg">API Access</h2>
          </div>
          <div className="p-3 rounded-lg mb-4 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <code className="flex-1 text-sm font-mono text-[#A0A0B8] truncate">
              {showKey ? fakeKey : fakeKey.replace(/[a-f0-9-]{8,}/g, (m) => "•".repeat(m.length))}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="text-[#A0A0B8] hover:text-white transition-colors p-1">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
              style={{ background: copied ? "rgba(0,255,136,0.1)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: copied ? "#00FF88" : "#A0A0B8" }}>
              <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Key"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#A0A0B8] hover:text-white transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          </div>
          <p className="mt-3 text-xs text-[#A0A0B8]">Include as <span className="font-mono text-[#00D4FF]">Authorization: Bearer &lt;key&gt;</span> in API requests.</p>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="glass-panel rounded-2xl p-6" style={{ border: "1px solid rgba(255,68,68,0.15)" }}>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#FF4444]" />
            <h2 className="font-bold text-lg text-[#FF4444]">Danger Zone</h2>
          </div>
          <p className="text-sm text-[#A0A0B8] mb-4">Deleting your account is permanent and cannot be undone. All your scans and data will be removed.</p>
          {showDeleteDialog ? (
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)" }}>
              <p className="text-sm font-semibold mb-3">Are you sure? This action cannot be reversed.</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#FF4444" }}>Yes, Delete My Account</button>
                <button onClick={() => setShowDeleteDialog(false)} className="px-4 py-2 rounded-lg text-sm text-[#A0A0B8] border border-white/10">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowDeleteDialog(true)} className="px-4 py-2 rounded-lg text-sm font-semibold text-[#FF4444] transition-all hover:bg-[#FF4444]/10"
              style={{ border: "1px solid rgba(255,68,68,0.3)" }}>
              Delete Account
            </button>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
