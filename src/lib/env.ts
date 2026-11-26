import { z } from "zod";

// host[:port], lowercase, no scheme or path. Matches what arrives in the Host header.
const host = z
  .string()
  .regex(/^[a-z0-9.-]+(:\d{1,5})?$/, "must be a host like example.com or localhost:3000");

const envSchema = z
  .object({
    STORE_HOST: host,
    ADMIN_HOST: host,
  })
  .refine((e) => e.STORE_HOST !== e.ADMIN_HOST, {
    message: "must differ from STORE_HOST",
    path: ["ADMIN_HOST"],
  });

export type Env = z.infer<typeof envSchema>;

/** Throws with the names of the bad variables, never their values (some will be secrets). */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment variables:\n${problems.join("\n")}`);
  }
  return result.data;
}

let cached: Env | undefined;

/** Server-side env, validated on first use. */
export function env(): Env {
  return (cached ??= parseEnv(process.env));
}
