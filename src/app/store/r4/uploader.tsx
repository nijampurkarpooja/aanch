"use client";
// Spike R4: browser upload straight to storage. `window.r4Upload` lets the proof drive it.
import { useEffect, useState } from "react";

type Result = { images: { width: number; url: string }[] };

async function upload(file: Blob): Promise<Result> {
  const presign = await fetch("/api/r4/presign", { method: "POST" });
  const { url, fields, key } = await presign.json();
  const form = new FormData();
  for (const [name, value] of Object.entries(fields as Record<string, string>)) {
    form.append(name, value);
  }
  form.append("Content-Type", file.type);
  form.append("file", file); // last: storage ignores fields after the file
  const uploaded = await fetch(url, { method: "POST", body: form });
  if (!uploaded.ok) throw new Error(`upload ${uploaded.status}: ${await uploaded.text()}`);
  const processed = await fetch("/api/r4/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  const result = await processed.json();
  if (!processed.ok) throw new Error(`process ${processed.status}: ${result.error}`);
  return result;
}

export function Uploader() {
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    (window as unknown as { r4Upload: typeof upload }).r4Upload = upload;
  }, []);

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setError(undefined);
          upload(file).then(setResult, (e: Error) => setError(e.message));
        }}
      />
      {error && <p role="alert">{error}</p>}
      <ul>
        {result?.images.map(({ width, url }) => (
          <li key={width}>
            <a href={url}>{width}px WebP</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
