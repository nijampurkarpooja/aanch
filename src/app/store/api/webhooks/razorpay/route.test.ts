import { createHmac } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const SECRET = "test-webhook-secret-of-32-chars-ok";
const body = JSON.stringify({ event: "payment.captured", payload: { payment: {} } });
const sign = (text: string, secret = SECRET) =>
  createHmac("sha256", secret).update(text).digest("hex");

beforeAll(() => {
  process.env.STORE_HOST = "localhost:3000";
  process.env.ADMIN_HOST = "admin.localhost:3000";
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
});

function webhook(text: string, signature?: string) {
  const headers = new Headers({ "x-razorpay-event-id": "evt_test123" });
  if (signature) headers.set("x-razorpay-signature", signature);
  return POST(
    new Request("http://localhost:3000/api/webhooks/razorpay", {
      method: "POST",
      body: text,
      headers,
    }),
  );
}

describe("Razorpay webhook", () => {
  it("accepts a correctly signed event and logs its name and id", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => {});
    expect((await webhook(body, sign(body))).status).toBe(200);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"eventId":"evt_test123"'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"event":"payment.captured"'));
    log.mockRestore();
  });

  it("S13: a bad signature gets 401", async () => {
    expect((await webhook(body, sign(body, "another-secret-entirely"))).status).toBe(401);
  });

  it("S13: a missing or malformed signature gets 401", async () => {
    expect((await webhook(body)).status).toBe(401);
    expect((await webhook(body, "not-hex")).status).toBe(401);
  });

  it("S13: a valid signature with anything after it gets 401", async () => {
    expect((await webhook(body, sign(body) + "zz")).status).toBe(401);
    expect((await webhook(body, sign(body) + "a")).status).toBe(401);
  });

  it("S13: a body changed after signing gets 401", async () => {
    const tampered = body.replace("captured", "refunded");
    expect((await webhook(tampered, sign(body))).status).toBe(401);
  });

  it("S7: a body over 1 MB gets 413, before its signature is checked", async () => {
    const big = JSON.stringify({ event: "x", pad: "a".repeat(1_000_001) });
    expect((await webhook(big, sign(big))).status).toBe(413);
  });

  it("S7: a signed body that isn't a Razorpay event gets 400", async () => {
    expect((await webhook("[1,2]", sign("[1,2]"))).status).toBe(400);
    expect((await webhook("not json", sign("not json"))).status).toBe(400);
  });
});
