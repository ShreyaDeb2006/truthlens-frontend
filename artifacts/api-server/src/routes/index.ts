import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import scansRouter from "./scans";
import documentsRouter from "./documents";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(scansRouter);
router.use(documentsRouter);
router.use(statsRouter);

export default router;
