// Spike R4: a signed form that lets the browser upload one image straight to the holding prefix.
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { MAX_UPLOAD_BYTES, bucket, s3 } from "@/lib/storage";

export async function POST() {
  const key = `holding/${crypto.randomUUID()}`;
  const { url, fields } = await createPresignedPost(s3(), {
    Bucket: bucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_UPLOAD_BYTES],
      ["starts-with", "$Content-Type", "image/"],
    ],
    Expires: 300,
  });
  return Response.json({ url, fields, key });
}
