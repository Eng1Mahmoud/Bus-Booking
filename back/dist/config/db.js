import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";
let isConnected = false;
/**
 * Connects to MongoDB, reusing an existing connection.
 *
 * The previous implementation neither awaited `mongoose.connect` nor handled
 * its rejection, so the server bound its port and served traffic while the
 * database was unreachable — every request then hung until the driver timed
 * out. Here the caller awaits, and a failure stops the boot.
 */
export const connectDB = async () => {
    if (isConnected)
        return;
    mongoose.set("strictQuery", true);
    try {
        await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 10_000,
        });
        isConnected = true;
        logger.info("MongoDB connected");
    }
    catch (error) {
        isConnected = false;
        logger.error({ err: error }, "MongoDB connection failed");
        throw error;
    }
    mongoose.connection.on("disconnected", () => {
        isConnected = false;
        logger.warn("MongoDB disconnected");
    });
    mongoose.connection.on("error", (error) => {
        logger.error({ err: error }, "MongoDB error");
    });
};
export const disconnectDB = async () => {
    if (!isConnected)
        return;
    await mongoose.disconnect();
    isConnected = false;
};
export const isDBConnected = () => mongoose.connection.readyState === 1;
//# sourceMappingURL=db.js.map