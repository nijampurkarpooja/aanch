// Spike R4 proof: drives the upload routes of a running store (BASE, default localhost:3000) and
// checks the S15 limits. Needs no storage credentials. Throwaway.
import sharp from "sharp";

const BASE = process.env.BASE ?? "http://localhost:3000";
let fails = 0;
const check = (ok: boolean, name: string, detail = "") => {
  console.log(`  ${ok ? "✓" : "✗"} ${name}${ok ? "" : `: ${detail}`}`);
  if (!ok) fails++;
};

async function presign() {
  const res = await fetch(`${BASE}/api/r4/presign`, { method: "POST" });
  if (!res.ok) throw new Error(`presign ${res.status}: ${await res.text()}`);
  return (await res.json()) as { url: string; fields: Record<string, string>; key: string };
}
async function send(bytes: Uint8Array<ArrayBuffer>, type: string) {
  const { url, fields, key } = await presign();
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.append(name, value);
  form.append("Content-Type", type);
  form.append("file", new Blob([bytes], { type }));
  const res = await fetch(url, { method: "POST", body: form });
  return { key, status: res.status, text: await res.text() };
}
async function processUpload(key: string) {
  const res = await fetch(`${BASE}/api/r4/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  return { status: res.status, body: await res.json() };
}

// A camera-sized JPEG carrying a GPS position.
const photo = await sharp({
  create: { width: 2400, height: 1600, channels: 3, background: "#7a8b5c" },
})
  .jpeg()
  .withExif({ IFD3: { GPSLatitudeRef: "N", GPSLatitude: "12/1 58/1 0/1" } })
  .toBuffer();
check(!!(await sharp(photo).metadata()).exif, "the test photo starts with EXIF");

const up = await send(photo, "image/jpeg");
check(
  up.status === 204 || up.status === 201,
  "a JPEG uploads with the signed form",
  `${up.status} ${up.text}`,
);
const done = await processUpload(up.key);
check(done.status === 200, "the function processes it", JSON.stringify(done.body));
const images: { width: number; url: string; shortUrl: string }[] = done.body.images ?? [];
for (const { width, url } of images) {
  const res = await fetch(url);
  const bytes = Buffer.from(await res.arrayBuffer());
  const meta = res.ok ? await sharp(bytes).metadata() : undefined;
  check(
    res.ok && meta?.format === "webp" && meta.width === width && !meta.exif,
    `the ${width}px copy reads via its signed link as WebP without EXIF`,
    `${res.status} ${meta?.format} ${meta?.width} exif=${!!meta?.exif}`,
  );
}
if (images[0]) {
  const plain = await fetch(images[0].url.split("?")[0]);
  check(
    plain.status === 403,
    "S15: the same object without a signature is refused",
    `${plain.status}`,
  );
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const late = await fetch(images[0].shortUrl);
  check(late.status === 403, "S15: an expired signed link fails", `${late.status}`);
}
const again = await processUpload(up.key);
check(again.status === 404, "the holding upload is gone once processed", `${again.status}`);

const big = await send(new Uint8Array(5 * 1024 * 1024 + 1), "image/jpeg");
check(
  big.status === 400,
  "S15: storage refuses an upload over 5 MB",
  `${big.status} ${big.text.slice(0, 200)}`,
);
const html = await send(new TextEncoder().encode("<h1>hi</h1>"), "text/html");
check(
  html.status === 403,
  "S15: storage refuses a non-image Content-Type",
  `${html.status} ${html.text.slice(0, 200)}`,
);

const svg = await send(
  new TextEncoder().encode(
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
  ),
  "image/jpeg",
);
const svgDone = svg.status < 300 ? await processUpload(svg.key) : undefined;
check(
  svgDone?.status === 415,
  "S15: an SVG sent as image/jpeg is rejected",
  `${svg.status} ${svgDone?.status}`,
);
check((await processUpload(svg.key)).status === 404, "S15: and deleted from holding");

check((await processUpload("products/anything")).status === 400, "only holding keys are processed");

console.log(fails === 0 ? "All checks passed" : `${fails} check(s) failed`);
process.exit(fails === 0 ? 0 : 1);
