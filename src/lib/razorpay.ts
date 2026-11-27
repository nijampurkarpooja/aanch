import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay signs the raw body with HMAC-SHA256, keyed by the webhook secret, as hex (S13). Pass the
 * exact bytes received: decoding to text can change them (a byte-order mark, invalid UTF-8).
 */
export function isValidWebhookSignature(
  rawBody: Uint8Array,
  signature: string | null,
  secret: string,
) {
  // Buffer.from(…, "hex") decodes a valid prefix and drops the rest, so check the format first.
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  return timingSafeEqual(Buffer.from(signature, "hex"), expected);
}
