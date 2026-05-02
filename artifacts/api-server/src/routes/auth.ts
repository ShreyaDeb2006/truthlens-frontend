import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken } from "../lib/auth";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "BadRequest", message: "Invalid request body" });
    return;
  }

  const { email, password, name } = parsed.data;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({ email, passwordHash, name, tier: "free" }).returning();

    if (!user) {
      res.status(500).json({ error: "InternalError", message: "Failed to create user" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier, createdAt: user.createdAt, scanCount: user.scanCount },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "InternalError", message: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "BadRequest", message: "Invalid request body" });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier, createdAt: user.createdAt, scanCount: user.scanCount },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "InternalError", message: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", authMiddleware, (_req, res) => {
  // JWT is stateless; client should discard the token
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) {
      res.status(404).json({ error: "NotFound", message: "User not found" });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name, tier: user.tier, createdAt: user.createdAt, scanCount: user.scanCount });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "InternalError", message: "Failed to get user" });
  }
});

export default router;
