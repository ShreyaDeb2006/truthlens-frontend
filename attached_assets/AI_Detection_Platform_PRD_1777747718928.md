# Product Requirements Document (PRD)
# TruthLens — AI Content Detection & Document Scanner Platform

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** May 2026  
**Document Owner:** Product Team  

---

## Table of Contents

1. [App Vision](#1-app-vision)  
2. [Features List](#2-features-list)  
3. [User Flows](#3-user-flows)  
4. [Design Reference](#4-design-reference)  
5. [Tech Constraints](#5-tech-constraints)  
6. [Acceptance Criteria](#6-acceptance-criteria)  
7. [Out of Scope — V1](#7-out-of-scope--v1)  
8. [Problem We Are Facing](#8-problem-we-are-facing)  
9. [Suggested Architecture](#9-suggested-architecture)  
10. [API Structure](#10-api-structure)  

---

## 1. App Vision

### Product Summary

**TruthLens** is a premium AI-powered content authenticity platform that enables users to upload or input videos, images, audio, documents, fake news articles, and text to instantly determine whether the content is AI-generated or human-made. The platform integrates multiple third-party AI detection APIs, orchestrates their results, and surfaces a unified confidence score with detailed breakdowns per file.

### Core Mission

> _"Detect AI. Scan Documents. Verify Reality."_

TruthLens empowers individuals and organizations to confidently verify the authenticity of digital content — protecting academic integrity, safeguarding hiring pipelines, defending journalistic credibility, and helping the general public navigate an increasingly synthetic media landscape.

### Target Users

| Segment | Primary Use Case | Pain Point Solved |
|---|---|---|
| Students & Educators | Checking assignments for AI-generated content | Manual review is time-consuming and unreliable |
| Content Creators | Verifying originality of their work or others' | Risk of publishing synthetic / derivative content |
| Recruiters & HR Teams | Validating candidate-submitted work samples | AI-generated portfolios and cover letters |
| Journalists & Fact-checkers | Detecting AI-written news or deepfake media | Fake news, synthetic video, AI audio manipulation |
| General Public | Identifying AI-generated media encountered online | Confusion about what is real in digital media |

### Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Average scan result time | < 8 seconds per file |
| Detection accuracy | ≥ 90% on benchmark datasets |
| User trust score (survey) | ≥ 4.2 / 5.0 |
| Monthly active users | 10,000+ |
| Chrome Extension DAU | 2,000+ |
| API uptime | ≥ 99.5% |

### Platform Scope

- **Web Application** — Accessible on desktop and mobile browsers
- **Chrome Extension** — Desktop/laptop only; connects to the same backend API
- **Developer API** — Public-facing REST API for third-party integrations

---

## 2. Features List

### Priority Legend

- **P0 — Critical:** Must be in V1 launch. Product cannot ship without it.
- **P1 — High:** Should be in V1. Significantly impacts user value.
- **P2 — Medium:** Important for retention. Can ship in V1.1 patch.
- **P3 — Low:** Nice to have. Scheduled for V2+.

---

### 2.1 Content Detection Module

| # | Feature | Priority | Notes |
|---|---|---|---|
| F-01 | Upload Image for AI detection | P0 | JPG, PNG, WEBP, GIF; max 20MB |
| F-02 | Upload Video for AI detection | P0 | MP4, MOV, AVI; max 500MB |
| F-03 | Upload Audio for AI detection | P0 | MP3, WAV, M4A; max 100MB |
| F-04 | Paste / upload Text for detection | P0 | Max 50,000 characters |
| F-05 | Real-time scanning with progress indicator | P0 | Animated scan progress bar |
| F-06 | Multi-API orchestration per file type | P0 | Min 2 APIs per content type |
| F-07 | Unified confidence score (0–100%) | P0 | Aggregated weighted result |
| F-08 | Per-API breakdown result | P1 | Show each API's individual score |
| F-09 | Detailed results page per scan | P1 | Charts, explanations, model breakdown |
| F-10 | "Likely AI" / "Likely Human" verdict label | P1 | Clear verdict at the top of results |
| F-11 | Highlighted suspicious text segments | P1 | Highlight in different colors by confidence |
| F-12 | Downloadable PDF report | P2 | Auto-generated scan report |
| F-13 | Fake news detection (text/URL) | P1 | URL input + text paste |
| F-14 | Fake document detection | P1 | Metadata + content analysis |
| F-15 | File type and size validation | P0 | Frontend + backend validation |
| F-16 | Scan history saved per user | P1 | Tied to authenticated account |

---

### 2.2 AI Document Scanner Module

| # | Feature | Priority | Notes |
|---|---|---|---|
| D-01 | Upload PDF / image of document | P0 | PDF, JPG, PNG; max 50MB |
| D-02 | Drag & drop upload interface | P1 | Supported on both desktop and mobile |
| D-03 | OCR text extraction (Tesseract / API) | P0 | Must handle scanned PDFs |
| D-04 | AI detection on extracted text | P0 | Post-OCR pipeline |
| D-05 | Highlighted suspicious sections in viewer | P1 | Color-coded inline highlights |
| D-06 | Summary generation of document | P2 | LLM-generated brief summary |
| D-07 | Keyword extraction | P2 | Top 10 relevant keywords |
| D-08 | Confidence score per document | P0 | Section-level + overall |
| D-09 | Download processed document / report | P2 | PDF with annotations |
| D-10 | OCR scanning animation | P1 | Engaging visual feedback |

---

### 2.3 Platform & Infrastructure

| # | Feature | Priority | Notes |
|---|---|---|---|
| P-01 | User registration and login | P0 | Email + OAuth (Google) |
| P-02 | JWT-based session management | P0 | Secure auth tokens |
| P-03 | User dashboard (overview + quick actions) | P1 | Activity summary, quick scan |
| P-04 | Scan history page (AI + Document tabs) | P1 | Paginated, filterable |
| P-05 | Chrome Extension integration via API | P0 | Extension already built; API contract required |
| P-06 | Admin panel: API key management | P1 | Rotate, monitor, disable third-party API keys |
| P-07 | Error handling & fallback when APIs fail | P0 | Graceful degradation with partial results |
| P-08 | Rate limiting per user tier | P1 | Free: 5 scans/day; Pro: unlimited |
| P-09 | API key issuance for developers | P2 | Developer tier access |
| P-10 | Developer documentation page | P2 | /docs with request/response examples |
| P-11 | Pricing page | P1 | Free, Pro, Enterprise tiers |
| P-12 | Settings page | P2 | Profile, notifications, API keys |

---

## 3. User Flows

### Flow 1: User Uploads a File and Gets Detection Result

```
[User arrives at /scan]
    │
    ▼
[Selects content type tab: Image / Video / Audio]
    │
    ▼
[Clicks upload area or drags and drops file]
    │
    ▼
[Frontend validates: file type, file size]
    │
    ├── [FAIL] → Show inline error message ("File too large. Max size: 20MB")
    │
    ▼
[File uploaded to backend storage (S3/Supabase)]
    │
    ▼
[Backend creates scan job with unique scan_id]
    │
    ▼
[Backend orchestrates calls to multiple detection APIs in parallel]
    │
    ▼
[Frontend shows animated scanning progress bar]
    │
    ▼
[Backend aggregates API results → calculates unified confidence score]
    │
    ▼
[Redirect user to /results/:scan_id]
    │
    ▼
[Results page renders:
  - AI probability gauge (circular graph)
  - Verdict label ("Likely AI Generated")
  - Per-API breakdown table
  - Radar chart + Line graph
  - Download Report button]
    │
    ▼
[Scan saved to user's history (if logged in)]
```

---

### Flow 2: User Pastes Text and Gets Detection Result

```
[User arrives at /scan → selects "Text" tab]
    │
    ▼
[User pastes or types text into textarea]
    │
    ▼
[Character count shown; max 50,000 characters]
    │
    ▼
[User clicks "Scan Text"]
    │
    ▼
[Frontend sends POST /api/scan/text with { content: "..." }]
    │
    ▼
[Backend sends text to text-detection APIs (e.g., Sapling, Copyleaks, ZeroGPT)]
    │
    ▼
[Results aggregated → confidence score computed]
    │
    ▼
[/results/:scan_id renders:
  - Confidence score
  - Highlighted suspicious sentences/paragraphs
  - Per-sentence AI probability
  - Model-by-model breakdown]
    │
    ▼
[Scan saved to history]
```

---

### Flow 3: User Logs In and Views Scan History

```
[User visits /login]
    │
    ▼
[Enters email + password OR clicks "Continue with Google"]
    │
    ▼
[Backend authenticates → issues JWT token]
    │
    ▼
[Redirect to /dashboard]
    │
    ▼
[Dashboard shows:
  - Recent scan activity cards
  - Shortcut buttons: "New Scan", "New Document Scan"
  - Quick stats: total scans, AI detected %, this week]
    │
    ▼
[User navigates to /history]
    │
    ▼
[Tabs shown: "AI Scans" | "Document Scans"]
    │
    ▼
[Each row shows: file name, type, date, verdict, confidence %, action buttons]
    │
    ▼
[User clicks a row → redirected to /results/:scan_id]
```

---

### Flow 4: Chrome Extension Sends Data to Website API

```
[User is browsing a webpage]
    │
    ▼
[User right-clicks an image / selects text → "Scan with TruthLens"]
    │
    ▼
[Extension extracts content (image URL / selected text)]
    │
    ▼
[Extension sends POST to https://api.truthlens.io/api/scan
  Headers: { Authorization: Bearer <user_token>, X-Extension-Version: "1.x" }
  Body: { type: "image" | "text", content: "...", source_url: "..." }]
    │
    ▼
[API validates token → routes to appropriate scan pipeline]
    │
    ▼
[API returns: { scan_id, verdict, confidence, result_url }]
    │
    ▼
[Extension displays inline popup with verdict + confidence score]
    │
    ▼
[Extension shows link: "View Full Report" → opens /results/:scan_id in new tab]
    │
    ▼
[Scan saved to user's history on dashboard]
```

---

### Flow 5: User Uploads Document for AI Document Scanning

```
[User navigates to /document-scan]
    │
    ▼
[Drag & drop or click to upload PDF or image]
    │
    ▼
[Frontend validates: PDF/JPG/PNG only; max 50MB]
    │
    ▼
[File uploaded to storage → OCR pipeline triggered]
    │
    ▼
[Animated OCR scanning effect shown in UI]
    │
    ▼
[OCR extracts full text from document pages]
    │
    ▼
[Extracted text sent to AI detection pipeline]
    │
    ▼
[Results returned: overall confidence + section-level scores]
    │
    ▼
[Redirect to /document-results/:id]
    │
    ▼
[Document results page shows:
  - Scrollable extracted text viewer
  - Highlighted suspicious passages (color-coded)
  - Summary box (AI-generated)
  - Keyword extraction panel
  - Download processed document button]
```

---

## 4. Design Reference

### 4.1 Design Philosophy

TruthLens must feel like a **premium AI SaaS product**, not a free utility tool. The UI should communicate intelligence, precision, and trust. Every visual element reinforces the core brand promise: *accuracy, authority, and cutting-edge technology*.

**Design Pillars:**
- **Dark Futuristic** — Deep dark backgrounds (#0A0A0F, #0D0D1A) with layered depth
- **Glassmorphism** — Frosted glass panels with subtle borders and blur
- **Neon Gradients** — Blue → Purple → Pink (`#00D4FF → #7B2FFF → #FF2D87`)
- **Glow Effects** — Neon glows on interactive elements, borders, and key data points
- **Motion** — Smooth Framer Motion transitions, animated graphs, scanning effects

---

### 4.2 Color System

```
Background Primary:    #0A0A0F
Background Secondary:  #0D0D1A
Background Card:       rgba(255,255,255,0.04) [glassmorphism]
Border Subtle:         rgba(255,255,255,0.08)

Neon Blue:             #00D4FF
Neon Purple:           #7B2FFF
Neon Pink:             #FF2D87
Neon Green:            #00FF88

Text Primary:          #FFFFFF
Text Secondary:        #A0A0B8
Text Muted:            #555570

Danger / AI Detected:  #FF4444
Warning / Uncertain:   #FFB800
Success / Human:       #00FF88
```

---

### 4.3 Typography

```
Font Family:  "Inter" (primary), "JetBrains Mono" (code / scores)
Heading 1:    48px / Bold / tracking: -0.03em
Heading 2:    32px / SemiBold
Heading 3:    24px / SemiBold
Body:         16px / Regular / line-height: 1.6
Caption:      13px / Regular / color: Text Muted
Mono Score:   28px / JetBrains Mono / Bold / color: Neon Blue
```

---

### 4.4 Page Structure

#### Page 1: Landing Page (`/`)

**Hero Section:**
- Animated particle/matrix background (canvas-based or Three.js)
- Large headline: `"Detect AI. Scan Documents. Verify Reality."`
- Sub-headline: `"The most advanced AI content detection platform — for images, video, audio, text, and documents."`
- Two primary CTA buttons: **[Scan Content]** (neon blue) / **[Scan Document]** (neon purple)
- Animated demo preview showing a confidence score gauge reaching 94%

**Module Cards Section:**
- Two floating glass cards side by side:
  - Card 1: AI Detection — icon grid showing Image, Video, Audio, Text, News
  - Card 2: Document Scanner — icon showing PDF scanning with OCR highlight effect
- Hover: cards glow with colored border

**How It Works Section:**
- 3-step animated flow (Upload → Scan → Results) with connecting animated lines

**Social Proof Section:**
- Logos of trust (universities, press), accuracy stats, number of scans run

**Chrome Extension Section:**
- Screenshot of extension popup in browser context
- Note: "Desktop & Laptop Only"
- Download CTA

**Pricing Preview:**
- 3-column card layout (Free / Pro / Enterprise)

**Footer:**
- Links, legal, social icons

---

#### Page 2: Dashboard (`/dashboard`)

**Layout:**
- Left sidebar: navigation links with icons
- Main area: two module cards at top (AI Detection + Document Scanner), each with a "New Scan" button
- Recent Activity table: last 10 scans with file name, type, date, verdict chip, confidence bar
- Stats row: Total Scans, AI Detected %, Scans This Week, Avg Confidence

**Verdict Chips:**
- `Likely AI` — Red/pink glow chip
- `Likely Human` — Green glow chip
- `Uncertain` — Yellow glow chip

---

#### Page 3: Scan Page (`/scan`)

**Layout:**
- Content type selector tabs at top: Image | Video | Audio | Text | News URL | Document
- Upload area: large dashed glass panel with drag & drop support, cloud icon, file type hints
- Text tab: large textarea with character counter
- "Scan Now" button — full-width gradient button, disabled until content loaded
- Status: scanning animation with rotating neon ring and step-by-step status ("Uploading... Analyzing... Fetching Results...")

---

#### Page 4: Document Scanner Page (`/document-scan`)

**Layout:**
- Upload panel: Drag & drop zone with PDF icon animation
- Supported formats badge: PDF | JPG | PNG
- After upload: OCR animation (horizontal scan line moving down the document preview)
- Extracted text preview panel appears on the right (scrollable)
- "Start AI Analysis" button activates after OCR completes
- Progress indicator: `OCR Complete → AI Analysis → Generating Report`

---

#### Page 5: Results Page (`/results/:id`)

**Layout:**
- **Top Section:**
  - Large circular radial gauge: 0–100% AI probability (animated fill)
  - Verdict label: `"LIKELY AI GENERATED"` in large bold text with red glow
  - Confidence: `94.7%` in mono font
  - File metadata: file name, type, scan date

- **Middle Section (Charts):**
  - Radar chart: shows how each detection model scored the content
  - Line graph: AI probability per text paragraph (for text scans) or per time segment (audio/video)
  - Per-model table: Model Name | Score | Verdict | Status (Pass/Fail/Error)

- **Why This Was Flagged (Trust UX):**
  - Text explanation of which signals triggered the detection
  - For text: highlighted suspicious sentences inline

- **Actions:**
  - `[Download Full Report]` (PDF)
  - `[Re-scan with More APIs]`
  - `[Share Results]` (copy link)

---

#### Page 6: Document Results Page (`/document-results/:id`)

**Layout:**
- Left panel: scrollable document text viewer with inline color-highlighted segments
  - Red highlight: High AI probability
  - Yellow highlight: Medium/uncertain
  - Green highlight: Low AI probability
- Right panel:
  - Overall confidence score with circular gauge
  - Summary box (AI-generated summary of document content)
  - Keyword cloud / list
  - Section-by-section confidence breakdown table
- Bottom: `[Download Annotated Document]` button

---

#### Page 7: History Page (`/history`)

- Tabs: `AI Scans` | `Document Scans`
- Each tab: searchable, filterable table
- Filter options: date range, verdict, content type
- Each row: thumbnail/icon | file name | type | date | verdict chip | confidence | actions (view, delete)

---

#### Page 8: Extension Page (`/extension`)

- Hero: "TruthLens for Chrome — Detect AI Anywhere You Browse"
- Desktop Only badge prominently shown
- 3-step install guide with screenshots
- Download CTA: `[Add to Chrome]`
- Feature list: right-click scanning, popup verdict, auto-scan on page load (optional)

---

#### Page 9: Documentation Page (`/docs`)

**Sidebar navigation + content area layout**

Sections:

**Overview**
- What TruthLens does
- Document Scanner module explanation
- API overview

**AI Detection API Reference**
```
POST /api/scan/image
POST /api/scan/video
POST /api/scan/audio
POST /api/scan/text
POST /api/scan/news
POST /api/scan/document
GET  /api/scan/:id
GET  /api/scans (list, paginated)
```

**Document Scanner API Reference**
```
POST /api/document/scan   → Upload + OCR + AI detection
GET  /api/document/:id    → Fetch result
```

**Request/Response Examples**
- Code blocks in JSON format with syntax highlighting
- cURL, JavaScript, Python examples

**Extension Integration**
- How to authenticate from extension
- Endpoint contract

---

#### Pages 10–13 (Supporting Pages)

- `/login` and `/signup` — Centered auth card, Google OAuth, email/password, animated gradient background
- `/settings` — Profile section, password change, notification preferences, API key display (masked)
- `/pricing` — 3 column cards: Free / Pro / Enterprise; feature comparison table; CTA buttons
- `/developers` — API key generation, usage stats, rate limit info, webhook setup (V2)

---

### 4.5 UI Component Library

| Component | Description |
|---|---|
| `<GlassCard>` | Dark glass panel with blur, border opacity, and optional glow |
| `<UploadBox>` | Dashed drag & drop zone with file type icons and hover states |
| `<DocumentUploadBox>` | Variant of UploadBox optimized for PDF/image documents |
| `<ConfidenceGauge>` | Animated radial SVG gauge; color shifts red/yellow/green by value |
| `<VerdictChip>` | Pill badge: "Likely AI", "Likely Human", "Uncertain" with glow |
| `<ScanProgress>` | Multi-step animated progress indicator with neon ring animation |
| `<OcrAnimation>` | Animated horizontal line scan effect over document preview |
| `<TextHighlighter>` | Inline text viewer that applies color highlights by AI confidence |
| `<RadarChart>` | Multi-model detection result radar (using Recharts or D3) |
| `<TimelineGraph>` | AI probability across document segments or audio timeline |
| `<ModelBreakdownTable>` | Per-API result table with status badges |
| `<SummaryBox>` | AI-generated document summary display panel |
| `<KeywordCloud>` | Visual keyword grid with frequency weighting |
| `<HistoryRow>` | Table row for scan history with thumbnail, metadata, actions |

---

### 4.6 Animations (Framer Motion)

| Animation | Trigger | Description |
|---|---|---|
| `pageSlide` | Route change | Horizontal slide + fade between pages |
| `gaugeReveal` | Results page load | Gauge fills from 0 to final value over 1.2s |
| `highlightReveal` | Text viewer mount | Highlights fade in staggered over 0.8s |
| `ocrScan` | OCR processing | Glowing line sweeps document top-to-bottom |
| `cardHover` | Glass card hover | Border glow intensifies, subtle lift shadow |
| `scanPulse` | Scan in progress | Neon ring pulses with breathing scale animation |
| `chartDraw` | Chart mount | Lines and bars animate in from left/bottom |
| `glowButton` | CTA hover | Gradient border appears, background glow blooms |

---

## 5. Tech Constraints

### 5.1 Frontend

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for landing/SEO; client for dashboard |
| Styling | Tailwind CSS + custom CSS vars | Utility classes + design tokens |
| Animation | Framer Motion | All transitions and micro-animations |
| Charts | Recharts + D3.js | Radar, line, gauge charts |
| File Upload | react-dropzone | Drag & drop + click-to-upload |
| State | Zustand | Lightweight global state for scan jobs |
| Auth | NextAuth.js | Session management, Google OAuth |
| Forms | React Hook Form + Zod | Validation, error handling |

---

### 5.2 Backend

| Concern | Choice | Notes |
|---|---|---|
| Runtime | Node.js 20 LTS | Primary backend runtime |
| Framework | Express.js OR Next.js API Routes | REST API endpoints |
| Auth | JWT (access + refresh token pattern) | 15min access / 7d refresh |
| File Handling | Multer (Express) or Next.js body parser | Multipart form data |
| Queue | BullMQ (Redis-backed) | Async job queue for heavy scans |
| OCR | Tesseract.js (server-side) OR Google Vision API | Fallback chain |
| Database ORM | Prisma | Type-safe DB access |

---

### 5.3 Storage

| Resource | Provider | Notes |
|---|---|---|
| File storage | AWS S3 OR Supabase Storage | Uploaded media files |
| Database | PostgreSQL (via Supabase or RDS) | Users, scans, results |
| Cache/Queue | Redis (Upstash) | Rate limiting, job queue, session cache |
| CDN | CloudFront (AWS) OR Vercel Edge | Fast asset delivery |

**Storage Limits:**
- Images: max 20 MB
- Videos: max 500 MB (upload chunked)
- Audio: max 100 MB
- Documents (PDF): max 50 MB
- Text: max 50,000 characters
- Files deleted from storage after 30 days (configurable per tier)

---

### 5.4 External AI Detection APIs

| Content Type | API Provider (examples) | Fallback |
|---|---|---|
| Text | Sapling AI, ZeroGPT, Copyleaks, GPTZero | Consensus average |
| Image | Hive Moderation, AI or Not, Illuminarty | Second-provider fallback |
| Audio | Resemble Detect, AI Voice Detector API | Single provider + flag |
| Video | Microsoft Video Indexer, Hive | Frame-extraction + image API |
| Fake News | Google Fact Check API, ClaimBuster | Domain credibility API |
| Fake Documents | DocuSign API signals + custom heuristics | Metadata + content analysis |
| OCR | Google Vision API, Tesseract.js | Tesseract as offline fallback |

**API Rate Limits (estimated):**

| API | Free Tier Limit | Production Recommended |
|---|---|---|
| Sapling AI | 200 calls/month | 50,000 calls/month Pro |
| GPTZero | 100/month | 10,000/month Pro |
| Hive Moderation | 500/month free | Custom enterprise |
| Google Vision OCR | 1,000/month | Pay-as-you-go |

**API Key Security:**
- All third-party API keys stored as environment variables; never exposed to client
- Keys rotatable via admin panel without redeployment
- Per-key usage tracking stored in DB
- Keys encrypted at rest (AES-256) in secrets manager (AWS Secrets Manager or Doppler)

---

### 5.5 Chrome Extension Integration

The Chrome extension is **already built and working**. The website must expose a stable REST API that the extension communicates with.

**Extension API Contract:**

```
Base URL:     https://api.truthlens.io/v1
Auth:         Bearer <JWT token> (user must be logged in)
Header:       X-Extension-Version: "1.x.x"
```

Required endpoints for extension:
- `POST /api/scan/text` — Text selected on page
- `POST /api/scan/image` — Image URL from page
- `POST /api/scan/news` — Full page URL for news detection
- `GET /api/scan/:id` — Poll for result

Extension polling strategy: Poll every 2s up to 30s; show timeout error if no result.

---

### 5.6 Security

| Concern | Mitigation |
|---|---|
| API key exposure | Server-side only; never sent to client |
| File upload abuse | MIME type validation + magic byte check on backend |
| XSS | Sanitize all user-input text; use DOMPurify before rendering |
| CSRF | SameSite cookies + CSRF tokens for state-changing endpoints |
| Rate limiting | Redis-based: 5 scans/day (free), 200/day (pro), per IP for unauthed |
| File path traversal | Randomized UUIDs for stored file paths |
| SQL injection | Parameterized queries via Prisma ORM |
| Secrets | Env vars only; never committed to repo; use secrets manager |
| Auth brute force | 5 failed login attempts → 15-minute lockout |

---

## 6. Acceptance Criteria

### Feature 1: File Upload Detection

**Scenario: User uploads a valid image file for AI detection**

```
GIVEN the user is on the /scan page and has selected the "Image" tab
WHEN the user uploads a JPG file of 5 MB
THEN the file should be accepted without error
  AND a scan job should be created with a unique scan_id
  AND the scanning progress animation should appear within 500ms
  AND the backend should call at least 2 image detection APIs
  AND the user should be redirected to /results/:scan_id within 15 seconds
  AND the results page should display a confidence score between 0% and 100%
  AND the per-model breakdown table should show at least 2 rows

GIVEN the user uploads a file exceeding 20 MB
WHEN the file is selected
THEN an inline error "File too large. Maximum size is 20MB." should appear
  AND no upload request should be sent to the backend

GIVEN the user uploads an unsupported file type (e.g., .exe)
WHEN the file is selected
THEN an inline error "Unsupported file type. Allowed: JPG, PNG, WEBP, GIF." should appear
  AND no upload request should be sent to the backend
```

---

### Feature 2: Text Detection

**Scenario: User pastes text and receives an AI detection result**

```
GIVEN the user is on the /scan page and has selected the "Text" tab
WHEN the user pastes 500 characters of text into the textarea
  AND clicks the "Scan Text" button
THEN the system should send the text to at least 2 text detection APIs
  AND return a unified confidence score within 8 seconds
  AND the results page should highlight sentences with AI probability > 70% in red
  AND sentences with probability 40–70% in yellow
  AND the character count should update in real-time as the user types

GIVEN the user submits text under 50 characters
WHEN the "Scan Text" button is clicked
THEN a warning message "Text too short for reliable analysis. Please enter at least 50 characters." should appear
  AND the scan should not proceed

GIVEN the text exceeds 50,000 characters
WHEN the user attempts to paste
THEN the textarea should truncate to 50,000 characters
  AND display a counter: "50,000 / 50,000 characters"
```

---

### Feature 3: API Failure Handling

**Scenario: One or more third-party detection APIs fail during a scan**

```
GIVEN the user has submitted a file for scanning
WHEN one of the detection APIs returns a 500 error or times out after 10 seconds
THEN the system should log the error internally
  AND continue processing results from remaining APIs
  AND the results page should display: "Note: 1 detection model was unavailable. Results based on [N] models."
  AND the confidence score should be calculated from available results only

GIVEN ALL detection APIs fail or time out
WHEN the backend has no results to aggregate
THEN the user should see an error page: "Scan failed. Our detection services are temporarily unavailable. Please try again in a few minutes."
  AND a "Retry" button should be shown
  AND no scan should be saved to history
  AND the error should be logged with the scan_id and timestamps for monitoring

GIVEN the OCR step fails during document scanning
WHEN the document text cannot be extracted
THEN the user should see: "Unable to extract text from this document. Please ensure the file is not password-protected and try again."
  AND an alternative option "Try a different file" should appear
```

---

## 7. Out of Scope — V1

The following features are explicitly excluded from the Version 1.0 release to maintain focus and delivery timeline:

### Hard Exclusions

| Feature | Reason | Target Version |
|---|---|---|
| Social media integrations (Twitter, LinkedIn, Instagram share) | Adds complexity; low priority for core trust utility | V2 |
| Native mobile app (iOS / Android) | Web app covers mobile browsers; native app requires separate development | V2+ |
| Batch processing (scan 50+ files at once) | Needs queue infrastructure maturation | V1.5 |
| Browser extensions for Firefox / Safari | Chrome extension already built; other browsers need separate implementation | V2 |
| Webhook notifications | Developer feature; low initial demand | V1.5 |
| Real-time collaborative review | Multi-user annotation of scan results | V2+ |
| White-label / embedded widget | Enterprise feature requiring significant customization infrastructure | V2+ |
| On-premise deployment option | Requires containerization + enterprise SLA | V3 |
| Custom AI model training | Building proprietary detection models vs. using APIs | V3 |
| Deepfake video real-time stream analysis | Extremely high compute cost; needs separate pipeline | V2+ |
| Invoice / billing management UI | MVP uses Stripe webhook + simple portal | V1.5 |

---

## 8. Problem We Are Facing

### 8.1 Current State

The **Chrome Extension is built, functional, and working correctly**. It can:
- Detect selected text on pages
- Right-click image scanning
- Display a popup verdict with a confidence score
- Authenticate users via stored JWT

### 8.2 The Problem

The **website is not working** because:

1. **No Backend API** — The extension currently has no stable server-side endpoint to communicate with. Calls either hit a non-existent URL or return empty responses.

2. **File Upload Pipeline Missing** — There is no implementation for:
   - Receiving multipart file uploads
   - Storing files to cloud storage
   - Routing files to appropriate third-party detection APIs
   - Aggregating results and storing them in a database
   - Returning structured results to the frontend

3. **No API Orchestration Layer** — Multiple APIs need to be called per scan. There is no orchestration that:
   - Calls multiple providers in parallel
   - Handles individual API failures gracefully
   - Aggregates and weights results into a single confidence score

4. **Frontend ↔ Backend Integration Gap** — The React frontend components exist in isolation with no connected API calls. Scan forms submit but go nowhere.

5. **Missing Database Schema** — No schema exists for users, scan jobs, scan results, or document records.

6. **Extension API Contract Not Defined** — The extension and website have not agreed on a stable API contract (endpoints, auth headers, response shape), which means the extension cannot be connected even when the backend is built.

### 8.3 Immediate Actions Required

| Priority | Action |
|---|---|
| P0 | Define and implement the REST API contract |
| P0 | Build file upload endpoint with cloud storage integration |
| P0 | Implement API orchestration module |
| P0 | Build database schema and result storage |
| P0 | Connect frontend scan forms to live API endpoints |
| P1 | Define extension ↔ API contract and test integration |
| P1 | Implement error fallback and partial-result handling |

---

## 9. Suggested Architecture

### 9.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌──────────────────┐          ┌────────────────────────────┐   │
│  │  Next.js Web App │          │  Chrome Extension (built)  │   │
│  │  (Desktop+Mobile)│          │  (Desktop only)            │   │
│  └────────┬─────────┘          └──────────┬─────────────────┘   │
└───────────┼──────────────────────────────┼────────────────────┘
            │ HTTPS REST                   │ HTTPS REST
            ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                        │
│                                                                 │
│   Auth Middleware (JWT)  |  Rate Limiter  |  Request Validator  │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND SERVICE LAYER                       │
│                     (Node.js / Express)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Scan Router  │  │ Document     │  │ Auth Service         │  │
│  │              │  │ Scanner      │  │ (Login/Register/JWT) │  │
│  │ /api/scan/*  │  │ /api/doc/*   │  └──────────────────────┘  │
│  └──────┬───────┘  └──────┬───────┘                            │
│         │                 │                                     │
│         ▼                 ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API ORCHESTRATION MODULE                        │  │
│  │                                                           │  │
│  │  Determines which APIs to call based on content type      │  │
│  │  Calls all relevant APIs in PARALLEL (Promise.allSettled) │  │
│  │  Handles timeouts, errors, partial results                │  │
│  │  Aggregates scores using weighted average algorithm       │  │
│  │  Returns structured result object                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────┐    ┌───────────────────────────────────┐
│   STORAGE LAYER     │    │       EXTERNAL APIS               │
│                     │    │                                   │
│  ┌───────────────┐  │    │  ┌────────────┐ ┌─────────────┐  │
│  │ PostgreSQL DB │  │    │  │ Sapling AI  │ │ GPTZero     │  │
│  │ (Supabase)    │  │    │  └────────────┘ └─────────────┘  │
│  └───────────────┘  │    │  ┌────────────┐ ┌─────────────┐  │
│  ┌───────────────┐  │    │  │ Hive Mod.  │ │ AI or Not   │  │
│  │ AWS S3 /      │  │    │  └────────────┘ └─────────────┘  │
│  │ Supabase      │  │    │  ┌────────────┐ ┌─────────────┐  │
│  │ Storage       │  │    │  │ Resemble   │ │ MS Video    │  │
│  └───────────────┘  │    │  │ Detect     │ │ Indexer     │  │
│  ┌───────────────┐  │    │  └────────────┘ └─────────────┘  │
│  │ Redis (Cache/ │  │    │  ┌────────────┐ ┌─────────────┐  │
│  │ Queue/Rate    │  │    │  │ Google     │ │ ClaimBuster │  │
│  │ Limiting)     │  │    │  │ Vision OCR │ │ (Fake News) │  │
│  └───────────────┘  │    │  └────────────┘ └─────────────┘  │
└─────────────────────┘    └───────────────────────────────────┘
```

---

### 9.2 File Upload Handling

```
1. Client selects file
2. Frontend validates: MIME type, file size (before upload)
3. Client sends multipart/form-data to POST /api/scan/upload
4. Backend (Multer) receives file in memory buffer
5. Backend validates: magic bytes check (actual file type vs extension)
6. Backend generates UUID-based filename
7. File streamed to S3/Supabase Storage (never written to disk in production)
8. Storage URL stored in DB scan record
9. Scan job added to BullMQ queue with { scan_id, file_url, content_type }
10. Worker picks up job → calls detection APIs
11. Results stored in DB → scan_id status updated to "complete"
12. Client polling /api/scan/:id every 2s receives "complete" status
13. Client redirects to /results/:id
```

---

### 9.3 API Orchestration (Detection)

```javascript
// Pseudocode for orchestration module

async function orchestrateScan(scanJob) {
  const { contentType, fileUrl, text } = scanJob;
  
  // Select APIs based on content type
  const apis = getApisForType(contentType); // returns array of API configs
  
  // Call all APIs in parallel, never fail entire job for one API error
  const results = await Promise.allSettled(
    apis.map(api => callWithTimeout(api, { fileUrl, text }, 10000))
  );
  
  // Separate fulfilled from rejected
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  if (successful.length === 0) {
    throw new Error('ALL_APIS_FAILED');
  }
  
  // Aggregate: weighted average based on API reliability weight
  const confidence = calculateWeightedScore(successful);
  
  return {
    confidence,          // 0–100
    verdict: getVerdict(confidence),  // 'AI' | 'HUMAN' | 'UNCERTAIN'
    models: successful,  // per-model breakdown
    failed_models: failed.length,
    warnings: failed.length > 0 ? [`${failed.length} model(s) unavailable`] : []
  };
}
```

---

### 9.4 Database Schema (Core Tables)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scans
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_type VARCHAR(20), -- 'image'|'video'|'audio'|'text'|'news'|'document'
  file_url TEXT,
  text_content TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending'|'processing'|'complete'|'failed'
  confidence DECIMAL(5,2),
  verdict VARCHAR(20), -- 'AI'|'HUMAN'|'UNCERTAIN'
  model_results JSONB, -- { model_name: { score, verdict, error? } }
  warnings TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Document Scans
CREATE TABLE document_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  ocr_text TEXT,
  confidence DECIMAL(5,2),
  section_results JSONB, -- array of { section_index, text, confidence }
  summary TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 9.5 Error Fallback System

```
Level 1 — Single API timeout (>10s):
  → Skip that API, continue with others
  → Add warning to result: "N model unavailable"

Level 2 — Multiple API failures (>50% of APIs fail):
  → Return partial result with prominent warning banner
  → Store partial results in DB
  → Flag scan for manual review (admin dashboard)

Level 3 — All APIs fail:
  → Return HTTP 503 with retryAfter header
  → Show user-friendly error page
  → Do not charge user's scan quota
  → Auto-alert via monitoring (Sentry/Datadog)

Level 4 — Storage failure (S3/Supabase):
  → Return HTTP 500
  → Do not create scan record
  → Log with full context

Level 5 — OCR failure (document scan):
  → Return specific OCR_FAILED error code
  → Show user message with troubleshooting tips
  → Offer retry option
```

---

## 10. API Structure

### 10.1 Authentication Endpoints

```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login, returns JWT
POST   /api/auth/refresh         Refresh JWT access token
POST   /api/auth/logout          Invalidate refresh token
GET    /api/auth/me              Get current user profile
```

---

### 10.2 AI Detection Endpoints

```
POST   /api/scan/image           Upload image for detection
POST   /api/scan/video           Upload video for detection
POST   /api/scan/audio           Upload audio for detection
POST   /api/scan/text            Submit text for detection
POST   /api/scan/news            Submit URL or article text for fake news detection
GET    /api/scan/:id             Get scan status and result
GET    /api/scans                List user's scans (paginated)
DELETE /api/scan/:id             Delete a scan record
```

**Request — POST /api/scan/text**
```json
{
  "content": "The quick brown fox jumps over the lazy dog...",
  "metadata": {
    "source": "web" | "extension",
    "source_url": "https://example.com/article"
  }
}
```

**Response — GET /api/scan/:id (complete)**
```json
{
  "scan_id": "a1b2c3d4-...",
  "status": "complete",
  "content_type": "text",
  "confidence": 94.7,
  "verdict": "AI",
  "verdict_label": "Likely AI Generated",
  "models": [
    { "name": "GPTZero", "score": 96.2, "verdict": "AI", "status": "success" },
    { "name": "Sapling AI", "score": 91.8, "verdict": "AI", "status": "success" },
    { "name": "Copyleaks", "score": 95.1, "verdict": "AI", "status": "success" }
  ],
  "segments": [
    { "text": "The quick brown fox...", "start": 0, "end": 42, "ai_probability": 0.97 },
    { "text": "...jumps over...", "start": 43, "end": 60, "ai_probability": 0.82 }
  ],
  "warnings": [],
  "created_at": "2026-05-02T10:30:00Z",
  "completed_at": "2026-05-02T10:30:07Z"
}
```

---

### 10.3 Document Scanner Endpoints

```
POST   /api/document/scan        Upload document for OCR + AI detection
GET    /api/document/:id         Get document scan status and result
GET    /api/documents            List user's document scans (paginated)
DELETE /api/document/:id         Delete document scan record
```

**Request — POST /api/document/scan**
```
Content-Type: multipart/form-data
Field: file (PDF, JPG, PNG; max 50MB)
Field: options (JSON): { generate_summary: true, extract_keywords: true }
```

**Response — GET /api/document/:id (complete)**
```json
{
  "doc_scan_id": "d4e5f6g7-...",
  "status": "complete",
  "file_name": "research_paper.pdf",
  "confidence": 87.3,
  "verdict": "AI",
  "ocr_text": "Full extracted text here...",
  "sections": [
    {
      "section_index": 0,
      "text": "Introduction paragraph...",
      "ai_probability": 0.91,
      "highlight_color": "red"
    },
    {
      "section_index": 1,
      "text": "Methodology section...",
      "ai_probability": 0.45,
      "highlight_color": "yellow"
    }
  ],
  "summary": "This document appears to describe a research methodology for...",
  "keywords": ["machine learning", "neural network", "transformer", "NLP"],
  "created_at": "2026-05-02T10:35:00Z",
  "completed_at": "2026-05-02T10:35:12Z"
}
```

---

### 10.4 OCR + AI Detection Backend Pipeline

```
Step 1: RECEIVE
  POST /api/document/scan receives multipart file
  Multer stores in memory buffer

Step 2: VALIDATE
  Check MIME type + magic bytes
  Check file size ≤ 50MB
  Check user scan quota

Step 3: STORE
  Upload original file to S3/Supabase Storage
  Generate signed URL
  Create DB record with status: "uploading"

Step 4: OCR EXTRACTION
  IF PDF:
    Use pdf-parse to extract text-layer text
    IF text-layer empty OR scan quality poor:
      Fallback to Google Vision API (OCR)
      Secondary fallback: Tesseract.js (offline)
  IF IMAGE:
    Use Google Vision API directly
    Fallback: Tesseract.js

  Store extracted text in DB
  Update status: "ocr_complete"

Step 5: TEXT SEGMENTATION
  Split extracted text into paragraphs/sections
  Each section ≥ 100 characters
  Store section array

Step 6: AI DETECTION
  For each section → send to text detection APIs in parallel
  Aggregate section-level confidence scores

Step 7: GLOBAL SCORE
  Calculate weighted average across all sections
  Apply length-weighting (longer sections carry more weight)
  Determine verdict

Step 8: ENRICHMENT (if options.generate_summary)
  Send full text to summarization API (or Claude API)
  Extract top 10 keywords using TF-IDF or API

Step 9: STORE RESULTS
  Save all section results, summary, keywords to DB
  Update status: "complete"
  Set completed_at timestamp

Step 10: NOTIFY CLIENT
  Client polling detects status: "complete"
  Redirect to /document-results/:id
```

---

### 10.5 Chrome Extension API Contract

```
All requests must include:
  Authorization: Bearer <jwt_access_token>
  X-Client-Type: chrome-extension
  X-Extension-Version: 1.0.0
  Content-Type: application/json

POST /api/scan/text
POST /api/scan/image   (body: { image_url: "https://..." })
POST /api/scan/news    (body: { url: "https://...", text: "..." })
GET  /api/scan/:id     (poll for completion)

Response for extension (compact):
{
  "scan_id": "uuid",
  "verdict": "AI" | "HUMAN" | "UNCERTAIN",
  "confidence": 94.7,
  "verdict_label": "Likely AI Generated",
  "result_url": "https://truthlens.io/results/uuid",
  "status": "complete" | "pending" | "processing"
}
```

---

*End of Document*

---

> **TruthLens PRD v1.0** — This document governs the V1 product build. All feature additions, scope changes, and architectural decisions should be reflected through a PRD amendment with version increment.
