import { pgTable, text, timestamp, numeric, integer, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scansTable = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  contentType: text("content_type").notNull(), // image|video|audio|text|news|document
  fileName: text("file_name"),
  fileUrl: text("file_url"),
  textContent: text("text_content"),
  status: text("status").notNull().default("pending"), // pending|processing|complete|failed
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  verdict: text("verdict"), // AI|HUMAN|UNCERTAIN
  verdictLabel: text("verdict_label"),
  models: jsonb("models"), // array of ModelResult
  segments: jsonb("segments"), // array of TextSegment
  warnings: jsonb("warnings"), // string[]
  failedModels: integer("failed_models").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({
  id: true,
  createdAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
