import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { pinoHttp } from "pino-http";
import { corsMiddleware, globalLimiter } from "./config/security.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import legacyRoutes from "./routes/legacyRoutes.js";
export const createApp = () => {
    const app = express();
    // Render terminates TLS at its proxy; without this every request appears to
    // come from the proxy's IP and the rate limiters key on a single bucket.
    app.set("trust proxy", 1);
    app.use(helmet());
    app.use(corsMiddleware);
    app.use(pinoHttp({ logger }));
    // 100kb, down from the previous 50mb. Avatar uploads are the only large
    // payload and are separately capped at ~1MB by their own schema.
    app.use(express.json({ limit: "100kb" }));
    app.use(express.urlencoded({ extended: true, limit: "100kb" }));
    app.use(cookieParser());
    // Strips `$`-prefixed keys and dots, so a body like `{"email": {"$ne": null}}`
    // cannot reach a mongoose filter. The validate middleware is the real
    // defence; this is the belt to its braces.
    app.use(mongoSanitize());
    app.use(globalLimiter);
    app.use("/api/health", healthRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/trips", tripRoutes);
    app.use("/api/bookings", bookingRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/admin", adminRoutes);
    // Deprecated aliases for the currently deployed frontend. Removed in Phase 5.
    app.use("/", legacyRoutes);
    app.use(notFound);
    app.use(errorHandler);
    return app;
};
export default createApp;
//# sourceMappingURL=app.js.map