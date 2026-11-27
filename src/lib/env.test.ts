import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

const valid = { STORE_HOST: "localhost:3000", ADMIN_HOST: "admin.localhost:3000" };

describe("parseEnv", () => {
  it("accepts valid hosts", () => {
    expect(parseEnv(valid)).toEqual(valid);
  });

  it("S16: names a missing variable", () => {
    expect(() => parseEnv({ STORE_HOST: valid.STORE_HOST })).toThrow(/ADMIN_HOST/);
  });

  it("S16: never echoes a bad value", () => {
    const bad = "https://secret-looking-value.example/path";
    expect(() => parseEnv({ ...valid, STORE_HOST: bad })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining(bad) }),
    );
  });

  it("rejects a scheme or path in a host", () => {
    expect(() => parseEnv({ ...valid, STORE_HOST: "https://aanch.vercel.app" })).toThrow(
      /STORE_HOST/,
    );
  });

  it("keeps a real webhook secret", () => {
    const secret = "a".repeat(32);
    expect(parseEnv({ ...valid, RAZORPAY_WEBHOOK_SECRET: secret }).RAZORPAY_WEBHOOK_SECRET).toBe(
      secret,
    );
  });

  it("treats an empty, short or example webhook secret as unset, without failing", () => {
    for (const bad of ["", "   ", "too-short", "placeholder-webhook-secret-of-32-chars"]) {
      expect(
        parseEnv({ ...valid, RAZORPAY_WEBHOOK_SECRET: bad }).RAZORPAY_WEBHOOK_SECRET,
      ).toBeUndefined();
    }
  });

  it("rejects the same host for store and admin", () => {
    expect(() => parseEnv({ ...valid, ADMIN_HOST: valid.STORE_HOST })).toThrow(/ADMIN_HOST/);
  });
});
