import { Router } from "express";
import multer from "multer";
import { db, scansTable, usersTable } from "@workspace/db";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { authMiddleware, optionalAuth, type AuthRequest } from "../middlewares/auth";
import { detectText, detectImage, detectAudio, detectVideo, detectNews } from "../lib/orchestrator";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

function formatScan(scan: typeof scansTable.$inferSelect) {
  return {
    scanId: scan.id,
    status: scan.status,
    contentType: scan.contentType,
    fileName: scan.fileName,
    confidence: scan.confidence ? Number(scan.confidence) : undefined,
    verdict: scan.verdict,
    verdictLabel: scan.verdictLabel,
    models: scan.models,
    segments: scan.segments,
    warnings: scan.warnings,
    failedModels: scan.failedModels,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    resultUrl: `/results/${scan.id}`,
  };
}

async function runScan(scanId: string, userId: string | undefined, runDetection: () => Promise<import("../lib/orchestrator").OrchestrationResult>) {
  try {
    await db.update(scansTable).set({ status: "processing" }).where(eq(scansTable.id, scanId));
    const result = await runDetection();
    await db.update(scansTable).set({
      status: "complete",
      confidence: String(result.confidence),
      verdict: result.verdict,
      verdictLabel: result.verdictLabel,
      models: result.models as any,
      segments: (result.segments ?? null) as any,
      warnings: (result.warnings as any) ?? [],
      failedModels: result.failedModels,
      completedAt: new Date(),
    }).where(eq(scansTable.id, scanId));

    if (userId) {
      await db.update(usersTable).set({ scanCount: sql`scan_count + 1` }).where(eq(usersTable.id, userId));
    }
  } catch (err) {
    await db.update(scansTable).set({ status: "failed" }).where(eq(scansTable.id, scanId));
    throw err;
  }
}

// POST /api/scan/text
router.post("/scan/text", optionalAuth, async (req: AuthRequest, res) => {
  const { content, metadata } = req.body;
  if (!content || typeof content !== "string" || content.trim().length < 50) {
    res.status(400).json({ error: "BadRequest", message: "Text must be at least 50 characters" });
    return;
  }
  if (content.length > 50000) {
    res.status(400).json({ error: "BadRequest", message: "Text exceeds 50,000 character limit" });
    return;
  }

  try {
    const [scan] = await db.insert(scansTable).values({
      userId: req.userId ?? null,
      contentType: "text",
      textContent: content.slice(0, 50000),
      status: "pending",
    }).returning();

    if (!scan) { res.status(500).json({ error: "InternalError", message: "Failed to create scan" }); return; }

    res.status(202).json({ scanId: scan.id, status: "pending", message: "Scan job created" });

    // Run detection async (fire & forget)
    runScan(scan.id, req.userId, () => detectText(content)).catch(console.error);
  } catch (err) {
    req.log.error({ err }, "Scan text error");
    res.status(500).json({ error: "InternalError", message: "Failed to start scan" });
  }
});

// POST /api/scan/news
router.post("/scan/news", optionalAuth, async (req: AuthRequest, res) => {
  const { url, text } = req.body;
  if (!url && !text) {
    res.status(400).json({ error: "BadRequest", message: "Provide a URL or text content" });
    return;
  }

  try {
    const [scan] = await db.insert(scansTable).values({
      userId: req.userId ?? null,
      contentType: "news",
      textContent: text || url,
      status: "pending",
    }).returning();

    if (!scan) { res.status(500).json({ error: "InternalError", message: "Failed to create scan" }); return; }

    res.status(202).json({ scanId: scan.id, status: "pending", message: "Scan job created" });
    runScan(scan.id, req.userId, () => detectNews(url, text)).catch(console.error);
  } catch (err) {
    req.log.error({ err }, "Scan news error");
    res.status(500).json({ error: "InternalError", message: "Failed to start scan" });
  }
});

// POST /api/scan/image
router.post("/scan/image", optionalAuth, upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "BadRequest", message: "No file uploaded" }); return; }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    res.status(400).json({ error: "BadRequest", message: "Unsupported file type. Allowed: JPG, PNG, WEBP, GIF" });
    return;
  }
  if (req.file.size > 20 * 1024 * 1024) {
    res.status(400).json({ error: "BadRequest", message: "File too large. Maximum size is 20MB" });
    return;
  }

  try {
    const [scan] = await db.insert(scansTable).values({
      userId: req.userId ?? null,
      contentType: "image",
      fileName: req.file.originalname,
      status: "pending",
    }).returning();

    if (!scan) { res.status(500).json({ error: "InternalError", message: "Failed to create scan" }); return; }

    res.status(202).json({ scanId: scan.id, status: "pending", message: "Scan job created" });
    const buf = req.file.buffer;
    runScan(scan.id, req.userId, () => detectImage(buf)).catch(console.error);
  } catch (err) {
    req.log.error({ err }, "Scan image error");
    res.status(500).json({ error: "InternalError", message: "Failed to start scan" });
  }
});

// POST /api/scan/audio
router.post("/scan/audio", optionalAuth, upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "BadRequest", message: "No file uploaded" }); return; }

  const allowedTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/m4a", "audio/x-m4a"];
  if (!req.file.mimetype.startsWith("audio/")) {
    res.status(400).json({ error: "BadRequest", message: "Unsupported file type. Allowed: MP3, WAV, M4A" });
    return;
  }
  if (req.file.size > 100 * 1024 * 1024) {
    res.status(400).json({ error: "BadRequest", message: "File too large. Maximum size is 100MB" });
    return;
  }

  try {
    const [scan] = await db.insert(scansTable).values({
      userId: req.userId ?? null,
      contentType: "audio",
      fileName: req.file.originalname,
      status: "pending",
    }).returning();

    if (!scan) { res.status(500).json({ error: "InternalError", message: "Failed to create scan" }); return; }

    res.status(202).json({ scanId: scan.id, status: "pending", message: "Scan job created" });
    const buf = req.file.buffer;
    runScan(scan.id, req.userId, () => detectAudio(buf)).catch(console.error);
  } catch (err) {
    req.log.error({ err }, "Scan audio error");
    res.status(500).json({ error: "InternalError", message: "Failed to start scan" });
  }
});

// POST /api/scan/video
router.post("/scan/video", optionalAuth, upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "BadRequest", message: "No file uploaded" }); return; }

  if (!req.file.mimetype.startsWith("video/")) {
    res.status(400).json({ error: "BadRequest", message: "Unsupported file type. Allowed: MP4, MOV, AVI" });
    return;
  }
  if (req.file.size > 500 * 1024 * 1024) {
    res.status(400).json({ error: "BadRequest", message: "File too large. Maximum size is 500MB" });
    return;
  }

  try {
    const [scan] = await db.insert(scansTable).values({
      userId: req.userId ?? null,
      contentType: "video",
      fileName: req.file.originalname,
      status: "pending",
    }).returning();

    if (!scan) { res.status(500).json({ error: "InternalError", message: "Failed to create scan" }); return; }

    res.status(202).json({ scanId: scan.id, status: "pending", message: "Scan job created" });
    const buf = req.file.buffer;
    runScan(scan.id, req.userId, () => detectVideo(buf)).catch(console.error);
  } catch (err) {
    req.log.error({ err }, "Scan video error");
    res.status(500).json({ error: "InternalError", message: "Failed to start scan" });
  }
});

// GET /api/scan/:id
router.get("/scan/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, String(id))).limit(1);
    if (!scan) { res.status(404).json({ error: "NotFound", message: "Scan not found" }); return; }
    res.json(formatScan(scan));
  } catch (err) {
    req.log.error({ err }, "Get scan error");
    res.status(500).json({ error: "InternalError", message: "Failed to get scan" });
  }
});

// DELETE /api/scan/:id
router.delete("/scan/:id", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, String(id))).limit(1);
    if (!scan) { res.status(404).json({ error: "NotFound", message: "Scan not found" }); return; }
    if (scan.userId && scan.userId !== req.userId) {
      res.status(403).json({ error: "Forbidden", message: "Access denied" }); return;
    }
    await db.delete(scansTable).where(eq(scansTable.id, String(id)));
    res.json({ success: true, message: "Scan deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete scan error");
    res.status(500).json({ error: "InternalError", message: "Failed to delete scan" });
  }
});

// GET /api/scans
router.get("/scans", authMiddleware, async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(String(req.query["page"] ?? "1"), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query["limit"] ?? "20"), 10)));
  const offset = (page - 1) * limit;

  try {
    const userCondition = eq(scansTable.userId, req.userId!);

    const [rows, totalResult] = await Promise.all([
      db.select().from(scansTable).where(userCondition).orderBy(desc(scansTable.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(scansTable).where(userCondition),
    ]);

    const total = totalResult[0]?.total ?? 0;
    res.json({
      scans: rows.map(formatScan),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "List scans error");
    res.status(500).json({ error: "InternalError", message: "Failed to list scans" });
  }
});

export default router;
