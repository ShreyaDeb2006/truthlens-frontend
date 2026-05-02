import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate(
      { data: { name, email, password } },
      {
        onSuccess: (data) => {
          login(data.token);
          navigate("/dashboard");
        },
        onError: (err: any) => setError(err?.response?.data?.message || "Registration failed. Please try again."),
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 70% 30%, rgba(123,47,255,0.05) 0%, transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 30% 70%, rgba(0,212,255,0.04) 0%, transparent 60%)" }} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#00D4FF]/20 border border-[#00D4FF]/30 flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}>
              <Shield className="w-5 h-5 text-[#00D4FF]" />
            </div>
            <span className="font-bold text-xl">TruthLens</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-[#A0A0B8]">Start detecting AI content for free</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", color: "#FF4444" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#A0A0B8] mb-2">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0A0B8] mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A0A0B8] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm text-white placeholder-[#A0A0B8] outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(0,212,255,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0B8] hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 rounded-lg font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)", boxShadow: "0 0 24px rgba(0,212,255,0.3)" }}
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A0A0B8]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#00D4FF] hover:underline font-medium">Sign in</Link>
          </p>
          <p className="mt-3 text-center text-xs text-[#A0A0B8]">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
