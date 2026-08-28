import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

/**
 * Boot sequence, kept separate from `app.ts` so tests can build an app without
 * binding a port or opening a database connection.
 *
 * The database is connected *before* the port is bound: the previous
 * implementation called `mongoose.connect` without awaiting it and started
 * listening immediately, so the server accepted traffic it could not serve.
 */
const start = async (): Promise<void> => {
  try {
    await connectDB();
  } catch {
    logger.fatal("Could not connect to the database. Exiting.");
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });

    // Don't let a hung connection block the deploy indefinitely.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.fatal({ err: reason }, "Unhandled rejection");
    process.exit(1);
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
  });
};

void start();
