import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  authedGet,
  decodeClaims,
  jsonPost,
  readJson,
  startTestServer,
  type TestContext,
} from "./helpers.js";

/**
 * Regression tests for the findings fixed in Phase 2.
 *
 * Each block names the finding it pins down. If one of these ever goes green-to-
 * red, a live account-takeover or privilege-escalation path has been reopened.
 */
let ctx: TestContext;
let base: string;

// The code only ever leaves the server by email, so a test recovers it the same
// way an attacker cannot: by brute-forcing the stored hash offline.
const recoverCode = (codeHash: string): string => {
  for (let i = 0; i < 1_000_000; i++) {
    const candidate = String(i).padStart(6, "0");
    if (createHash("sha256").update(candidate).digest("hex") === codeHash) {
      return candidate;
    }
  }
  throw new Error("code not recoverable");
};

const VICTIM = "victim@example.com";
const REAL_PASSWORD = "correct-horse-1";

beforeAll(async () => {
  ctx = await startTestServer(5301);
  base = ctx.baseUrl;
});

afterAll(async () => {
  await ctx.stop();
});

describe("S2 — email verification cannot be forged", () => {
  it("does not return the verification code or the password to the client", async () => {
    const res = await jsonPost(base, "/SignUp", {
      FName: "Mahmoud",
      LName: "Mohamed",
      email: VICTIM,
      password: REAL_PASSWORD,
    });
    const body = await readJson<any>(res);

    expect(body.verification_code).toBeUndefined();
    expect(body.user?.password).toBeUndefined();
    expect(body.exist).toBe(false);
  });

  it("creates no user row until the email is proven", async () => {
    const { User } = await import("../models/User.js");
    expect(await User.countDocuments()).toBe(0);
  });

  it("stores the code hashed and the password bcrypted", async () => {
    const { PendingRegistration } = await import("../models/PendingRegistration.js");
    const pending = await PendingRegistration.findOne({ email: VICTIM });

    expect(pending).not.toBeNull();
    expect(pending!.codeHash).toHaveLength(64);
    expect(pending!.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("rejects a matching pair of client-supplied codes", async () => {
    const res = await jsonPost(base, "/verification", {
      verificationCode: "000000",
      verification_code: "000000",
      user: { email: VICTIM },
    });

    expect((await readJson<any>(res)).verification).toBe(false);

    const { User } = await import("../models/User.js");
    expect(await User.countDocuments()).toBe(0);
  });

  it("accepts the real code and creates the account", async () => {
    const { PendingRegistration } = await import("../models/PendingRegistration.js");
    const pending = await PendingRegistration.findOne({ email: VICTIM });

    const res = await jsonPost(base, "/verification", {
      verificationCode: recoverCode(pending!.codeHash),
      user: { email: VICTIM },
    });

    expect((await readJson<any>(res)).verification).toBe(true);

    const { User } = await import("../models/User.js");
    expect(await User.countDocuments()).toBe(1);
  });
});

describe("S1 — password reset cannot be forged", () => {
  it("does not return the reset code", async () => {
    const res = await jsonPost(base, "/sendCodeVerification", {
      email: VICTIM,
    });
    const body = await readJson<any>(res);

    expect(body.verification_code).toBeUndefined();
    // Shape the deployed frontend depends on.
    expect(body.send).toBe(true);
    expect(body.email).toBe(VICTIM);
  });

  it("rejects the original exploit: any matching pair resets any account", async () => {
    const res = await jsonPost(base, "/newPassword", {
      email: VICTIM,
      password: "attacker-owns-you",
      verificationCode: "1",
      verification_code: "1",
    });

    expect((await readJson<any>(res)).verification).toBe(false);
  });

  it("leaves the real password working and the attacker's not", async () => {
    const attacker = await jsonPost(base, "/login", {
      email: VICTIM,
      password: "attacker-owns-you",
    });
    expect((await readJson<any>(attacker)).exist).toBe(false);

    const owner = await jsonPost(base, "/login", {
      email: VICTIM,
      password: REAL_PASSWORD,
    });
    expect((await readJson<any>(owner)).exist).toBe(true);
  });

  it("caps code guessing at five attempts", async () => {
    for (let i = 0; i < 5; i++) {
      await jsonPost(base, "/newPassword", {
        email: VICTIM,
        password: "irrelevant-1",
        verificationCode: "999999",
      });
    }

    const res = await jsonPost(base, "/newPassword", {
      email: VICTIM,
      password: "irrelevant-1",
      verificationCode: "999999",
    });

    expect(res.status).toBe(429);
  });
});

describe("S6 — access tokens expire and carry a role", () => {
  it("issues a token with exp and role, plus an httpOnly refresh cookie", async () => {
    const res = await jsonPost(base, "/login", {
      email: VICTIM,
      password: REAL_PASSWORD,
    });
    const body = await readJson<any>(res);
    const claims = decodeClaims(body.token);

    expect(typeof claims.exp).toBe("number");
    expect(claims.role).toBe("user");
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
  });
});

describe("S4 / S7 — a user token must not reach admin routes", () => {
  let userToken: string;

  beforeAll(async () => {
    const res = await jsonPost(base, "/login", {
      email: VICTIM,
      password: REAL_PASSWORD,
    });
    userToken = (await readJson<any>(res)).token;
  });

  // Both the new paths and the deprecated aliases — the guard has to be on
  // every URL that reaches an admin controller, not just the tidy ones.
  it.each([
    "/api/admin/admins",
    "/api/users",
    "/admin/getAdmins",
    "/admin/getTrips",
    "/getAllUsers",
  ])("returns 403 for %s", async (path) => {
    const res = await authedGet(base, path, userToken);
    expect(res.status).toBe(403);
  });

  it("cannot create an admin", async () => {
    const res = await jsonPost(
      base,
      "/admin/addAdmin",
      { name: "evil", email: "evil@example.com", password: "password123" },
      { authorization: `Bearer ${userToken}` },
    );

    expect(res.status).toBe(403);

    const { Admin } = await import("../models/Admin.js");
    expect(await Admin.countDocuments()).toBe(0);
  });
});

describe("S5 — admin passwords are hashed", () => {
  it("lets an existing plaintext admin log in and upgrades the row", async () => {
    const { Admin } = await import("../models/Admin.js");
    await Admin.create({
      name: "Legacy",
      email: "legacy@example.com",
      password: "plaintext-pass-1",
    });

    const res = await jsonPost(base, "/admin/login", {
      email: "legacy@example.com",
      password: "plaintext-pass-1",
    });
    const body = await readJson<any>(res);

    expect(body.exist).toBe(true);
    expect(decodeClaims(body.token).role).toBe("admin");

    const upgraded = await Admin.findOne({
      email: "legacy@example.com",
    }).select("+password");
    expect(upgraded!.password).toMatch(/^\$2[aby]\$/);
  });

  it("lets an admin token through, and stores new admins hashed", async () => {
    const login = await jsonPost(base, "/admin/login", {
      email: "legacy@example.com",
      password: "plaintext-pass-1",
    });
    const adminToken = (await readJson<any>(login)).token;

    const list = await authedGet(base, "/admin/getAdmins", adminToken);
    expect(list.status).toBe(200);

    await jsonPost(
      base,
      "/admin/addAdmin",
      { name: "New", email: "new@example.com", password: "password123" },
      { authorization: `Bearer ${adminToken}` },
    );

    const { Admin } = await import("../models/Admin.js");
    const created = await Admin.findOne({ email: "new@example.com" }).select(
      "+password",
    );
    expect(created!.password).toMatch(/^\$2[aby]\$/);
  });
});
