import { Router } from "express";
import multer from "multer";
import { db, documentScansTable, usersTable } from "@workspace/db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { authMiddleware, optionalAuth, type AuthRequest } from "../middlewares/auth";
import { detectDocument } from "../lib/orchestrator";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

function formatDoc(doc: typeof documentScansTable.$inferSelect) {
  return {
    docScanId: doc.id,
    status: doc.status,
    fileName: doc.fileName,
    confidence: doc.confidence ? Number(doc.confidence) : undefined,
    verdict: doc.verdict,
    verdictLabel: doc.verdictLabel,
    ocrText: doc.ocrText,
    sections: doc.sections,
    summary: doc.summary,
    keywords: doc.keywords,
    warnings: doc.warnings,
    createdAt: doc.createdAt,
    completedAt: doc.completedAt,
  };
}

// Simulate OCR extraction from uploaded file
async function extractTextFromFile(buffer: Buffer, mimetype: string): Promise<string> {
  // In production: use Google Vision API or Tesseract.js
  // For now, simulate a realistic OCR output
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  return `Introduction

This document presents a comprehensive analysis of modern technological advancements in artificial intelligence and machine learning systems. The research methodology employed in this study follows established academic protocols and peer-reviewed guidelines.

Methodology

The research was conducted over a period of six months, utilizing data from multiple sources including academic journals, industry reports, and primary data collection. Statistical analysis was performed using standard regression models.

The implications of these findings suggest that current AI systems demonstrate remarkable capabilities in natural language processing and pattern recognition. Furthermore, the integration of deep learning architectures has significantly improved performance benchmarks.

Results and Discussion

Our analysis reveals that approximately 73% of the sampled content exhibited characteristics consistent with AI-generated text. The confidence intervals for these measurements fall within acceptable statistical parameters.

The transformer-based models examined in this study showed particular proficiency in generating coherent and contextually appropriate responses. These results align with previously published research in the field.

Conclusion

Based on the evidence presented, it is clear that AI-generated content has reached a level of sophistication that challenges traditional detection methods. Future research should focus on developing more robust authentication mechanisms.`;
}

async function generateSummary(text: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 500));
  const words = text.split(" ").slice(0, 30).join(" ");
  return `This document appears to discuss ${words}... The content shows patterns consistent with AI-generated academic writing, with high confidence in certain sections.`;
}

function extractKeywords(text: string): string[] {
  const common = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "this", "that", "these", "those", "it", "its"];
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!common.includes(w)) freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([w]) => w);
}

// POST /api/document/scan
router.post("/document/scan", optionalAuth, upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "BadRequest", message: "No file uploaded" }); return; }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
  const isAllowed = allowedTypes.includes(req.file.mimetype) || req.file.originalname.toLowerCase().endsWith(".pdf");
  if (!isAllowed) {
    res.status(400).json({ error: "BadRequest", message: "Unsupported file type. Allowed: PDF, JPG, PNG" });
    return;
  }
  if (req.file.size > 50 * 1024 * 1024) {
    res.status(400).json({ error: "BadRequest", message: "File too large. Maximum size is 50MB" });
    return;
  }

  try {
    const [doc] = await db.insert(documentScansTable).values({
      userId: req.userId ?? null,
      fileName: req.file.originalname,
      status: "pending",
    }).returning();

    if (!doc) { res.status(500).json({ error: "InternalError", message: "Failed to create document scan" }); return; }

    res.status(202).json({ scanId: doc.id, status: "pending", message: "Document scan job created" });

    // Run async pipeline
    (async () => {
      try {
        await db.update(documentScansTable).set({ status: "processing" }).where(eq(documentScansTable.id, doc.id));

        const extractedText = await extractTextFromFile(req.file!.buffer, req.file!.mimetype);

        await db.update(documentScansTable).set({ status: "ocr_complete", ocrText: extractedText }).where(eq(documentScansTable.id, doc.id));

        const result = await detectDocument(extractedText);

        const generateSummaryOpt = req.body.generateSummary !== "false";
        const extractKeywordsOpt = req.body.extractKeywords !== "false";

        const summary = generateSummaryOpt ? await generateSummary(extractedText) : null;
        const keywords = extractKeywordsOpt ? extractKeywords(extractedText) : [];

        await db.update(documentScansTable).set({
          status: "complete",
          confidence: String(result.confidence),
          verdict: result.verdict,
          verdictLabel: result.verdictLabel,
          sections: result.sections as any,
          summary,
          keywords: keywords as any,
          warnings: (result.warnings as any) ?? [],
          completedAt: new Date(),
        }).where(eq(documentScansTable.id, doc.id));

        if (req.userId) {
          await db.update(usersTable).set({ scanCount: sql`scan_count + 1` }).where(eq(usersTable.id, req.userId));
        }
      } catch (err) {
        await db.update(documentScansTable).set({ status: "failed" }).where(eq(documentScansTable.id, doc.id));
        console.error("Document scan failed:", err);
      }
    })();
  } catch (err) {
    req.log.error({ err }, "Document scan error");
    res.status(500).json({ error: "InternalError", message: "Failed to start document scan" });
  }
});

// GET /api/document/:id
router.get("/document/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [doc] = await db.select().from(documentScansTable).where(eq(documentScansTable.id, String(id))).limit(1);
    if (!doc) { res.status(404).json({ error: "NotFound", message: "Document scan not found" }); return; }
    res.json(formatDoc(doc));
  } catch (err) {
    req.log.error({ err }, "Get document scan error");
    res.status(500).json({ error: "InternalError", message: "Failed to get document scan" });
  }
});

// DELETE /api/document/:id
router.delete("/document/:id", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const [doc] = await db.select().from(documentScansTable).where(eq(documentScansTable.id, String(id))).limit(1);
    if (!doc) { res.status(404).json({ error: "NotFound", message: "Document scan not found" }); return; }
    if (doc.userId && doc.userId !== req.userId) {
      res.status(403).json({ error: "Forbidden", message: "Access denied" }); return;
    }
    await db.delete(documentScansTable).where(eq(documentScansTable.id, String(id)));
    res.json({ success: true, message: "Document scan deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete document scan error");
    res.status(500).json({ error: "InternalError", message: "Failed to delete document scan" });
  }
});

// GET /api/documents
router.get("/documents", authMiddleware, async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query["limit"] ?? "20"), 10)));
  const offset = (page - 1) * limit;

  try {
    const conditions = [eq(documentScansTable.userId, req.userId!)];

    const [rows, totalResult] = await Promise.all([
      db.select().from(documentScansTable).where(and(...conditions)).orderBy(desc(documentScansTable.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(documentScansTable).where(and(...conditions)),
    ]);

    const total = totalResult[0]?.total ?? 0;
    res.json({
      documents: rows.map(formatDoc),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "List documents error");
    res.status(500).json({ error: "InternalError", message: "Failed to list document scans" });
  }
});

export default router;
