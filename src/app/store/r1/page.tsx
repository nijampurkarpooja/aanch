// Spike R1: a product page with a nonce CSP and one database read. Throwaway, never merged.
// The photo is a stand-in: sharp noise, 960x1200 WebP, 95 KB, about a real product photo’s weight.
import { connection } from "next/server";
import { Suspense } from "react";
import { AddToBag } from "./add-to-bag";
import { anek, eczar } from "./fonts";
import { Stock } from "./stock";

export const metadata = { title: "Neel thali, 27 cm · Aanch", robots: { index: false } };
// No prebuilt shell: a shell is built without a request, so its scripts can't carry the nonce.
export const instant = false;

export default async function R1Product() {
  await connection(); // render the whole page per request, so every script gets the nonce
  return (
    <main
      className={`${eczar.variable} ${anek.variable} mx-auto grid max-w-5xl gap-8 p-6 font-[family-name:var(--font-body)] md:grid-cols-2`}
    >
      {/* A plain img: next/image writes style="color:transparent", which the strict style-src blocks. */}
      <img
        src="/r1/thali-960.webp"
        alt="A deep blue stoneware thali on a cotton cloth"
        width={960}
        height={1200}
        fetchPriority="high"
        className="h-auto w-full rounded"
      />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl">Neel thali, 27 cm</h1>
        <p className="mt-2 text-2xl">₹2,450</p>
        <Suspense fallback={<p className="text-sm text-stone-600">Checking stock…</p>}>
          <Stock />
        </Suspense>
        <p className="mt-4 max-w-prose leading-relaxed">
          Thrown on the wheel and fired to 1280 °C in our gas kiln. The neel glaze pools darker at
          the rim. Food-safe, oven-safe to 220 °C, and fine in the dishwasher.
        </p>
        <AddToBag />
      </div>
    </main>
  );
}
