// Spike R4: Neon Object Storage through the plain AWS SDK. Throwaway, never merged.
import { S3Client } from "@aws-sdk/client-s3";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const bucket = () => required("STORAGE_BUCKET");

let client: S3Client | undefined;
// Our own variable names: Vercel reserves AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_REGION.
export function s3() {
  return (client ??= new S3Client({
    endpoint: required("STORAGE_ENDPOINT"),
    region: required("STORAGE_REGION"),
    forcePathStyle: true, // Neon serves path-style URLs only
    credentials: {
      accessKeyId: required("STORAGE_ACCESS_KEY_ID"),
      secretAccessKey: required("STORAGE_SECRET_ACCESS_KEY"),
    },
  }));
}

/** The image format the bytes really are, whatever the upload claimed (S15). */
export function imageType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && ascii(1, 4) === "PNG" && bytes[0] === 0x89) return "png";
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}
