// Spike R1: the planned typefaces (concept.md), Latin subsets, self-hosted. Both are OFL; the files
// come from Google Fonts (Eczar 700; Anek Latin variable, wdth 75–125, wght 100–800).
import localFont from "next/font/local";

export const eczar = localFont({
  src: "./fonts/eczar-700-latin.woff2",
  weight: "700",
  variable: "--font-display",
});
export const anek = localFont({
  src: "./fonts/anek-latin-var-latin.woff2",
  weight: "100 800",
  variable: "--font-body",
});
