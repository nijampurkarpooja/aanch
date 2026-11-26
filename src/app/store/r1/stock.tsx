// Spike R1: the one database read, made per request.
import { connection } from "next/server";
import pg from "pg";

let pool: pg.Pool | undefined;

export async function Stock() {
  await connection();
  const url = process.env.DATABASE_URL_STORE;
  if (!url) throw new Error("DATABASE_URL_STORE is not set");
  pool ??= new pg.Pool({ connectionString: url, max: 1 });
  const { rows } = await pool.query<{ checked: string }>(
    "select to_char(now() at time zone 'Asia/Kolkata', 'HH24:MI:SS') as checked",
  );
  return (
    <p className="text-sm text-stone-600">
      4 left from this firing · checked {rows[0].checked} IST
    </p>
  );
}
