import { MongoMemoryServer } from "mongodb-memory-server";
import type { Server } from "node:http";

/**
 * Environment has to be set before anything imports `config/env.ts`, which
 * validates and freezes it at module load. That is why the app is imported
 * dynamically inside `startTestServer` rather than at the top of a test file.
 */
export interface TestContext {
  baseUrl: string;
  stop: () => Promise<void>;
}

export const startTestServer = async (port: number): Promise<TestContext> => {
  const mongo = await MongoMemoryServer.create();

  process.env.MONGO_URI = mongo.getUri("bustest");
  process.env.JWT_ACCESS_SECRET = "a".repeat(40);
  process.env.JWT_REFRESH_SECRET = "b".repeat(40);
  // production, so the suite asserts against the same error shapes real
  // clients see (no stack traces in the body).
  process.env.NODE_ENV = "production";
  process.env.LOG_LEVEL = "silent";
  // The lowest bcrypt cost the config allows — real rounds make the suite crawl.
  process.env.BCRYPT_ROUNDS = "10";

  const { createApp } = await import("../app.js");
  const { connectDB, disconnectDB } = await import("../config/db.js");

  await connectDB();
  const server: Server = createApp().listen(port);

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    stop: async () => {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await disconnectDB();
      await mongo.stop();
    },
  };
};

export const jsonPost = (
  baseUrl: string,
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<Response> =>
  fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

export const authedGet = (
  baseUrl: string,
  path: string,
  token: string,
): Promise<Response> =>
  fetch(baseUrl + path, { headers: { authorization: `Bearer ${token}` } });

/** `Response.json()` is typed `unknown`; tests assert on known shapes. */
export const readJson = async <T = Record<string, unknown>>(
  res: Response,
): Promise<T> => (await res.json()) as T;

/** Decodes a JWT payload without verifying it — tests assert on the claims. */
export const decodeClaims = (token: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString()) as Record<
    string,
    unknown
  >;
