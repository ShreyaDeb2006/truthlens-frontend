import { pgTable, text, timestamp, numeric, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const documentScansTable = pgTable("document_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  status: text("status").notNull().default("pending"), // pending|processing|ocr_complete|complete|failed
  ocrText: text("ocr_text"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  verdict: text("verdict"), // AI|HUMAN|UNCERTAIN
  verdictLabel: text("verdict_label"),
  sections: jsonb("sections"), // array of DocumentSection
  summary: text("summary"),
  keywords: jsonb("keywords"), // string[]
  warnings: jsonb("warnings"), // string[]
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertDocumentScanSchema = createInsertSchema(documentScansTable).omit({
  id: true,
  createdAt: true,
});

export type InsertDocumentScan = z.infer<typeof insertDocumentScanSchema>;
export type DocumentScan = typeof documentScansTable.$inferSelect;
