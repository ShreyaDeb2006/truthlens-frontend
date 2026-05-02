// AI Detection Orchestrator — simulates calling multiple detection APIs
// In production, replace these stubs with real API calls

export interface ModelResult {
  name: string;
  score: number;
  verdict: "AI" | "HUMAN" | "UNCERTAIN";
  status: "success" | "error" | "timeout";
  error?: string;
}

export interface TextSegment {
  text: string;
  start: number;
  end: number;
  aiProbability: number;
}

export interface OrchestrationResult {
  confidence: number;
  verdict: "AI" | "HUMAN" | "UNCERTAIN";
  verdictLabel: string;
  models: ModelResult[];
  segments?: TextSegment[];
  warnings: string[];
  failedModels: number;
}

function getVerdict(confidence: number): { verdict: "AI" | "HUMAN" | "UNCERTAIN"; label: string } {
  if (confidence >= 70) return { verdict: "AI", label: "Likely AI Generated" };
  if (confidence <= 30) return { verdict: "HUMAN", label: "Likely Human Written" };
  return { verdict: "UNCERTAIN", label: "Uncertain — Mixed Signals" };
}

function jitter(base: number, range: number): number {
  return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range));
}

// Simulate network delay (100-800ms per API call)
function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function detectText(content: string): Promise<OrchestrationResult> {
  // Simulate 3 text detection APIs
  const apiCalls = [
    { name: "GPTZero", baseScore: 85, range: 20, failChance: 0.05 },
    { name: "Sapling AI", baseScore: 80, range: 25, failChance: 0.05 },
    { name: "Copyleaks", baseScore: 82, range: 22, failChance: 0.08 },
  ];

  const results = await Promise.allSettled(
    apiCalls.map(async (api) => {
      await delay(200 + Math.random() * 600);
      if (Math.random() < api.failChance) throw new Error("API timeout");
      const score = jitter(api.baseScore, api.range);
      const { verdict } = getVerdict(score);
      return { name: api.name, score: Math.round(score * 10) / 10, verdict, status: "success" as const };
    })
  );

  const models: ModelResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { name: apiCalls[i]!.name, score: 0, verdict: "UNCERTAIN", status: "error", error: "API unavailable" };
  });

  const successful = models.filter((m) => m.status === "success");
  const avgConfidence = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.score, 0) / successful.length
    : 50;

  const confidence = Math.round(avgConfidence * 10) / 10;
  const { verdict, label } = getVerdict(confidence);

  // Generate text segments
  const sentences = content.match(/[^.!?]+[.!?]*/g) || [content];
  const segments: TextSegment[] = [];
  let pos = 0;
  for (const sentence of sentences.slice(0, 20)) {
    const trimmed = sentence.trim();
    if (trimmed.length < 10) { pos += sentence.length; continue; }
    const aiProb = Math.max(0, Math.min(1, (confidence / 100) + (Math.random() - 0.5) * 0.4));
    segments.push({ text: trimmed, start: pos, end: pos + sentence.length, aiProbability: Math.round(aiProb * 100) / 100 });
    pos += sentence.length;
  }

  const failedModels = models.filter((m) => m.status !== "success").length;
  const warnings = failedModels > 0 ? [`${failedModels} detection model(s) were unavailable. Results based on ${successful.length} model(s).`] : [];

  return { confidence, verdict, verdictLabel: label, models, segments, warnings, failedModels };
}

export async function detectImage(_fileBuffer: Buffer): Promise<OrchestrationResult> {
  const apiCalls = [
    { name: "Hive Moderation", baseScore: 78, range: 30, failChance: 0.05 },
    { name: "AI or Not", baseScore: 82, range: 28, failChance: 0.05 },
  ];

  const results = await Promise.allSettled(
    apiCalls.map(async (api) => {
      await delay(300 + Math.random() * 700);
      if (Math.random() < api.failChance) throw new Error("API timeout");
      const score = jitter(api.baseScore, api.range);
      const { verdict } = getVerdict(score);
      return { name: api.name, score: Math.round(score * 10) / 10, verdict, status: "success" as const };
    })
  );

  const models: ModelResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { name: apiCalls[i]!.name, score: 0, verdict: "UNCERTAIN", status: "error", error: "API unavailable" };
  });

  const successful = models.filter((m) => m.status === "success");
  const avgConfidence = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.score, 0) / successful.length
    : 50;

  const confidence = Math.round(avgConfidence * 10) / 10;
  const { verdict, label } = getVerdict(confidence);
  const failedModels = models.filter((m) => m.status !== "success").length;
  const warnings = failedModels > 0 ? [`${failedModels} detection model(s) were unavailable.`] : [];

  return { confidence, verdict, verdictLabel: label, models, segments: undefined, warnings, failedModels };
}

export async function detectAudio(_fileBuffer: Buffer): Promise<OrchestrationResult> {
  const apiCalls = [
    { name: "Resemble Detect", baseScore: 74, range: 35, failChance: 0.08 },
    { name: "AI Voice Detector", baseScore: 70, range: 30, failChance: 0.08 },
  ];

  const results = await Promise.allSettled(
    apiCalls.map(async (api) => {
      await delay(400 + Math.random() * 800);
      if (Math.random() < api.failChance) throw new Error("API timeout");
      const score = jitter(api.baseScore, api.range);
      const { verdict } = getVerdict(score);
      return { name: api.name, score: Math.round(score * 10) / 10, verdict, status: "success" as const };
    })
  );

  const models: ModelResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { name: apiCalls[i]!.name, score: 0, verdict: "UNCERTAIN", status: "error", error: "API unavailable" };
  });

  const successful = models.filter((m) => m.status === "success");
  const avgConfidence = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.score, 0) / successful.length
    : 50;

  const confidence = Math.round(avgConfidence * 10) / 10;
  const { verdict, label } = getVerdict(confidence);
  const failedModels = models.filter((m) => m.status !== "success").length;
  const warnings = failedModels > 0 ? [`${failedModels} detection model(s) were unavailable.`] : [];

  return { confidence, verdict, verdictLabel: label, models, segments: undefined, warnings, failedModels };
}

export async function detectVideo(_fileBuffer: Buffer): Promise<OrchestrationResult> {
  const apiCalls = [
    { name: "Microsoft Video Indexer", baseScore: 76, range: 32, failChance: 0.1 },
    { name: "Hive Video AI", baseScore: 72, range: 28, failChance: 0.08 },
  ];

  const results = await Promise.allSettled(
    apiCalls.map(async (api) => {
      await delay(500 + Math.random() * 1000);
      if (Math.random() < api.failChance) throw new Error("API timeout");
      const score = jitter(api.baseScore, api.range);
      const { verdict } = getVerdict(score);
      return { name: api.name, score: Math.round(score * 10) / 10, verdict, status: "success" as const };
    })
  );

  const models: ModelResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { name: apiCalls[i]!.name, score: 0, verdict: "UNCERTAIN", status: "error", error: "API unavailable" };
  });

  const successful = models.filter((m) => m.status === "success");
  const avgConfidence = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.score, 0) / successful.length
    : 50;

  const confidence = Math.round(avgConfidence * 10) / 10;
  const { verdict, label } = getVerdict(confidence);
  const failedModels = models.filter((m) => m.status !== "success").length;
  const warnings = failedModels > 0 ? [`${failedModels} detection model(s) were unavailable.`] : [];

  return { confidence, verdict, verdictLabel: label, models, segments: undefined, warnings, failedModels };
}

export async function detectNews(url?: string, text?: string): Promise<OrchestrationResult> {
  const apiCalls = [
    { name: "Google Fact Check", baseScore: 65, range: 40, failChance: 0.05 },
    { name: "ClaimBuster", baseScore: 60, range: 35, failChance: 0.08 },
  ];

  const results = await Promise.allSettled(
    apiCalls.map(async (api) => {
      await delay(300 + Math.random() * 600);
      if (Math.random() < api.failChance) throw new Error("API timeout");
      const score = jitter(api.baseScore, api.range);
      const { verdict } = getVerdict(score);
      return { name: api.name, score: Math.round(score * 10) / 10, verdict, status: "success" as const };
    })
  );

  const models: ModelResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return { name: apiCalls[i]!.name, score: 0, verdict: "UNCERTAIN", status: "error", error: "API unavailable" };
  });

  const successful = models.filter((m) => m.status === "success");
  const avgConfidence = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.score, 0) / successful.length
    : 50;

  const confidence = Math.round(avgConfidence * 10) / 10;
  const { verdict, label } = getVerdict(confidence);

  const content = url || text || "";
  const segments = content && content.length > 50
    ? content.match(/[^.!?]+[.!?]*/g)?.slice(0, 10).map((s, i) => ({
        text: s.trim(),
        start: i * 50,
        end: (i + 1) * 50,
        aiProbability: Math.max(0, Math.min(1, (confidence / 100) + (Math.random() - 0.5) * 0.3)),
      })) || []
    : undefined;

  const failedModels = models.filter((m) => m.status !== "success").length;
  const warnings = failedModels > 0 ? [`${failedModels} detection model(s) were unavailable.`] : [];

  return { confidence, verdict, verdictLabel: label, models, segments, warnings, failedModels };
}

export async function detectDocument(text: string): Promise<{
  confidence: number;
  verdict: "AI" | "HUMAN" | "UNCERTAIN";
  verdictLabel: string;
  sections: Array<{ sectionIndex: number; text: string; aiProbability: number; highlightColor: "red" | "yellow" | "green" }>;
  warnings: string[];
}> {
  // Split into sections (paragraphs)
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length >= 50);

  const sectionResults = await Promise.all(
    paragraphs.slice(0, 20).map(async (para, idx) => {
      await delay(100 + Math.random() * 200);
      const aiProbability = Math.max(0, Math.min(1, 0.6 + (Math.random() - 0.5) * 0.6));
      const rounded = Math.round(aiProbability * 100) / 100;
      const highlightColor: "red" | "yellow" | "green" =
        rounded >= 0.7 ? "red" : rounded >= 0.4 ? "yellow" : "green";
      return { sectionIndex: idx, text: para.trim(), aiProbability: rounded, highlightColor };
    })
  );

  const avgProb = sectionResults.reduce((sum, s) => sum + s.aiProbability, 0) / (sectionResults.length || 1);
  const confidence = Math.round(avgProb * 1000) / 10;
  const { verdict, label } = getVerdict(confidence);

  return { confidence, verdict, verdictLabel: label, sections: sectionResults, warnings: [] };
}
