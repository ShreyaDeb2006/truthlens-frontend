import { useState } from "react";
import { Link } from "wouter";

const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">TruthLens API Overview</h2>
        <p className="text-[#A0A0B8] leading-relaxed">The TruthLens API provides programmatic access to our multi-model AI content detection platform. All endpoints are REST-based and return JSON responses.</p>
        <div className="p-4 rounded-xl" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)" }}>
          <div className="text-sm font-semibold text-[#00D4FF] mb-2">Base URL</div>
          <code className="text-sm font-mono text-white">/api</code>
        </div>
        <h3 className="text-lg font-semibold mt-6">Authentication</h3>
        <p className="text-[#A0A0B8] text-sm">All API requests require a Bearer token in the Authorization header:</p>
        <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`Authorization: Bearer sk-tl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`}
        </pre>
      </div>
    ),
  },
  {
    id: "auth",
    label: "Authentication",
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Authentication</h2>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Register</h3>
          <div className="text-xs px-2 py-0.5 rounded inline-block font-mono font-bold" style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}>POST /api/auth/register</div>
          <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`// Request body
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}

// Response 201
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "tier": "free",
    "scanCount": 0
  }
}`}
          </pre>
          <h3 className="text-lg font-semibold">Login</h3>
          <div className="text-xs px-2 py-0.5 rounded inline-block font-mono font-bold" style={{ background: "rgba(0,212,255,0.15)", color: "#00D4FF" }}>POST /api/auth/login</div>
          <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`// Request body
{
  "email": "jane@example.com",
  "password": "securepassword"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": { ... }
}`}
          </pre>
        </div>
      </div>
    ),
  },
  {
    id: "detection",
    label: "AI Detection API",
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">AI Detection API</h2>
        {[
          { method: "POST", path: "/api/scan/text", label: "Text Analysis", body: `{ "content": "Your text to analyze (min 50 chars)" }` },
          { method: "POST", path: "/api/scan/image", label: "Image Detection", body: `// multipart/form-data\nfile: <image_file>` },
          { method: "POST", path: "/api/scan/audio", label: "Audio Analysis", body: `// multipart/form-data\nfile: <audio_file>` },
          { method: "POST", path: "/api/scan/video", label: "Video Forensics", body: `// multipart/form-data\nfile: <video_file>` },
          { method: "POST", path: "/api/scan/news", label: "News Verification", body: `{ "url": "https://example.com/article", "content": "Optional article text" }` },
        ].map(({ method, path, label, body }) => (
          <div key={path} className="space-y-2">
            <h3 className="text-lg font-semibold">{label}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#7B2FFF]/20 text-[#7B2FFF]">{method}</span>
              <code className="text-sm font-mono text-[#00D4FF]">{path}</code>
            </div>
            <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`${body}

// Response 200
{
  "id": "uuid",
  "status": "processing",
  "contentType": "${path.split('/').pop()}",
  "createdAt": "2025-01-01T00:00:00Z"
}`}
            </pre>
          </div>
        ))}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Get Scan Result</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#00D4FF]/15 text-[#00D4FF]">GET</span>
            <code className="text-sm font-mono text-[#00D4FF]">/api/scan/:id</code>
          </div>
          <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`// Response 200
{
  "id": "uuid",
  "status": "complete",
  "contentType": "text",
  "confidence": "94.7",
  "verdict": "AI",
  "verdictLabel": "Likely AI Generated",
  "models": [
    { "name": "GPTZero", "score": 96.2, "verdict": "AI", "status": "success" },
    { "name": "Sapling AI", "score": 91.4, "verdict": "AI", "status": "success" }
  ],
  "failedModels": 0,
  "createdAt": "2025-01-01T00:00:00Z",
  "completedAt": "2025-01-01T00:00:08Z"
}`}
          </pre>
        </div>
      </div>
    ),
  },
  {
    id: "documents",
    label: "Document Scanner API",
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Document Scanner API</h2>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Scan Document</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#7B2FFF]/20 text-[#7B2FFF]">POST</span>
            <code className="text-sm font-mono text-[#00D4FF]">/api/document</code>
          </div>
          <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`// multipart/form-data
file: <pdf_or_image_file>  // max 50MB

// Response 200
{
  "id": "uuid",
  "status": "processing",
  "fileName": "research.pdf"
}`}
          </pre>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Get Document Result</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#00D4FF]/15 text-[#00D4FF]">GET</span>
            <code className="text-sm font-mono text-[#00D4FF]">/api/document/:id</code>
          </div>
          <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
{`// Response 200
{
  "id": "uuid",
  "status": "complete",
  "fileName": "research.pdf",
  "confidence": "87.3",
  "verdict": "AI",
  "verdictLabel": "Likely AI Generated",
  "ocrText": "Full extracted text...",
  "sections": [
    { "sectionIndex": 0, "text": "Intro paragraph...", "aiProbability": 0.91, "highlightColor": "red" }
  ],
  "keywords": ["machine learning", "neural network"],
  "summary": "This document shows strong indicators..."
}`}
          </pre>
        </div>
      </div>
    ),
  },
];

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const current = SECTIONS.find(s => s.id === active);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/5 sticky top-0 z-50" style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)" }}>
        <Link href="/" className="font-bold text-lg">TruthLens</Link>
        <span className="text-sm text-[#A0A0B8]">API Reference</span>
        <Link href="/signup" className="text-sm font-semibold px-4 py-2 rounded-lg text-black" style={{ background: "linear-gradient(135deg, #00D4FF, #7B2FFF)" }}>Get API Key</Link>
      </nav>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto py-8 px-4 border-r border-white/5 hidden md:block">
          <div className="text-xs font-semibold text-[#A0A0B8] uppercase tracking-wider mb-4 px-2">Reference</div>
          <nav className="space-y-1">
            {SECTIONS.map(({ id, label }) => (
              <button key={id} onClick={() => setActive(id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
                style={active === id ? { background: "rgba(0,212,255,0.1)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.2)" } : { color: "#A0A0B8" }}>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-12 px-8 max-w-3xl">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto md:hidden">
            {SECTIONS.map(({ id, label }) => (
              <button key={id} onClick={() => setActive(id)}
                className="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap"
                style={active === id ? { background: "rgba(0,212,255,0.15)", color: "#00D4FF" } : { color: "#A0A0B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="text-[#A0A0B8] [&_h2]:text-white [&_h3]:text-white">
            {current?.content}
          </div>
        </main>
      </div>
    </div>
  );
}
