// Spike R4: checks an upload's real type, re-encodes it with sharp, and returns signed read links.
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { MAX_UPLOAD_BYTES, bucket, imageType, s3 } from "@/lib/storage";

const WIDTHS = [480, 960, 1600];

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const key = (body as { key?: unknown } | null)?.key;
  if (typeof key !== "string" || !/^holding\/[0-9a-f-]{36}$/.test(key)) {
    return Response.json({ error: "Unknown upload" }, { status: 400 });
  }

  let original: Uint8Array;
  try {
    const object = await s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    original = await object.Body!.transformToByteArray();
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey") {
      return Response.json({ error: "Unknown upload" }, { status: 404 });
    }
    throw error;
  }

  try {
    // The signed form already caps the size; this holds even if the storage didn't enforce it.
    if (original.length > MAX_UPLOAD_BYTES) {
      return Response.json({ error: "Too large" }, { status: 413 });
    }
    if (!imageType(original)) return Response.json({ error: "Not an image" }, { status: 415 });

    let encoded: { width: number; data: Buffer }[];
    try {
      const image = sharp(original, { limitInputPixels: 40_000_000 }).rotate();
      encoded = await Promise.all(
        WIDTHS.map(async (width) => ({
          width,
          // sharp drops EXIF (GPS included) unless asked to keep it.
          data: await image.clone().resize({ width, withoutEnlargement: true }).webp().toBuffer(),
        })),
      );
    } catch {
      return Response.json({ error: "Unreadable image" }, { status: 415 });
    }

    const id = crypto.randomUUID();
    const images = await Promise.all(
      encoded.map(async ({ width, data }) => {
        const Key = `products/${id}-${width}.webp`;
        await s3().send(
          new PutObjectCommand({ Bucket: bucket(), Key, Body: data, ContentType: "image/webp" }),
        );
        const read = new GetObjectCommand({ Bucket: bucket(), Key });
        return {
          width,
          url: await getSignedUrl(s3(), read, { expiresIn: 300 }),
          // For the proof only: a link that has expired by the time it's tried.
          shortUrl: await getSignedUrl(s3(), read, { expiresIn: 1 }),
        };
      }),
    );
    return Response.json({ images });
  } finally {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  }
}
