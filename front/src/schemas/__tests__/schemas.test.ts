import { describe, expect, it } from "vitest";
import { changePasswordSchema, loginSchema, signUpSchema } from "../index";

/**
 * The rules used to be hand-written per screen and had drifted: sign-in wanted
 * eight characters, change-password six, and the API twelve. These assert the
 * one shared definition, so a form can no longer accept what the API rejects.
 */
describe("password rules", () => {
  it("rejects a password shorter than the API's floor", () => {
    const result = loginSchema.safeParse({
      email: "rider@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("applies the same floor on sign-up", () => {
    expect(
      signUpSchema.safeParse({
        FName: "A",
        LName: "B",
        email: "rider@example.com",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("email rules", () => {
  it.each(["", "not-an-email", "missing@tld", "@example.com"])(
    "rejects %j",
    (email) => {
      expect(loginSchema.safeParse({ email, password: "longenough1" }).success).toBe(
        false,
      );
    },
  );

  it("trims surrounding whitespace", () => {
    const result = loginSchema.safeParse({
      email: "  rider@example.com  ",
      password: "longenough1",
    });

    expect(result.success).toBe(true);
    expect(result.success && result.data.email).toBe("rider@example.com");
  });
});

describe("change password", () => {
  it("refuses a new password identical to the current one", () => {
    const result = changePasswordSchema.safeParse({
      password: "samepassword1",
      newPassword: "samepassword1",
    });

    expect(result.success).toBe(false);
    expect(
      !result.success &&
        result.error.issues.some((i) => i.path.includes("newPassword")),
    ).toBe(true);
  });

  it("accepts a genuinely different one", () => {
    expect(
      changePasswordSchema.safeParse({
        password: "oldpassword1",
        newPassword: "newpassword2",
      }).success,
    ).toBe(true);
  });
});
