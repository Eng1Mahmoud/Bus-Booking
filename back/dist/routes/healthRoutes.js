import { Router } from "express";
import { isDBConnected } from "../config/db.js";
import { env } from "../config/env.js";
const router = Router();
/**
 * Replaces `GET /` returning the string "Hello World".
 *
 * Reports 503 when the database is unreachable so a platform health check
 * pulls the instance out of rotation instead of serving requests that will
 * hang on the driver.
 */
router.get("/", (_req, res) => {
    const dbConnected = isDBConnected();
    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? "ok" : "degraded",
        uptime: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        database: dbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
    });
});
export default router;
//# sourceMappingURL=healthRoutes.js.map