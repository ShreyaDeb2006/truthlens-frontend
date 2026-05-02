import { Router } from "express";
import { db, scansTable, documentScansTable } from "@workspace/db";
import { eq, and, gte, count, avg, sql } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

// GET /api/stats/dashboard
router.get("/stats/dashboard", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalScansResult,
      totalDocsResult,
      aiScansResult,
      weekScansResult,
      avgConfResult,
    ] = await Promise.all([
      db.select({ total: count() }).from(scansTable).where(eq(scansTable.userId, userId)),
      db.select({ total: count() }).from(documentScansTable).where(eq(documentScansTable.userId, userId)),
      db.select({ total: count() }).from(scansTable).where(and(eq(scansTable.userId, userId), eq(scansTable.verdict, "AI"))),
      db.select({ total: count() }).from(scansTable).where(and(eq(scansTable.userId, userId), gte(scansTable.createdAt, weekAgo))),
      db.select({ avg: avg(scansTable.confidence) }).from(scansTable).where(and(eq(scansTable.userId, userId), eq(scansTable.status, "complete"))),
    ]);

    const totalScans = totalScansResult[0]?.total ?? 0;
    const totalDocumentScans = totalDocsResult[0]?.total ?? 0;
    const aiCount = aiScansResult[0]?.total ?? 0;
    const aiDetectedPercent = totalScans > 0 ? Math.round((Number(aiCount) / Number(totalScans)) * 1000) / 10 : 0;
    const scansThisWeek = weekScansResult[0]?.total ?? 0;
    const avgConfStr = avgConfResult[0]?.avg;
    const avgConfidence = avgConfStr ? Math.round(Number(avgConfStr) * 10) / 10 : 0;

    res.json({
      totalScans: Number(totalScans),
      totalDocumentScans: Number(totalDocumentScans),
      aiDetectedPercent,
      scansThisWeek: Number(scansThisWeek),
      avgConfidence,
      scanQuotaUsed: Number(totalScans),
      scanQuotaLimit: 5, // free tier
    });
  } catch (err) {
    req.log.error({ err }, "Dashboard stats error");
    res.status(500).json({ error: "InternalError", message: "Failed to get dashboard stats" });
  }
});

// GET /api/stats/recent-activity
router.get("/stats/recent-activity", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query["limit"] ?? "10"), 10)));

  try {
    const [scans, docs] = await Promise.all([
      db.select().from(scansTable).where(eq(scansTable.userId, userId))
        .orderBy(sql`created_at desc`).limit(limit),
      db.select().from(documentScansTable).where(eq(documentScansTable.userId, userId))
        .orderBy(sql`created_at desc`).limit(limit),
    ]);

    const activity = [
      ...scans.map((s) => ({
        id: s.id,
        type: "scan" as const,
        contentType: s.contentType,
        fileName: s.fileName,
        verdict: s.verdict,
        verdictLabel: s.verdictLabel,
        confidence: s.confidence ? Number(s.confidence) : undefined,
        status: s.status,
        createdAt: s.createdAt,
      })),
      ...docs.map((d) => ({
        id: d.id,
        type: "document_scan" as const,
        contentType: "document",
        fileName: d.fileName,
        verdict: d.verdict,
        verdictLabel: d.verdictLabel,
        confidence: d.confidence ? Number(d.confidence) : undefined,
        status: d.status,
        createdAt: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    res.json({ activity });
  } catch (err) {
    req.log.error({ err }, "Recent activity error");
    res.status(500).json({ error: "InternalError", message: "Failed to get recent activity" });
  }
});

// GET /api/stats/verdict-breakdown
router.get("/stats/verdict-breakdown", authMiddleware, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  try {
    const verdictRows = await db.select({
      verdict: scansTable.verdict,
      contentType: scansTable.contentType,
      total: count(),
    })
      .from(scansTable)
      .where(eq(scansTable.userId, userId))
      .groupBy(scansTable.verdict, scansTable.contentType);

    let ai = 0, human = 0, uncertain = 0;
    const byTypeMap: Record<string, { ai: number; human: number; uncertain: number }> = {};

    for (const row of verdictRows) {
      const ct = row.contentType;
      if (!byTypeMap[ct]) byTypeMap[ct] = { ai: 0, human: 0, uncertain: 0 };
      const n = Number(row.total);
      if (row.verdict === "AI") { ai += n; byTypeMap[ct]!.ai += n; }
      else if (row.verdict === "HUMAN") { human += n; byTypeMap[ct]!.human += n; }
      else { uncertain += n; byTypeMap[ct]!.uncertain += n; }
    }

    const byContentType = Object.entries(byTypeMap).map(([contentType, v]) => ({
      contentType,
      ...v,
    }));

    res.json({ ai, human, uncertain, byContentType });
  } catch (err) {
    req.log.error({ err }, "Verdict breakdown error");
    res.status(500).json({ error: "InternalError", message: "Failed to get verdict breakdown" });
  }
});

export default router;
