import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Not found · Aanch" };

// shortcut: a plain 404 for both hosts; the designed one comes with the shell in milestone 1.
export default function GlobalNotFound() {
  return (
    <html lang="en-IN">
      <body>
        <main>
          <h1>Not found</h1>
          <p>There’s nothing at this address.</p>
        </main>
      </body>
    </html>
  );
}
