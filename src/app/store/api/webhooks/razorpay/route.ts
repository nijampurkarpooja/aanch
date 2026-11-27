import { z } from "zod";
import { env } from "@/lib/env";
import { isValidWebhookSignature } from "@/lib/razorpay";

const MAX_BODY_BYTES = 1_000_000;
// The docs don't publish the payload's shape, so only the top-level event name is relied on yet.
const webhookEvent = z.object({ event: z.string().min(1).max(100) });

// shortcut: verifies and logs only (spike R5); recording the event and confirming the order in one
// transaction come with payments (S13). Dedupe on signed body fields (event, entity id, created_at):
// the x-razorpay-event-id header isn't signed, so a replay can carry any id.
export async function POST(request: Request) {
  const secret = env().RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      JSON.stringify({ msg: "razorpay webhook: RAZORPAY_WEBHOOK_SECRET unset or invalid" }),
    );
    return Response.json({ error: "Webhooks are not configured" }, { status: 503 });
  }

  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    return Response.json({ error: "Too large" }, { status: 413 });
  }
  const body = new Uint8Array(await request.arrayBuffer());
  if (body.length > MAX_BODY_BYTES) return Response.json({ error: "Too large" }, { status: 413 });
  if (!isValidWebhookSignature(body, request.headers.get("x-razorpay-signature"), secret)) {
    return Response.json({ error: "Bad signature" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = webhookEvent.safeParse(JSON.parse(new TextDecoder().decode(body)));
  } catch {
    parsed = undefined;
  }
  if (!parsed?.success) return Response.json({ error: "Bad payload" }, { status: 400 });

  // No payload fields beyond the event name: payments carry the shopper's email and phone.
  console.info(
    JSON.stringify({
      msg: "razorpay webhook verified",
      event: parsed.data.event,
      eventId: request.headers.get("x-razorpay-event-id")?.slice(0, 64) ?? null,
    }),
  );
  return new Response(null, { status: 200 });
}
