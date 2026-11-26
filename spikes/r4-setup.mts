// Spike R4 setup: lets the store's origins post uploads to the bucket. Throwaway.
// Run: node --env-file=.env.local spikes/r4-setup.mts
import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};
const s3 = new S3Client({
  endpoint: env("STORAGE_ENDPOINT"),
  region: env("STORAGE_REGION"),
  forcePathStyle: true,
  credentials: {
    accessKeyId: env("STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: env("STORAGE_SECRET_ACCESS_KEY"),
  },
});
const Bucket = env("STORAGE_BUCKET");

await s3.send(
  new PutBucketCorsCommand({
    Bucket,
    CORSConfiguration: {
      CORSRules: [
        {
          // shortcut: any Vercel preview may post; the real bucket lists the store's hosts only.
          AllowedOrigins: ["http://localhost:3000", "https://*.vercel.app"],
          AllowedMethods: ["POST", "GET"],
          AllowedHeaders: ["*"],
          MaxAgeSeconds: 600,
        },
      ],
    },
  }),
);
const { CORSRules } = await s3.send(new GetBucketCorsCommand({ Bucket }));
console.log(`CORS on ${Bucket}:`, JSON.stringify(CORSRules));
